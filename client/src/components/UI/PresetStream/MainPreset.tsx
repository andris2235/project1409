import { memo, useCallback } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";
import streamStore from "../../../store/streamsStore";
const hlsStreams = [
  "https://stream-fastly.castr.com/5b9352dbda7b8c769937e459/live_2361c920455111ea85db6911fe397b9e/index.fmp4.m3u8",
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8",
  "http://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8",
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
];
const MainPreset = () => {
const setMirrorStreams = streamStore(state => state.setMirrorStreams);

  const setMirrorStreamsHandler = useCallback(
    (stream: MediaStream, src: string) => {     
      setMirrorStreams({mirrorStreeam: stream, src});
    },
    [setMirrorStreams]
  );
 
  
  return hlsStreams.map((i) => (
    <div className={styles.firstPresetItem} key={i}>
      <HlsPlayer onStreamReady={(s)=>setMirrorStreamsHandler(s, i)} src={i} />
    </div>
  ));
};

export default memo(MainPreset);
