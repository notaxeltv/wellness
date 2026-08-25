import { create } from 'zustand';
import type { ChatMessage } from '@shared/types';
import { buildSystemPrompt, toOllamaMessages } from '@/lib/aiContext';
import { generateId } from '@/lib/utils';
import { useSettingsStore } from './useSettingsStore';
import { useDashboardStore } from './useDashboardStore';
import { useWorkoutStore } from './useWorkoutStore';

const CONVERSATION_ID = 'coach-principale';

interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
  currentRequestId: string | null;
  error: string | null;
  loadMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  cancelStreaming: () => Promise<void>;
  clearConversation: () => Promise<void>;
}

let unsubscribeChunk: (() => void) | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: CONVERSATION_ID,
  messages: [],
  streamingContent: '',
  isStreaming: false,
  currentRequestId: null,
  error: null,

  loadMessages: async () => {
    const messages = await window.api.chat.getMessages(CONVERSATION_ID);
    set({ messages });
  },

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || get().isStreaming) return;

    set({ error: null });

    const userMessage = await window.api.chat.addMessage(CONVERSATION_ID, 'user', trimmed);
    set({ messages: [...get().messages, userMessage] });

    const { settings } = useSettingsStore.getState();
    const { stats } = useDashboardStore.getState();
    const { plans } = useWorkoutStore.getState();
    const systemPrompt = buildSystemPrompt(settings, stats, plans);
    const ollamaMessages = toOllamaMessages(systemPrompt, get().messages);

    const requestId = generateId();
    set({ isStreaming: true, streamingContent: '', currentRequestId: requestId });

    unsubscribeChunk?.();
    unsubscribeChunk = window.api.ollama.onChunk((chunk) => {
      if (chunk.requestId !== requestId) return;
      if (chunk.content) {
        set((state) => ({ streamingContent: state.streamingContent + chunk.content }));
      }
    });

    try {
      const result = await window.api.ollama.startChat({
        requestId,
        messages: ollamaMessages,
        options: {
          model: settings.ollamaModel,
          temperature: settings.temperature,
          topP: settings.topP,
          maxTokens: settings.maxTokens,
        },
      });

      if (result.success && result.content) {
        const assistantMessage = await window.api.chat.addMessage(CONVERSATION_ID, 'assistant', result.content);
        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isStreaming: false,
          streamingContent: '',
          currentRequestId: null,
        }));
      } else {
        set({
          isStreaming: false,
          streamingContent: '',
          currentRequestId: null,
          error: result.error ?? 'Nessuna risposta ricevuta da Ollama.',
        });
      }
    } catch (err) {
      set({
        isStreaming: false,
        streamingContent: '',
        currentRequestId: null,
        error: err instanceof Error ? err.message : 'Errore imprevisto durante la generazione della risposta.',
      });
    } finally {
      unsubscribeChunk?.();
      unsubscribeChunk = null;
    }
  },

  cancelStreaming: async () => {
    const { currentRequestId } = get();
    if (currentRequestId) {
      await window.api.ollama.cancelChat(currentRequestId);
    }
  },

  clearConversation: async () => {
    await window.api.chat.clear(CONVERSATION_ID);
    set({ messages: [], streamingContent: '', isStreaming: false, currentRequestId: null, error: null });
  },
}));
