export type NetpingAction = "on" | "off";

export interface RecordStartBody {
  stream: string;
  name: string;
}
export interface RecordData {
  patientName: string;
  ts: number;
  fileName: string;
  stream: string
}
