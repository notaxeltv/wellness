import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useChatStore } from '@/store/useChatStore';

/**
 * Carica una sola volta all'avvio dell'app tutti i dati necessari dagli store,
 * cosi' le pagine possono limitarsi a leggerli senza ripetere i fetch iniziali.
 */
export function useAppBootstrap(): void {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadWorkouts = useWorkoutStore((s) => s.loadAll);
  const loadMeals = useNutritionStore((s) => s.loadMeals);
  const loadProgress = useProgressStore((s) => s.loadEntries);
  const loadStats = useDashboardStore((s) => s.loadStats);
  const loadChat = useChatStore((s) => s.loadMessages);

  useEffect(() => {
    void loadSettings();
    void loadWorkouts();
    void loadMeals();
    void loadProgress();
    void loadStats();
    void loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
