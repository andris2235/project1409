import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";

interface PresetVideoItem {
  poster?: string;
  streamUrl: string;
  staticFile?: boolean;
}

const PresetVideoItem = ({
  poster,
  streamUrl,
  staticFile,
}: PresetVideoItem) => {
  return (
    <div className={styles.firstPresetItem}>
      <HlsPlayer poster={poster} src={streamUrl} staticFile={staticFile} />
    </div>
  );
};

export default PresetVideoItem;
