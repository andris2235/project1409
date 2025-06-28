import React, { useState } from "react";
import "./Switch.css";

type Props = {
  on: boolean;
  disabled: boolean
  setOn: (v: boolean)=>void;
};

const Switch: React.FC<Props> = ({ on, setOn, disabled }) => {
  const [stretch, setStretch] = useState(false);

  const handleClick = () => {
    if (disabled) return
    setStretch(true); // начинаем анимацию

    // убираем "растяжение" через 300мс
    setTimeout(() => {
      setStretch(false);
      setOn(!on); // меняем состояние
    }, 300);
  };

  return (
    <div
      className={`switch-wrapper ${on ? "on" : ""} ${
        on ? "gradient" : "dark"
      } `}
      onClick={handleClick}
    >
      <div className={`switch-thumb ${stretch ? "stretch" : ""}`} />
    </div>
  );
};

export default Switch;
