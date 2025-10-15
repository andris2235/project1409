import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import switchControllers from "../controllers/SwitcherControllers";

const router = Router();

router.post(
  "/:input",
  tryCatch(switchControllers.input)
);

export default router;