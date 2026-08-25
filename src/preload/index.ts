import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '@shared/ipcChannels';
import type { OllamaStreamChunk } from '@shared/types';
import type { WellnessApi } from '@shared/preloadApi';

const api: WellnessApi = {
  app: {
    getInfo: () => ipcRenderer.invoke(IpcChannels.appGetInfo),
  },
  settings: {
    get: () => ipcRenderer.invoke(IpcChannels.settingsGet),
    update: (partial) => ipcRenderer.invoke(IpcChannels.settingsUpdate, partial),
  },
  exercises: {
    list: () => ipcRenderer.invoke(IpcChannels.exercisesList),
  },
  workouts: {
    listPlans: () => ipcRenderer.invoke(IpcChannels.workoutPlansList),
    getPlan: (id) => ipcRenderer.invoke(IpcChannels.workoutPlanGet, id),
    listSessions: (limit) => ipcRenderer.invoke(IpcChannels.workoutSessionsList, limit),
    createSession: (input) => ipcRenderer.invoke(IpcChannels.workoutSessionCreate, input),
    deleteSession: (id) => ipcRenderer.invoke(IpcChannels.workoutSessionDelete, id),
  },
  nutrition: {
    getMeals: (isoDate) => ipcRenderer.invoke(IpcChannels.nutritionGetMeals, isoDate),
    setMealCompleted: (id, completato) => ipcRenderer.invoke(IpcChannels.nutritionSetMealCompleted, id, completato),
    updateMealNote: (id, note) => ipcRenderer.invoke(IpcChannels.nutritionUpdateMealNote, id, note),
    updateMealDetails: (id, updates) => ipcRenderer.invoke(IpcChannels.nutritionUpdateMealDetails, id, updates),
  },
  progress: {
    list: (limit) => ipcRenderer.invoke(IpcChannels.progressList, limit),
    upsert: (entry) => ipcRenderer.invoke(IpcChannels.progressUpsert, entry),
    delete: (id) => ipcRenderer.invoke(IpcChannels.progressDelete, id),
  },
  dashboard: {
    getStats: () => ipcRenderer.invoke(IpcChannels.dashboardGetStats),
  },
  chat: {
    getMessages: (conversationId) => ipcRenderer.invoke(IpcChannels.chatGetMessages, conversationId),
    addMessage: (conversationId, ruolo, contenuto) =>
      ipcRenderer.invoke(IpcChannels.chatAddMessage, conversationId, ruolo, contenuto),
    clear: (conversationId) => ipcRenderer.invoke(IpcChannels.chatClear, conversationId),
    listConversations: () => ipcRenderer.invoke(IpcChannels.chatListConversations),
  },
  ollama: {
    checkStatus: (baseUrl, model) => ipcRenderer.invoke(IpcChannels.ollamaCheckStatus, baseUrl, model),
    startChat: (payload) => ipcRenderer.invoke(IpcChannels.ollamaChatStart, payload),
    cancelChat: (requestId) => ipcRenderer.invoke(IpcChannels.ollamaChatCancel, requestId),
    onChunk: (callback) => {
      const listener = (_event: unknown, chunk: OllamaStreamChunk): void => callback(chunk);
      ipcRenderer.on(IpcChannels.ollamaChatChunk, listener);
      return () => ipcRenderer.removeListener(IpcChannels.ollamaChatChunk, listener);
    },
  },
};

contextBridge.exposeInMainWorld('api', api);
