import { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import { setPreset } from "../service/multiviewer";

class StreamControllers {
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
}

const streamControllers = new StreamControllers();
export default streamControllers;
