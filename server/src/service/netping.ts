import axios from "axios";
import { NetpingAction } from "../types/netping";

const NETPING_IP = process.env.NETPING_IP;
const NETPING_LOGIN = process.env.NETPING_LOGIN ?? "";
const NETPING_PASSWORD = process.env.NETPING_PASSWORD ?? "";

export async function getNetPingRelayStatus(relayNumber: number) {
  const url = `http://${NETPING_IP}/relay.cgi?r${relayNumber}`;

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      auth: {
        username: NETPING_LOGIN,
        password: NETPING_PASSWORD,
      },
    });

    if (response.status === 200) {
      const result = response.data;
      const match = result.match(/relay_result\('ok',\s*(\d+),\s*(\d+)\)/);

      if (match) {
        const status = parseInt(match[2]);
        console.log(
          `[NetPing] Статус реле ${relayNumber}: ${
            status === 1 ? "включено" : "выключено"
          }`
        );
        return {
          success: true,
          status: status === 1 ? "on" : "off",
          message:
            status === 1 ? "Устройство включено" : "Устройство выключено",
        };
      } else {
        throw new Error("Не удалось распарсить ответ от NetPing");
      }
    } else {
      throw new Error(`Статус ответа: ${response.status}`);
    }
  } catch (error: any) {
    if (error?.code === "ECONNABORTED") {
      console.error("[NetPing] Ошибка: Таймаут запроса при чтении статуса.");
      return { success: false, message: "Устройство не отвечает (таймаут)" };
    }
    console.error("[NetPing] Ошибка при чтении статуса:", error?.message);
    return { success: false, message: "Не удалось получить статус устройства" };
  }
}

export async function controlNetPingRelay(
  relayNumber: number,
  action: NetpingAction
) {
  let command;
  if (action === "on") {
    command = `r${relayNumber}=1`;
  } else if (action === "off") {
    command = `r${relayNumber}=0`;
  } else {
    return { success: false, message: "Неизвестная команда" };
  }

  const url = `http://${NETPING_IP}/relay.cgi?${command}`;

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      auth: {
        username: NETPING_LOGIN,
        password: NETPING_PASSWORD,
      },
    });

    if (response.status === 200) {
      console.log(
        `[NetPing] Команда "${action}" для розетки ${relayNumber} выполнена успешно`
      );
      return {
        success: true,
        message: `Монитор ${action === "on" ? "включен" : "выключен"}`,
      };
    } else {
      throw new Error(`Статус ответа: ${response.status}`);
    }
  } catch (error: any) {
    // Ловим и сетевые ошибки, и ошибки таймаута
    if ("code" in error && error.code === "ECONNABORTED") {
      console.error(
        "[NetPing] Ошибка: Таймаут запроса. NetPing не ответил за 5 секунд."
      );
      return { success: false, message: "Устройство не отвечает (таймаут)" };
    }

    // Обработка других ошибок (например, нет сети)
    console.error(
      "[NetPing] Ошибка при отправке команды:",
      error?.message ?? "Неизвестная ошибка при отправке команды"
    );
    return {
      success: false,
      message: "Не удалось отправить команду на NetPing",
    };
  }
}
