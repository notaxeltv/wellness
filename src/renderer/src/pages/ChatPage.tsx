import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send, Square, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { useChatStore } from '@/store/useChatStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const SUGGERIMENTI = [
  'Genera un allenamento per oggi con quello che ho: corpo libero, loop bands e zaino.',
  'Come posso progredire gradualmente dato che riparto dopo un anno di stop?',
  'Dammi consigli su come distribuire i 6 pasti in giornata prima e dopo l\'allenamento.',
  'Ho un leggero dolore al ginocchio: quali esercizi dovrei evitare oggi?',
];

export default function ChatPage() {
  const messages = useChatStore((s) => s.messages);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const cancelStreaming = useChatStore((s) => s.cancelStreaming);
  const clearConversation = useChatStore((s) => s.clearConversation);
  const ollamaStatus = useSettingsStore((s) => s.ollamaStatus);

  const [input, setInput] = useState('');
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coach AI</h1>
          <p className="text-muted-foreground">Qwen2.5-Coder 14B in esecuzione locale via Ollama.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void clearConversation()}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Nuova conversazione
        </Button>
      </div>

      {ollamaStatus && !ollamaStatus.connesso && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3 text-sm text-destructive">
            Ollama non è raggiungibile su questo computer. Assicurati che sia in esecuzione (comando{' '}
            <code>ollama serve</code>) e che il modello sia scaricato con{' '}
            <code>ollama pull qwen2.5-coder:14b</code>.
          </CardContent>
        </Card>
      )}

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
          <ScrollArea className="flex-1 pr-2">
            <div className="flex flex-col gap-4 py-2">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Fai una domanda al tuo coach, oppure prova uno dei suggerimenti qui sotto.
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} ruolo={msg.ruolo} contenuto={msg.contenuto} />
              ))}
              {isStreaming && <ChatMessageBubble ruolo="assistant" contenuto={streamingContent || '…'} />}
              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGERIMENTI.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio al tuo coach... (Invio per inviare, Shift+Invio per andare a capo)"
              className="min-h-[52px] flex-1 resize-none"
            />
            {isStreaming ? (
              <Button variant="destructive" onClick={() => void cancelStreaming()}>
                <Square className="mr-1.5 h-4 w-4" /> Interrompi
              </Button>
            ) : (
              <Button onClick={() => void handleSend()} disabled={!input.trim()}>
                <Send className="mr-1.5 h-4 w-4" /> Invia
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
