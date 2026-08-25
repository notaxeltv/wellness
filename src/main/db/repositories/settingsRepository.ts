import type Database from 'better-sqlite3';
import { DEFAULT_SETTINGS, type AppSettings } from '@shared/types';

export function getSettings(db: Database.Database): AppSettings {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const stored: Record<string, string> = {};
  for (const row of rows) stored[row.key] = row.value;

  const parsed: AppSettings = { ...DEFAULT_SETTINGS };
  if (stored.ollamaBaseUrl) parsed.ollamaBaseUrl = stored.ollamaBaseUrl;
  if (stored.ollamaModel) parsed.ollamaModel = stored.ollamaModel;
  if (stored.temperature) parsed.temperature = Number(stored.temperature);
  if (stored.topP) parsed.topP = Number(stored.topP);
  if (stored.maxTokens) parsed.maxTokens = Number(stored.maxTokens);
  if (stored.nomeUtente) parsed.nomeUtente = stored.nomeUtente;
  if (stored.obiettivo) parsed.obiettivo = stored.obiettivo;
  if (stored.numeroCorporeoIniziale) parsed.numeroCorporeoIniziale = Number(stored.numeroCorporeoIniziale);
  if (stored.temaScuro !== undefined) parsed.temaScuro = stored.temaScuro === 'true';

  return parsed;
}

export function updateSettings(db: Database.Database, partial: Partial<AppSettings>): AppSettings {
  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (@key, @value)
     ON CONFLICT(key) DO UPDATE SET value = @value`
  );
  const tx = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) {
      upsert.run({ key, value });
    }
  });

  const entries: [string, string][] = Object.entries(partial)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);

  tx(entries);
  return getSettings(db);
}
