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
    value: "console_big",
  },
  {
    label: "Дополнительный источник видеосигнала 1",
    value: "console_small",
  },
  {
    label: "Дополнительный источник видеосигнала 2",
    value: "Ptz_big",
  },
];
// export const SECOND__STREAMS = [
//   "/dev/console_big",
//   "/dev/console_small",
//   "rtsp://admin:admin@192.168.12.248:554/",
//   "rtsp://admin:admin@192.168.12.247:554/",
// ];

export const secondStreams: SecondStreamType[] = [
  {
    url: `${baseURL}api/static/hls/first-${HLS_KEY}/index.m3u8`,
    key: "first",
    poster: "/bigNoVideo.png",
    text: "Эндоскопическая видеосистема Arthrex SynergyID",
  },
  {
    url: `${baseURL}video/example.mp4`,
    key: "console_small",
    poster: "/smallNoVideo.png",
    text: "Персональный компьютер Windows",
  },
  {
    url: `${baseURL}api/static/hls/fiveth-${HLS_KEY}/index.m3u8`,
    key: "fiveth",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 1",
  },
  {
    url: `${baseURL}api/static/hls/sixth-${HLS_KEY}/index.m3u8`,
    key: "sixth",
    poster: "/noVideo.png",
    text: "Дополнительный источник видеосигнала 2",
  },
];
