import { NextFunction, Request, Response } from "express";
import { controlNetPingRelay, getNetPingRelayStatus } from "../service/netping";
import ApiError from "../error/ApiError";

class NetpingController {
  async netpingControl(req: Request, res: Response) {
    // Получаем команду из тела запроса, которое отправил фронтенд
    const { command } = req.body; // command будет равно 'on' или 'off'

    console.log(`Получена команда: ${command}`);

    if (command === "on") {
      const result = await controlNetPingRelay(1, "on");
      return res.json(result);
    } else if (command === "off") {
      const result = await controlNetPingRelay(1, "off");
      return res.json(result);
    } else {
      // Если пришла какая-то другая команда
      return res
        .status(400)
        .json({ success: false, message: "Неверная команда" });
    }
  }
  async getNetpingStatus(req: Request, res: Response, next: NextFunction) {
    const {success, status, message} = await getNetPingRelayStatus(1);
    if (!success || !status){
      return next(ApiError.internal(message))
    }
    return res.json(status)
  }
}

const netpingControllers = new NetpingController();
export default netpingControllers;
