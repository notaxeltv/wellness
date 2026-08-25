import { app, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { IpcChannels } from '@shared/ipcChannels';
import type { AppInfo, CreateWorkoutSessionInput, OllamaChatMessage, OllamaChatOptions } from '@shared/types';
import { getDb, getDbPath } from '../db';
import { listExercises } from '../db/repositories/exerciseRepository';
import {
  listWorkoutPlans,
  getWorkoutPlanById,
  listWorkoutSessions,
  createWorkoutSession,
  deleteWorkoutSession,
} from '../db/repositories/workoutRepository';
import {
  getMealsForDate,
  setMealCompleted,
  updateMealNote,
  updateMealDetails,
} from '../db/repositories/nutritionRepository';
import { listBodyProgress, upsertBodyProgress, deleteBodyProgress } from '../db/repositories/progressRepository';
import { getSettings, updateSettings } from '../db/repositories/settingsRepository';
import {
  getConversationMessages,
  addChatMessage,
  clearConversation,
  listConversationIds,
} from '../db/repositories/chatRepository';
import { getDashboardStats } from '../db/repositories/dashboardRepository';
import { checkOllamaStatus, streamChat } from '../ollama/ollamaClient';

const activeStreams = new Map<string, AbortController>();

export function registerIpcHandlers(): void {
  const db = getDb();

  // --- Info app ---
  ipcMain.handle(
    IpcChannels.appGetInfo,
    (): AppInfo => ({
      version: app.getVersion(),
      dbPath: getDbPath(),
      platform: process.platform,
    })
  );

  // --- Impostazioni ---
  ipcMain.handle(IpcChannels.settingsGet, () => getSettings(db));
  ipcMain.handle(IpcChannels.settingsUpdate, (_e, partial) => updateSettings(db, partial));

  // --- Esercizi ---
  ipcMain.handle(IpcChannels.exercisesList, () => listExercises(db));

  // --- Piani di allenamento ---
  ipcMain.handle(IpcChannels.workoutPlansList, () => listWorkoutPlans(db));
  ipcMain.handle(IpcChannels.workoutPlanGet, (_e, id: number) => getWorkoutPlanById(db, id));

  // --- Sessioni di allenamento ---
  ipcMain.handle(IpcChannels.workoutSessionsList, (_e, limit?: number) => listWorkoutSessions(db, limit));
  ipcMain.handle(IpcChannels.workoutSessionCreate, (_e, input: CreateWorkoutSessionInput) =>
    createWorkoutSession(db, input)
  );
  ipcMain.handle(IpcChannels.workoutSessionDelete, (_e, id: number) => deleteWorkoutSession(db, id));

  // --- Nutrizione ---
  ipcMain.handle(IpcChannels.nutritionGetMeals, (_e, isoDate: string) => getMealsForDate(db, isoDate));
  ipcMain.handle(IpcChannels.nutritionSetMealCompleted, (_e, id: number, completato: boolean) =>
    setMealCompleted(db, id, completato)
  );
  ipcMain.handle(IpcChannels.nutritionUpdateMealNote, (_e, id: number, note: string) =>
    updateMealNote(db, id, note)
  );
  ipcMain.handle(
    IpcChannels.nutritionUpdateMealDetails,
    (_e, id: number, updates: { nomePasto?: string; orarioPrevisto?: string }) =>
      updateMealDetails(db, id, updates)
  );

  // --- Progressi corporei ---
  ipcMain.handle(IpcChannels.progressList, (_e, limit?: number) => listBodyProgress(db, limit));
  ipcMain.handle(IpcChannels.progressUpsert, (_e, entry) => upsertBodyProgress(db, entry));
  ipcMain.handle(IpcChannels.progressDelete, (_e, id: number) => deleteBodyProgress(db, id));

  // --- Dashboard ---
  ipcMain.handle(IpcChannels.dashboardGetStats, () => getDashboardStats(db));

  // --- Chat / cronologia conversazioni ---
  ipcMain.handle(IpcChannels.chatGetMessages, (_e, conversationId: string) =>
    getConversationMessages(db, conversationId)
  );
  ipcMain.handle(
    IpcChannels.chatAddMessage,
    (_e, conversationId: string, ruolo: 'system' | 'user' | 'assistant', contenuto: string) =>
      addChatMessage(db, conversationId, ruolo, contenuto)
  );
  ipcMain.handle(IpcChannels.chatClear, (_e, conversationId: string) => clearConversation(db, conversationId));
  ipcMain.handle(IpcChannels.chatListConversations, () => listConversationIds(db));

  // --- Ollama ---
  ipcMain.handle(IpcChannels.ollamaCheckStatus, async (_e, baseUrl: string, model: string) =>
    checkOllamaStatus(baseUrl, model)
  );

  ipcMain.handle(
    IpcChannels.ollamaChatStart,
    async (
      event: IpcMainInvokeEvent,
      payload: { requestId: string; messages: OllamaChatMessage[]; options?: OllamaChatOptions }
    ) => {
      const settings = getSettings(db);
      const controller = new AbortController();
      activeStreams.set(payload.requestId, controller);

      try {
        const fullContent = await streamChat({
          baseUrl: settings.ollamaBaseUrl,
          model: payload.options?.model ?? settings.ollamaModel,
          messages: payload.messages,
          temperature: payload.options?.temperature ?? settings.temperature,
          topP: payload.options?.topP ?? settings.topP,
          maxTokens: payload.options?.maxTokens ?? settings.maxTokens,
          signal: controller.signal,
          onToken: (content) => {
            if (event.sender.isDestroyed()) return;
            event.sender.send(IpcChannels.ollamaChatChunk, {
              requestId: payload.requestId,
              content,
              done: false,
            });
          },
        });

        if (!event.sender.isDestroyed()) {
          event.sender.send(IpcChannels.ollamaChatChunk, {
            requestId: payload.requestId,
            content: '',
            done: true,
          });
        }
        return { success: true as const, content: fullContent };
      } catch (err) {
        const message =
          controller.signal.aborted && !(err instanceof Error && /abort/i.test(err.message))
            ? 'Generazione interrotta dall’utente.'
            : err instanceof Error
              ? err.message
              : 'Errore sconosciuto durante la comunicazione con Ollama.';
        return { success: false as const, error: message };
      } finally {
        activeStreams.delete(payload.requestId);
      }
    }
  );

  ipcMain.handle(IpcChannels.ollamaChatCancel, (_e, requestId: string) => {
    const controller = activeStreams.get(requestId);
    controller?.abort();
    activeStreams.delete(requestId);
  });
}
