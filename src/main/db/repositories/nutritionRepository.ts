import type Database from 'better-sqlite3';
import type { Meal } from '@shared/types';
import { ensureMealsForDate } from '../seed';

interface MealRow {
  id: number;
  data: string;
  slot: number;
  nome_pasto: string;
  orario_previsto: string;
  completato: number;
  note: string | null;
}

function mapMeal(row: MealRow): Meal {
  return {
    id: row.id,
    data: row.data,
    slot: row.slot,
    nomePasto: row.nome_pasto,
    orarioPrevisto: row.orario_previsto,
    completato: Boolean(row.completato),
    note: row.note,
  };
}

export function getMealsForDate(db: Database.Database, isoDate: string): Meal[] {
  ensureMealsForDate(db, isoDate);
  const rows = db
    .prepare('SELECT * FROM meals WHERE data = ? ORDER BY slot')
    .all(isoDate) as MealRow[];
  return rows.map(mapMeal);
}

export function setMealCompleted(db: Database.Database, id: number, completato: boolean): void {
  db.prepare('UPDATE meals SET completato = ? WHERE id = ?').run(completato ? 1 : 0, id);
}

export function updateMealNote(db: Database.Database, id: number, note: string): void {
  db.prepare('UPDATE meals SET note = ? WHERE id = ?').run(note, id);
}

export function updateMealDetails(
  db: Database.Database,
  id: number,
  updates: { nomePasto?: string; orarioPrevisto?: string }
): void {
  if (updates.nomePasto !== undefined) {
    db.prepare('UPDATE meals SET nome_pasto = ? WHERE id = ?').run(updates.nomePasto, id);
  }
  if (updates.orarioPrevisto !== undefined) {
    db.prepare('UPDATE meals SET orario_previsto = ? WHERE id = ?').run(updates.orarioPrevisto, id);
  }
}

export function getMealCompletionStats(
  db: Database.Database,
  isoDate: string
): { completati: number; totali: number } {
  ensureMealsForDate(db, isoDate);
  const row = db
    .prepare('SELECT COUNT(*) as totali, SUM(completato) as completati FROM meals WHERE data = ?')
    .get(isoDate) as { totali: number; completati: number | null };
  return { completati: row.completati ?? 0, totali: row.totali };
}
