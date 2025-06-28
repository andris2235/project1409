import React, { useCallback, type Dispatch, type SetStateAction } from "react";
import "./Joystick.css";
import type { ClickType } from "../../../types/joystik";

interface JoystickProps {
  isPressed: ClickType | null;
  setIsPressed: Dispatch<SetStateAction<ClickType | null>>;
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
      return "joystick-container-press-down";
    } else if (isPressed === "down") {
      return "joystick-container-press-up";
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
        onClick={() => handleInteraction("up")}
        onTouchStart={(e) => handleTouchStart(e, "up")}
        onTouchEnd={(e) => handleTouchEnd(e, "up")}
        onMouseDown={() => handleInteraction("up")}
        onMouseUp={() => handleRelease("up")}
        onMouseLeave={() => handleRelease("up")}
      >
        <img src="/icons/up.png" alt="Up" />
      </button>
      <button
        className={`joystick-button ${isPressed === "left" ? "pressed" : ""}`}
        onClick={() => handleInteraction("left")}
        onTouchStart={(e) => handleTouchStart(e, "left")}
        onTouchEnd={(e) => handleTouchEnd(e, "left")}
        onMouseDown={() => handleInteraction("left")}
        onMouseUp={() => handleRelease("left")}
        onMouseLeave={() => handleRelease("left")}
      >
        <img src="/icons/left.png" alt="Left" />
      </button>
      <button
        className={`joystick-button ${isPressed === "right" ? "pressed" : ""}`}
        onClick={() => handleInteraction("right")}
        onTouchStart={(e) => handleTouchStart(e, "right")}
        onTouchEnd={(e) => handleTouchEnd(e, "right")}
        onMouseDown={() => handleInteraction("right")}
        onMouseUp={() => handleRelease("right")}
        onMouseLeave={() => handleRelease("right")}
      >
        <img src="/icons/right.png" alt="Right" />
      </button>
      <button
        className={`joystick-button ${isPressed === "down" ? "pressed" : ""}`}
        onClick={() => handleInteraction("down")}
        onTouchStart={(e) => handleTouchStart(e, "down")}
        onTouchEnd={(e) => handleTouchEnd(e, "down")}
        onMouseDown={() => handleInteraction("down")}
        onMouseUp={() => handleRelease("down")}
        onMouseLeave={() => handleRelease("down")}
      >
        <img src="/icons/down.png" alt="Down" />
      </button>
    </div>
  );
};

export default Joystick;
