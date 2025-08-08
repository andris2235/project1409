import * as winston from "winston";
import "winston-daily-rotate-file";
const transport = new winston.transports.DailyRotateFile({
  filename: "logs/errorHandler-%DATE%.log", // Лог-файлы будут называться с датой
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
export default async function errorHandler(error: any) {
  logger.info("errorHandler", { error });
  console.error(error);
  if (error instanceof Error) {
    return { success: false, message: error.message, data: null };
  } else {
    return { success: false, message: "Something went wrong", data: null };
  }
}
