// index.js
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Для записи (main_stream)
const RECORD_KEY = 'main_stream';
const RECORD_URL = `rtsp://192.168.31.150:554/${RECORD_KEY}`;

// Для браузерного LL-HLS (sub_stream)
const HLS_KEY = 'sub_stream';
const HLS_URL = `rtsp://192.168.31.150:554/${HLS_KEY}`;
const HLS_DIR = path.resolve(__dirname, 'public', 'hls');
const HLS_PLAYLIST = `${HLS_KEY}.m3u8`;
const RECORD_DIR = path.resolve(__dirname, 'records');

// Переменные для процессов
let recordProcess = null;
let hlsProcess = null;

// Функция для очистки всех файлов из папки HLS
function clearHlsDirectory() {
    try {
        // fs.readdirSync() - синхронно читает содержимое папки и возвращает массив имен файлов
        const files = fs.readdirSync(HLS_DIR);

        // forEach() - метод массива, выполняет функцию для каждого элемента
        files.forEach(file => {
            // path.join() - безопасно склеивает путь к папке с именем файла
            const filePath = path.join(HLS_DIR, file);

            try {
                // fs.unlinkSync() - синхронно удаляет файл
                fs.unlinkSync(filePath);
                console.log(`Удален старый файл: ${file}`);
            } catch (err) {
                // Если файл не удалось удалить, выводим ошибку, но не останавливаем программу
                console.error(`Ошибка удаления файла ${file}:`, err.message);
            }
        });

        console.log('Папка HLS очищена');
    } catch (err) {
        // Если не удалось прочитать папку (например, её нет), выводим ошибку
        console.error('Ошибка очистки папки HLS:', err.message);
    }
}

// // Функция для удаления старых сегментов, когда их становится больше 10
// function cleanupOldSegments() {
//     try {
//         // Читаем содержимое папки HLS
//         const files = fs.readdirSync(HLS_DIR);

//         // filter() - метод массива, оставляет только элементы, для которых функция возвращает true
//         // Фильтруем только сегменты (.m4s файлы), исключаем плейлист (.m3u8)
//         const segments = files.filter(file => file.endsWith('.m4s'));

//         // Проверяем, превышает ли количество сегментов лимит в 10
//         if (segments.length > 10) {
//             // sort() - сортирует массив. По умолчанию сортирует по алфавиту
//             // Сортируем сегменты по имени (старые сегменты обычно имеют меньшие номера)
//             segments.sort();

//             // slice() - возвращает часть массива
//             // slice(0, segments.length - 10) - берем все элементы кроме последних 10
//             // Например, если 15 сегментов: slice(0, 5) вернет первые 5 (самые старые)
//             const segmentsToDelete = segments.slice(0, segments.length - 10);

//             // Удаляем старые сегменты
//             segmentsToDelete.forEach(segment => {
//                 const segmentPath = path.join(HLS_DIR, segment);
//                 try {
//                     fs.unlinkSync(segmentPath);
//                     console.log(`Удален старый сегмент: ${segment}`);
//                 } catch (err) {
//                     console.error(`Ошибка удаления сегмента ${segment}:`, err.message);
//                 }
//             });
//         }
//     } catch (err) {
//         console.error('Ошибка очистки старых сегментов:', err.message);
//     }
// }

// Создать папку, если нет + очистить HLS папку при запуске
[HLS_DIR, RECORD_DIR].forEach(dir => {
    // Если папка не существует - создаем её
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Создана папка: ${dir}`);
    }
});

// Очищаем папку HLS от старых файлов при запуске сервера
console.log('Очистка папки HLS при запуске...');
clearHlsDirectory();

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Улучшенная функция запуска HLS-конвертера с автоматическим восстановлением
let hlsWatchdog = null;

function startHls() {
    const args = [
        '-hide_banner',
        '-rtsp_transport', 'tcp',
        '-i', HLS_URL,
        '-c:v', 'h264_videotoolbox',                // Аппаратное кодирование! На линуксе заменим на h264_vaapi
        '-avoid_negative_ts', 'make_zero',
        '-fflags', '+genpts+discardcorrupt',
        '-max_muxing_queue_size', '1024',
        '-hls_time', '1',
        '-hls_list_size', '5',
        '-hls_flags', 'append_list+omit_endlist+split_by_time+discont_start',
        '-hls_segment_type', 'fmp4',
        '-hls_segment_filename', path.join(HLS_DIR, `${HLS_KEY}_%05d.m4s`),
        '-hls_allow_cache', '0',
        '-hls_playlist_type', 'event',
        '-y',
        path.join(HLS_DIR, HLS_PLAYLIST)
    ];

    if (hlsProcess && !hlsProcess.killed) {
        console.log('Останавливаем предыдущий HLS процесс...');
        hlsProcess.kill('SIGKILL');
    }

    // spawn с pipe, чтобы читать stderr
    hlsProcess = spawn('ffmpeg', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
    });

    // читаем логи ffmpeg
    hlsProcess.stderr.on('data', (chunk) => {
        console.log('[ffmpeg-hls stderr]', chunk.toString());
    });
    hlsProcess.stdout.on('data', (chunk) => {
        // обычно ffmpeg пишет в stderr, stdout пустой, но на всякий случай:
        console.log('[ffmpeg-hls stdout]', chunk.toString());
    });

    hlsProcess.on('error', (err) => {
        console.error('Ошибка запуска HLS ffmpeg:', err.message);
    });

    hlsProcess.on('close', (code, signal) => {
        console.warn(`HLS ffmpeg закрыт code=${code}, signal=${signal}. Перезапуск через 3 сек.`);
        // Очистим watchdog
        if (hlsWatchdog) {
            clearInterval(hlsWatchdog);
            hlsWatchdog = null;
        }
        setTimeout(startHls, 3000);
    });

    // watchdog: если плейлист не обновлялся >5s, перезапускаем
    hlsWatchdog = setInterval(() => {
        try {
            const stat = fs.statSync(path.join(HLS_DIR, HLS_PLAYLIST));
            if (Date.now() - stat.mtimeMs > 5000) {
                console.warn('HLS playlist stale, restarting HLS ffmpeg');
                if (hlsProcess && !hlsProcess.killed) hlsProcess.kill('SIGKILL');
            }
        } catch (e) {
            // плейлист ещё не создан — ок
        }
    }, 3000);
}

// Запускаем HLS при старте сервера
startHls();

// API: старт записи
app.post('/record/start', (req, res) => {
    if (recordProcess) {
        return res.status(400).json({ error: 'Запись уже запущена' });
    }

    // Берём данные из тела запроса (они придут из index.html)
    const { name = '', date = '' } = req.body || {};

    // Функция безопасного имени файла
    function safeName(s) {
        return s
            .trim()
            .replace(/\s+/g, '_')           // пробелы -> _
            .replace(/[:\/\\<>?"|*']/g, '') // удалить запрещенные символы
            .replace(/[^\w\-а-яА-ЯёЁ_]/g, ''); // оставить буквы/цифры/подчерки
    }

    // Формируем имя: если есть имя пациента — используем его, плюс дата (если есть)
    let base;
    const safePatient = safeName(name);
    if (safePatient) {
        if (date) {
            base = `${safePatient}_${date}`;
        } else {
            // если дата не указана — добавим текущее время для уникальности
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            base = `${safePatient}_${ts}`;
        }
    } else {
        // если имя не задано — fallback на старый timestamp
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        base = `record-${ts}`;
    }

    const filename = `${base}.mp4`;
    const output = path.join(RECORD_DIR, filename);

    // Запускаем ffmpeg для записи (как раньше)
    const args = [
        '-hide_banner',
        '-rtsp_transport', 'tcp',
        '-i', RECORD_URL,
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        '-fflags', '+genpts',
        output
    ];

    recordProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'inherit', 'inherit'] });
    console.log(`Запись начата: ${output}`);

    recordProcess.on('exit', (code, signal) => {
        console.log(`FFmpeg (запись) завершился: code=${code}, signal=${signal}`);
        recordProcess = null;
    });

    recordProcess.on('error', (err) => {
        console.error('Ошибка запуска записи:', err.message);
        recordProcess = null;
    });

    res.json({ status: 'started', file: filename });
});


// API: стоп записи
app.post('/record/stop', (req, res) => {
    if (!recordProcess) {
        return res.status(400).json({ error: 'Запись не запущена' });
    }

    // Останавливаем ffmpeg
    recordProcess.kill('SIGINT');
    recordProcess = null; // сбрасываем сразу
    console.log('Запись остановлена по запросу');
    res.json({ status: 'stopped' });
});

// API для перезапуска HLS потока
app.post('/hls/restart', (req, res) => {
    try {
        restartHls();
        res.json({ success: true, message: 'HLS поток перезапущен' });
    } catch (error) {
        console.error('Ошибка перезапуска HLS:', error.message);
        res.status(500).json({ error: 'Ошибка перезапуска HLS потока' });
    }
});


// API для очистки HLS папки
app.post('/hls/clear', (req, res) => {
    try {
        clearHlsDirectory();
        res.json({ success: true, message: 'HLS папка очищена' });
    } catch (error) {
        console.error('Ошибка очистки HLS папки:', error.message);
        res.status(500).json({ error: 'Ошибка очистки HLS папки' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});

// ловим сигналы выхода и корректно убиваем ffmpeg
function shutdown() {
    console.log('Остановка сервера: завершаем подпроцессы ffmpeg…');
    if (hlsProcess && !hlsProcess.killed) hlsProcess.kill('SIGINT');
    if (recordProcess && !recordProcess.killed) recordProcess.kill('SIGINT');
    process.exit();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);