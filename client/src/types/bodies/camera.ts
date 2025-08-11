import type { ClickType } from "../joystik";

export interface GetStreamParams{
  limit?: number
    [key: string]: string | number | Date | undefined;
}

export interface SetTvStateBody{
  value: boolean
}

export interface SetCameraZoomBody{
x: number,
y: number,
z: number
}

export interface SetCameraPositionBody{
  direction: ClickType
  cameraType: CameraTypes
}

export enum CameraTypes{
  small = "small",
  large = "large"
}