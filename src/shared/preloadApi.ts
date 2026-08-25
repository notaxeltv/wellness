import type {
  AppInfo,
  AppSettings,
  BodyProgress,
  ChatMessage,
  CreateWorkoutSessionInput,
  DashboardStats,
  Exercise,
  Meal,
  OllamaChatMessage,
  OllamaChatOptions,
  OllamaStatus,
  OllamaStreamChunk,
  WeeklyActivityPoint,
  WorkoutPlan,
  WorkoutSession,
} from './types';

export interface OllamaChatStartResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface WellnessApi {
  app: {
    getInfo(): Promise<AppInfo>;
  };
  settings: {
    get(): Promise<AppSettings>;
    update(partial: Partial<AppSettings>): Promise<AppSettings>;
  };
  exercises: {
    list(): Promise<Exercise[]>;
  };
  workouts: {
    listPlans(): Promise<WorkoutPlan[]>;
    getPlan(id: number): Promise<WorkoutPlan | null>;
    listSessions(limit?: number): Promise<WorkoutSession[]>;
    createSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession>;
    deleteSession(id: number): Promise<void>;
  };
  nutrition: {
    getMeals(isoDate: string): Promise<Meal[]>;
    setMealCompleted(id: number, completato: boolean): Promise<void>;
    updateMealNote(id: number, note: string): Promise<void>;
    updateMealDetails(id: number, updates: { nomePasto?: string; orarioPrevisto?: string }): Promise<void>;
  };
  progress: {
    list(limit?: number): Promise<BodyProgress[]>;
    upsert(entry: {
      data: string;
      pesoKg?: number | null;
      vitaCm?: number | null;
      pettoCm?: number | null;
      note?: string | null;
    }): Promise<BodyProgress>;
    delete(id: number): Promise<void>;
  };
  dashboard: {
    getStats(): Promise<DashboardStats>;
    getWeeklyActivity(): Promise<WeeklyActivityPoint[]>;
  };
  chat: {
    getMessages(conversationId: string): Promise<ChatMessage[]>;
    addMessage(
      conversationId: string,
      ruolo: 'system' | 'user' | 'assistant',
      contenuto: string
    ): Promise<ChatMessage>;
    clear(conversationId: string): Promise<void>;
    listConversations(): Promise<string[]>;
  };
  ollama: {
    checkStatus(baseUrl: string, model: string): Promise<OllamaStatus>;
    startChat(payload: {
      requestId: string;
      messages: OllamaChatMessage[];
      options?: OllamaChatOptions;
    }): Promise<OllamaChatStartResult>;
    cancelChat(requestId: string): Promise<void>;
    onChunk(callback: (chunk: OllamaStreamChunk) => void): () => void;
  };
}
