import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import streamControllers from "../controllers/AdminControllers";


const router = Router();

router.post(
  "/preset/:n",
  tryCatch(streamControllers.setPreset)
);

export default router;