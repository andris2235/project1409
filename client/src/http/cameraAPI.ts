import { $host } from ".";
import type { SetCameraZoomBody } from "../types/bodies/camera";
import type { PresetTypes } from "../types/stream";
import type { TvState } from "../types/tv";


export const setTvState = async (item: TvState) => {
  const { data } = await $host.post(`api/stream/tv/${item}`);
  return data;
};

export const moveCamera = async (item: SetCameraZoomBody, cam: "cam1" | "cam2") => {
  const { data } = await $host.post(`api/stream/camera/${cam}/move`, item);
  return data;
};

export const stopCamera = async (cam: "cam1" | "cam2") => {
  const { data } = await $host.post(`api/stream/camera/${cam}/stop`);
  return data;
};

export const setPreset = async (preset: PresetTypes) => {
  const { data } = await $host.post(`api/stream/preset/${preset}`);
  return data;
};
