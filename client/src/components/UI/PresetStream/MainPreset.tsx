import { memo, useCallback } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";
import streamStore from "../../../store/streamsStore";
import { baseURL } from "../../../http";
const hlsStreams = [
  `${baseURL}stream1/index.m3u8`,
  `${baseURL}stream2/index.m3u8`,
  `${baseURL}stream3/index.m3u8`,
  `${baseURL}stream4/index.m3u8`,
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
