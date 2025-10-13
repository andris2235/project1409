import React from "react";
import styles from "./GradientFrame.module.scss";

interface GradientFrameProps {
  children: React.ReactNode;
  className?: string;
}

const GradientFrame: React.FC<GradientFrameProps> = ({ children, className }) => {
  return (
    <div className={`${styles.frameOuter} ${className || ""}`}>
      <div className={styles.frameMiddle}>
        <div className={styles.frameInner}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default GradientFrame;
