import styles from "./style.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { handlerAxiosError, sleep } from "../../utils/func";
import { useShallow } from "zustand/react/shallow";
import useTranslationStore from "../../store/useTranslationStore";
import { presets } from "../../utils/firstStreams";
import PresetStream from "../../components/UI/PresetStream/PresetStream";
import { useCallback, useEffect } from "react";
import notificationStore from "../../store/notificationStore";
import type { PresetTypes } from "../../types/stream";
import { setPreset } from "../../http/cameraAPI";

const StreamCameraBlock = () => {
  const {
    currentPreset,
    deletingPreset,
    otherPresets,
    setCurrentPreset,
    setDeletingPreset,
    setOtherPresets,
  } = useTranslationStore(
    useShallow((s) => ({
      currentPreset: s.currentPreset,
      deletingPreset: s.deletingPreset,
      otherPresets: s.otherPresets,
      setCurrentPreset: s.setCurrentPreset,
      setDeletingPreset: s.setDeletingPreset,
      setOtherPresets: s.setOtherPresets,
    }))
  );
  const { setNotification } = notificationStore();
  const setCurrentPresetHandler = async (type: PresetTypes) => {
    const oldCurrent = { ...currentPreset };
    const current = presets.find((i) => i.type === type);
    if (!current) return;
    // resetStreams()
    setDeletingPreset(current);
    setCurrentPreset(current);
    await sleep(500);
    setOtherPresets(
      otherPresets.map((i) => (i.type === current.type ? oldCurrent : i))
    );
  };

  const setPresetHandler = useCallback(async () => {
    try {
      await setPreset(currentPreset.type);
    } catch (error) {
      console.log(error);
      setNotification({
        text: handlerAxiosError(error),
        type: "error",
        visible: true,
      });
    }
  }, [setNotification, currentPreset]);

  useEffect(() => {
    setPresetHandler();
  }, [setPresetHandler]);
  
  return (
    <div className={styles.cameraBlock}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          key={currentPreset.type}
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
            <PresetStream preset={currentPreset.type} />
          </div>

          <p>{currentPreset.secondText ?? "ccc"}</p>
        </motion.div>
      </AnimatePresence>
      <div className={styles.miniCameras}>
        {otherPresets.map((i) => (
          <motion.div
            key={i.type}
            onClick={() => setCurrentPresetHandler(i.type)}
            initial={
              deletingPreset?.type === i.type
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -40 }
            }
            animate={
              deletingPreset?.type === i.type
                ? { opacity: 0, y: 40 }
                : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.4 }}
            className={styles.miniCameras__camera}
          >
            <div>
              <PresetStream preset={i.type} />
            </div>
            <p>{i.secondText ?? ""}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamCameraBlock;
