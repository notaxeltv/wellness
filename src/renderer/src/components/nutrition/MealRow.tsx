import { useState } from 'react';
import { Check, Clock, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Meal } from '@shared/types';

interface MealRowProps {
  meal: Meal;
  onToggle: (id: number, completato: boolean) => void;
  onUpdateNote: (id: number, note: string) => void;
  onUpdateDetails: (id: number, updates: { nomePasto?: string; orarioPrevisto?: string }) => void;
}

export function MealRow({ meal, onToggle, onUpdateNote, onUpdateDetails }: MealRowProps) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(meal.nomePasto);
  const [orario, setOrario] = useState(meal.orarioPrevisto);
  const [note, setNote] = useState(meal.note ?? '');

  const saveDetails = () => {
    onUpdateDetails(meal.id, { nomePasto: nome, orarioPrevisto: orario });
    setEditing(false);
  };

  return (
    <Card className={cn('transition-colors', meal.completato && 'border-success/50 bg-success/5')}>
      <CardContent className="flex items-start gap-3 py-4">
        <button
          onClick={() => onToggle(meal.id, !meal.completato)}
          className={cn(
            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
            meal.completato ? 'border-success bg-success text-success-foreground' : 'border-input hover:border-primary'
          )}
          aria-label={meal.completato ? 'Segna come non completato' : 'Segna come completato'}
        >
          {meal.completato && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1">
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-8 w-48" />
              <Input value={orario} onChange={(e) => setOrario(e.target.value)} className="h-8 w-24" />
              <Button size="sm" onClick={saveDetails}>
                Salva
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-medium', meal.completato && 'text-muted-foreground line-through')}>
                {meal.nomePasto}
              </p>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {meal.orarioPrevisto}
              </span>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}

          <Textarea
            className="mt-2 h-8 min-h-8 text-xs"
            placeholder="Note (es. cosa hai mangiato)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => onUpdateNote(meal.id, note)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
