import type Database from 'better-sqlite3';
import type { Exercise } from '@shared/types';

interface ExerciseRow {
  id: number;
  nome: string;
  categoria: Exercise['categoria'];
  gruppo_muscolare: string;
  descrizione: string;
  istruzioni: string;
  livello: Exercise['livello'];
}

function mapRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    gruppoMuscolare: row.gruppo_muscolare as Exercise['gruppoMuscolare'],
    descrizione: row.descrizione,
    istruzioni: row.istruzioni,
    livello: row.livello,
  };
}

export function listExercises(db: Database.Database): Exercise[] {
  const rows = db.prepare('SELECT * FROM exercises ORDER BY categoria, nome').all() as ExerciseRow[];
  return rows.map(mapRow);
}

export function getExerciseById(db: Database.Database, id: number): Exercise | null {
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id) as ExerciseRow | undefined;
  return row ? mapRow(row) : null;
}
