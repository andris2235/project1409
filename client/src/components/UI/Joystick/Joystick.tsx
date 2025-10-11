import React, { useCallback, type Dispatch, type SetStateAction } from "react";
import "./Joystick.css";
import type { ClickType } from "../../../types/joystik";

const DownIcon = () => (
  <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5063 1.60462C17.8119 1.29904 17.8329 0.780626 17.5533 0.446703C17.2737 0.112781 16.7993 0.089802 16.4937 0.395378L11.3221 5.56695C10.0466 6.84244 7.95341 6.84244 6.67791 5.56695L1.50633 0.395378C1.20075 0.0898024 0.726345 0.112782 0.44671 0.446705C0.167074 0.780628 0.188103 1.29904 0.49368 1.60462L5.66526 6.77619C7.51396 8.62489 10.4861 8.62489 12.3348 6.77619L17.5063 1.60462Z" fill="white" fill-opacity="0.64" />
  </svg>
);

const LeftIcon = () => (
  <svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.53034 1.53033C8.82323 1.23744 8.82323 0.762563 8.53034 0.46967C8.23744 0.176777 7.76257 0.176777 7.46968 0.46967L2.2981 5.64125C0.443112 7.49624 0.443114 10.5038 2.29811 12.3588L7.46968 17.5303C7.76257 17.8232 8.23744 17.8232 8.53034 17.5303C8.82323 17.2374 8.82323 16.7626 8.53034 16.4697L3.35877 11.2981C2.08956 10.0289 2.08956 7.97112 3.35876 6.70191L8.53034 1.53033Z" fill="white" fill-opacity="0.64" />
  </svg>
);

const TopIcon = () => (
  <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.70191 3.35864C7.97112 2.08944 10.0289 2.08944 11.2981 3.35864L16.4697 8.53021C16.7626 8.82311 17.2374 8.82311 17.5303 8.53021C17.8232 8.23732 17.8232 7.76245 17.5303 7.46955L12.3588 2.29798C10.5038 0.442992 7.49624 0.44299 5.64125 2.29798L0.46967 7.46955C0.176777 7.76245 0.176777 8.23732 0.46967 8.53021C0.762563 8.82311 1.23744 8.82311 1.53033 8.53021L6.70191 3.35864Z" fill="white" fill-opacity="0.64" />
  </svg>
);

const RightIcon = () => (
  <svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.53033 0.46967C1.23744 0.176777 0.762564 0.176777 0.46967 0.46967C0.176777 0.762563 0.176777 1.23744 0.46967 1.53033L5.64124 6.70191C6.91045 7.97112 6.91045 10.0289 5.64124 11.2981L0.46967 16.4697C0.176777 16.7626 0.176777 17.2374 0.46967 17.5303C0.762563 17.8232 1.23744 17.8232 1.53033 17.5303L6.7019 12.3588C8.55689 10.5038 8.55689 7.49624 6.70191 5.64125L1.53033 0.46967Z" fill="white" fill-opacity="0.64" />
  </svg>
);





interface JoystickProps {
  isPressed: ClickType | null;
  setIsPressed: (c: ClickType | null)=> void | Dispatch<SetStateAction<ClickType | null>>;
}

const Joystick = ({ isPressed, setIsPressed }: JoystickProps) => {
  const handleInteraction = useCallback(
    (direction: ClickType) => {
      setIsPressed(direction);
    },
    [setIsPressed]
  );

  const handleRelease = useCallback(
    (direction: ClickType) => {
      if (isPressed === direction) {
        setIsPressed(null);
      }
    },
    [isPressed, setIsPressed]
  );

  const handleTouchStart = (_: React.TouchEvent, direction: ClickType) => {
    handleInteraction(direction);
  };

  const handleTouchEnd = (e: React.TouchEvent, direction: ClickType) => {
    e.preventDefault();
    handleRelease(direction);
  };

  const getAnimation = (isPressed: ClickType | null) => {
    if (!isPressed) return "";
    if (isPressed === "up") {
      return "joystick-container-press-up";
    } else if (isPressed === "down") {
      return "joystick-container-press-down";
    } else if (isPressed === "left") {
      return "joystick-container-press-left";
    } else if (isPressed === "right") {
      return "joystick-container-press-right";
    }
  };


  return (
    <div className={`joystick-container ${getAnimation(isPressed)}`}>
      <button
        className={`joystick-button  ${isPressed === "up" ? "pressed" : ""}`}
        // onClick={() => handleInteraction("up")}
        onTouchStart={(e) => handleTouchStart(e, "up")}
        onTouchEnd={(e) => handleTouchEnd(e, "up")}
        onMouseDown={() => handleInteraction("up")}
        onMouseUp={() => handleRelease("up")}
        onMouseLeave={() => handleRelease("up")}
      >
        <TopIcon />
      </button>
      <button
        className={`joystick-button ${isPressed === "left" ? "pressed" : ""}`}
        // onClick={() => handleInteraction("left")}
        onTouchStart={(e) => handleTouchStart(e, "left")}
        onTouchEnd={(e) => handleTouchEnd(e, "left")}
        onMouseDown={() => handleInteraction("left")}
        onMouseUp={() => handleRelease("left")}
        onMouseLeave={() => handleRelease("left")}
      >
        <LeftIcon />
      </button>
      <button
        className={`joystick-button ${isPressed === "right" ? "pressed" : ""}`}
        // onClick={() => handleInteraction("right")}
        onTouchStart={(e) => handleTouchStart(e, "right")}
        onTouchEnd={(e) => handleTouchEnd(e, "right")}
        onMouseDown={() => handleInteraction("right")}
        onMouseUp={() => handleRelease("right")}
        onMouseLeave={() => handleRelease("right")}
      >
        <RightIcon />
      </button>
      <button
        className={`joystick-button ${isPressed === "down" ? "pressed" : ""}`}
        // onClick={() => handleInteraction("down")}
        onTouchStart={(e) => handleTouchStart(e, "down")}
        onTouchEnd={(e) => handleTouchEnd(e, "down")}
        onMouseDown={() => handleInteraction("down")}
        onMouseUp={() => handleRelease("down")}
        onMouseLeave={() => handleRelease("down")}
      >
        <DownIcon />
      </button>
    </div>
  );
};

export default Joystick;
