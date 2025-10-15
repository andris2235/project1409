import { useEffect, useState } from "react";
import styles from "./style.module.scss";
import secondStore from "../../store/secondStore";
import { useShallow } from "zustand/react/shallow";

function formatDiff(start: Date): string {
  const diffMs = Date.now() - start.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const RecordTimer = () => {
  const {
    isRecording,
    recordStartTime,
  } = secondStore(
    useShallow((s) => ({
      isRecording: s.isRecording,
      setIsRecording: s.setIsRecording,
      patientName: s.patientName,
      setPatientName: s.setPatientName,
      choosedDevice: s.choosedDevice,
      setChoosedDevice: s.setChoosedDevice,
      recordStartTime: s.recordStartTime,
      setRecordStartTime: s.setRecordStartTime,
    }))
  );
  const [time, setTime] = useState(() =>
    recordStartTime ? formatDiff(recordStartTime) : null
  );
  useEffect(() => {
    if (!isRecording || !recordStartTime) return;
    const interval = setInterval(() => {
      setTime(formatDiff(recordStartTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordStartTime]);
  return <p className={styles.timer}>{time}</p>;
};

export default RecordTimer;
