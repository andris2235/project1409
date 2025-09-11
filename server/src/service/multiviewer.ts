// server/src/service/multiviewer.ts
import * as net from "net";
import * as winston from "winston";
import "winston-daily-rotate-file";
import * as path from "path";

const transport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "..", "logs", "multiviewer-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
});
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport],
});

const MV_HOST = process.env.MV_HOST ?? "";
const MV_PORT = process.env.MV_PORT ? +process.env.MV_PORT : 1010;

let mvSocket: net.Socket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Периодическая проверка состояния соединения
function startHealthCheck() {
  setInterval(() => {
    if (mvSocket && !mvSocket.destroyed) {
      logger.info("✔️ Состояние MV: соединение активно");
    } else {
      logger.warn("⚠️ Состояние MV: сокет неактивен");
    }
  }, 300000); // каждые 5 минут
}

// Регулярный опрос статуса для поддержания активности
function startPollingStatus() {
  setInterval(() => {
    if (mvSocket && !mvSocket.destroyed) {
      // пример команды запроса статуса, адаптируйте под вашу спецификацию
      mvSocket.write("get window layout status\r\n");
      logger.debug("📤 Отправлен polling-запрос статуса MV");
    }
  }, 30000); // каждые 30 секунд
}

export function connectMV(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  mvSocket = new net.Socket();
  mvSocket.setKeepAlive(true, 60000); // TCP keep-alive каждые 60 секунд

  mvSocket.connect(MV_PORT, MV_HOST, () => {
    logger.info("✅ Connected to multiviewer");
  });

  mvSocket.on("error", (err) => {
    logger.error("❌ MV connection error:", { message: err.message });
    scheduleReconnect();
  });

  mvSocket.on("end", () => {
    logger.warn("🔌 MV connection ended by server");
    scheduleReconnect();
  });

  mvSocket.on("close", (hadError) => {
    logger.warn(`🚫 MV connection closed${hadError ? " due to error" : ""}`);
    scheduleReconnect();
  });

  startHealthCheck();
  startPollingStatus();
}

function scheduleReconnect(): void {
  if (mvSocket) {
    mvSocket.destroy();
    mvSocket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  reconnectTimeout = setTimeout(() => {
    logger.info("🔄 Attempting to reconnect to multiviewer...");
    connectMV();
  }, 5000);
}

export function setPreset(n: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (n < 1 || n > 4) {
      reject(new Error(`Invalid preset number: ${n}`));
      return;
    }
    if (!mvSocket || mvSocket.destroyed) {
      logger.warn("🚫 MV socket is undefined or destroyed");
      reject(new Error("Multiviewer not connected"));
      return;
    }
    const code = 4 + n;
    const cmd = `set window layout mode ${code}\r\n`;
    mvSocket.write(cmd, (err) => {
      if (err) {
        logger.error("Failed to write to multiviewer:", { error: err });
        reject(err);
      } else {
        logger.info(`✅ Preset ${n} command sent successfully`);
        resolve(true);
      }
    });
  });
}



// // server/src/service/multiviewer.ts
// import * as net from "net";
// import * as winston from "winston";
// import "winston-daily-rotate-file";
// import * as path from "path";

// const transport = new winston.transports.DailyRotateFile({
//   filename: path.join(__dirname, "..", "logs", "multiviewer-%DATE%.log"),
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "30d",
// });

// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [transport],
// });

// const MV_HOST = process.env.MV_HOST ?? "";
// const MV_PORT = process.env.MV_PORT ? +process.env.MV_PORT : 1010;

// let mvSocket: net.Socket | null = null;
// let reconnectTimeout: NodeJS.Timeout | null = null;

// /**
//  * Возвращает текущий активный сокет или null
//  */
// export function getMCSocket(): net.Socket | null {
//   return mvSocket;
// }

// /**
//  * Логирование входящих данных от мультивьювера
//  */
// function setupDataLogging(socket: net.Socket) {
//   socket.on("data", (data) => {
//     const msg = data.toString().trim();
//     logger.info("📥 Получено от MV:", { message: msg });
//   });
// }

// /**
//  * Периодическая проверка состояния соединения
//  */
// function startHealthCheck() {
//   setInterval(() => {
//     if (mvSocket && !mvSocket.destroyed) {
//       logger.info("✔️ Состояние MV: соединение активно");
//     } else {
//       logger.warn("⚠️ Состояние MV: сокет неактивен");
//     }
//   }, 300000); // каждые 5 минут
// }

// /**
//  * Запускает подключение к мультивьюверу
//  */
// export function connectMV(): void {
//   if (reconnectTimeout) {
//     clearTimeout(reconnectTimeout);
//     reconnectTimeout = null;
//   }

//   mvSocket = new net.Socket();

//   mvSocket.connect(MV_PORT, MV_HOST, () => {
//     logger.info("✅ Connected to multiviewer");
//   });

//   // setupDataLogging(mvSocket);

//   mvSocket.on("error", (err) => {
//     logger.error("❌ MV connection error:", { message: err.message });
//     scheduleReconnect();
//   });

//   mvSocket.on("end", () => {
//     logger.warn("🔌 MV connection ended by server");
//     scheduleReconnect();
//   });

//   mvSocket.on("close", (hadError) => {
//     logger.warn(`🚫 MV connection closed${hadError ? " due to error" : ""}`);
//     scheduleReconnect();
//   });

//   startHealthCheck();
// }

// function scheduleReconnect(): void {
//   if (mvSocket) {
//     mvSocket.destroy();
//     mvSocket = null;
//   }
//   if (reconnectTimeout) {
//     clearTimeout(reconnectTimeout);
//   }
//   reconnectTimeout = setTimeout(() => {
//     logger.info("🔄 Attempting to reconnect to multiviewer...");
//     connectMV();
//   }, 5000);
// }

// /**
//  * Проверка состояния подключения
//  */
// export function isMultiviewerConnected(): boolean {
//   return mvSocket !== null && !mvSocket.destroyed && (mvSocket as any).readyState === "open";
// }

// /**
//  * Устанавливает пресет раскладки
//  * @param n - номер пресета (1–4)
//  * @returns Promise<boolean>
//  */
// export function setPreset(n: number): Promise<boolean> {
//   return new Promise((resolve, reject) => {
//     if (n < 1 || n > 4) {
//       reject(new Error(`Invalid preset number: ${n}`));
//       return;
//     }
//     if (!mvSocket || mvSocket.destroyed) {
//       logger.warn("🚫 MV socket is undefined or destroyed");
//       reject(new Error("Multiviewer not connected"));
//       return;
//     }
//     const code = 4 + n;
//     const cmd = `set window layout mode ${code}\r\n`;
//     try {
//       mvSocket.write(cmd, (err) => {
//         if (err) {
//           logger.error("Failed to write to multiviewer:", { error: err });
//           reject(err);
//         } else {
//           logger.info(`✅ Preset ${n} command sent successfully`);
//           resolve(true);
//         }
//       });
//     } catch (error: any) {
//       logger.error("Error sending preset command:", { error: error.message });
//       reject(error);
//     }
//   });
// }
