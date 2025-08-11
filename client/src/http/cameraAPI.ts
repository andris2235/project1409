import { $host } from ".";
import type { GetStreamParams, SetCameraPositionBody, SetCameraZoomBody, SetTvStateBody } from "../types/bodies/camera";
import { buildQueryParams } from "../utils/func";

export const getStreams = async (params: GetStreamParams) => {
  const queryParams = buildQueryParams(params);
  const { data } = await $host.get(`api/stream?${queryParams}`);
  return data;
};

export const getTvState = async (params: GetStreamParams) => {
  const queryParams = buildQueryParams(params);
  const { data } = await $host.get(`api/stream?${queryParams}`);
  return data;
};


export const setTvState = async (item: SetTvStateBody) => {
  const { data } = await $host.post("api/admin/user", item);
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

export const setCameraPosition = async (item: SetCameraPositionBody) => {
  const { data } = await $host.post("api/admin/user", item);
  return data;
};