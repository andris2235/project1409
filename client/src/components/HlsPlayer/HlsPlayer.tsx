import React, { useEffect, useRef } from "react"
import Hls from "hls.js"

type Props = {
  src: string
  autoPlay?: boolean
  controls?: boolean
}

const HlsPlayer: React.FC<Props> = ({
  src,
  autoPlay = true,
  controls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari
      video.src = src
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)

      return () => {
        hls.destroy()
      }
    } else {
      console.error("HLS is not supported in this browser.")
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls={controls}
      autoPlay={autoPlay}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    // <></>
  )
}

export default HlsPlayer
