import { Request, Response } from "express";
import { sendCommandToSwitcher } from "../types/switcher";

class SwitchControllers {
  async input(req: Request, res: Response) {
    const input = parseInt(req.params.input, 10);
    if (isNaN(input) || input < 1 || input > 4) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid input number" });
    }
    const response = await sendCommandToSwitcher(input);
    return res.json({
      status: "success",
      message: `Switched to input ${input}`,
      switcherResponse: response,
    });
  }
}

const switchControllers = new SwitchControllers();
export default switchControllers
