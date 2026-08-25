import type { WellnessApi } from '@shared/preloadApi';

declare global {
  interface Window {
    api: WellnessApi;
  }
}

export {};
