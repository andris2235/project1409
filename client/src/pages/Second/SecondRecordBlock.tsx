import styles from "./style.module.scss";
import PatientNameInput from "../../components/UI/Input/PatientNameInput";
import type { Device } from "../../types/second";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { devices } from "./data";
import secondStore from "../../store/secondStore";
import { useShallow } from "zustand/react/shallow";

const SecondRecordBlock = () => {
  const {
    isRecording,
    setIsRecording,
    patientName,
    setPatientName,
    choosedDevice,
    setChoosedDevice,
  } = secondStore(
    useShallow((s) => ({
      isRecording: s.isRecording,
      setIsRecording: s.setIsRecording,
      patientName: s.patientName,
      setPatientName: s.setPatientName,
      choosedDevice: s.choosedDevice,
      setChoosedDevice: s.setChoosedDevice,
    }))
  );
  return (
    <div
      style={{
        border: isRecording ? "rgba(237, 77, 77, 1)" : "none",
        boxShadow: isRecording
          ? "0px 0px 16px 0px rgba(237, 77, 77, 0.48)"
          : "none",
      }}
      className={styles.recordBlock}
    >
      <div className={styles.title}>
        <div className={styles.icon}>
          <img
            src={isRecording ? "/icons/recordActive.svg" : "/icons/record.svg"}
            alt="record"
          />
        </div>
        <h4>Запись c камеры</h4>
      </div>
      <div>
        <PatientNameInput
          value={patientName}
          onChange={(v) => setPatientName(v)}
        />
      </div>
      <div>
        <FormControl fullWidth>
          <RadioGroup
            value={choosedDevice}
            onChange={(e) => setChoosedDevice(e.target.value as Device)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {devices.map((item) => {
              const selected = choosedDevice === item.value;
              return (
                <Box
                  key={item.value}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(0, 0, 0, 0.08)",
                    borderRadius: "24px",
                    padding: "14px 20px",
                    transition: "0.3s ease",
                  }}
                >
                  <FormControlLabel
                    value={item.value}
                    control={
                      <Radio
                        checked={selected}
                        sx={{
                          color: "white",
                          "&.Mui-checked": { color: "white" },
                          "& .MuiSvgIcon-root": { fontSize: 28 },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: 400,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      width: "100%",
                      margin: 0,
                      alignItems: "center",
                    }}
                  />
                </Box>
              );
            })}
          </RadioGroup>
        </FormControl>
      </div>
      <div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            justifyContent: isRecording ? "space-between" : "center",
            border: isRecording ? "rgba(237, 77, 77, 1)" : "none",
            boxShadow: isRecording
              ? "0px 0px 16px 0px rgba(237, 77, 77, 0.48)"
              : "none",
          }}
          className={styles.recordBtn}
        >
          <div className={styles.recordBtnLeft}>
            <div
              style={{ borderRadius: isRecording ? "4px" : "50%" }}
              className={styles.recording}
            ></div>
            <div>
              <span>{isRecording ? "Остановить запись" : "Начать запись"}</span>
            </div>
          </div>
          {isRecording && <p className={styles.timer}>00:03:21</p>}
        </button>
      </div>
    </div>
  );
};

export default SecondRecordBlock;
