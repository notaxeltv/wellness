import { create } from 'zustand';
import { DEFAULT_SETTINGS, type AppSettings, type OllamaStatus } from '@shared/types';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  ollamaStatus: OllamaStatus | null;
  checkingStatus: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  checkOllamaStatus: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  ollamaStatus: null,
  checkingStatus: false,

  loadSettings: async () => {
    const settings = await window.api.settings.get();
    set({ settings, loaded: true });
  },

  updateSettings: async (partial) => {
    const settings = await window.api.settings.update(partial);
    set({ settings });
  },

  checkOllamaStatus: async () => {
    set({ checkingStatus: true });
    try {
      const { settings } = get();
      const status = await window.api.ollama.checkStatus(settings.ollamaBaseUrl, settings.ollamaModel);
      set({ ollamaStatus: status, checkingStatus: false });
    } catch {
      set({
        ollamaStatus: {
          connesso: false,
          modelloDisponibile: false,
          modelli: [],
          errore: 'Errore inatteso durante il controllo di Ollama.',
        },
        checkingStatus: false,
      });
    }
  },
}));
