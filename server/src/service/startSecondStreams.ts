import { SecondStreamType } from "../types/record";
import { clearHlsDirectory, startHls } from "./recordStream";

const retryAttempts = new Map<number, number>();
const MAX_RETRIES = 20; // 20 попыток = 10 минут
export const SECOND__STREAMS:SecondStreamType[] = [
  {stream: "/dev/console_big", key: "first"},
  // {stream: "/dev/console_small", key: "second"},
  {stream: "rtsp://admin:admin@192.168.12.248:554/", key: "fiveth"},
  {stream: "rtsp://admin:admin@192.168.12.247:554/", key: "sixth"},
];

export async function startSecondStreams() {
  clearHlsDirectory();
  SECOND__STREAMS.forEach(async (stream, index) => {
    const initializeStream = async () => {
      const currentRetries = retryAttempts.get(index) || 0;
      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Ограничиваем попытки
      if (currentRetries >= MAX_RETRIES) {
        console.error(
          `❌ Stream ${stream} exceeded max retries (${MAX_RETRIES}). Giving up.`
        );
        return;
      }

      try {
        startHls(stream);
        console.log(
          `✅ Stream ${index} (device: ${stream}) initialized successfully`
        );
        retryAttempts.set(index, 0); // ✅ Сбрасываем при успехе
      } catch (error: any) {
        console.error(
          `❌ Stream ${index} (device: ${stream}) failed:`,
          error.message
        );
        retryAttempts.set(index, currentRetries + 1); // ✅ Увеличиваем счетчик

        // 🔄 Retry через 30 секунд
        console.log(`🔄 Stream ${index} will retry in 30 seconds...`);
        setTimeout(() => {
          initializeStream();
        }, 30000);
      }
    };

    // Запускаем с небольшой задержкой между стримами
    setTimeout(() => initializeStream(), index * 1000); // 0с, 1с, 2с, 3с
  });
}
