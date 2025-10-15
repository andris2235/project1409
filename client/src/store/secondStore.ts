import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import type { MirrorStream } from "./streamsStore";
import type { Device, SecondStreamType, SecondTabTypes } from "../types/second";
import { secondStreams } from "../pages/Second/data";
import type { ZoomValues } from "../types/zoom";
import type { ClickType } from "../types/joystik";

interface SecondStoreType {
  mirrorStreams: MirrorStream[];
  setMirrorStreams: (stream: MirrorStream) => void;
  resetStreams: () => void;
  progress: Record<string, number>;
  setProgress: (src: string, time: number) => void;
  getProgress: (src: string) => number;
  currentTab: SecondTabTypes;
  setCurrentTab: (currentTab: SecondTabTypes) => void;
  currentStream: SecondStreamType;
  setCurrentStream: (currentStream: SecondStreamType) => void;
  deletingStream: null | string;
  setDeletingStream: (deletingStream: null | string) => void;
  otherStreams: SecondStreamType[];
  setOtherStreams: (otherStreams: SecondStreamType[]) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  patientName: string;
  setPatientName: (patientName: string) => void;
  choosedDevice: Device | null;
  setChoosedDevice: (choosedDevice: Device | null) => void;
  tvSwitchDisabled: boolean;
  setTvSwitchDisabled: (tvSwitchDisabled: boolean) => void;
  tvIsOn: boolean;
  setTvIsOn: (tvIsOn: boolean) => void;
  operationZoom: ZoomValues;
  setOperationZoom: (operationZoom: ZoomValues) => void;
  operationIsPressed: null | ClickType;
  setOperationIsPressed: (operationIsPressed: null | ClickType) => void;
}

const secondStore = create<SecondStoreType>()(
  persist(
    (set, get) => ({
      operationIsPressed: null,
      setOperationIsPressed(operationIsPressed) {
        set({ operationIsPressed });
      },
      operationZoom: "neutral" as ZoomValues,
      setOperationZoom(operationZoom) {
        set({ operationZoom });
      },
      tvSwitchDisabled: false,
      setTvSwitchDisabled(tvSwitchDisabled) {
        set({ tvSwitchDisabled });
      },
      tvIsOn: false,
      setTvIsOn: (tvIsOn: boolean) => {
        set({ tvIsOn });
      },
      choosedDevice: null,
      setChoosedDevice(choosedDevice) {
        set({ choosedDevice });
      },
      patientName: "",
      setPatientName(patientName) {
        set({ patientName });
      },
      isRecording: false,
      setIsRecording(isRecording) {
        set({ isRecording });
      },
      otherStreams: secondStreams.slice(1),
      setOtherStreams(otherStreams) {
        set({ otherStreams });
      },
      currentTab: "operationRoom" as SecondTabTypes,
      setCurrentTab(currentTab) {
        set({ currentTab });
      },
      deletingStream: null,
      setDeletingStream(deletingStream) {
        set({ deletingStream });
      },
      currentStream: secondStreams[0],
      setCurrentStream(currentStream) {
        set({ currentStream });
      },
      mirrorStreams: [],
      setMirrorStreams: (stream) => {
        const { mirrorStreams: oldMirrorStreams } = get();
        set({
          mirrorStreams: [
            ...oldMirrorStreams.filter((i) => i.src !== stream.src),
            stream,
          ],
        });
      },
      resetStreams: () => {
        set({ mirrorStreams: [] });
      },
      progress: {},
      getProgress: (src) => get().progress[src] || 0,
      setProgress: (src, time) => {
        set((state) => ({
          progress: { ...state.progress, [src]: time },
        }));
      },
    }),
    {
      name: "second-store", // ключ в localStorage
      partialize: (state) => ({ currentTab: state.currentTab }), // сохраняем только текущий таб
    }
  )
);

export default secondStore;
