import { Request, Response } from "express";
import { controlNetPingRelay } from "../service/netping";

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
      return res.status(400).json({ success: false, message: "Неверная команда" });
    }
  }
}

const netpingControllers = new NetpingController();
export default netpingControllers;
