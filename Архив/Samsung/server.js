const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

// ====== НАСТРОЙКИ ======
const TV_IP = '192.168.31.253'; // IP Самсунг QB65C (может в файл env засунуть?)
const TV_PORT = 1515;            // Порт MDC over Ethernet - не меняется
// =====================

// Команды вкл/выкл из мануала
const CMD_POWER_ON = Buffer.from([0xAA, 0x11, 0x01, 0x01, 0x01, 0x14]);
const CMD_POWER_OFF = Buffer.from([0xAA, 0x11, 0x01, 0x01, 0x00, 0x13]);

function sendToTV(commandBuffer) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.connect(TV_PORT, TV_IP, () => {
            console.log(`Отправка: ${commandBuffer.toString('hex')}`);
            socket.write(commandBuffer);
            setTimeout(() => { socket.end(); resolve(); }, 200);
        });

        socket.on('error', reject);
        socket.on('timeout', () => { socket.destroy(); reject(new Error('TCP timeout')); });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        const htmlPath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(htmlPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(html);
    }

    if (req.url === '/on' && req.method === 'POST') {
        try { await sendToTV(CMD_POWER_ON); res.writeHead(204).end(); }
        catch (err) { res.writeHead(500).end(err.toString()); }
        return;
    }

    if (req.url === '/off' && req.method === 'POST') {
        try { await sendToTV(CMD_POWER_OFF); res.writeHead(204).end(); }
        catch (err) { res.writeHead(500).end(err.toString()); }
        return;
    }

    res.writeHead(404).end('Not found');
});

server.listen(5050, () => {
    console.log(`http://localhost:5050`);
});

