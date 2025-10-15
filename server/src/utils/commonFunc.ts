import * as fs from "fs";
import { ChildProcess } from "child_process";

export async function gracefulShutdown(
  processes: (ChildProcess | null | undefined)[] = []
): Promise<void> {
  console.log("Остановка: завершаем подпроцессы…");

  // Фильтруем только активные процессы
  const active = processes.filter((p): p is ChildProcess =>
    Boolean(p && !p.killed)
  );

  if (active.length === 0) {
    console.log("Нет активных подпроцессов.");
    process.exit(0);
    return;
  }

  // Отправляем SIGINT и ждём завершения
  await Promise.allSettled(
    active.map((p) => {
      p.kill("SIGINT");
      return new Promise<void>((resolve) => {
        p.once("exit", () => {
          console.log(`Процесс PID ${p.pid} завершён.`);
          resolve();
        });
      });
    })
  );

  console.log("Все подпроцессы завершены. Завершаем работу.");
  process.exit(0);
}
export function checkExistFolder(directory: string): void {
  // Проверяем существует ли папка, если нет - создаем её
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Функция безопасного имени файла
export function safeName(s: string) {
  return s
    .trim()
    .replace(/\s+/g, "_") // пробелы -> _
    .replace(/[:\/\\<>?"|*']/g, "") // удалить запрещенные символы
    .replace(/[^\w\-а-яА-ЯёЁ_]/g, ""); // оставить буквы/цифры/подчерки
}
