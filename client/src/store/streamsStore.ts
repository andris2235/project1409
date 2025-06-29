import { create } from "zustand";
export interface MirrorStream {
  mirrorStreeam: MediaStream;
  src: string;
}
interface StreamStoreType {
  mirrorStreams: MirrorStream[];
  setMirrorStreams: (stream: MirrorStream) => void;
  resetStreams: () => void;
  progress: Record<string, number>;
  setProgress: (src: string, time: number) => void;
  getProgress: (src: string) => number;
}

const streamStore = create<StreamStoreType>((set, get) => ({
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
}));

export default streamStore;
