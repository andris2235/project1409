import { useCallback, useEffect, useRef, useState } from "react";
import ZoomControl from "../../components/UI/CameraZoom/ZoomControl";
import Joystick from "../../components/UI/Joystick/Joystick";
import PresetStream from "../../components/UI/PresetStream/PresetStream";
import Switch from "../../components/UI/Switch/Switch";
import { PresetTypes, type PresetItem } from "../../types/stream";
import styles from "./style.module.scss";
import type { ZoomValues } from "../../types/zoom";
import type { ClickType } from "../../types/joystik";
import MyLoader from "../../components/UI/MyLoader";
import notificationStore from "../../store/notificationStore";
import { handlerAxiosError } from "../../utils/func";
import { getStreams, getTvState } from "../../http/cameraAPI";
const hlsStreams = [
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8",
  "http://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8",
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
];
const presets: PresetItem[] = [
  {
    text: "Эндоскоп 1, Эндоскоп 2, Большая операционная, Малая операционная",
    type: PresetTypes.first,
  },
  {
    text: "Эндоскоп 1, Большая операционная",
    type: PresetTypes.second,
  },
  {
    text: "Эндоскоп 2, Малая операционная",
    type: PresetTypes.third,
  },
  {
    text: "Эндоскоп 1, Большая операционная, малая операционная",
    type: PresetTypes.fourth,
  },
];
const Home = () => {
  const [loading, setLoading] = useState(true);
  const [tvSwitchDisabled, setTvSwitchDisabled] = useState(false);
  const { setNotification } = notificationStore();
  const isZoomProcessing = useRef(false);
  const isPositionProcessing = useRef(false);
  const [currentPreset, setCurrentPreset] = useState({
    text: "Эндоскоп 1, Эндоскоп 2, Большая операционная, Малая операционная",
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
  const zoomIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionIntervalId = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const setCurrentPresetHandler = (type: PresetTypes) => {
    const current = presets.find((i) => i.type === type);
    if (!current) return;
    setCurrentPreset(current);
    setOtherPresets(presets.filter((i) => i.type !== type));
  };

  useEffect(() => {
    zoomIntervalId.current = setInterval(async () => {
      try {
        if (isZoomProcessing.current) return;

        // Обработка small
        if (smallOperationZoom !== "neutral") {
          isZoomProcessing.current = true;
          console.log("Обработка small:", smallOperationZoom);
          isZoomProcessing.current = false;
          return; // ждём следующего тика, чтобы large пошёл строго после
        }

        // Обработка large
        if (largeOperationZoom !== "neutral") {
          isZoomProcessing.current = true;
          console.log("Обработка large:", largeOperationZoom);
          isZoomProcessing.current = false;
        }
      } catch (error) {
        console.log(error);
        setNotification({
          visible: true,
          type: "error",
          text: handlerAxiosError(error),
        });
      }
    }, 500);

    return () => {
      if (zoomIntervalId.current) clearInterval(zoomIntervalId.current);
    };
  }, [smallOperationZoom, largeOperationZoom, setNotification]);

  useEffect(() => {
    positionIntervalId.current = setInterval(async () => {
      try {
        if (isPositionProcessing.current) return;

        // Обработка small
        if (smallOperationIsPressed) {
          isPositionProcessing.current = true;
          console.log("Обработка small:", smallOperationIsPressed);
          isPositionProcessing.current = false;
          return; // ждём следующего тика, чтобы large пошёл строго после
        }

        // Обработка large
        if (largeOperationIsPressed) {
          isPositionProcessing.current = true;
          console.log("Обработка large:", largeOperationIsPressed);
          isPositionProcessing.current = false;
        }
      } catch (error) {
        console.log(error);
        setNotification({
          visible: true,
          type: "error",
          text: handlerAxiosError(error),
        });
      }
    }, 500);

    return () => {
      if (positionIntervalId.current) clearInterval(positionIntervalId.current);
    };
  }, [largeOperationIsPressed, smallOperationIsPressed, setNotification]);

  const setTvValueHandler = useCallback(
    async (v: boolean) => {
      try {
        setTvSwitchDisabled(true);
        setTvIsOn(v);
        setTvSwitchDisabled(false);
      } catch (error) {
        setNotification({
          visible: true,
          type: "error",
          text: handlerAxiosError(error),
        });
      }
    },
    [setNotification]
  );

  const firstFetch = useCallback(async () => {
    try {
      setLoading(false);
      await getStreams({});
      await getTvState({});
    } catch (error) {
      console.log(error);

      setNotification({
        visible: true,
        type: "error",
        text: handlerAxiosError(error),
      });
    } finally {
      setLoading(false);
    }
  }, [setNotification]);

  useEffect(() => {
    firstFetch();
  }, [firstFetch]);

  if (loading) {
    return <MyLoader />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.managementBlock}>
        <div className={styles.tvManagement}>
          <div className={styles.tvManagement__left}>
            <div className={styles.tvManagement__left__icon}>
              <img src="/icons/desktop.png" alt="desktop" />
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
              <img src="/icons/camera.png" alt="camera" />
            </div>
            <div className={styles.smallCamera__left__text}>
              <span>
                <b>Малая операционная</b>{" "}
              </span>
              <br />
              <span>Камера 1</span>
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
              <img src="/icons/camera.png" alt="camera" />
            </div>
            <div className={styles.smallCamera__left__text}>
              <span>
                <b>Большая операционная</b>{" "}
              </span>
              <br />
              <span>Камера 2</span>
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
        <div className={styles.cameraBlock__current}>
          <div className={styles.cameraBlock__current__hls}>
            <PresetStream streams={hlsStreams} preset={currentPreset.type} />
          </div>
          <p>{currentPreset.text}</p>
        </div>
        <div className={styles.miniCameras}>
          {otherPresets.map((i) => (
            <div
              onClick={() => setCurrentPresetHandler(i.type)}
              key={i.type}
              className={styles.miniCameras__camera}
            >
              <div>
                <PresetStream streams={hlsStreams} preset={i.type} />
              </div>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
