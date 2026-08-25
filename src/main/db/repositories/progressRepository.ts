import type Database from 'better-sqlite3';
import type { BodyProgress } from '@shared/types';

interface ProgressRow {
  id: number;
  data: string;
  peso_kg: number | null;
  vita_cm: number | null;
  petto_cm: number | null;
  note: string | null;
}

function mapProgress(row: ProgressRow): BodyProgress {
  return {
    id: row.id,
    data: row.data,
    pesoKg: row.peso_kg,
    vitaCm: row.vita_cm,
    pettoCm: row.petto_cm,
    note: row.note,
  };
}

export function listBodyProgress(db: Database.Database, limit = 180): BodyProgress[] {
  const rows = db
    .prepare('SELECT * FROM body_progress ORDER BY data DESC LIMIT ?')
    .all(limit) as ProgressRow[];
  return rows.map(mapProgress).reverse();
}

export function upsertBodyProgress(
  db: Database.Database,
  entry: { data: string; pesoKg?: number | null; vitaCm?: number | null; pettoCm?: number | null; note?: string | null }
): BodyProgress {
  db.prepare(
    `INSERT INTO body_progress (data, peso_kg, vita_cm, petto_cm, note)
     VALUES (@data, @pesoKg, @vitaCm, @pettoCm, @note)
     ON CONFLICT(data) DO UPDATE SET
       peso_kg = COALESCE(@pesoKg, peso_kg),
       vita_cm = COALESCE(@vitaCm, vita_cm),
       petto_cm = COALESCE(@pettoCm, petto_cm),
       note = COALESCE(@note, note)`
  ).run({
    data: entry.data,
    pesoKg: entry.pesoKg ?? null,
    vitaCm: entry.vitaCm ?? null,
    pettoCm: entry.pettoCm ?? null,
    note: entry.note ?? null,
  });

  const row = db.prepare('SELECT * FROM body_progress WHERE data = ?').get(entry.data) as ProgressRow;
  return mapProgress(row);
}

export function getLatestBodyProgress(db: Database.Database): BodyProgress | null {
  const row = db
    .prepare('SELECT * FROM body_progress WHERE peso_kg IS NOT NULL ORDER BY data DESC LIMIT 1')
    .get() as ProgressRow | undefined;
  return row ? mapProgress(row) : null;
}

export function deleteBodyProgress(db: Database.Database, id: number): void {
  db.prepare('DELETE FROM body_progress WHERE id = ?').run(id);
}
