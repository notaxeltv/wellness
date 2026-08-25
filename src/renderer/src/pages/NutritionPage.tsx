import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MealRow } from '@/components/nutrition/MealRow';
import { useNutritionStore } from '@/store/useNutritionStore';
import { formatDataItaliana, formatIsoDate } from '@/lib/utils';

export default function NutritionPage() {
  const selectedDate = useNutritionStore((s) => s.selectedDate);
  const meals = useNutritionStore((s) => s.meals);
  const setSelectedDate = useNutritionStore((s) => s.setSelectedDate);
  const loadMeals = useNutritionStore((s) => s.loadMeals);
  const toggleMeal = useNutritionStore((s) => s.toggleMeal);
  const updateNote = useNutritionStore((s) => s.updateNote);
  const updateDetails = useNutritionStore((s) => s.updateDetails);

  useEffect(() => {
    void loadMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeDay = (delta: number) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + delta);
    void setSelectedDate(formatIsoDate(date));
  };

  const completati = meals.filter((m) => m.completato).length;
  const percentuale = meals.length > 0 ? (completati / meals.length) * 100 : 0;
  const isOggi = selectedDate === formatIsoDate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nutrizione</h1>
        <p className="text-muted-foreground">Piano a 6 pasti piccoli al giorno, pensato per sostenere l'allenamento.</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <Button variant="outline" size="icon" onClick={() => changeDay(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium capitalize">
              {formatDataItaliana(selectedDate)} {isOggi && '(oggi)'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <Progress value={percentuale} className="w-48" />
              <span className="text-xs text-muted-foreground">
                {completati}/{meals.length} pasti
              </span>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => changeDay(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {meals.map((meal) => (
          <MealRow
            key={meal.id}
            meal={meal}
            onToggle={toggleMeal}
            onUpdateNote={updateNote}
            onUpdateDetails={updateDetails}
          />
        ))}
      </div>
    </div>
  );
}
