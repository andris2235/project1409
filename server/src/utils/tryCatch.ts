import { NextFunction, Request, Response } from "express";
import * as winston from "winston";
import "winston-daily-rotate-file";

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/tryCatch-%DATE%.log", // Лог-файлы будут называться с датой
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
function tryCatch(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>, cleanup?: () => Promise<void>) {
   
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            await fn(req, res, next);
        } catch(err) {
            console.log(err);
            logger.error({err})
            res.status(500).send({ success: false, data: "Internal error" });
        } finally {
            cleanup && await cleanup();
        }
    };
}

export default tryCatch;