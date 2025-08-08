const express = require('express');
const cors = require('cors');
const Onvif = require('node-onvif');

const app = express();
app.use(cors());
app.use(express.json());

let device = new Onvif.OnvifDevice({
    xaddr: 'http://192.168.31.128:80/onvif/device_service',
    user: 'admin',
    pass: 'admin'
});

let isReady = false;

device.init().then(() => {
    isReady = true;
    console.log('ONVIF камера инициализирована');
}).catch((err) => {
    console.error('Ошибка инициализации:', err.message);
});

// начало движения
app.post('/start', async (req, res) => {
    if (!isReady) return res.status(500).send('Камера не готова');
    const { x, y, z } = req.body;
    try {
        await device.ptzMove({ speed: { x, y, z } });
        res.send('Движение начато');
    } catch (err) {
        res.status(500).send('Ошибка движения: ' + err.message);
    }
});

// остановка движения
app.post('/stop', async (req, res) => {
    if (!isReady) return res.status(500).send('Камера не готова');
    try {
        await device.ptzStop();
        res.send('Остановлено');
    } catch (err) {
        res.status(500).send('Ошибка остановки: ' + err.message);
    }
});

app.listen(3001, () => console.log('Backend запущен на http://localhost:3001'));
