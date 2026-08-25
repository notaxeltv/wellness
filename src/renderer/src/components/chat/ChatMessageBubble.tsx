import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@shared/types';

interface ChatMessageBubbleProps {
  ruolo: ChatMessage['ruolo'];
  contenuto: string;
}

export function ChatMessageBubble({ ruolo, contenuto }: ChatMessageBubbleProps) {
  const isUser = ruolo === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[75%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-secondary text-secondary-foreground' : 'bg-card border border-border'
        )}
      >
        {contenuto}
      </div>
    </div>
  );
}
