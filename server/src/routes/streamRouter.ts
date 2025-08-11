import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import streamControllers from "../controllers/StreamControllers";


const router = Router();

router.post(
  "/preset/:n",
  tryCatch(streamControllers.setPreset)
);

router.post(
  "/camera/:cam/move",
  tryCatch(streamControllers.moveCamera)
);

router.post(
  "/camera/:cam/stop",
  tryCatch(streamControllers.stopCamera)
);

export default router;