const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

// --- НАСТРОЙКИ ---
const PORT = 8000;
const NETPING_IP = "192.168.1.100"; // IP-адрес NetPing
const NETPING_LOGIN = "visor"; // Логин по умолчанию
const NETPING_PASSWORD = "ping"; // Пароль по умолчанию

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- УПРАВЛЕНИЕ NETPING ---

async function controlNetPingRelay(relayNumber, action) {
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
  } catch (error) {
    // Ловим и сетевые ошибки, и ошибки таймаута
    if (error.code === "ECONNABORTED") {
      console.error(
        "[NetPing] Ошибка: Таймаут запроса. NetPing не ответил за 5 секунд."
      );
      return { success: false, message: "Устройство не отвечает (таймаут)" };
    }

    // Обработка других ошибок (например, нет сети)
    console.error("[NetPing] Ошибка при отправке команды:", error.message);
    return {
      success: false,
      message: "Не удалось отправить команду на NetPing",
    };
  }
}

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Новый маршрут для приема команд от кнопок
app.post("/netping/control", async (req, res) => {
  // Получаем команду из тела запроса, которое отправил фронтенд
  const { command } = req.body; // command будет равно 'on' или 'off'

  console.log(`Получена команда: ${command}`);

  if (command === "on") {
    const result = await controlNetPingRelay(1, "on");
    res.json(result);
  } else if (command === "off") {
    const result = await controlNetPingRelay(1, "off");
    res.json(result);
  } else {
    // Если пришла какая-то другая команда
    res.status(400).json({ success: false, message: "Неверная команда" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Функция для чтения статуса реле
async function getNetPingRelayStatus(relayNumber) {
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
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("[NetPing] Ошибка: Таймаут запроса при чтении статуса.");
      return { success: false, message: "Устройство не отвечает (таймаут)" };
    }
    console.error("[NetPing] Ошибка при чтении статуса:", error.message);
    return { success: false, message: "Не удалось получить статус устройства" };
  }
}
const result = await getNetPingRelayStatus(1);
