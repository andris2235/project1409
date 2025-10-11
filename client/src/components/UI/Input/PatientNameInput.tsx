import { Box, TextField } from "@mui/material";

interface PatientNameInputProps{
  label?: string
  value: string
  onChange: (v: string)=> void
}

export default function PatientNameInput({label, value, onChange}: PatientNameInputProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "40px",
        padding: "7px 16px",
        width: "100%",
        height: "52px",
      }}
    >
      <img src="/icons/patient.svg" alt="patient" />
      <Box
        sx={{
          flex: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label={label ?? "ФИО пациента"}
          value={value}
          onChange={e => onChange(e.target.value)}
          slotProps={textFieldSlotProps}
        />
      </Box>
    </Box>
  );
}



const textFieldSlotProps = {
  inputLabel: {
    sx: {
      color: "white",
      "&.Mui-focused": { color: "white" },
      "&.MuiInputLabel-shrink": {
        transform: "translate(0px, -1px) scale(0.8)",
      },
      "&:not(.MuiInputLabel-shrink)": {
        transform: "translate(0px, 8px) scale(1)",
      },
      fontSize: 16,
      p: 0,
    },
  },
  input: {
    sx: {
      p: 0,
      color: "white",
      "& fieldset": { border: "none" },
      "& input": {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: "24px",
        mt: 2,

        p: 0,
      },
    },
  },
};