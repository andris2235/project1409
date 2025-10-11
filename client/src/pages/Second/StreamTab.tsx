import SecondZoomControl from "../../components/UI/SecondCameraZoom/SecondCameraZoom";
import SecondJoystick from "../../components/UI/SecondJoystick/SecondJoystick";
import secondStore from "../../store/secondStore";
import SecondCameraBlock from "./SecondCameraBlock";
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
  return (
    <>
      <div
        style={{ justifyContent: "center" }}
        className={styles.managementBlock}
      >
        <div className={styles.managing}>
          <div className={styles.managing__left}>
            <div className={styles.managing__left__icon}>
              <img src="/icons/camera.png" alt="camera" />
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
            <SecondCameraBlock />
    </>
  );
};

export default StreamTab;
