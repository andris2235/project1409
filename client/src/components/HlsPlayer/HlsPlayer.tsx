import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  onStreamReady: (stream: MediaStream) => void;
};

const HlsPlayer: React.FC<Props> = ({
  src,
  autoPlay = true,
  controls = false,
  onStreamReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      console.error("HLS not supported");
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    const drawLoop = () => {
      if (video.readyState >= 2) {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(drawLoop);
    };

    drawLoop();
    const stream = canvas.captureStream(30); // 30 FPS
    onStreamReady(stream);
    // video.addEventListener("play", () => {
    // });

    return () => {
      hls?.destroy();
    };
  }, [src, onStreamReady]);

  return (
    <>
      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoPlay}
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <canvas ref={canvasRef} />
    </>

    // <></>
  );
};

export default HlsPlayer;
