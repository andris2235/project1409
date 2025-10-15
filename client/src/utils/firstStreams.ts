import { PresetTypes, type PresetItem } from "../types/stream";

export const presets: PresetItem[] = [
  {
    text: "Большая/малая операционные Quad>",
    secondText: "Preset Quad",
    type: PresetTypes.first,
  },
  {
    text: "Большая операционная Preset2",
    secondText: "Preset 2",
    type: PresetTypes.second,
  },
  {
    text: "Малая операционная Preset3",
    secondText: "Preset 3",
    type: PresetTypes.third,
  },
  {
    text: "Большая операционная Preset4",
    secondText: "Preset 4",
    type: PresetTypes.fourth,
  },
];