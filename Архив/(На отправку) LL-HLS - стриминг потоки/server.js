const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;
const STREAMS = [0, 1, 2, 3]; // Номера источников видеосигнала по команде:  ffmpeg -f avfoundation -list_devices true -i ""
const PUBLIC_DIR = path.join(__dirname, 'public');

function createStream(streamIndex) {
    const folder = path.join(PUBLIC_DIR, `stream${streamIndex + 1}`);

    if (fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true });
    }
    fs.mkdirSync(folder, { recursive: true });

    app.get(`/stream${streamIndex + 1}/index.m3u8`, (req, res) => {
        res.header('Content-Type', 'application/vnd.apple.mpegurl');
        res.sendFile(path.join(folder, 'index.m3u8'));
    });

    app.get(`/stream${streamIndex + 1}/:segment.m4s`, (req, res) => {
        res.header('Content-Type', 'video/iso.segment');
        res.sendFile(path.join(folder, `${req.params.segment}.m4s`));
    });

    app.get(`/stream${streamIndex + 1}/init.mp4`, (req, res) => {
        res.header('Content-Type', 'video/mp4');
        res.sendFile(path.join(folder, 'init.mp4'));
    });

    const ffmpegArgs = [
        '-f', 'avfoundation',
        '-framerate', '15',
        '-video_size', '640x480',
        '-i', `${STREAMS[streamIndex]}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-g', '30',
        '-sc_threshold', '0',
        '-hls_time', '1',
        '-hls_list_size', '6',
        '-hls_playlist_type', 'event',
        '-hls_flags', 'delete_segments+append_list+independent_segments',
        '-hls_segment_type', 'fmp4',
        '-hls_fmp4_init_filename', 'init.mp4',
        '-hls_segment_filename', path.join(folder, 'segment%03d.m4s'),
        path.join(folder, 'index.m3u8')
    ];

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);
    ffmpeg.stderr.on('data', data => console.log(`Stream${streamIndex + 1}: ` + data.toString()));
    ffmpeg.on('exit', code => console.log(`Stream${streamIndex + 1} ffmpeg exited with code ${code}`));
}

STREAMS.forEach((_, index) => createStream(index));

// Удаление лишних сегментов из папок Стрим, чтобы не забивалась память сервера
const MAX_SEGMENTS = 10;
const STREAM_DIRS = ['stream1', 'stream2', 'stream3', 'stream4'].map(name =>
    path.join(__dirname, 'public', name)
);

setInterval(() => {
    STREAM_DIRS.forEach(STREAM_PATH => {
        fs.readdir(STREAM_PATH, (err, files) => {
            if (err) return;

            const segments = files
                .filter(file => /^segment\d+\.m4s$/.test(file))
                .sort((a, b) => {
                    const numA = parseInt(a.replace('segment', '').replace('.m4s', ''));
                    const numB = parseInt(b.replace('segment', '').replace('.m4s', ''));
                    return numA - numB;
                });

            if (segments.length > MAX_SEGMENTS) {
                const toDelete = segments.slice(0, segments.length - MAX_SEGMENTS);
                toDelete.forEach(file => {
                    fs.unlink(path.join(STREAM_PATH, file), err => {
                        if (err) console.error(`Ошибка удаления ${file}:`, err);
                    });
                });
            }
        });
    });
}, 5000); // каждые 5 секунд


app.use(express.static(PUBLIC_DIR));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

