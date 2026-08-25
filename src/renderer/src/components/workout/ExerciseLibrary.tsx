import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Exercise } from '@shared/types';

const CATEGORIE = [
  { value: 'tutti', label: 'Tutti' },
  { value: 'corpo_libero', label: 'Corpo libero' },
  { value: 'loop_bands', label: 'Loop bands' },
  { value: 'zaino_pesi', label: 'Zaino pesi' },
];

interface ExerciseLibraryProps {
  exercises: Exercise[];
}

export function ExerciseLibrary({ exercises }: ExerciseLibraryProps) {
  const [filtro, setFiltro] = useState('tutti');

  const filtrati = useMemo(
    () => (filtro === 'tutti' ? exercises : exercises.filter((e) => e.categoria === filtro)),
    [exercises, filtro]
  );

  return (
    <div className="space-y-4">
      <Tabs value={filtro} onValueChange={setFiltro}>
        <TabsList>
          {CATEGORIE.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtrati.map((exercise) => (
          <Card key={exercise.id}>
            <CardContent className="py-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{exercise.nome}</p>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {exercise.gruppoMuscolare}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{exercise.descrizione}</p>
              <p className="mt-2 text-xs text-muted-foreground">{exercise.istruzioni}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
