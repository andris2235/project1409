import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { Express } from "express";
import * as winston from "winston";
import "winston-daily-rotate-file";

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/createStream-%DATE%.log", // Лог-файлы будут называться с датой
  datePattern: "YYYY-MM-DD", // Формат даты
  zippedArchive: true, // Архивировать старые логи
  maxSize: "20m", // Максимальный размер файла (после чего он будет ротироваться)
  maxFiles: "30d", // Хранить логи только за последние 30 дней
});

const logger = winston.createLogger({
  level: "info", // Уровень логирования
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport],
});

export interface StreamConfig {
  index: number; // Индекс стрима
  deviceId: number; // ID устройства
  publicDir: string; // Папка для HLS
  streamsList: (number | string)[]; // Список устройств
}

function getFFmpegInputArgs(deviceId: number | string): string[] {
  const platform = os.platform();
  
  //Проверка на RTSP URL
  if (typeof deviceId === 'string' && deviceId.startsWith('rtsp://')) {
    console.log(`[RTSP] Using RTSP input: ${deviceId}`);
    return [
      "-rtsp_transport", "tcp",        // TCP для надежности
      "-fflags", "+genpts", // ✅ ИСПРАВИТЬ timing issues
     "-avoid_negative_ts", "make_zero", // ✅ ИСПРАВИТЬ negative timestamps
      "-i", `${deviceId}`,             // RTSP URL
    ];
  }

// Существующая логика для локальных устройств
  // const isPtz = deviceId === "/dev/Ptz_big" || deviceId === "/dev/Ptz_small";
if (platform === "darwin") {
    // macOS (avfoundation)
    return [
      "-f", "avfoundation",
      "-framerate", "15",
      "-video_size", "640x480",
      "-i", `${deviceId}`,
    ];
  } else if (platform === "linux") {
    // Linux (v4l2)
    return [
      "-f", "v4l2",
      "-framerate", "15", 
      "-video_size", "640x480",
      "-thread_queue_size", "512",
      "-i", `${deviceId}`,
    ];
  } else {
    throw new Error(`Платформа ${platform} не поддерживается`);
  }
}


// ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Функция теперь возвращает Promise
export function createStream(app: Express, config: StreamConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const folder = path.join(config.publicDir, `stream${config.index + 1}`);

      // Создаём директорию
      if (fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true });
      }
      fs.mkdirSync(folder, { recursive: true });

      // HTTP endpoints
      app.get(`/stream${config.index + 1}/index.m3u8`, (_, res) => {
        res.header("Content-Type", "application/vnd.apple.mpegurl");
        res.sendFile(path.join(folder, "index.m3u8"));
      });

      app.get(`/stream${config.index + 1}/:segment.m4s`, (req, res) => {
        res.header("Content-Type", "video/iso.segment");
        res.sendFile(path.join(folder, `${req.params.segment}.m4s`));
      });

      app.get(`/stream${config.index + 1}/init.mp4`, (_, res) => {
        res.header("Content-Type", "video/mp4");
        res.sendFile(path.join(folder, "init.mp4"));
      });

      // Формируем аргументы ffmpeg with different settings for v4l2 and rtsp
      const inputArgs = getFFmpegInputArgs(config.streamsList[config.index]);
      const rawDevice = config.streamsList[config.index];
      let isRTSP = false;

      if (typeof rawDevice === 'string') {
      isRTSP = rawDevice.startsWith('rtsp://');
      }
      const hlsArgs = [
        "-c:v", isRTSP ? "copy" : "libx264",
        ...(isRTSP ? [] : [
        "-preset", "ultrafast",
        "-tune", "zerolatency",
        ]),
        "-g",
        "30",
        "-sc_threshold",
        "0",
        "-hls_time",
        "1",
        "-hls_list_size",
        "6",
        "-hls_playlist_type",
        "event",
        "-hls_flags",
        "delete_segments+append_list+independent_segments",
        "-hls_segment_type",
        "fmp4",
        "-hls_fmp4_init_filename",
        "init.mp4",
        "-hls_segment_filename",
        path.join(folder, "segment%03d.m4s"),
        path.join(folder, "index.m3u8"),
      ];

      const ffmpegArgs = [...inputArgs, ...hlsArgs];

      console.log(`[Stream${config.index + 1}] Starting FFmpeg with args:`, ffmpegArgs.join(' '));

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Запуск ffmpeg с полной обработкой ошибок
      const ffmpeg = spawn("ffmpeg", ffmpegArgs);
      
      // ✅ ДОБАВЛЕНО: Флаг для отслеживания успешного запуска
      let streamStarted = false;
      let initTimeout: NodeJS.Timeout;

      // ✅ ДОБАВЛЕНО: Обработка ошибки spawn (критически важно!)
      ffmpeg.on("error", (error) => {
        const errorMsg = `FFmpeg spawn failed: ${error.message}`;
        logger.error(`Stream${config.index + 1} spawn error:`, error);
        console.error(`❌ Stream${config.index + 1} spawn error:`, errorMsg);
        
        if (initTimeout) clearTimeout(initTimeout);
        reject(new Error(errorMsg));
      });

      // ✅ УЛУЧШЕНО: Обработка stderr с проверкой успешного запуска
      ffmpeg.stderr.on("data", (data) => {
        const output = data.toString();
        console.log(`[Stream${config.index + 1}] FFmpeg: ${output.trim()}`);
        
        // ✅ ДОБАВЛЕНО: Проверка на успешный запуск FFmpeg
        if (!streamStarted && (
          output.includes("Press [q] to stop") || 
          output.includes("frame=") ||
          output.includes("Opening ") ||
          output.includes("Stream mapping:")
        )) {
          streamStarted = true;
          if (initTimeout) clearTimeout(initTimeout);
          console.log(`✅ Stream${config.index + 1} FFmpeg started successfully`);
          logger.info(`Stream${config.index + 1} FFmpeg started successfully`);
          resolve();
        }
        
        // ✅ ДОБАВЛЕНО: Проверка на критические ошибки устройства
        if (output.includes("No such file or directory")) {
          if (initTimeout) clearTimeout(initTimeout);
          const errorMsg = `Device not found: ${config.streamsList[config.index]}`;
          console.error(`❌ Stream${config.index + 1} device error:`, errorMsg);
          logger.error(`Stream${config.index + 1} device error:`, errorMsg);
          reject(new Error(errorMsg));
          return;
        }
        
        if (output.includes("Permission denied")) {
          if (initTimeout) clearTimeout(initTimeout);
          const errorMsg = `Permission denied for device: ${config.streamsList[config.index]}`;
          console.error(`❌ Stream${config.index + 1} permission error:`, errorMsg);
          logger.error(`Stream${config.index + 1} permission error:`, errorMsg);
          reject(new Error(errorMsg));
          return;
        }
        
        if (output.includes("Device or resource busy")) {
          if (initTimeout) clearTimeout(initTimeout);
          const errorMsg = `Device busy: ${config.streamsList[config.index]}`;
          console.error(`❌ Stream${config.index + 1} device busy:`, errorMsg);
          logger.error(`Stream${config.index + 1} device busy:`, errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        if (output.includes("Invalid data found when processing input")) {
          if (initTimeout) clearTimeout(initTimeout);
          const errorMsg = `Invalid input data from device: ${config.streamsList[config.index]}`;
          console.error(`❌ Stream${config.index + 1} invalid data:`, errorMsg);
          logger.error(`Stream${config.index + 1} invalid data:`, errorMsg);
          reject(new Error(errorMsg));
          return;
        }
      });

      // ✅ УЛУЧШЕНО: Обработка выхода процесса
      ffmpeg.on("exit", (code, signal) => {
        if (initTimeout) clearTimeout(initTimeout);
        
        const exitMsg = signal ? 
          `FFmpeg killed with signal ${signal}` : 
          `FFmpeg exited with code ${code}`;
          
        logger.info(`Stream${config.index + 1} ${exitMsg}`);
        console.log(`[Stream${config.index + 1}] ${exitMsg}`);
        
        // Если процесс завершился до успешного запуска - это ошибка
        if (!streamStarted && code !== 0) {
          const errorMsg = `FFmpeg failed to start: ${exitMsg}`;
          console.error(`❌ Stream${config.index + 1} failed:`, errorMsg);
          logger.error(`Stream${config.index + 1} failed:`, errorMsg);
          reject(new Error(errorMsg));
        }
      });

      // ✅ ДОБАВЛЕНО: Timeout для инициализации (10 секунд)
      initTimeout = setTimeout(() => {
        if (!streamStarted) {
          const errorMsg = `Stream initialization timeout (10s)`;
          console.error(`❌ Stream${config.index + 1} timeout:`, errorMsg);
          logger.error(`Stream${config.index + 1} timeout:`, errorMsg);
          
          // Убиваем процесс если он завис
          if (!ffmpeg.killed) {
            ffmpeg.kill('SIGTERM');
            setTimeout(() => {
              if (!ffmpeg.killed) {
                ffmpeg.kill('SIGKILL');
              }
            }, 5000);
          }
          
          reject(new Error(errorMsg));
        }
      }, 10000); // 10 секунд на запуск

    } catch (error: any) {
      const errorMsg = `CreateStream critical error: ${error.message}`;
      logger.error("createStream critical error:", error);
      console.error(`❌ Stream${config.index + 1} critical error:`, errorMsg);
      reject(new Error(errorMsg));
    }
  });
}

export function startSegmentCleaner(
  streamDirs: string[],
  maxSegments: number = 15, // ← УВЕЛИЧИТЬ с 10 до 15
  intervalMs: number = 10000 // ← УВЕЛИЧИТЬ с 5000 до 10000 (10 сек)
): void {
  try {
    setInterval(() => {
      streamDirs.forEach((STREAM_PATH) => {
        fs.readdir(STREAM_PATH, (err, files) => {
          if (err) {
            logger.error(`Ошибка чтение ${STREAM_PATH}:`, err);
            return;
          }

          const segments = files
            .filter((file) => /^segment\d+\.m4s$/.test(file))
            .map(file => ({
              name: file,
              // ✅ ДОБАВИТЬ проверку времени создания файла
              stats: fs.statSync(path.join(STREAM_PATH, file))
            }))
            .sort((a, b) => {
              const numA = parseInt(a.name.replace("segment", "").replace(".m4s", ""));
              const numB = parseInt(b.name.replace("segment", "").replace(".m4s", ""));
              return numA - numB;
            });

          if (segments.length > maxSegments) {
            const toDelete = segments.slice(0, segments.length - maxSegments);
            
            toDelete.forEach((segment) => {
              const filePath = path.join(STREAM_PATH, segment.name);
              const fileAge = Date.now() - segment.stats.mtime.getTime();
              
              // ✅ КРИТИЧНО: Удаляем только файлы старше 30 секунд
              if (fileAge > 30000) {
                fs.unlink(filePath, (err) => {
                  if (err && err.code !== 'ENOENT') {
                    logger.error(`Ошибка удаления ${segment.name}:`, err);
                  }
                });
              }
            });
          }
        });
      });
    }, intervalMs);
  } catch (error) {
    logger.error("startSegmentCleaner error", error);
  }
}
