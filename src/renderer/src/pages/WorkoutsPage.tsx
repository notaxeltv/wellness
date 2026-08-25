import { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanCard } from '@/components/workout/PlanCard';
import { SessionRunner } from '@/components/workout/SessionRunner';
import { SessionHistoryList } from '@/components/workout/SessionHistoryList';
import { ExerciseLibrary } from '@/components/workout/ExerciseLibrary';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import type { WorkoutPlan } from '@shared/types';

export default function WorkoutsPage() {
  const plans = useWorkoutStore((s) => s.plans);
  const sessions = useWorkoutStore((s) => s.sessions);
  const exercises = useWorkoutStore((s) => s.exercises);
  const removeSession = useWorkoutStore((s) => s.removeSession);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);

  const handleDelete = async (id: number) => {
    await removeSession(id);
    toast('Sessione eliminata dallo storico.');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Allenamenti</h1>
        <p className="text-muted-foreground">
          Piani pensati per corpo libero, loop bands e zaino con bottiglie d'acqua, con progressione graduale.
        </p>
      </div>

      <Tabs defaultValue="piani">
        <TabsList>
          <TabsTrigger value="piani">Piani</TabsTrigger>
          <TabsTrigger value="storico">Storico</TabsTrigger>
          <TabsTrigger value="libreria">Libreria esercizi</TabsTrigger>
        </TabsList>

        <TabsContent value="piani">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onStart={setActivePlan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="storico">
          <SessionHistoryList sessions={sessions} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="libreria">
          <ExerciseLibrary exercises={exercises} />
        </TabsContent>
      </Tabs>

      <SessionRunner plan={activePlan} onOpenChange={(open) => !open && setActivePlan(null)} />
    </div>
  );
}
