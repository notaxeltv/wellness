import { create } from 'zustand';
import type { DashboardStats, WeeklyActivityPoint } from '@shared/types';

interface DashboardState {
  stats: DashboardStats | null;
  weeklyActivity: WeeklyActivityPoint[];
  loading: boolean;
  loadStats: () => Promise<void>;
  loadWeeklyActivity: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  weeklyActivity: [],
  loading: false,

  loadStats: async () => {
    set({ loading: true });
    const stats = await window.api.dashboard.getStats();
    set({ stats, loading: false });
  },

  loadWeeklyActivity: async () => {
    const weeklyActivity = await window.api.dashboard.getWeeklyActivity();
    set({ weeklyActivity });
  },
}));
