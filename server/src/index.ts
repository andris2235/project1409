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
import * as path from 'path';
import * as os from 'os';
import { createStream, startSegmentCleaner } from "./service/createStream";
const app: Express = express();
const port: number = parseInt(process.env.PORT || "8080", 10);

app.use(cors());
app.use(express.json());
const PUBLIC_DIR = path.join(__dirname, 'public');
const STREAMS =
    os.platform() === 'darwin'
        ? [0, 1, 2, 3] // macOS: индексы устройств avfoundation
        : ['/dev/video0', '/dev/video1', '/dev/video2', '/dev/video3'];

STREAMS.forEach((_, index) =>
    createStream(app, { index, deviceId: index, publicDir: PUBLIC_DIR, streamsList: STREAMS })
);

const STREAM_DIRS = STREAMS.map((_, i) => path.join(PUBLIC_DIR, `stream${i + 1}`));

startSegmentCleaner(STREAM_DIRS, 10, 5000);

app.use(express.static(PUBLIC_DIR));

staticFilePaths.forEach(({ route, folder }) => {
  app.use(route, express.static(folder));
});
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);
const server = http.createServer(app);
app.use(ErrorHandlingMiddleware);

const start = async () => {
  try {
    initFunc();
    server.listen(port, async () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
