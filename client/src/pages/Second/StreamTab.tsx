import { useEffect } from "react";
import SecondZoomControl from "../../components/UI/SecondCameraZoom/SecondCameraZoom";
import SecondJoystick from "../../components/UI/SecondJoystick/SecondJoystick";
import { useCameraQueue } from "../../hooks/useCameraQueue";
import secondStore from "../../store/secondStore";
import StreamCameraBlock from "./StreamCameraBlock";
import styles from "./style.module.scss";
import { useShallow } from "zustand/react/shallow";

const StreamTab = () => {
  const {
    operationIsPressed,
    operationZoom,
    setOperationZoom,
    setOperationIsPressed,
  } = secondStore(
    useShallow((s) => ({
      operationIsPressed: s.operationIsPressed,
      operationZoom: s.operationZoom,
      setOperationZoom: s.setOperationZoom,
      setOperationIsPressed: s.setOperationIsPressed,
    }))
  );
  const camera2Control = useCameraQueue("cam2");
  useEffect(() => {
    camera2Control.handleMove(operationIsPressed);
  }, [operationIsPressed, camera2Control.handleMove]);
  useEffect(() => {
    camera2Control.handleZoom(operationZoom);
  }, [operationZoom, camera2Control.handleZoom]);
  return (
    <>
      <div
        style={{ justifyContent: "center" }}
        className={styles.managementBlock}
      >
        <div className={styles.managing}>
          <div className={styles.managing__left}>
            <div className={styles.managing__left__icon}>
              <img src="/icons/video.svg" alt="video" fetchPriority="high"/>
            </div>
            <div className={styles.managing__left__text}>
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
          <SecondZoomControl
            direction={operationZoom}
            setDirection={setOperationZoom}
          />
          <SecondJoystick
            isPressed={operationIsPressed}
            setIsPressed={setOperationIsPressed}
          />
        </div>
      </div>
      <StreamCameraBlock />
    </>
  );
};

export default StreamTab;
