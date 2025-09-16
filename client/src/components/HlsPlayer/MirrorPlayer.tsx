import React, { memo, useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  autoPlay?: boolean;
  controls?: boolean;
  unavailable?: boolean;
};

const MirrorPlayer: React.FC<Props> = ({
  stream,
  autoPlay = true,
  controls = false,
  unavailable = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  // if (!stream) return

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      muted
      playsInline
      controls={controls}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: unavailable ? "scale(.5)" : undefined }}
    />
  );
};

export default memo(MirrorPlayer);
