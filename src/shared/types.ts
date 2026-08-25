// Tipi condivisi tra processo main, preload e renderer.
// Nota: rimangono semplici (solo dati) per poter essere serializzati via IPC.

export type EquipmentType = 'corpo_libero' | 'loop_bands' | 'zaino_pesi';

export type MuscleGroup =
  | 'petto'
  | 'schiena'
  | 'gambe'
  | 'spalle'
  | 'braccia'
  | 'core'
  | 'cardio'
  | 'corpo_intero';

export interface Exercise {
  id: number;
  nome: string;
  categoria: EquipmentType;
  gruppoMuscolare: MuscleGroup;
  descrizione: string;
  istruzioni: string;
  livello: 'principiante' | 'intermedio' | 'avanzato';
}

export interface WorkoutPlanExercise {
  id: number;
  planId: number;
  exerciseId: number;
  ordine: number;
  serie: number;
  ripetizioni: string; // es. "10-12" oppure "30 sec"
  riposoSecondi: number;
  note?: string;
  exercise?: Exercise;
}

export interface WorkoutPlan {
  id: number;
  nome: string;
  descrizione: string;
  livello: 'principiante' | 'intermedio' | 'avanzato';
  giorniSettimana: string; // es. "Lun, Mer, Ven"
  durataStimataMinuti: number;
  esercizi?: WorkoutPlanExercise[];
}

export interface SessionExerciseLog {
  id: number;
  sessionId: number;
  exerciseId: number;
  serieCompletate: number;
  ripetizioniEffettive: string;
  carico?: string; // es. "corpo libero", "2 bottiglie 1.5L", "loop band media"
  note?: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: number;
  planId: number | null;
  data: string; // ISO date YYYY-MM-DD
  durataMinuti: number | null;
  note: string | null;
  completata: boolean;
  createdAt: string;
  esercizi?: SessionExerciseLog[];
  planNome?: string;
}

export interface Meal {
  id: number;
  data: string; // ISO date
  slot: number; // 1-6
  nomePasto: string;
  orarioPrevisto: string; // HH:mm
  completato: boolean;
  note: string | null;
}

export interface BodyProgress {
  id: number;
  data: string;
  pesoKg: number | null;
  vitaCm: number | null;
  pettoCm?: number | null;
  note: string | null;
}

export interface ChatMessage {
  id: number;
  conversationId: string;
  ruolo: 'system' | 'user' | 'assistant';
  contenuto: string;
  timestamp: string;
}

export interface AppSettings {
  ollamaBaseUrl: string;
  ollamaModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  nomeUtente: string;
  obiettivo: string;
  numeroCorporeoIniziale: number | null;
  temaScuro: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5-coder:14b',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  nomeUtente: 'Atleta',
  obiettivo: 'Mantenere la forma fisica e prepararsi per la palestra',
  numeroCorporeoIniziale: null,
  temaScuro: true,
};

// --- Ollama ---

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  modifiedAt: string;
  parameterSize?: string;
}

export interface OllamaStatus {
  connesso: boolean;
  modelloDisponibile: boolean;
  modelli: OllamaModelInfo[];
  errore?: string;
}

export interface OllamaChatOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface OllamaStreamChunk {
  requestId: string;
  content: string;
  done: boolean;
}

export interface OllamaStreamError {
  requestId: string;
  message: string;
}

// --- Statistiche dashboard ---

export interface AppInfo {
  version: string;
  dbPath: string;
  platform: string;
}

export interface CreateWorkoutSessionInput {
  planId: number | null;
  data: string;
  durataMinuti: number | null;
  note: string | null;
  completata: boolean;
  esercizi: Array<{
    exerciseId: number;
    serieCompletate: number;
    ripetizioniEffettive: string;
    carico?: string;
    note?: string;
  }>;
}

export interface DashboardStats {
  allenamentiSettimana: number;
  streakGiorni: number;
  pastiCompletatiOggi: number;
  pastiTotaliOggi: number;
  ultimoPeso: number | null;
  variazionePeso: number | null;
  prossimoPlanNome: string | null;
}

export interface WeeklyActivityPoint {
  data: string; // ISO date
  giornoLabel: string; // es. "Lun", "Mar"
  allenamenti: number; // sessioni completate quel giorno
  pastiCompletati: number;
  pastiTotali: number;
}
