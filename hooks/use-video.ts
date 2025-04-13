import type { Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VideoState {
  fileUrl: string | null;
  fileId: Id<'_storage'> | null;
  setFileUrl: (fileUrl: string | null) => void;
  setFileId: (fileId: Id<'_storage'> | null) => void;
}


export const useVideo = create<VideoState>()(
  persist((set) => ({
    fileUrl: null,
    fileId: null,
    setFileUrl: (fileUrl) => set({ fileUrl }),
    setFileId: (fileId) => set({ fileId }),
  }), {
    name: 'fileUrl',
    storage: createJSONStorage(() => localStorage)
  })
);


