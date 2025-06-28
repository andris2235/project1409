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

export const setCameraZoom = async (item: SetCameraZoomBody) => {
  const { data } = await $host.post("api/admin/user", item);
  return data;
};

export const setCameraPosition = async (item: SetCameraPositionBody) => {
  const { data } = await $host.post("api/admin/user", item);
  return data;
};