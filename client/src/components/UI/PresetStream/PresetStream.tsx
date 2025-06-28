import styles from "./style.module.scss";
import { PresetTypes } from "../../../types/stream";
import { useCallback, useMemo } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import MirrorPlayer from "../../HlsPlayer/MirrorPlayer";
import streamStore from "../../../store/streamsStore";

interface PresetStreamProps {
  streams: string[];
  preset: PresetTypes;
}
const PresetStream = ({ streams, preset }: PresetStreamProps) => {
    const {mirrorStreams, setMirrorStreams} = streamStore()
    const setMirrorStreamsHandler = useCallback((stream: MediaStream)=>{
      setMirrorStreams(stream)
    }, [setMirrorStreams])
    
  const content = useMemo(() => {
    if (preset === PresetTypes.first) {
      return streams.map((i) => (
        <div className={styles.firstPresetItem} key={i}>
          <HlsPlayer onStreamReady={setMirrorStreamsHandler} src={i} />
        </div>
      ));
    } else if (preset === PresetTypes.second || preset === PresetTypes.third) {
      const firstStream = mirrorStreams[0];
      const secondStream = mirrorStreams[1];    
      if (!firstStream || !secondStream) return
      return (
        <>
          <div className={styles.fullPresetItem}>
            <MirrorPlayer stream={firstStream} />
          </div>
          <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream} />
          </div>
        </>
      );
    } else {
      const firstStream = mirrorStreams[0];
      const secondStream = mirrorStreams[1];
      const thirdStream = mirrorStreams[2];
      return (
        <>
          <div className={styles.fullPresetItem}>
            <MirrorPlayer stream={firstStream} />
          </div>
          <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream} />
          </div>
          <div className={styles.bottomRightPresetItem}>
            <MirrorPlayer stream={thirdStream} />
          </div>
        </>
      );
    }
  }, [preset, streams, mirrorStreams, setMirrorStreamsHandler]);
  return <div className={styles.wrapper}>{content}</div>;
};

export default PresetStream;
