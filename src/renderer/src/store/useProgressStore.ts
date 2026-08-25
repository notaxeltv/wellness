import { create } from 'zustand';
import type { BodyProgress } from '@shared/types';

interface ProgressState {
  entries: BodyProgress[];
  loading: boolean;
  loadEntries: () => Promise<void>;
  addEntry: (entry: {
    data: string;
    pesoKg?: number | null;
    vitaCm?: number | null;
    pettoCm?: number | null;
    note?: string | null;
  }) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  entries: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    const entries = await window.api.progress.list(180);
    set({ entries, loading: false });
  },

  addEntry: async (entry) => {
    await window.api.progress.upsert(entry);
    await get().loadEntries();
  },

  removeEntry: async (id) => {
    await window.api.progress.delete(id);
    set({ entries: get().entries.filter((e) => e.id !== id) });
  },
}));
