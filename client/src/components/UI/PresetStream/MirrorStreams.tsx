import { PresetTypes } from "../../../types/stream";
import { memo, useMemo } from "react";
import MirrorPlayer from "../../HlsPlayer/MirrorPlayer";
import streamStore from "../../../store/streamsStore";
import styles from "./style.module.scss";
interface PresetStreamProps {
  preset: PresetTypes;
}
const MirrorStreams = ({ preset }: PresetStreamProps) => {
  const { mirrorStreams } = streamStore();

  const content = useMemo(() => {
    if (preset === PresetTypes.second || preset === PresetTypes.third) {
      const firstStream = mirrorStreams[0];
      const secondStream = mirrorStreams[1];
      if (!firstStream || !secondStream) return;
      return (
        <>
          <div className={styles.fullPresetItem}>
            <MirrorPlayer stream={firstStream.mirrorStreeam} />
          </div>
          <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream.mirrorStreeam} />
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
            <MirrorPlayer stream={firstStream?.mirrorStreeam} />
          </div>
          <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream?.mirrorStreeam} />
          </div>
          <div className={styles.bottomRightPresetItem}>
            <MirrorPlayer stream={thirdStream?.mirrorStreeam} />
          </div>
        </>
      );
    }
  }, [preset, mirrorStreams]);
  return content;
};

export default memo(MirrorStreams);
