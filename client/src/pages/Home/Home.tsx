import { useCallback, useEffect, useState } from "react";
import { useHeartbeat } from "../../hooks/useHeartbeat"; //!!HeartBeat
import { useCameraQueue } from "../../hooks/useCameraQueue";
import ZoomControl from "../../components/UI/CameraZoom/ZoomControl";
import Joystick from "../../components/UI/Joystick/Joystick";
import PresetStream from "../../components/UI/PresetStream/PresetStream";
import Switch from "../../components/UI/Switch/Switch";
import { PresetTypes, type PresetItem } from "../../types/stream";
import styles from "./style.module.scss";
import type { ZoomValues } from "../../types/zoom";
import type { ClickType } from "../../types/joystik";
import notificationStore from "../../store/notificationStore";
import { handlerAxiosError, sleep } from "../../utils/func";
import { AnimatePresence, motion } from "framer-motion";
import { setPreset, setTvState } from "../../http/cameraAPI";
import { DesktopIcon } from "../../components/UI/icons";
import { presets } from "../../utils/firstStreams";

const CameraIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7 5.25C4.37665 5.25 2.25 7.37665 2.25 10V14C2.25 16.6234 4.37665 18.75 7 18.75H14.5C16.3087 18.75 17.8535 17.6202 18.4671 16.0278L19.2626 16.8232C20.365 17.9257 22.25 17.1449 22.25 15.5858V8.41421C22.25 6.85513 20.365 6.07434 19.2626 7.17678L18.4671 7.97221C17.8535 6.37983 16.3087 5.25 14.5 5.25H7ZM20.3232 15.7626L18.75 14.1893V9.81066L20.3232 8.23744C20.4807 8.07995 20.75 8.19149 20.75 8.41421V15.5858C20.75 15.8085 20.4807 15.9201 20.3232 15.7626ZM3.75 10C3.75 8.20507 5.20507 6.75 7 6.75H14.5C16.0188 6.75 17.25 7.98122 17.25 9.5V14.5C17.25 16.0188 16.0188 17.25 14.5 17.25H7C5.20507 17.25 3.75 15.7949 3.75 14V10Z"
      fill="#363538"
    />
  </svg>
);

const Home = () => {
  const [tvSwitchDisabled, setTvSwitchDisabled] = useState(false);
  const { setNotification } = notificationStore();
  const [deletingPreset, setDeletingPreset] = useState<null | PresetItem>(null);
  const [currentPreset, setCurrentPreset] = useState({
    text: "Большая/малая операционные Quad",
    type: PresetTypes.first,
  });
  const [otherPresets, setOtherPresets] = useState<PresetItem[]>(
    presets.filter((i) => i.type !== PresetTypes.first)
  );
  const [smallOperationZoom, setSmallOperationZoom] =
    useState<ZoomValues>("neutral");
  const [largeOperationZoom, setLargeOperationZoom] =
    useState<ZoomValues>("neutral");
  const [smallOperationIsPressed, setSmallOperationIsPressed] =
    useState<null | ClickType>(null);
  const [largeOperationIsPressed, setLargeOperationIsPressed] =
    useState<null | ClickType>(null);
  const [tvIsOn, setTvIsOn] = useState(false);
  const { isOnline, lastPing, reconnect } = useHeartbeat(15000); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!HeartBeat

  const camera1Control = useCameraQueue("cam1"); //Создаем контроллеры для камер
  const camera2Control = useCameraQueue("cam2");

  const setCurrentPresetHandler = async (type: PresetTypes) => {
    const oldCurrent = { ...currentPreset };
    const current = presets.find((i) => i.type === type);
    if (!current) return;
    // resetStreams()
    setDeletingPreset(current);
    setCurrentPreset(current);
    await sleep(500);
    setOtherPresets((p) =>
      p.map((i) => (i.type === current.type ? oldCurrent : i))
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

  useEffect(() => {
    camera1Control.handleZoom(smallOperationZoom);
  }, [smallOperationZoom, camera1Control.handleZoom]);
  useEffect(() => {
    camera2Control.handleZoom(largeOperationZoom);
  }, [largeOperationZoom, camera2Control.handleZoom]);
  useEffect(() => {
    camera1Control.handleMove(smallOperationIsPressed);
  }, [smallOperationIsPressed, camera1Control.handleMove]);
  useEffect(() => {
    camera2Control.handleMove(largeOperationIsPressed);
  }, [largeOperationIsPressed, camera2Control.handleMove]);

  const setTvValueHandler = useCallback(
    async (v: boolean) => {
      try {
        setTvSwitchDisabled(true);
        await setTvState(v ? "on" : "off");
        setTvIsOn(v);
      } catch (error) {
        setNotification({
          visible: true,
          type: "error",
          text: handlerAxiosError(error),
        });
      } finally {
        setTvSwitchDisabled(false);
      }
    },
    [setNotification]
  );

  useEffect(() => {
    setTvValueHandler(true);
    return () => {
      setTvValueHandler(false);
    };
  }, [setTvValueHandler]);

  return (
    <div className={styles.wrapper}>
      {/* Проверяем статус и пишем статус и соединение с сервером */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          padding: "8px 12px",
          backgroundColor: isOnline ? "#4CAF50" : "#f44336",
          color: "white",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
          fontFamily: "Arial, sans-serif",
        }}
      >
        {isOnline ? "🟢 Онлайн" : "🔴 Оффлайн"}
        {lastPing && (
          <div style={{ fontSize: "10px", marginTop: "2px" }}>
            {lastPing.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Модальное окно при потере связи */}
      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            zIndex: 1001,
            minWidth: "300px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0" }}>⚠️ Потеря связи с сервером</h3>
          <p style={{ margin: "10px 0" }}>Попытка переподключения...</p>
          <button
            onClick={reconnect}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Переподключиться вручную
          </button>
        </div>
      )}
      <div className={styles.managementBlock}>
        <div className={styles.tvManagement}>
          <div className={styles.tvManagement__left}>
            <div className={styles.tvManagement__left__icon}>
              <DesktopIcon />
            </div>
            <div className={styles.tvManagement__left__text}>
              <span>
                <b>Телевизор</b>{" "}
              </span>
              <br />
              <span>Подключен</span>
            </div>
          </div>
          <Switch
            disabled={tvSwitchDisabled}
            on={tvIsOn}
            setOn={setTvValueHandler}
          />
        </div>
        <div className={styles.smallCamera}>
          <div className={styles.smallCamera__left}>
            <div className={styles.smallCamera__left__icon}>
              <img src="/icons/camera.png" alt="camera" fetchPriority="high"/>
            </div>
            <div className={styles.smallCamera__left__text}>
              <span>
                <b>Малая операционная</b>{" "}
              </span>
              <br />
              <span
                style={{
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "143%",
                  color: "rgba(255, 255, 255, 0.64)",
                }}
              >
                Камера 1
              </span>
            </div>
          </div>
          <div className={styles.smallCamera__managing}>
            <ZoomControl
              direction={smallOperationZoom}
              setDirection={setSmallOperationZoom}
            />
            <Joystick
              isPressed={smallOperationIsPressed}
              setIsPressed={setSmallOperationIsPressed}
            />
          </div>
        </div>
        <div className={styles.smallCamera}>
          <div className={styles.smallCamera__left}>
            <div className={styles.smallCamera__left__icon}>
              <CameraIcon />
            </div>
            <div className={styles.smallCamera__left__text}>
              <span>
                <b>Большая операционная</b>{" "}
              </span>
              <br />
              <span
                style={{
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "143%",
                  color: "rgba(255, 255, 255, 0.64)",
                }}
              >
                Камера 2
              </span>
            </div>
          </div>
          <div className={styles.smallCamera__managing}>
            <ZoomControl
              direction={largeOperationZoom}
              setDirection={setLargeOperationZoom}
            />
            <Joystick
              isPressed={largeOperationIsPressed}
              setIsPressed={setLargeOperationIsPressed}
            />
          </div>
        </div>
      </div>
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

            <p>{currentPreset.text}</p>
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
              <p>{i.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
