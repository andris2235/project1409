import axios from "axios";
import type { ClickType } from "../types/joystik";

export const buildQueryParams = (params: QueryType) => {
  const queryParams = [];

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (value) {
        queryParams.push(`${key}=${encodeURIComponent(value.toString())}`);
      }
    }
  }

  return queryParams.join("&");
};

export interface QueryType {
  [key: string]: string | number | Date | undefined;
}

export const handlerAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error?.response?.data.message;
  } else {
    return "Произошла непредвиденная ошибка";
  }
};

export async function sleep(timeout: number) {
  return await new Promise((res) => setTimeout(res, timeout));
}

export function getCameraDelta(direction: ClickType) {
  switch (direction) {
    case "up":
      return { x: 0, y: 0.5, z: 0 };
    case "down":
      return { x: 0, y: -0.5, z: 0 };
    case "left":
      return { x: -0.5, y: 0, z: 0 };
    case "right":
      return { x: 0.5, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 0 };
  }
}