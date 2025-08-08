const net = require('net');
const express = require('express');
const app = express();
const PORT = 3000;

// Настройки мультивьювера
const MV_HOST = '192.168.31.142';  // IP-адрес мультивьювера
const MV_PORT = 23;              // Telnet-порт

// TCP-сокет к мультивьюверу
let mvSocket = new net.Socket();
function connectMV() {
    mvSocket.connect(MV_PORT, MV_HOST, () => {
        console.log('Connected to multiviewer');
    });
    mvSocket.on('error', err => {
        console.error('MV error:', err);
        setTimeout(connectMV, 2000);
    });
    mvSocket.on('close', () => {
        console.log('MV connection closed, retrying…');
        setTimeout(connectMV, 2000);
    });
}
connectMV();

// Раздаем статические файлы из папки public
app.use(express.static('public'));

// Эндпоинт для переключения пресетов // В команде Telnet в документации производителя: 5→Preset 1, 6→Preset 2, 7→Preset 3, 8→Preset 4
app.get('/preset/:n', (req, res) => {
    const n = parseInt(req.params.n, 10);
    if (n >= 1 && n <= 4) {
        const code = 4 + n;
        const cmd = `set window layout mode ${code}\r\n`;
        mvSocket.write(cmd);
        res.json({ status: 'ok', preset: n }); // ✅ отправляем JSON
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid preset number' }); // ✅ JSON даже в ошибке
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
