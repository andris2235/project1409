import errorHandler from "../utils/erronHandler";
import net = require("net");

const SWITCHER_IP = process.env.SWITCHER_IP ?? "";
const SWITCHER_PORT = process.env.SWITCHER_PORT
  ? Number(process.env.SWITCHER_PORT)
  : 5000;


export function sendCommandToSwitcher(inputNumber: number) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    try {
      client.connect(SWITCHER_PORT, SWITCHER_IP, () => {
        console.log(`Connected to switcher at ${SWITCHER_IP}:${SWITCHER_PORT}`);

        const command = `ROUTE1,1,${inputNumber}\r`;
        console.log(`Sending command: ${command}`);
        client.write(command);
      });

      client.on("data", (data) => {
        console.log("Received from switcher:", data.toString());
        client.destroy();
        resolve({ success: true, response: data.toString() });
      });

      client.on("timeout", () => {
        console.error("Switcher timeout: no response in 5s");
        client.destroy();
        reject(new Error("Switcher timeout"));
      });

      client.on("error", (err) => {
        console.error("Switcher connection error:", err.message);
        client.destroy();
        reject(err);
      });

      client.on("close", () => {
        console.log("Connection to switcher closed.");
      });

      client.setTimeout(5000);
    } catch (error) {
      reject(error);
    }
  });
}
