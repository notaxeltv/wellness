import { useEffect } from 'react';
import { Bot, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function OllamaStatusBadge() {
  const ollamaStatus = useSettingsStore((s) => s.ollamaStatus);
  const checkingStatus = useSettingsStore((s) => s.checkingStatus);
  const checkOllamaStatus = useSettingsStore((s) => s.checkOllamaStatus);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ollamaBaseUrl, settings.ollamaModel]);

  if (checkingStatus && !ollamaStatus) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Bot className="h-3 w-3 animate-pulse" /> Verifica Ollama...
      </Badge>
    );
  }

  if (!ollamaStatus || !ollamaStatus.connesso) {
    return (
      <Badge variant="destructive" className="gap-1.5" title={ollamaStatus?.errore}>
        <WifiOff className="h-3 w-3" /> Ollama non connesso
      </Badge>
    );
  }

  if (!ollamaStatus.modelloDisponibile) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Bot className="h-3 w-3" /> Modello {settings.ollamaModel} non trovato
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1.5">
      <Bot className="h-3 w-3" /> Coach AI pronto ({settings.ollamaModel})
    </Badge>
  );
}
