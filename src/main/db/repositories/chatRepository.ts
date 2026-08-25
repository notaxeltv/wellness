import type Database from 'better-sqlite3';
import type { ChatMessage } from '@shared/types';

interface ChatRow {
  id: number;
  conversation_id: string;
  ruolo: ChatMessage['ruolo'];
  contenuto: string;
  timestamp: string;
}

function mapMessage(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    ruolo: row.ruolo,
    contenuto: row.contenuto,
    timestamp: row.timestamp,
  };
}

export function getConversationMessages(db: Database.Database, conversationId: string): ChatMessage[] {
  const rows = db
    .prepare('SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY id')
    .all(conversationId) as ChatRow[];
  return rows.map(mapMessage);
}

export function addChatMessage(
  db: Database.Database,
  conversationId: string,
  ruolo: ChatMessage['ruolo'],
  contenuto: string
): ChatMessage {
  const info = db
    .prepare('INSERT INTO chat_messages (conversation_id, ruolo, contenuto) VALUES (?, ?, ?)')
    .run(conversationId, ruolo, contenuto);
  const row = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(Number(info.lastInsertRowid)) as ChatRow;
  return mapMessage(row);
}

export function clearConversation(db: Database.Database, conversationId: string): void {
  db.prepare('DELETE FROM chat_messages WHERE conversation_id = ?').run(conversationId);
}

export function listConversationIds(db: Database.Database): string[] {
  const rows = db
    .prepare('SELECT DISTINCT conversation_id FROM chat_messages ORDER BY conversation_id')
    .all() as { conversation_id: string }[];
  return rows.map((r) => r.conversation_id);
}
