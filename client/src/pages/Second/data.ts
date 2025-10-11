import { baseURL } from "../../http";
import type { SecondStreamType } from "../../types/second";
import { SecondPresetTypes, type SecondPresetItem } from "../../types/stream";

// const presets: SecondPresetItem[] = [
//   {
//     text: "Большая/малая операционные Quad>",
//     type: SecondPresetTypes.first,
//   },
//   {
//     text: "Большая операционная Preset2",
//     type: SecondPresetTypes.second,
//   },
//   {
//     text: "Малая операционная Preset3",
//     type: SecondPresetTypes.third,
//   },
//   {
//     text: "Большая операционная Preset4",
//     type: SecondPresetTypes.fourth,
//   },
// ];

export const devices = [
  {
    label: "Эндоскопическая видеосистема Arthrex SynergyID",
    value: "endo",
  },
  {
    label: "Дополнительный источник видеосигнала 1",
    value: "source1",
  },
  {
    label: "Дополнительный источник видеосигнала 2",
    value: "source2",
  },
];

export const secondStreams: SecondStreamType[] = [
  {
    url: `${baseURL}stream1/index.m3u8`,
    key: "console_big",
    poster: "/bigNoVideo.png",
    text: "Эндоскопическая видеосистема Arthrex SynergyID",
  },
  {
    url: `${baseURL}stream2/index.m3u8`,
    key: "console_small",
    poster: "/smallNoVideo.png",
    text: "Персональный компьютер Windows",
  },
  {
    url: `${baseURL}stream3/index.m3u8`,
    key: "Ptz_big",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 1",
  },
  {
    url: `${baseURL}stream4/index.m3u8`,
    key: "Ptz_small",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 2",
  },
];
