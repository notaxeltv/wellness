import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { seedDatabase, ensureMealsForDate } from './seed';

let dbInstance: Database.Database | null = null;

export function getDbPath(): string {
  const userDataDir = app.getPath('userData');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'wellness-home-coach.sqlite3');
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(SCHEMA_SQL);
  seedDatabase(db);

  const today = new Date().toISOString().slice(0, 10);
  ensureMealsForDate(db, today);

  dbInstance = db;
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Lo schema è definito inline per garantire che funzioni sia in sviluppo
// sia nel bundle Electron impacchettato in asar (nessuna dipendenza da file .sql esterni).
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('corpo_libero', 'loop_bands', 'zaino_pesi')),
  gruppo_muscolare TEXT NOT NULL,
  descrizione TEXT NOT NULL DEFAULT '',
  istruzioni TEXT NOT NULL DEFAULT '',
  livello TEXT NOT NULL DEFAULT 'principiante' CHECK (livello IN ('principiante', 'intermedio', 'avanzato'))
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descrizione TEXT NOT NULL DEFAULT '',
  livello TEXT NOT NULL DEFAULT 'principiante' CHECK (livello IN ('principiante', 'intermedio', 'avanzato')),
  giorni_settimana TEXT NOT NULL DEFAULT '',
  durata_stimata_minuti INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  ordine INTEGER NOT NULL DEFAULT 0,
  serie INTEGER NOT NULL DEFAULT 3,
  ripetizioni TEXT NOT NULL DEFAULT '10-12',
  riposo_secondi INTEGER NOT NULL DEFAULT 60,
  note TEXT
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER REFERENCES workout_plans(id) ON DELETE SET NULL,
  data TEXT NOT NULL,
  durata_minuti INTEGER,
  note TEXT,
  completata INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_session_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  serie_completate INTEGER NOT NULL DEFAULT 0,
  ripetizioni_effettive TEXT NOT NULL DEFAULT '',
  carico TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
  nome_pasto TEXT NOT NULL,
  orario_previsto TEXT NOT NULL,
  completato INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  UNIQUE(data, slot)
);

CREATE TABLE IF NOT EXISTS body_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL UNIQUE,
  peso_kg REAL,
  vita_cm REAL,
  petto_cm REAL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('system', 'user', 'assistant')),
  contenuto TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_data ON workout_sessions(data);
CREATE INDEX IF NOT EXISTS idx_meals_data ON meals(data);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_messages(conversation_id, id);
`;
