import { baseURL } from "../../http";
import type { SecondStreamType } from "../../types/second";
import { HLS_KEY } from "../../utils/strConst";
// import { SecondPresetTypes, type SecondPresetItem } from "../../types/stream";

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
export const SECOND__STREAMS = [
  "/dev/console_big",
  "/dev/console_small",
  "rtsp://admin:admin@192.168.12.248:554/",
  "rtsp://admin:admin@192.168.12.247:554/",
];

export const secondStreams: SecondStreamType[] = [
  {
    url: `${baseURL}api/static/hls/console_big-${HLS_KEY}/index.m3u8`,
    key: "console_big",
    poster: "/bigNoVideo.png",
    text: "Эндоскопическая видеосистема Arthrex SynergyID",
  },
  {
    url: `${baseURL}api/static/hls/console_small-${HLS_KEY}/index.m3u8`,
    key: "console_small",
    poster: "/smallNoVideo.png",
    text: "Персональный компьютер Windows",
  },
  {
    url: `${baseURL}api/static/hls/Ptz_big-${HLS_KEY}/index.m3u8`,
    key: "Ptz_big",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 1",
  },
  {
    url: `${baseURL}api/static/hls/Ptz_small-${HLS_KEY}/index.m3u8`,
    key: "Ptz_small",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 2",
  },
];
