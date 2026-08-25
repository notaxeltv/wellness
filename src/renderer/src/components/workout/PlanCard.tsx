import { Clock, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkoutPlan } from '@shared/types';

const LIVELLO_LABEL: Record<WorkoutPlan['livello'], string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzato: 'Avanzato',
};

const CATEGORIA_LABEL: Record<string, string> = {
  corpo_libero: 'Corpo libero',
  loop_bands: 'Loop bands',
  zaino_pesi: 'Zaino pesi',
};

interface PlanCardProps {
  plan: WorkoutPlan;
  onStart: (plan: WorkoutPlan) => void;
}

export function PlanCard({ plan, onStart }: PlanCardProps) {
  const categorie = Array.from(new Set(plan.esercizi?.map((e) => e.exercise?.categoria).filter(Boolean)));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{plan.nome}</CardTitle>
          <Badge variant="outline">{LIVELLO_LABEL[plan.livello]}</Badge>
        </div>
        <CardDescription>{plan.descrizione}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {categorie.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-[11px]">
              {CATEGORIA_LABEL[cat as string] ?? cat}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {plan.durataStimataMinuti} min
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> {plan.esercizi?.length ?? 0} esercizi
          </span>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {plan.esercizi?.slice(0, 4).map((pe) => (
            <li key={pe.id}>
              • {pe.exercise?.nome} — {pe.serie}×{pe.ripetizioni}
            </li>
          ))}
          {plan.esercizi && plan.esercizi.length > 4 && <li>… e altri {plan.esercizi.length - 4}</li>}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onStart(plan)}>
          Inizia allenamento
        </Button>
      </CardFooter>
    </Card>
  );
}
