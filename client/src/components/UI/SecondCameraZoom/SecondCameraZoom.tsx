import React, { useRef, type Dispatch, type SetStateAction } from "react";
import styles from "./zoomControl.module.css"
import type { ZoomValues } from "../../../types/zoom";

interface ZoomControlProps{
  direction: ZoomValues
  setDirection: (operationZoom: ZoomValues) => void | Dispatch<SetStateAction<ZoomValues>> 
}

const SecondZoomControl = ({direction, setDirection}: ZoomControlProps) => {
  const startX = useRef<number | null>(null);

  // ======== TOUCH EVENTS =========
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const deltaX = e.touches[0].clientX - startX.current;
    handleMove(deltaX);
  };

  const handleTouchEnd = () => {
    setDirection("neutral");
    startX.current = null;
  };

  // ======== MOUSE EVENTS =========
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (startX.current === null) return;
    const deltaX = e.clientX - startX.current;
    handleMove(deltaX);
  };

  const handleMouseUp = () => {
    setDirection("neutral");
    startX.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // ======== COMMON LOGIC =========
  const handleMove = (deltaX: number) => {
    if (deltaX < -20) {
      setDirection("up");
    } else if (deltaX > 20) {
      setDirection("down");
    } else {
      setDirection("neutral");
    }
  };

  return (
    <div
      className={`${styles["zoom-wrapper"]} ${direction === "up" ? styles["active-up"] : ""} ${
        direction === "down" ? styles["active-down"] : ""
      }`}
    >
      <div className={styles["zoom-label"]}>+</div>
      <div
        className={`${styles["zoom-thumb"]} ${
          direction === "up" ? styles["up"] : direction === "down" ? styles["down"] : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      />
      <div className={styles["zoom-label"] }>−</div>
    </div>
  );
};

export default SecondZoomControl;
