import { $host } from ".";
import type { NetpingAction, RecordData, RecordStartBody } from "../types/bodies/second";
import { withRetry } from "./retryWrapper";

export const netpingControl = async (command: NetpingAction) => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/netping/control`,
        { command },
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const getNetpingStatus = async (): Promise<NetpingAction>  => {
  return withRetry(
    async () => {
      const { data } = await $host.get(
        `api/netping/status`,
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const switchInput = async (params: number) => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/switch/${params}`,
        { },
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const getRecordData= async (): Promise<RecordData | null>  => {
  return withRetry(
    async () => {
      const { data } = await $host.get(
        `api/record/status`,
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const recordStart = async (body: RecordStartBody) => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/record/start/`,
        body,
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const recordStop = async () => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/record/stop/`,
        {},
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const restartHls = async () => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/record/hls/restart/`,
        {},
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};

export const clearHls = async () => {
  return withRetry(
    async () => {
      const { data } = await $host.post(
        `api/record/hls/clear/`,
        {},
        { timeout: 8000 }
      );
      return data;
    },
    { maxRetries: 2 }
  );
};
