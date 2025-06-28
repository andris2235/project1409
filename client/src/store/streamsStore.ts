import { create } from "zustand";


interface StreamStoreType {
  mirrorStreams: MediaStream[];
  setMirrorStreams: (stream: MediaStream)=> void
}

const streamStore = create<StreamStoreType>((set, get) => ({
  mirrorStreams: [],
  setMirrorStreams: (stream) => {
    const {mirrorStreams: oldMirrorStreams} = get()
    set({mirrorStreams: [...oldMirrorStreams, stream]})
  },
}));

export default streamStore;
