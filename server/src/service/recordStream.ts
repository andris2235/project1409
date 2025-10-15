import * as fs from "fs";
import { HLS_DIR } from "../utils/filePathConsts";
import * as path from "path";
import { ChildProcess, spawn } from "child_process";
import { gracefulShutdown } from "../utils/commonFunc";
import { SecondStreamType } from "../types/record";

// Для браузерного LL-HLS (sub_stream)
const HLS_KEY = process.env.HLS_KEY ?? "";

// Переменные для процессов
const hlsProcesses = new Map<
  string,
  {
    process: ChildProcess;
    watchdog: NodeJS.Timeout;
  }
>();

// Функция для очистки всех файлов из папки HLS
export function clearHlsDirectory() {
  try {
    // fs.readdirSync() - синхронно читает содержимое папки и возвращает массив имен файлов
    const files = fs.readdirSync(HLS_DIR);

    // forEach() - метод массива, выполняет функцию для каждого элемента
    files.forEach((file) => {
      // path.join() - безопасно склеивает путь к папке с именем файла
      const filePath = path.join(HLS_DIR, file);

      try {
        // fs.unlinkSync() - синхронно удаляет файл
        fs.unlinkSync(filePath);
        console.log(`Удален старый файл: ${file}`);
      } catch (err: any) {
        // Если файл не удалось удалить, выводим ошибку, но не останавливаем программу
        console.error(`Ошибка удаления файла ${file}:`, err?.message ?? "");
      }
    });

    console.log("Папка HLS очищена");
  } catch (err: any) {
    // Если не удалось прочитать папку (например, её нет), выводим ошибку
    console.error("Ошибка очистки папки HLS:", err?.message ?? "");
  }
}

export function startHls(streamData: SecondStreamType) {
  const { stream, key } = streamData;
  const HLS_URL = `${stream}/${HLS_KEY}`;
  // создаём отдельную папку для каждого потока
  const streamDir = path.join(HLS_DIR, `${key}-${HLS_KEY}`);
  fs.mkdirSync(streamDir, { recursive: true });

  // файлы внутри уникальной папки
  const playlistPath = path.join(streamDir, "index.m3u8");
  const segmentPath = path.join(streamDir, `${key}_${HLS_KEY}_%05d.m4s`);

  const args = [
    "-hide_banner",
    "-rtsp_transport",
    "tcp",
    "-i",
    HLS_URL,
    "-c:v",
    "h264_vaapi", // или "libx264" без GPU
    "-avoid_negative_ts",
    "make_zero",
    "-fflags",
    "+genpts+discardcorrupt",
    "-max_muxing_queue_size",
    "1024",
    "-hls_time",
    "1",
    "-hls_list_size",
    "5",
    "-hls_flags",
    "append_list+omit_endlist+split_by_time+discont_start",
    "-hls_segment_type",
    "fmp4",
    "-hls_segment_filename",
    segmentPath,
    "-hls_allow_cache",
    "0",
    "-hls_playlist_type",
    "event",
    "-y",
    playlistPath,
  ];

  // если для этого ключа уже запущен процесс — убиваем его
  const existing = hlsProcesses.get(key);
  if (existing) {
    console.log(`Останавливаем предыдущий процесс HLS для ${key}`);
    existing.process.kill("SIGKILL");
    clearInterval(existing.watchdog);
    hlsProcesses.delete(key);
  }

  // запускаем новый процесс
  const proc = spawn("ffmpeg", args, {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  proc.stderr.on("data", (chunk) =>
    console.log(`[${key}] ffmpeg stderr:`, chunk.toString())
  );
  proc.on("error", (err) =>
    console.error(`[${key}] Ошибка запуска:`, err.message)
  );

  proc.on("close", (code, signal) => {
    console.warn(
      `[${key}] ffmpeg завершён code=${code}, signal=${signal}. Перезапуск через 3 сек.`
    );
    const entry = hlsProcesses.get(key);
    if (entry) {
      clearInterval(entry.watchdog);
      hlsProcesses.delete(key);
    }
    setTimeout(() => startHls(streamData), 3000);
  });

  // watchdog для конкретного потока
  const watchdog = setInterval(() => {
    try {
      const stat = fs.statSync(playlistPath);
      if (Date.now() - stat.mtimeMs > 5000) {
        console.warn(`[${key}] HLS не обновляется, перезапуск...`);
        proc.kill("SIGKILL");
      }
    } catch {
      // файл ещё не создан — ок
    }
  }, 3000);

  hlsProcesses.set(key, { process: proc, watchdog });
}

function handleShutdown() {
  gracefulShutdown(Array.from(hlsProcesses, ([_, value])=> (value.process)));
}
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
