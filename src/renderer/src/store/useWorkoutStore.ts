import { create } from 'zustand';
import type { CreateWorkoutSessionInput, Exercise, WorkoutPlan, WorkoutSession } from '@shared/types';
import { useDashboardStore } from './useDashboardStore';

interface WorkoutState {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  loading: boolean;
  loadAll: () => Promise<void>;
  logSession: (input: CreateWorkoutSessionInput) => Promise<WorkoutSession>;
  removeSession: (id: number) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exercises: [],
  plans: [],
  sessions: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const [exercises, plans, sessions] = await Promise.all([
      window.api.exercises.list(),
      window.api.workouts.listPlans(),
      window.api.workouts.listSessions(90),
    ]);
    set({ exercises, plans, sessions, loading: false });
  },

  logSession: async (input) => {
    const session = await window.api.workouts.createSession(input);
    set({ sessions: [session, ...get().sessions] });
    void useDashboardStore.getState().loadStats();
    void useDashboardStore.getState().loadWeeklyActivity();
    return session;
  },

  removeSession: async (id) => {
    await window.api.workouts.deleteSession(id);
    set({ sessions: get().sessions.filter((s) => s.id !== id) });
    void useDashboardStore.getState().loadStats();
    void useDashboardStore.getState().loadWeeklyActivity();
  },
}));
