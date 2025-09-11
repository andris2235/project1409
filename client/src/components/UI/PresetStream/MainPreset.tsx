import { memo, useCallback } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";
import streamStore from "../../../store/streamsStore";
import { baseURL } from "../../../http";
const hlsStreams = [
  {url: `${baseURL}stream1/index.m3u8`, key: "console_big"},
  {url: `${baseURL}stream2/index.m3u8`, key: "console_small"},
  {url: `${baseURL}stream3/index.m3u8`, key: "Ptz_big"},
  {url: `${baseURL}stream4/index.m3u8`, key: "Ptz_small"},
];
const MainPreset = () => {
const setMirrorStreams = streamStore(state => state.setMirrorStreams);

  const setMirrorStreamsHandler = useCallback(
    (stream: MediaStream, src: string, key: string) => {     
      setMirrorStreams({mirrorStreeam: stream, src, key});
    },
    [setMirrorStreams]
  );
 
  
  return hlsStreams.map((i) => (
  <div className={styles.firstPresetItem} key={i.key}>
    <HlsPlayer 
      onStreamReady={(s)=>setMirrorStreamsHandler(s, i.url, i.key)} 
      src={i.url}
      streamKey={i.key} //  ДОБАВИЛИ streamKey для различных подстановок лого
    />
  </div>
));
};

export default memo(MainPreset);
