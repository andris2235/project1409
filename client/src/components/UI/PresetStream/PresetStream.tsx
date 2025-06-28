import styles from "./style.module.scss";
import { PresetTypes } from "../../../types/stream";
import { useMemo } from "react";
import HlsPlayer from "../../HlsPlayer/HlsPlayer";

interface PresetStreamProps {
  streams: string[];
  preset: PresetTypes;
}
const PresetStream = ({ streams, preset }: PresetStreamProps) => {
  const content = useMemo(() => {
    if (preset === PresetTypes.first) {
      return streams.map((i) => (
        <div className={styles.firstPresetItem} key={i}>
          <HlsPlayer src={i} />
        </div>
      ));
    } else if (preset === PresetTypes.second || preset === PresetTypes.third) {
      const firstStream = streams[0];
      const secondStream = streams[1];
      return (
        <>
          <div className={styles.fullPresetItem}>
            <HlsPlayer src={firstStream} />
          </div>
          <div className={styles.topRightPresetItem}>
            <HlsPlayer src={secondStream} />
          </div>
        </>
      );
    } else {
      const firstStream = streams[0];
      const secondStream = streams[1];
      const thirdStream = streams[2];
      return (
        <>
          <div className={styles.fullPresetItem}>
            <HlsPlayer src={firstStream} />
          </div>
          <div className={styles.topRightPresetItem}>
            <HlsPlayer src={secondStream} />
          </div>
          <div className={styles.bottomRightPresetItem}>
            <HlsPlayer src={thirdStream} />
          </div>
        </>
      );
    }
  }, [preset, streams]);
  return <div className={styles.wrapper}>{content}</div>;
};

export default PresetStream;
