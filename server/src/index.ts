import * as dotenv from "dotenv";
dotenv.config();
import * as express from "express";
import * as http from "http";
import { Express } from "express";
import * as cors from "cors";
import ErrorHandlingMiddleware from "./middleware/ErrorHandlingMiddleware";
import router from "./routes";
import { staticFilePaths } from "./utils/filePathConsts";
import { initFunc } from "./service/initFunctions";
import * as path from "path";
import * as os from "os";
import { createStream, startSegmentCleaner } from "./service/createStream";

const app: Express = express();
const port: number = parseInt(process.env.PORT || "8080", 10);

const retryAttempts = new Map<number, number>();
const MAX_RETRIES = 20; // 20 попыток = 10 минут

app.use(cors());
app.use(express.json());
const PUBLIC_DIR = path.join(__dirname, "public");
const STREAMS =
  os.platform() === "darwin"
    ? [0, 1, 2, 3] // macOS: индексы устройств avfoundation
    : ["/dev/console_big", "/dev/console_small", "rtsp://admin:admin@192.168.12.248:554/", "rtsp://admin:admin@192.168.12.247:554/"];

// STREAMS.forEach((i, index) =>
//   createStream(app, {
//     index,
//     deviceId: index,
//     publicDir: PUBLIC_DIR,
//     streamsList: STREAMS,
//   })
// );
STREAMS.forEach(async (stream, index) => {
  const initializeStream = async () => {
    const currentRetries = retryAttempts.get(index) || 0;
    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Ограничиваем попытки
    if (currentRetries >= MAX_RETRIES) {
      console.error(`❌ Stream ${index} exceeded max retries (${MAX_RETRIES}). Giving up.`);
      return;
    }

    try {
      await createStream(app, {
        index,
        deviceId: index,
        publicDir: PUBLIC_DIR,
        streamsList: STREAMS,
      });
      console.log(`✅ Stream ${index} (device: ${stream}) initialized successfully`);
      retryAttempts.set(index, 0); // ✅ Сбрасываем при успехе
    } catch (error: any) {
      console.error(`❌ Stream ${index} (device: ${stream}) failed:`, error.message);
      retryAttempts.set(index, currentRetries + 1); // ✅ Увеличиваем счетчик

      // 🔄 Retry через 30 секунд
      console.log(`🔄 Stream ${index} will retry in 30 seconds...`);
      setTimeout(() => { initializeStream(); }, 30000);
    }
  };

  // Запускаем с небольшой задержкой между стримами
  setTimeout(() => initializeStream(), index * 1000); // 0с, 1с, 2с, 3с
});

const STREAM_DIRS = STREAMS.map((_, i) =>
  path.join(PUBLIC_DIR, `stream${i + 1}`)
);

startSegmentCleaner(STREAM_DIRS, 15, 10000);

app.use(express.static(PUBLIC_DIR));
staticFilePaths.forEach(({ route, folder }) => {
  app.use(route, express.static(folder));
});
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
app.use(express.static(path.join(__dirname, "build")));
const server = http.createServer(app);
app.use(ErrorHandlingMiddleware);

import { connectMV } from "./service/multiviewer";

const start = async () => {
  try {
    initFunc();
// ✅ ИСПРАВЛЕНИЕ: Подключаемся к мультивьюверу при старте
    console.log("🔌 Connecting to Cypress multiviewer...");
    connectMV();

    server.listen(port, "0.0.0.0", async () => {
      console.log(`Server is running on port ${port}`);
    });
    app.get("*", async (req, res) => {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    });
  } catch (error) {
    console.log(error);
  }
};

start();
