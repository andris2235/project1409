import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import streamStore from "../../store/streamsStore";

type Props = {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  onStreamReady: (stream: MediaStream) => void;
  streamKey?: string; // ✅ 
};

const HlsPlayer: React.FC<Props> = ({
  src,
  autoPlay = true,
  controls = false,
  onStreamReady,
  streamKey,
}) => {
  const { setProgress, getProgress } = streamStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // ✅ СОСТОЯНИЯ ДЛЯ PLACEHOLDER
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // ✅ ФУНКЦИЯ ДЛЯ PLACEHOLDER
  const getPlaceholderImage = (key?: string) => {
    const placeholders: Record<string, string> = {
      'console_big': '/console_big_placeholder.png',
      'console_small': '/console_small_placeholder.png', 
      'Ptz_big': '/ptz_big_placeholder.png',
      'Ptz_small': '/ptz_small_placeholder.png'
    };
    console.log('🔍 StreamKey:', key, 'Placeholder:', placeholders[key || '']); // ✅ ДЛЯ ОТЛАДКИ
    return key ? placeholders[key] || '/logo192.png' : '/logo192.png';
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let hls: Hls | null = null;
    setIsLoading(true);
    setHasError(false);
    setVideoReady(false);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest parsed for:', streamKey); // ✅ ОТЛАДКА
        const lastTime = getProgress(src);
        if (!isNaN(lastTime)) {
          video.currentTime = lastTime;
        }
        if (autoPlay) {
          video.play().catch((err) => {
            console.warn("Video play failed", err);
            setHasError(true);
            setIsLoading(false);
          });
        }
      });

      // ✅ ОБРАБОТКА ГОТОВНОСТИ ВИДЕО
      video.addEventListener('loadeddata', () => {
        console.log('✅ Video ready for:', streamKey); // ✅ ОТЛАДКА
        setVideoReady(true);
        setIsLoading(false);
      });

      // ✅ ОБРАБОТКА ОШИБОК
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS error for:', streamKey, data);
        setHasError(true);
        setIsLoading(false);
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.currentTime = getProgress(src);
      
      video.addEventListener('loadeddata', () => {
        setVideoReady(true);
        setIsLoading(false);
      });
      
      video.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
      });
      
      if (autoPlay) {
        video.play().catch((err) => {
          console.warn("Video play failed", err);
          setHasError(true);
        });
      }
    } else {
      console.error("HLS not supported");
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    const drawLoop = () => {
      // ✅ РИСУЕМ ТОЛЬКО КОГДА ВИДЕО ГОТОВО
      if (videoReady && video.readyState >= 2) {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(drawLoop);
    };

    drawLoop();
    const stream = canvas.captureStream(30);
    onStreamReady(stream);

    return () => {
      if (video && !video.seeking) {
        setProgress(src, video.currentTime);
      }
      stream.getTracks().forEach((track) => track.stop());
      hls?.destroy();
    };
  }, [src, onStreamReady, setProgress, getProgress, autoPlay, streamKey, videoReady]);

  return (
    <>
      {/* ✅ PLACEHOLDER ПОКАЗЫВАЕМ ПОВЕРХ ВСЕГО */}
      {(isLoading || hasError) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          zIndex: 10, // ✅ ПОВЕРХ CANVAS
        }}>
          <img 
            src={getPlaceholderImage(streamKey)}
            alt={hasError ? "Stream Error" : "Loading Stream"}
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain'
            }}
          />
          {isLoading && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              color: 'white',
              fontSize: '12px'
            }}>
              Загрузка {streamKey}...
            </div>
          )}
        </div>
      )}

      {/* ✅ VIDEO СКРЫТ, НО РАБОТАЕТ */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        controls={controls}
        autoPlay={autoPlay}
        muted
      />
      
      {/* ✅ CANVAS ПОКАЗЫВАЕМ ТОЛЬКО КОГДА ВИДЕО ГОТОВО */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: videoReady ? 'block' : 'none',
          width: '100%', 
          height: '100%' 
        }} 
      />
    </>
  );
};

export default HlsPlayer;
