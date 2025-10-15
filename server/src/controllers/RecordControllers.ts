import { NextFunction, Request, Response } from "express";
import {
  clearHlsDirectory,
} from "../service/recordStream";
import { RECORD_DIR } from "../utils/filePathConsts";
import { gracefulShutdown, safeName } from "../utils/commonFunc";
import * as path from "path";
import { ChildProcessByStdio, spawn } from "child_process";
import ApiError from "../error/ApiError";
import { startSecondStreams } from "../service/startSecondStreams";
import { RecordData } from "../types/record";

// Переменные для процессов
let recordProcess: ChildProcessByStdio<null, null, null> | null = null;
let recordData: null | RecordData
const RECORD_KEY = process.env.RECORD_KEY ?? "";
class RecordControllers {
  async recordStart(req: Request, res: Response, next: NextFunction) {
    if (recordProcess) {
      return res.status(400).json({ error: "Запись уже запущена" });
    }
    const { name = "", stream } = req.body;
    if (!stream || typeof stream !== "string"){
      return next(ApiError.badRequest("Url is required"))
    }
    const RECORD_URL = `${stream}/${RECORD_KEY}`;
    // Формируем имя: если есть имя пациента — используем его, плюс дата (если есть)
    // нужно ли добавить название стрима???
    const safePatient = safeName(name);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");

    const fileName = `${safePatient.length > 0 ? safePatient : "record"}-${ts}.mp4`;
    const output = path.join(RECORD_DIR, fileName);

    // Запускаем ffmpeg для записи (как раньше)
    const args = [
      "-hide_banner",
      "-rtsp_transport",
      "tcp",
      "-i",
      RECORD_URL,
      "-c",
      "copy",
      "-avoid_negative_ts",
      "make_zero",
      "-fflags",
      "+genpts",
      output,
    ];

    recordProcess = spawn("ffmpeg", args, {
      stdio: ["ignore", "inherit", "inherit"],
    });
    console.log(`Запись начата: ${output}`);

    recordProcess.on("exit", (code, signal) => {
      console.log(`FFmpeg (запись) завершился: code=${code}, signal=${signal}`);
      recordProcess = null;
    });

    recordProcess.on("error", (err) => {
      console.error("Ошибка запуска записи:", err.message);
      recordProcess = null;
    });
    recordData = {patientName: safePatient, ts, fileName, stream}
    return res.json({ status: "started", file: fileName });
  }
  async recordStop(_: Request, res: Response) {
    if (!recordProcess) {
      return res.status(400).json({ error: "Запись не запущена" });
    }

    // Останавливаем ffmpeg
    recordProcess.kill("SIGINT");
    recordProcess = null; // сбрасываем сразу
    recordData = null
    console.log("Запись остановлена по запросу");
    return res.json({ status: "stopped" });
  }
  async restart(_: Request, res: Response) {
    try {
      await startSecondStreams()
      res.json({ success: true, message: "HLS поток перезапущен" });
    } catch (error: any) {
      console.error("Ошибка перезапуска HLS:", error?.message ?? "");
      res.status(500).json({ error: "Ошибка перезапуска HLS потока" });
    }
  }
  async getRecordData(_: Request, res: Response) {
    return res.json(recordData)
  }
  async clearHls(_: Request, res: Response) {
    try {
      clearHlsDirectory();
      res.json({ success: true, message: "HLS папка очищена" });
    } catch (error: any) {
      console.error("Ошибка очистки HLS папки:", error.message);
      res.status(500).json({ error: "Ошибка очистки HLS папки" });
    }
  }
}
function handleShutdown() {
  gracefulShutdown([recordProcess]);
}
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
const recordControllers = new RecordControllers();
export default recordControllers;
