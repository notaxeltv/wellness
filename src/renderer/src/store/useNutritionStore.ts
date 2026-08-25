import { create } from 'zustand';
import type { Meal } from '@shared/types';
import { formatIsoDate } from '@/lib/utils';
import { useDashboardStore } from './useDashboardStore';

interface NutritionState {
  selectedDate: string;
  meals: Meal[];
  loading: boolean;
  setSelectedDate: (date: string) => Promise<void>;
  loadMeals: () => Promise<void>;
  toggleMeal: (id: number, completato: boolean) => Promise<void>;
  updateNote: (id: number, note: string) => Promise<void>;
  updateDetails: (id: number, updates: { nomePasto?: string; orarioPrevisto?: string }) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  selectedDate: formatIsoDate(),
  meals: [],
  loading: false,

  setSelectedDate: async (date) => {
    set({ selectedDate: date });
    await get().loadMeals();
  },

  loadMeals: async () => {
    set({ loading: true });
    const meals = await window.api.nutrition.getMeals(get().selectedDate);
    set({ meals, loading: false });
  },

  toggleMeal: async (id, completato) => {
    await window.api.nutrition.setMealCompleted(id, completato);
    set({ meals: get().meals.map((m) => (m.id === id ? { ...m, completato } : m)) });
    void useDashboardStore.getState().loadStats();
  },

  updateNote: async (id, note) => {
    await window.api.nutrition.updateMealNote(id, note);
    set({ meals: get().meals.map((m) => (m.id === id ? { ...m, note } : m)) });
  },

  updateDetails: async (id, updates) => {
    await window.api.nutrition.updateMealDetails(id, updates);
    set({
      meals: get().meals.map((m) =>
        m.id === id
          ? { ...m, nomePasto: updates.nomePasto ?? m.nomePasto, orarioPrevisto: updates.orarioPrevisto ?? m.orarioPrevisto }
          : m
      ),
    });
  },
}));
