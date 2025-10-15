import { Router } from "express";
import tryCatch from "../utils/tryCatch";
import netpingControllers from "../controllers/NetpingControllers";

const router = Router();

router.post(
  "/control",
  tryCatch(netpingControllers.netpingControl)
);

export default router;