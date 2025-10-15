import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import recordControllers from "../controllers/RecordControllers";

const router = Router();

router.post(
  "/start",
  tryCatch(recordControllers.recordStart)
);

router.post(
  "/stop",
  tryCatch(recordControllers.recordStop)
);

router.get(
  "/status",
  tryCatch(recordControllers.getRecordData)
);

router.post(
  "/hls/restart",
  tryCatch(recordControllers.restart)
);

router.post(
  "/hls/clear",
  tryCatch(recordControllers.clearHls)
);

export default router;