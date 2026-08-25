import type Database from 'better-sqlite3';
import type { DashboardStats } from '@shared/types';
import { countSessionsSince, getWorkoutStreak, listWorkoutPlans } from './workoutRepository';
import { getMealCompletionStats } from './nutritionRepository';
import { listBodyProgress } from './progressRepository';

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = domenica
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export function getDashboardStats(db: Database.Database): DashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  const allenamentiSettimana = countSessionsSince(db, startOfWeekIso());
  const streakGiorni = getWorkoutStreak(db);
  const { completati, totali } = getMealCompletionStats(db, today);

  const progressi = listBodyProgress(db, 30).filter((p) => p.pesoKg != null);
  const ultimoPeso = progressi.length > 0 ? progressi[progressi.length - 1].pesoKg : null;
  const primoPeso = progressi.length > 0 ? progressi[0].pesoKg : null;
  const variazionePeso =
    ultimoPeso != null && primoPeso != null ? Math.round((ultimoPeso - primoPeso) * 10) / 10 : null;

  const piani = listWorkoutPlans(db);
  const prossimoPlanNome = piani.length > 0 ? piani[0].nome : null;

  return {
    allenamentiSettimana,
    streakGiorni,
    pastiCompletatiOggi: completati,
    pastiTotaliOggi: totali,
    ultimoPeso,
    variazionePeso,
    prossimoPlanNome,
  };
}
