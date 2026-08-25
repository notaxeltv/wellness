import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, MessageCircle, Salad, TrendingDown, TrendingUp, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeeklyActivityChart } from '@/components/dashboard/WeeklyActivityChart';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';

export default function DashboardPage() {
  const stats = useDashboardStore((s) => s.stats);
  const loadStats = useDashboardStore((s) => s.loadStats);
  const weeklyActivity = useDashboardStore((s) => s.weeklyActivity);
  const loadWeeklyActivity = useDashboardStore((s) => s.loadWeeklyActivity);
  const settings = useSettingsStore((s) => s.settings);
  const meals = useNutritionStore((s) => s.meals);
  const loadMeals = useNutritionStore((s) => s.loadMeals);
  const plans = useWorkoutStore((s) => s.plans);

  useEffect(() => {
    // Le statistiche possono cambiare in altre pagine (allenamenti, pasti), quindi le
    // ricarichiamo ogni volta che l'utente torna sulla Dashboard.
    void loadStats();
    void loadWeeklyActivity();
    void loadMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prossimiPasti = useMemo(() => meals.filter((m) => !m.completato).slice(0, 3), [meals]);
  const pastiProgress = stats && stats.pastiTotaliOggi > 0 ? (stats.pastiCompletatiOggi / stats.pastiTotaliOggi) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bentornato, {settings.nomeUtente}</h1>
        <p className="text-muted-foreground">
          Ecco il riepilogo di oggi. Un passo alla volta: la costanza conta più dell'intensità.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Allenamenti (settimana)</CardTitle>
            <Dumbbell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.allenamentiSettimana ?? 0}</p>
            <p className="text-xs text-muted-foreground">sessioni completate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak allenamenti</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.streakGiorni ?? 0}</p>
            <p className="text-xs text-muted-foreground">giorni consecutivi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pasti di oggi</CardTitle>
            <Salad className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.pastiCompletatiOggi ?? 0}/{stats?.pastiTotaliOggi ?? 6}
            </p>
            <Progress value={pastiProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peso corporeo</CardTitle>
            {stats?.variazionePeso != null && stats.variazionePeso < 0 ? (
              <TrendingDown className="h-4 w-4 text-success" />
            ) : (
              <TrendingUp className="h-4 w-4 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.ultimoPeso != null ? `${stats.ultimoPeso} kg` : '—'}</p>
            <p className="text-xs text-muted-foreground">
              {stats?.variazionePeso != null
                ? `${stats.variazionePeso > 0 ? '+' : ''}${stats.variazionePeso} kg negli ultimi rilevamenti`
                : 'Registra il tuo peso nella sezione Progressi'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attività della settimana</CardTitle>
          <CardDescription>Ultimi 7 giorni: allenamenti svolti e pasti completati</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyActivityChart data={weeklyActivity} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prossimo allenamento consigliato</CardTitle>
            <CardDescription>
              {stats?.prossimoPlanNome
                ? `In base alla tua attrezzatura, oggi potresti seguire: ${stats.prossimoPlanNome}`
                : 'Crea un piano nella sezione Allenamenti per iniziare.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {plans.slice(0, 3).map((plan) => (
              <Badge key={plan.id} variant="secondary">
                {plan.nome}
              </Badge>
            ))}
            <Button asChild size="sm" className="ml-auto">
              <Link to="/allenamenti">Vai agli allenamenti</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> Coach AI
            </CardTitle>
            <CardDescription>Qwen2.5-Coder 14B via Ollama, in esecuzione in locale.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Chiedi consigli su allenamento, progressioni con lo zaino o sui pasti della giornata.
            </p>
            <Button asChild className="w-full">
              <Link to="/coach">Apri la chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pasti in sospeso</CardTitle>
          <CardDescription>I prossimi pasti pianificati per oggi</CardDescription>
        </CardHeader>
        <CardContent>
          {prossimiPasti.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tutti i pasti di oggi sono completati. Ottimo lavoro!</p>
          ) : (
            <ul className="divide-y divide-border">
              {prossimiPasti.map((meal) => (
                <li key={meal.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{meal.nomePasto}</span>
                  <span className="text-muted-foreground">{meal.orarioPrevisto}</span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/nutrizione">Gestisci i pasti</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
