import React, { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  autoPlay?: boolean;
  controls?: boolean;
};

const MirrorPlayer: React.FC<Props> = ({
  stream,
  autoPlay = true,
  controls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      muted
      playsInline
      controls={controls}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

export default MirrorPlayer;
