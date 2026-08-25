import { create } from 'zustand';
import type { DashboardStats } from '@shared/types';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  loadStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,

  loadStats: async () => {
    set({ loading: true });
    const stats = await window.api.dashboard.getStats();
    set({ stats, loading: false });
  },
}));
