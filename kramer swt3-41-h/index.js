const express = require('express');
const path = require('path');
const net = require('net');

const app = express();
const PORT = 3000;

// НАСТРОЙКИ KRAMER 
const SWITCHER_IP = '192.168.31.162'; // IP Kramer
const SWITCHER_PORT = 5000; // TCP-порт для Protocol 3000 (в настройках устройства)
// ------------------------------------

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Отправка команды на коммутатор
function sendCommandToSwitcher(inputNumber) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        // Подключаемся к коммутатору
        client.connect(SWITCHER_PORT, SWITCHER_IP, () => {
            console.log(`Connected to switcher at ${SWITCHER_IP}:${SWITCHER_PORT}`);

            // Формируем команду по Protocol 3000. \r - это Carriage Return
            const command = `ROUTE1,1,${inputNumber}\r`;

            console.log(`Sending command: ${command}`);
            client.write(command);
        });

        // Обработка ответа от коммутатора
        client.on('data', (data) => {
            console.log('Received from switcher: ' + data.toString());
            client.destroy(); // Закрываем соединение после получения ответа
            resolve(data.toString());
        });

        // Обработка ошибок
        client.on('error', (err) => {
            console.error('Switcher connection error:', err.message);
            reject(err);
        });

        // Обработка закрытия соединения
        client.on('close', () => {
            console.log('Connection to switcher closed.');
        });
    });
}

app.post('/switch/:input', async (req, res) => {
    const input = parseInt(req.params.input, 10);

    if (isNaN(input) || input < 1 || input > 4) {
        return res.status(400).json({ status: 'error', message: 'Invalid input number' });
    }

    try {
        const response = await sendCommandToSwitcher(input);
        res.json({ status: 'success', message: `Switched to input ${input}`, switcherResponse: response });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to send command to switcher' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
