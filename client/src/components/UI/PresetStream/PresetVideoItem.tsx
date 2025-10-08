import HlsPlayer from "../../HlsPlayer/HlsPlayer";
import styles from "./style.module.scss";

interface PresetVideoItem{
    poster?: string
    streamUrl: string
}

const PresetVideoItem = ({poster, streamUrl}: PresetVideoItem)=>{
    return (<div className={styles.firstPresetItem} >
      <HlsPlayer
        poster={poster} src={streamUrl} />
    </div>)
}

export default PresetVideoItem