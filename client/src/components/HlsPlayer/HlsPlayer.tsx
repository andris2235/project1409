import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import streamStore from "../../store/streamsStore";

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
  const { setProgress, getProgress } = streamStore();
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
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const lastTime = getProgress(src);
        if (!isNaN(lastTime)) {
          video.currentTime = lastTime;
        }
        if (autoPlay) {
          video.play().catch((err) => {
            console.warn("Video play failed", err);
          });
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.currentTime = getProgress(src);
      if (autoPlay) {
        video.play().catch((err) => {
          console.warn("Video play failed", err);
        });
      }
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
    // const saveProgress = () => {
    //   if (!video.paused && !video.seeking) {
    //     setProgress(src, video.currentTime);
    //   }
    // };

    return () => {
      if (video && !video.seeking) {
        setProgress(src, video.currentTime);
      }
      stream.getTracks().forEach((track) => track.stop());
      hls?.destroy();
    };
  }, [src, onStreamReady, setProgress, getProgress, autoPlay]);

  return (
    <>
      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoPlay}
        playsInline
        loop
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <canvas style={{opacity: 0}} ref={canvasRef} />
    </>
  );
};

export default HlsPlayer;
