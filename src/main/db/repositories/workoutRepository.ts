import type Database from 'better-sqlite3';
import type {
  CreateWorkoutSessionInput,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  SessionExerciseLog,
} from '@shared/types';
import { getExerciseById } from './exerciseRepository';

interface PlanRow {
  id: number;
  nome: string;
  descrizione: string;
  livello: WorkoutPlan['livello'];
  giorni_settimana: string;
  durata_stimata_minuti: number;
}

interface PlanExerciseRow {
  id: number;
  plan_id: number;
  exercise_id: number;
  ordine: number;
  serie: number;
  ripetizioni: string;
  riposo_secondi: number;
  note: string | null;
}

interface SessionRow {
  id: number;
  plan_id: number | null;
  data: string;
  durata_minuti: number | null;
  note: string | null;
  completata: number;
  created_at: string;
}

interface SessionExerciseRow {
  id: number;
  session_id: number;
  exercise_id: number;
  serie_completate: number;
  ripetizioni_effettive: string;
  carico: string | null;
  note: string | null;
}

function mapPlan(row: PlanRow): WorkoutPlan {
  return {
    id: row.id,
    nome: row.nome,
    descrizione: row.descrizione,
    livello: row.livello,
    giorniSettimana: row.giorni_settimana,
    durataStimataMinuti: row.durata_stimata_minuti,
  };
}

function mapPlanExercise(row: PlanExerciseRow): WorkoutPlanExercise {
  return {
    id: row.id,
    planId: row.plan_id,
    exerciseId: row.exercise_id,
    ordine: row.ordine,
    serie: row.serie,
    ripetizioni: row.ripetizioni,
    riposoSecondi: row.riposo_secondi,
    note: row.note ?? undefined,
  };
}

function mapSession(row: SessionRow): WorkoutSession {
  return {
    id: row.id,
    planId: row.plan_id,
    data: row.data,
    durataMinuti: row.durata_minuti,
    note: row.note,
    completata: Boolean(row.completata),
    createdAt: row.created_at,
  };
}

function mapSessionExercise(row: SessionExerciseRow): SessionExerciseLog {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    serieCompletate: row.serie_completate,
    ripetizioniEffettive: row.ripetizioni_effettive,
    carico: row.carico ?? undefined,
    note: row.note ?? undefined,
  };
}

export function listWorkoutPlans(db: Database.Database): WorkoutPlan[] {
  const rows = db.prepare('SELECT * FROM workout_plans ORDER BY id').all() as PlanRow[];
  return rows.map((row) => {
    const plan = mapPlan(row);
    plan.esercizi = getPlanExercises(db, row.id);
    return plan;
  });
}

export function getPlanExercises(db: Database.Database, planId: number): WorkoutPlanExercise[] {
  const rows = db
    .prepare('SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY ordine')
    .all(planId) as PlanExerciseRow[];
  return rows.map((row) => {
    const pe = mapPlanExercise(row);
    pe.exercise = getExerciseById(db, row.exercise_id) ?? undefined;
    return pe;
  });
}

export function getWorkoutPlanById(db: Database.Database, id: number): WorkoutPlan | null {
  const row = db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(id) as PlanRow | undefined;
  if (!row) return null;
  const plan = mapPlan(row);
  plan.esercizi = getPlanExercises(db, id);
  return plan;
}

export function listWorkoutSessions(db: Database.Database, limit = 60): WorkoutSession[] {
  const rows = db
    .prepare(
      `SELECT ws.*, wp.nome as plan_nome
       FROM workout_sessions ws
       LEFT JOIN workout_plans wp ON wp.id = ws.plan_id
       ORDER BY ws.data DESC, ws.id DESC
       LIMIT ?`
    )
    .all(limit) as (SessionRow & { plan_nome: string | null })[];

  return rows.map((row) => {
    const session = mapSession(row);
    session.planNome = row.plan_nome ?? undefined;
    session.esercizi = getSessionExercises(db, row.id);
    return session;
  });
}

export function getSessionExercises(db: Database.Database, sessionId: number): SessionExerciseLog[] {
  const rows = db
    .prepare('SELECT * FROM workout_session_exercises WHERE session_id = ?')
    .all(sessionId) as SessionExerciseRow[];
  return rows.map((row) => {
    const log = mapSessionExercise(row);
    log.exercise = getExerciseById(db, row.exercise_id) ?? undefined;
    return log;
  });
}

export function createWorkoutSession(db: Database.Database, input: CreateWorkoutSessionInput): WorkoutSession {
  const insertSession = db.prepare(
    `INSERT INTO workout_sessions (plan_id, data, durata_minuti, note, completata)
     VALUES (@planId, @data, @durataMinuti, @note, @completata)`
  );
  const insertExercise = db.prepare(
    `INSERT INTO workout_session_exercises (session_id, exercise_id, serie_completate, ripetizioni_effettive, carico, note)
     VALUES (@sessionId, @exerciseId, @serieCompletate, @ripetizioniEffettive, @carico, @note)`
  );

  const sessionId = db.transaction(() => {
    const info = insertSession.run({
      planId: input.planId,
      data: input.data,
      durataMinuti: input.durataMinuti,
      note: input.note,
      completata: input.completata ? 1 : 0,
    });
    const newId = Number(info.lastInsertRowid);
    for (const ex of input.esercizi) {
      insertExercise.run({
        sessionId: newId,
        exerciseId: ex.exerciseId,
        serieCompletate: ex.serieCompletate,
        ripetizioniEffettive: ex.ripetizioniEffettive,
        carico: ex.carico ?? null,
        note: ex.note ?? null,
      });
    }
    return newId;
  })();

  const row = db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get(sessionId) as SessionRow;
  const session = mapSession(row);
  session.esercizi = getSessionExercises(db, sessionId);
  if (input.planId) {
    const plan = getWorkoutPlanById(db, input.planId);
    session.planNome = plan?.nome;
  }
  return session;
}

export function deleteWorkoutSession(db: Database.Database, id: number): void {
  db.prepare('DELETE FROM workout_sessions WHERE id = ?').run(id);
}

export function countSessionsSince(db: Database.Database, isoDate: string): number {
  const row = db
    .prepare('SELECT COUNT(*) as c FROM workout_sessions WHERE data >= ? AND completata = 1')
    .get(isoDate) as { c: number };
  return row.c;
}

export function countSessionsOnDate(db: Database.Database, isoDate: string): number {
  const row = db
    .prepare('SELECT COUNT(*) as c FROM workout_sessions WHERE data = ? AND completata = 1')
    .get(isoDate) as { c: number };
  return row.c;
}

export function getWorkoutStreak(db: Database.Database): number {
  const rows = db
    .prepare('SELECT DISTINCT data FROM workout_sessions WHERE completata = 1 ORDER BY data DESC')
    .all() as { data: string }[];
  if (rows.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const dateSet = new Set(rows.map((r) => r.data));
  // Consente che oggi non sia ancora stato allenato senza rompere la streak di ieri.
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dateSet.has(iso)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
