# Wellness Home Coach

Applicazione desktop (Electron) per allenamenti casalinghi con un coach AI integrato che gira **completamente in locale**, senza bisogno di connessione internet o servizi cloud.

Pensata per chi si allena a casa con **corpo libero**, **loop bands** e uno **zaino riempibile con bottiglie d'acqua** come sovraccarico, ad esempio dopo un lungo periodo di inattività e in preparazione al ritorno in palestra.

## Caratteristiche principali

- 🏋️ **Allenamenti** — piani predefiniti (corpo libero, loop bands, zaino pesi) con progressione graduale, libreria esercizi e storico sessioni.
- 🥗 **Nutrizione** — pianificatore a 6 pasti piccoli al giorno con completamento e note.
- 📈 **Progressi** — grafico dell'andamento del peso corporeo e misure nel tempo.
- 🤖 **Coach AI locale** — chat con streaming basata su [Ollama](https://ollama.com) e il modello `qwen2.5-coder:14b`, con contesto automatico su allenamenti/pasti/progressi dell'utente.
- 🔒 **100% offline** — tutti i dati (allenamenti, pasti, progressi, conversazioni) sono salvati in un database SQLite locale. Nessun dato lascia il computer dell'utente.
- 🇮🇹 Interfaccia completamente in italiano.

## Stack tecnologico

| Livello        | Tecnologia                                    |
| -------------- | ---------------------------------------------- |
| Desktop shell  | Electron + `electron-vite` + `electron-builder` |
| Frontend       | React 18 + TypeScript + Vite                   |
| Stile / UI     | Tailwind CSS + componenti in stile shadcn/ui   |
| Stato          | Zustand                                        |
| Database       | SQLite locale (`better-sqlite3`)               |
| AI runtime     | Ollama (`qwen2.5-coder:14b`) via API HTTP locale |

## Prerequisiti

1. **Node.js** 18+ (consigliato 20+) e npm.
2. **[Ollama](https://ollama.com)** installato e in esecuzione sul computer dell'utente finale.
3. Il modello scaricato in locale:

   ```bash
   ollama pull qwen2.5-coder:14b
   ```

L'app si collega di default a `http://localhost:11434` (l'endpoint standard di Ollama). L'URL e il nome del modello sono configurabili dalla schermata **Impostazioni** dell'app.

## Avvio in sviluppo

```bash
npm install
npm run dev
```

`npm run dev` avvia `electron-vite` in modalità sviluppo con hot-reload sia per il renderer (React) che per il processo main/preload.

## Build di produzione

```bash
# Compila TypeScript + bundle main/preload/renderer in out/
npm run build

# Genera i pacchetti installabili con electron-builder
npm run build:linux   # AppImage + deb
npm run build:win     # installer NSIS
npm run build:mac     # dmg
```

I pacchetti generati vengono salvati nella cartella `release/`.

> Nota: `better-sqlite3` è un modulo nativo. Lo script `postinstall` esegue automaticamente `electron-builder install-app-deps` per ricompilarlo contro la versione di Electron usata dal progetto.

## Struttura del progetto

```
src/
  main/            Processo Electron main (finestra, IPC, database, integrazione Ollama)
    db/             Schema SQLite, seed dati, repository per dominio
    ipc/            Canali e handler IPC
    ollama/         Client HTTP verso l'API di Ollama (chat streaming, stato)
  preload/          Script preload (contextBridge, superficie API sicura per il renderer)
  renderer/         App React (Vite)
    src/
      components/   Componenti UI (shadcn-style) e componenti di dominio
      pages/         Pagine: Dashboard, Allenamenti, Nutrizione, Progressi, Coach AI, Impostazioni
      store/         Store Zustand (settings, workout, nutrition, progress, chat, dashboard)
      lib/           Utility (cn, formattazione date, prompt di sistema per l'AI)
  shared/           Tipi TypeScript e costanti condivisi tra main/preload/renderer
```

## Come funziona l'integrazione con Ollama

Tutte le chiamate di rete verso Ollama avvengono nel **processo main** (Node.js), non nel renderer, per evitare problemi di CORS/CSP e per centralizzare la gestione degli errori:

- `GET /api/tags` per verificare che Ollama sia raggiungibile e che il modello configurato sia disponibile (schermata Impostazioni e badge di stato nell'header).
- `POST /api/chat` in streaming (`stream: true`) per la chat del Coach AI: i chunk di testo vengono inoltrati al renderer via IPC in tempo reale mentre il modello genera la risposta.

Il coach riceve automaticamente un prompt di sistema (in italiano) con il contesto dell'utente: attrezzatura disponibile, obiettivo, piani di allenamento, statistiche recenti su allenamenti e pasti, in modo da poter dare consigli pertinenti e sicuri per chi riparte dopo un periodo di inattività.

## Licenza

Uso personale / didattico.
