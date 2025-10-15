import axios from "axios";
import type { ClickType } from "../types/joystik";

export function diffTime(date1: Date, date2: Date): string {
  // разница в миллисекундах
  const diffMs = Math.abs(date2.getTime() - date1.getTime());

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  // форматируем в hh:mm:ss
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

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

export const handlerAxiosError = (error: unknown, defaultErrorText?: string) => {
  if (axios.isAxiosError(error)) {
    return error?.response?.data.message ?? defaultErrorText ?? "";
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