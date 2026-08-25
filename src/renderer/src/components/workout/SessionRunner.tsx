import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { formatIsoDate } from '@/lib/utils';
import type { WorkoutPlan } from '@shared/types';

interface SessionRunnerProps {
  plan: WorkoutPlan | null;
  onOpenChange: (open: boolean) => void;
}

interface ExerciseLog {
  exerciseId: number;
  nome: string;
  serieCompletate: number;
  ripetizioniEffettive: string;
  carico: string;
}

export function SessionRunner({ plan, onOpenChange }: SessionRunnerProps) {
  const logSession = useWorkoutStore((s) => s.logSession);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [note, setNote] = useState('');
  const [durata, setDurata] = useState<number>(plan?.durataStimataMinuti ?? 30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setLogs(
        (plan.esercizi ?? []).map((pe) => ({
          exerciseId: pe.exerciseId,
          nome: pe.exercise?.nome ?? 'Esercizio',
          serieCompletate: pe.serie,
          ripetizioniEffettive: pe.ripetizioni,
          carico: pe.exercise?.categoria === 'zaino_pesi' ? 'Zaino (specifica bottiglie/litri)' : '',
        }))
      );
      setDurata(plan.durataStimataMinuti);
      setNote('');
    }
  }, [plan]);

  if (!plan) return null;

  const updateLog = (index: number, changes: Partial<ExerciseLog>) => {
    setLogs((prev) => prev.map((log, i) => (i === index ? { ...log, ...changes } : log)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await logSession({
        planId: plan.id,
        data: formatIsoDate(),
        durataMinuti: durata,
        note: note || null,
        completata: true,
        esercizi: logs.map((log) => ({
          exerciseId: log.exerciseId,
          serieCompletate: log.serieCompletate,
          ripetizioniEffettive: log.ripetizioniEffettive,
          carico: log.carico || undefined,
        })),
      });
      toast.success('Allenamento salvato', { description: `${plan.nome} registrato nello storico.` });
      onOpenChange(false);
    } catch (err) {
      toast.error('Errore nel salvataggio', {
        description: err instanceof Error ? err.message : 'Errore imprevisto.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(plan)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan.nome}</DialogTitle>
          <DialogDescription>
            Registra serie, ripetizioni effettive e carico usato per ogni esercizio, poi salva la sessione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={log.exerciseId} className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-medium">{log.nome}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Serie</Label>
                  <Input
                    type="number"
                    min={0}
                    value={log.serieCompletate}
                    onChange={(e) => updateLog(index, { serieCompletate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ripetizioni</Label>
                  <Input
                    value={log.ripetizioniEffettive}
                    onChange={(e) => updateLog(index, { ripetizioniEffettive: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Carico / note</Label>
                  <Input value={log.carico} onChange={(e) => updateLog(index, { carico: e.target.value })} />
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Durata (minuti)</Label>
              <Input type="number" min={1} value={durata} onChange={(e) => setDurata(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Note sulla sessione</Label>
            <Textarea
              placeholder="Come ti sei sentito? Dolori, fatica, energia..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvataggio…' : 'Salva allenamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
