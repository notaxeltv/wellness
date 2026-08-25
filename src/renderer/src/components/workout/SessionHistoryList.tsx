import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDataItaliana } from '@/lib/utils';
import type { WorkoutSession } from '@shared/types';

interface SessionHistoryListProps {
  sessions: WorkoutSession[];
  onDelete: (id: number) => void;
}

export function SessionHistoryList({ sessions, onDelete }: SessionHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nessun allenamento registrato ancora. Avvia una sessione dalla tab "Piani".
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{formatDataItaliana(session.data)}</p>
              <p className="text-sm text-muted-foreground">
                {session.planNome ?? 'Allenamento libero'}
                {session.durataMinuti ? ` · ${session.durataMinuti} min` : ''}
              </p>
              {session.note && <p className="mt-1 text-xs italic text-muted-foreground">"{session.note}"</p>}
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {session.esercizi?.map((ex) => (
                  <li key={ex.id} className="rounded-full bg-secondary px-2 py-0.5">
                    {ex.exercise?.nome}: {ex.serieCompletate}×{ex.ripetizioniEffettive}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(session.id)} title="Elimina sessione">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
