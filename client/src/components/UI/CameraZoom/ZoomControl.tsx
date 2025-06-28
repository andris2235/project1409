import React, { useRef, type Dispatch, type SetStateAction } from "react";
import "./ZoomControl.css";
import type { ZoomValues } from "../../../types/zoom";

interface ZoomControlProps{
  direction: ZoomValues
  setDirection: Dispatch<SetStateAction<ZoomValues>>
}

const ZoomControl = ({direction, setDirection}: ZoomControlProps) => {
  const startY = useRef<number | null>(null);

  // ======== TOUCH EVENTS =========
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const deltaY = e.touches[0].clientY - startY.current;
    handleMove(deltaY);
  };

  const handleTouchEnd = () => {
    setDirection("neutral");
    startY.current = null;
  };

  // ======== MOUSE EVENTS =========
  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (startY.current === null) return;
    const deltaY = e.clientY - startY.current;
    handleMove(deltaY);
  };

  const handleMouseUp = () => {
    setDirection("neutral");
    startY.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // ======== COMMON LOGIC =========
  const handleMove = (deltaY: number) => {
    if (deltaY < -20) {
      setDirection("up");
    } else if (deltaY > 20) {
      setDirection("down");
    } else {
      setDirection("neutral");
    }
  };

  return (
    <div
      className={`zoom-wrapper ${direction === "up" ? "active-up" : ""} ${
        direction === "down" ? "active-down" : ""
      }`}
    >
      <div className="zoom-label">+</div>
      <div
        className={`zoom-thumb ${
          direction === "up" ? "up" : direction === "down" ? "down" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      />
      <div className="zoom-label">−</div>
    </div>
  );
};

export default ZoomControl;
