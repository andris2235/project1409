import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";

interface PresetVideoItem {
  poster?: string;
  streamUrl: string;
  staticFile?: boolean;
  single?: boolean;
}

const PresetVideoItem = ({
  poster,
  streamUrl,
  staticFile,
  single
}: PresetVideoItem) => {
  return (
    <div className={single ? styles.fullPresetItem : styles.firstPresetItem}>
      <HlsPlayer poster={poster} src={streamUrl} staticFile={staticFile} />
    </div>
  );
};

export default PresetVideoItem;
