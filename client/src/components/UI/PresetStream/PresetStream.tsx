import styles from "./style.module.scss";
import { PresetTypes } from "../../../types/stream";
import MainPreset from "./MainPreset";
import MirrorStreams from "./MirrorStreams";
import { memo } from "react";

interface PresetStreamProps {
  preset: PresetTypes;
}
const PresetStream = ({ preset }: PresetStreamProps) => {
  return (
    <div className={styles.wrapper}>
      {preset === PresetTypes.first ? (
        <MainPreset />
      ) : (
        <MirrorStreams preset={preset} />
      )}
    </div>
  );
};

export default memo(PresetStream);
