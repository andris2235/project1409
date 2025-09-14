import { memo, useCallback } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";
import streamStore from "../../../store/streamsStore";
import { baseURL } from "../../../http";
const hlsStreams = [
  {url: `${baseURL}stream1/index.m3u8`, key: "console_big", poster: "/bigNoVideo.png"},
  {url: `${baseURL}stream2/index.m3u8`, key: "console_small", poster: "/smallNoVideo.png"},
  {url: `${baseURL}stream3/index.m3u8`, key: "Ptz_big", poster: "/noVideo.png"},
  {url: `${baseURL}stream4/index.m3u8`, key: "Ptz_small", poster: "/noVideo.png"},
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
      <HlsPlayer poster={i.poster} onStreamReady={(s)=>setMirrorStreamsHandler(s, i.url, i.key)} src={i.url} />
    </div>
  ));
};

export default memo(MainPreset);
