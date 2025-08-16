import { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import { setPreset } from "../service/multiviewer";
import onvifController from "../service/OnvifCamera";
import { TvState } from "../types/tv";
import { sendToTV } from "../service/sendToTv";
const CMD_POWER_ON = Buffer.from([0xAA, 0x11, 0x01, 0x01, 0x01, 0x14]);
const CMD_POWER_OFF = Buffer.from([0xAA, 0x11, 0x01, 0x01, 0x00, 0x13]);
class StreamControllers {
  async setTv(req: Request, res: Response, next: NextFunction) {
    const state = req.params.state as TvState;
    const result = await sendToTV(state === "off" ? CMD_POWER_OFF : CMD_POWER_ON)
    if (!result){
      return next(ApiError.internal("Server error"));
    }
    return res.sendStatus(200)
  }
  async setPreset(req: Request, res: Response, next: NextFunction) {
    const n = parseInt(req.params.n, 10);
    if (n < 1 || n > 4) {
      return next(ApiError.badRequest("Invalid preset number"));
    }
    const result = setPreset(n);
    if (!result) {
      return next(ApiError.internal("Server error"));
    }
    return res.json({ status: "ok", preset: n }); // ✅ отправляем JSON
  }
  async moveCamera(req: Request, res: Response, next: NextFunction) {
    const { cam } = req.params;
    const { x, y, z } = req.body;
    if (!cam || typeof z !== "number" || typeof x !== "number" || typeof y !== "number") {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message } = await onvifController.moveCamera(cam, x, y, z);
    if (!success) {
      return next(ApiError.internal(message));
    }
    res.json({ status: "ok", action: "move", cam });
  }
  async stopCamera(req: Request, res: Response, next: NextFunction) {
    const { cam } = req.params;
    if (!cam) {
      return next(ApiError.badRequest("Incomplete data"));
    }
    const { success, message } = await onvifController.stopCamera(cam);
    if (!success) {
      return next(ApiError.internal(message));
    }
    res.json({ status: "ok", action: "move", cam });
  }
}

const streamControllers = new StreamControllers();
export default streamControllers;
