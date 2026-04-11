import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MediaVisibilityState {
  mediaVisible: boolean;
  setMediaVisible: (visible: boolean) => void;
  toggleMediaVisible: () => void;
}

export const useMediaVisibilityStore = create<MediaVisibilityState>()(
  persist(
    (set) => ({
      mediaVisible: true,
      setMediaVisible: (visible) => set({ mediaVisible: visible }),
      toggleMediaVisible: () => set((state) => ({ mediaVisible: !state.mediaVisible })),
    }),
    {
      name: 'media-visibility', // clé localStorage
    }
  )
);
