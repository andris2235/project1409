import * as net from "net";
import * as winston from "winston";
import "winston-daily-rotate-file";

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/tv-%DATE%.log",
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

const TV_PORT = process.env.TV_PORT ? +process.env.TV_PORT : 1515;
const TV_IP = process.env.TV_IP as string;

export async function sendToTV(commandBuffer: Buffer): Promise<boolean> {
  try {
    await new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();

      socket.setTimeout(2000);

      socket.connect(TV_PORT, TV_IP, () => {
        logger.info(`Отправка: ${commandBuffer.toString("hex")}`);
        socket.write(commandBuffer);

        setTimeout(() => {
          socket.end();
          resolve();
        }, 200);
      });

      socket.on("error", (err: Error) => reject(err));
      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("TCP timeout"));
      });
    });

    return true; // команда успешно отправлена
  } catch (error) {
    logger.error("Ошибка при отправке команды на ТВ:", error);
    return false; // ошибка при отправке
  }
}
