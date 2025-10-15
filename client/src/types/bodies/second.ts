export type NetpingAction = "on" | "off";

export interface RecordStartBody {
  date?: string;
  name: string;
}
export interface RecordData {
  patientName: string;
  ts: string;
  fileName: string;
  stream: string
}
