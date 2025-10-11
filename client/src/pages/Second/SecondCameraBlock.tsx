import styles from "./style.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import PresetVideoItem from "../../components/UI/PresetStream/PresetVideoItem";
import { sleep } from "../../utils/func";
import secondStore from "../../store/secondStore";
import { secondStreams } from "./data";
import { useShallow } from 'zustand/react/shallow';

const SecondCameraBlock = () => {
  const {
    currentStream,
    deletingStream,
    otherStreams,
    setCurrentStream,
    setDeletingStream,
    setOtherStreams,
  } = secondStore(useShallow((s) => ({
    currentStream: s.currentStream,
    deletingStream: s.deletingStream,
    otherStreams: s.otherStreams,
    setCurrentStream: s.setCurrentStream,
    setDeletingStream: s.setDeletingStream,
    setOtherStreams: s.setOtherStreams,
  })));
  const setCurrentPresetHandler = async (key: string) => {
    const oldCurrent = { ...currentStream };
    const current = secondStreams.find((i) => i.key === key);
    if (!current) return;
    setDeletingStream(current.key);
    setCurrentStream(current);
    await sleep(500);
    setOtherStreams(
      otherStreams.map((i) => (i.key === current.key ? oldCurrent : i))
    );
  };
  console.log(currentStream);

  return (
    <div className={styles.cameraBlock}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          key={currentStream.key}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.5 }}
          className={styles.cameraBlock__current}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 703 448"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.currentBorderSvg}
          >
            <defs>
              <linearGradient
                id="frameGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#A2B2F7" />
                <stop offset="50%" stopColor="#CA97EA" />
                <stop offset="100%" stopColor="#90BFFD" />
              </linearGradient>
            </defs>
            <rect
              x="4"
              y="4"
              width="695"
              height="440"
              rx="32"
              ry="32"
              fill="none"
              stroke="url(#frameGradient)"
              strokeWidth="8"
            />
          </svg>

          <div className={styles.cameraBlock__current__hls}>
            <PresetVideoItem
              streamUrl={currentStream.url}
              poster={currentStream.poster}
            />
          </div>
          <div>
            <p>{currentStream.text}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className={styles.miniCameras}>
        {otherStreams.map((i) => (
          <motion.div
            key={i.key}
            onClick={() => setCurrentPresetHandler(i.key)}
            initial={
              deletingStream === i.key
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -40 }
            }
            animate={
              deletingStream === i.key
                ? { opacity: 0, y: 40 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.4 }}
            className={styles.miniCameras__camera}
          >
            <div>
              <PresetVideoItem streamUrl={i.url} poster={i.poster} />
            </div>
            <p>{i.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SecondCameraBlock;
