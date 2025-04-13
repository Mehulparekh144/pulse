import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'


interface SummaryStore {
  summary: string;
  setSummary: (summary: string) => void;
}

export const useSummary = create<SummaryStore>()(
  persist((set) => ({
    summary: '',
    setSummary: (summary) => set({ summary }),
  }), {
    name: 'summary',
    storage: createJSONStorage(() => localStorage),
  })
);


