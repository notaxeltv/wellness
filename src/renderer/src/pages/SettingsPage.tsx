import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { AppInfo } from '@shared/types';

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const ollamaStatus = useSettingsStore((s) => s.ollamaStatus);
  const checkingStatus = useSettingsStore((s) => s.checkingStatus);
  const checkOllamaStatus = useSettingsStore((s) => s.checkOllamaStatus);

  const [baseUrl, setBaseUrl] = useState(settings.ollamaBaseUrl);
  const [model, setModel] = useState(settings.ollamaModel);
  const [nomeUtente, setNomeUtente] = useState(settings.nomeUtente);
  const [obiettivo, setObiettivo] = useState(settings.obiettivo);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    setBaseUrl(settings.ollamaBaseUrl);
    setModel(settings.ollamaModel);
    setNomeUtente(settings.nomeUtente);
    setObiettivo(settings.obiettivo);
  }, [settings]);

  useEffect(() => {
    void window.api.app.getInfo().then(setAppInfo);
  }, []);

  const salvaConnessione = async () => {
    await updateSettings({ ollamaBaseUrl: baseUrl, ollamaModel: model });
    await checkOllamaStatus();
    toast.success('Impostazioni Ollama aggiornate');
  };

  const salvaProfilo = async () => {
    await updateSettings({ nomeUtente, obiettivo });
    toast.success('Profilo aggiornato');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Impostazioni</h1>
        <p className="text-muted-foreground">Configura la connessione a Ollama e le preferenze dell'app.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connessione Ollama</CardTitle>
          <CardDescription>
            L'app si collega a Ollama in esecuzione sul tuo computer per usare il modello Qwen2.5-Coder in locale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {ollamaStatus?.connesso ? (
              <Badge variant="success">Connesso</Badge>
            ) : (
              <Badge variant="destructive">Non connesso</Badge>
            )}
            {ollamaStatus?.errore && <p className="text-xs text-muted-foreground">{ollamaStatus.errore}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">URL server Ollama</Label>
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:11434" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Modello</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="qwen2.5-coder:14b" />
            </div>
          </div>

          {ollamaStatus && ollamaStatus.modelli.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Modelli disponibili su questo Ollama</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {ollamaStatus.modelli.map((m) => (
                  <Badge key={m.name} variant="outline" className="cursor-pointer" onClick={() => setModel(m.name)}>
                    {m.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={salvaConnessione}>Salva e verifica connessione</Button>
            <Button variant="outline" onClick={() => void checkOllamaStatus()} disabled={checkingStatus}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${checkingStatus ? 'animate-spin' : ''}`} /> Verifica ora
            </Button>
          </div>

          {!ollamaStatus?.connesso && (
            <p className="rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
              Assicurati che Ollama sia installato e in esecuzione (<code>ollama serve</code>) e che il modello sia
              stato scaricato con <code>ollama pull qwen2.5-coder:14b</code>.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parametri di generazione</CardTitle>
          <CardDescription>Regola creatività e lunghezza delle risposte del coach AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Temperature</span>
              <span>{settings.temperature.toFixed(2)}</span>
            </div>
            <Slider
              value={[settings.temperature]}
              min={0}
              max={1.5}
              step={0.05}
              onValueChange={([v]) => void updateSettings({ temperature: v })}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Top P</span>
              <span>{settings.topP.toFixed(2)}</span>
            </div>
            <Slider
              value={[settings.topP]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => void updateSettings({ topP: v })}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Lunghezza massima risposta (token)</span>
              <span>{settings.maxTokens}</span>
            </div>
            <Slider
              value={[settings.maxTokens]}
              min={256}
              max={4096}
              step={128}
              onValueChange={([v]) => void updateSettings({ maxTokens: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>Usato dal coach AI per personalizzare i consigli.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input value={nomeUtente} onChange={(e) => setNomeUtente(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Obiettivo</Label>
            <Input value={obiettivo} onChange={(e) => setObiettivo(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Tema scuro</Label>
            <Switch checked={settings.temaScuro} onCheckedChange={(v) => void updateSettings({ temaScuro: v })} />
          </div>
          <Button onClick={salvaProfilo}>Salva profilo</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni app</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Versione: {appInfo?.version ?? '—'}</p>
          <p>Database locale: {appInfo?.dbPath ?? '—'}</p>
          <p>Piattaforma: {appInfo?.platform ?? '—'}</p>
          <Separator className="my-2" />
          <p>Tutti i dati (allenamenti, pasti, progressi, chat) sono salvati solo su questo computer.</p>
        </CardContent>
      </Card>
    </div>
  );
}
