import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import streamStore from "../../store/streamsStore";

type Props = {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  onStreamReady?: (stream: MediaStream, unavailable: boolean) => void;
  poster?: string;
};
function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    // ширина ограничивает
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    // высота ограничивает
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}
const HlsPlayer: React.FC<Props> = ({
  src,
  autoPlay = true,
  controls = false,
  onStreamReady,
  poster,
}) => {
  const { setProgress, getProgress } = streamStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const video = videoRef.current;

    const handleError = () => setError(true);
    const handleCanPlay = () => setError(false);
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
      // Отслеживание ошибок Hls.js
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS fatal error", data);
          handleError();
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
    let stream: undefined | MediaStream
    if (onStreamReady){
          const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    const fallbackImg = new Image();
    if (poster){

      fallbackImg.src = poster;
    }

    const drawLoop = () => {
      if (ctx) {
        // console.log(!error && video.readyState >= 2);

        if (!error && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else if (error) {
          drawImageContain(ctx, fallbackImg, canvas.width, canvas.height);
        }
      }
      requestAnimationFrame(drawLoop);
    };

    drawLoop();
    stream = canvas.captureStream(30); // 30 FPS
    onStreamReady(stream, error);
    }
    // video.addEventListener("play", () => {
    // });
    // const saveProgress = () => {
    //   if (!video.paused && !video.seeking) {
    //     setProgress(src, video.currentTime);
    //   }
    // };

    // Если видео снова может проигрываться
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      if (video && !video.seeking) {
        setProgress(src, video.currentTime);
      }
      if (stream){
        stream.getTracks().forEach((track) => track.stop());
      }
      hls?.destroy();

      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src, onStreamReady, setProgress, getProgress, autoPlay, error, poster]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoPlay}
        // onError={() => setError(true)}
        // onCanPlay={() => setError(false)}
        playsInline
        loop
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.5s ease",
          opacity: error ? 0 : 1,
        }}
      />
      {/* Fallback картинка */}
      {poster && <img
        src={poster}
        alt="Стрим недоступен"
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transition: "opacity 0.5s ease",
          opacity: error ? 1 : 0,
          maxHeight: "130px",
          margin: "auto 0",
        }}
      />}
      {onStreamReady && <canvas style={{ opacity: 0 }} ref={canvasRef} />}
    </div>
  );
};

export default HlsPlayer;
