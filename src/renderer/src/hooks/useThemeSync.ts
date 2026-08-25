import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useThemeSync(): void {
  const temaScuro = useSettingsStore((s) => s.settings.temaScuro);
  const loaded = useSettingsStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle('dark', temaScuro);
  }, [temaScuro, loaded]);
}
