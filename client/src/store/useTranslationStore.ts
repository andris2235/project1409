import { create } from "zustand/react";
import { PresetTypes, type PresetItem } from "../types/stream";
import { presets } from "../utils/firstStreams";

interface useTranslationStoreType {
  setDeletingPreset: (deletingPreset: null | PresetItem) => void;
  setCurrentPreset: (currentPreset: PresetItem) => void;
  deletingPreset: null | PresetItem;
  currentPreset: PresetItem;
  otherPresets: PresetItem[];
  setOtherPresets: (otherPresets: PresetItem[]) => void;
}

const useTranslationStore = create<useTranslationStoreType>((set) => ({
  deletingPreset: null,
  otherPresets: presets.filter((i) => i.type !== PresetTypes.first),
  currentPreset: {
    text: "Preset Quad",
    secondText: "Preset Quad",
    type: PresetTypes.first,
  },
  setCurrentPreset: (currentPreset) => {
    set({ currentPreset });
  },
  setDeletingPreset(deletingPreset) {
    set({deletingPreset})
  },
  setOtherPresets(otherPresets) {
    set({otherPresets})
  },
}));

export default useTranslationStore;
