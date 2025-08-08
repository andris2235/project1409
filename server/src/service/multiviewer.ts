import * as net from "net";
import * as winston from "winston";
import "winston-daily-rotate-file";

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/multiviewer-%DATE%.log", // Лог-файлы будут называться с датой
  datePattern: "YYYY-MM-DD", // Формат даты
  zippedArchive: true, // Архивировать старые логи
  maxSize: "20m", // Максимальный размер файла (после чего он будет ротироваться)
  maxFiles: "30d", // Хранить логи только за последние 14 дней
});

const logger = winston.createLogger({
  level: "info", // Уровень логирования
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport],
});

const MV_HOST = process.env.MV_HOST ?? "";
const MV_PORT = process.env.MV_PORT ? +process.env.MV_PORT : 1010;
console.log(MV_HOST, MV_PORT);

let mvSocket: net.Socket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

/**
 * Возвращает текущий активный сокет или null
 */
export function getMCSocket(): net.Socket | null {
  return mvSocket;
}

/**
 * Запускает подключение к мультивьюверу
 */
export function connectMV(): void {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  mvSocket = new net.Socket();

  mvSocket.connect(MV_PORT, MV_HOST, () => {
    logger.info("✅ Connected to multiviewer");
  });

  // mvSocket.on("data", (data) => {
  //   console.log("📥 Received from MV:", data.toString());
  // });

  mvSocket.on("error", (err) => {
    logger.info("❌ MV connection error:", err.message);
    scheduleReconnect();
  });

  mvSocket.on("end", () => {
    logger.info("🔌 MV connection ended by server");
    scheduleReconnect();
  });

  mvSocket.on("close", (hadError) => {
    logger.info(`🚫 MV connection closed${hadError ? " due to error" : ""}`);
    scheduleReconnect();
  });
}

function scheduleReconnect(): void {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      console.log("🔄 Reconnecting to MV...");
      connectMV();
    }, 2000);
  }

  if (mvSocket) {
    mvSocket.destroy();
    mvSocket = null;
  }
}

/**
 * Устанавливает пресет раскладки
 * @param n - номер пресета (1–4)
 * @returns true, если команда отправлена
 */
export function setPreset(n: number): boolean {
  if (n < 1 || n > 4) return false;
  if (!mvSocket || mvSocket.destroyed) {
    logger.info(`🚫 MV socket is undefined or destroyed`);
    return false;
  }

  const code = 4 + n;
  const cmd = `set window layout mode ${code}\r\n`;
  mvSocket.write(cmd);
  return true;
}
