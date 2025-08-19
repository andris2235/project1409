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
    if (preset === PresetTypes.second) {
      const firstStream = mirrorStreams.find((i) => i.key === "console_big");
      const secondStream = mirrorStreams.find((i) => i.key === "Ptz_big");
      return (
        <>
          {firstStream && <div className={styles.fullPresetItem}>
            <MirrorPlayer stream={firstStream.mirrorStreeam} />
          </div>}
          {secondStream && <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream.mirrorStreeam} />
          </div>}
        </>
      );
    } else if (preset === PresetTypes.third) {
      const firstStream = mirrorStreams.find((i) => i.key === "console_small");
      const secondStream = mirrorStreams.find((i) => i.key === "Ptz_small");
      return (
        <>
          {firstStream && <div className={styles.fullPresetItem}>
            <MirrorPlayer stream={firstStream.mirrorStreeam} />
          </div>}
          {secondStream && <div className={styles.topRightPresetItem}>
            <MirrorPlayer stream={secondStream.mirrorStreeam} />
          </div>}
        </>
      );
    } else {
      const firstStream = mirrorStreams.find((i) => i.key === "console_big");
      const secondStream = mirrorStreams.find((i) => i.key === "Ptz_big");
      return (
        <div className={styles.fourPresetWrapper}>
          {firstStream && (
            <div className={styles.fourPresetItem}>
              <MirrorPlayer stream={firstStream?.mirrorStreeam} />
            </div>
          )}
          {secondStream && (
            <div className={styles.fourPresetItem}>
              <MirrorPlayer stream={secondStream?.mirrorStreeam} />
            </div>
          )}
        </div>
      );
    }
  }, [preset, mirrorStreams]);
  return content;
};

export default memo(MirrorStreams);
