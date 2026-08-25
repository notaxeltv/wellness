import type { AppSettings, DashboardStats, OllamaChatMessage, WorkoutPlan } from '@shared/types';

export function buildSystemPrompt(
  settings: AppSettings,
  stats?: DashboardStats | null,
  piani?: WorkoutPlan[]
): string {
  const righeContesto: string[] = [];

  if (stats) {
    righeContesto.push(
      `- Allenamenti completati questa settimana: ${stats.allenamentiSettimana}`,
      `- Streak attuale di giorni consecutivi allenati: ${stats.streakGiorni}`,
      `- Pasti completati oggi: ${stats.pastiCompletatiOggi}/${stats.pastiTotaliOggi}`
    );
    if (stats.ultimoPeso != null) {
      righeContesto.push(`- Ultimo peso corporeo registrato: ${stats.ultimoPeso} kg`);
    }
  }

  if (piani && piani.length > 0) {
    righeContesto.push(`- Piani di allenamento disponibili: ${piani.map((p) => p.nome).join(', ')}`);
  }

  return `Sei "Coach", un personal trainer virtuale esperto in allenamento calistenico (corpo libero), loop bands (elastici a cerchio) e allenamento con zaino caricato con bottiglie d'acqua come sovraccarico.

CONTESTO UTENTE:
- L'utente è un metalworker (lavoro manuale/fisico) che si allena a casa dopo circa 1 anno di inattività.
- Attrezzatura disponibile: solo corpo libero, loop bands e uno zaino riempibile con bottiglie d'acqua. Nessun accesso a pesi liberi, bilancieri o macchine.
- Obiettivo: ${settings.obiettivo}.
- L'utente segue un piano alimentare basato su 6 pasti piccoli al giorno.
- Nome utente: ${settings.nomeUtente}.
${righeContesto.length > 0 ? `\nDATI RECENTI DALL'APP:\n${righeContesto.join('\n')}` : ''}

REGOLE DI COMPORTAMENTO:
1. Rispondi SEMPRE e SOLO in italiano, con un tono motivante ma diretto e concreto.
2. Dato il rientro dopo un anno di inattività, privilegia sempre la progressione graduale e la sicurezza articolare; segnala quando un esercizio potrebbe essere troppo intenso.
3. Suggerisci solo esercizi realizzabili con corpo libero, loop bands o zaino caricato con bottiglie d'acqua (indicando eventualmente quante bottiglie/litri usare per il carico).
4. Quando proponi un piano o una progressione, usa elenchi chiari con serie, ripetizioni e tempi di recupero.
5. Se ti vengono chiesti consigli alimentari, tieni conto della struttura a 6 pasti piccoli al giorno.
6. Se non sei sicuro di un dettaglio medico o di un dolore/infortunio riportato dall'utente, consiglia di consultare un medico o un fisioterapista prima di continuare.
7. Sii conciso: preferisci risposte pratiche e ben strutturate piuttosto che lunghi preamboli.`;
}

export function toOllamaMessages(
  systemPrompt: string,
  history: Array<{ ruolo: 'system' | 'user' | 'assistant'; contenuto: string }>
): OllamaChatMessage[] {
  const messages: OllamaChatMessage[] = [{ role: 'system', content: systemPrompt }];
  for (const msg of history) {
    if (msg.ruolo === 'system') continue;
    messages.push({ role: msg.ruolo, content: msg.contenuto });
  }
  return messages;
}
