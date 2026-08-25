import type { OllamaChatMessage, OllamaModelInfo, OllamaStatus } from '@shared/types';

interface OllamaTagsResponse {
  models: Array<{
    name: string;
    size: number;
    modified_at: string;
    details?: { parameter_size?: string };
  }>;
}

interface OllamaChatStreamLine {
  message?: { role: string; content: string };
  done: boolean;
  error?: string;
}

export interface StreamChatParams {
  baseUrl: string;
  model: string;
  messages: OllamaChatMessage[];
  temperature: number;
  topP: number;
  maxTokens: number;
  signal: AbortSignal;
  onToken: (content: string) => void;
}

const REQUEST_TIMEOUT_MS = 15_000;

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

export async function checkOllamaStatus(baseUrl: string, expectedModel: string): Promise<OllamaStatus> {
  try {
    const { signal, cancel } = withTimeout(undefined, REQUEST_TIMEOUT_MS);
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`, { signal });
    cancel();

    if (!res.ok) {
      return {
        connesso: false,
        modelloDisponibile: false,
        modelli: [],
        errore: `Ollama ha risposto con stato HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as OllamaTagsResponse;
    const modelli: OllamaModelInfo[] = (data.models ?? []).map((m) => ({
      name: m.name,
      size: m.size,
      modifiedAt: m.modified_at,
      parameterSize: m.details?.parameter_size,
    }));

    const modelloDisponibile = modelli.some(
      (m) => m.name === expectedModel || m.name.startsWith(expectedModel.split(':')[0])
    );

    return { connesso: true, modelloDisponibile, modelli };
  } catch (err) {
    return {
      connesso: false,
      modelloDisponibile: false,
      modelli: [],
      errore:
        err instanceof Error
          ? `Impossibile contattare Ollama su ${baseUrl}: ${err.message}`
          : 'Errore sconosciuto nella connessione a Ollama',
    };
  }
}

/**
 * Esegue una chat in streaming contro l'endpoint /api/chat di Ollama (formato NDJSON).
 * Ogni chunk ricevuto viene passato a onToken con il testo incrementale.
 */
export async function streamChat(params: StreamChatParams): Promise<string> {
  const { baseUrl, model, messages, temperature, topP, maxTokens, signal, onToken } = params;

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature,
        top_p: topP,
        num_predict: maxTokens,
      },
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama ha risposto con stato ${res.status}${text ? `: ${text}` : ''}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parsed = JSON.parse(trimmed) as OllamaChatStreamLine;
      if (parsed.error) {
        throw new Error(parsed.error);
      }
      const content = parsed.message?.content ?? '';
      if (content) {
        fullContent += content;
        onToken(content);
      }
      if (parsed.done) {
        return fullContent;
      }
    }
  }

  return fullContent;
}
