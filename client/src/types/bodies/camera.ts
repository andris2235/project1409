import type { ClickType } from "../joystik";

export interface GetStreamParams{
  limit?: number
    [key: string]: string | number | Date | undefined;
}

export interface SetTvStateBody{
  value: boolean
}

export interface SetCameraZoomBody{
  increase: boolean
  cameraType: CameraTypes
}

export interface SetCameraPositionBody{
  direction: ClickType
  cameraType: CameraTypes
}

export enum CameraTypes{
  small = "small",
  large = "large"
}