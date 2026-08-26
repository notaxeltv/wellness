# Pokémon GO Tracker

Strumenti per tenere traccia manualmente dei progressi in **Pokémon GO**, con **calcoli automatici** su completamento Pokédex, IV%, livello/XP, medaglie, win rate raid e altro.

Sono incluse **due soluzioni**:

| Soluzione | Ideale per | Requisiti |
|-----------|------------|-----------|
| **File Excel** (`PokemonGO_Tracker.xlsx`) | Chi preferisce fogli di calcolo, Google Sheets o Excel | Excel, LibreOffice Calc o Google Sheets |
| **App desktop web** (`app/`) | Interfaccia più comoda, grafici, backup JSON | Solo un browser (Chrome, Firefox, Edge) |

---

## File Excel

### Fogli inclusi

1. **Dashboard** — riepilogo risorse, Pokédex, shiny, livello/XP, raid/GBL
2. **Pokedex** — conteggi catturati/visti per generazione (Gen 1–9), % e totali
3. **Shiny** — registro shiny con **IV% calcolato** da Att/Dif/PS
4. **XP** — tabella livelli 1–50 con XP cumulativo
5. **Medaglie** — progresso e tier (Bronzo → Platino) automatici
6. **Battaglie** — raid, Go Battle League, buddy
7. **Leggendari** — tracciamento catture e win rate per raid

### Come usare

1. Apri `PokemonGO_Tracker.xlsx` con Excel o LibreOffice Calc
2. Le celle **gialle** sono da compilare manualmente
3. Le celle **verdi** contengono formule calcolate automaticamente
4. Inserisci il tuo **XP totale** nella Dashboard (cella B21) per calcolare livello e progresso

### Rigenerare il file

Se modifichi lo script o vuoi un file nuovo:

```bash
pip install openpyxl
python generate_excel.py
```

---

## App desktop (browser)

### Avvio rapido

**Opzione A — doppio click (consigliata su Windows/macOS):**

Apri il file `app/index.html` nel browser.

**Opzione B — server locale:**

```bash
cd app
python3 -m http.server 8080
```

Poi apri `http://localhost:8080` nel browser.

### Funzionalità

- **Dashboard** con statistiche aggregate e barre di progresso per generazione
- **Pokédex** per Gen 1–9 con totali e percentuali
- **Registro Shiny** con calcolo IV% automatico
- **Risorse** (Stardust, Poké Ball, ecc.) con obiettivi personali
- **Medaglie** con tier e % verso il prossimo livello
- **Battaglie** (Raid + GBL) con win rate
- **Leggendari** con tentativi, catture e win rate
- **Esporta/Importa backup JSON** per non perdere i dati

I dati vengono salvati automaticamente nel browser tramite `localStorage`.

---

## Cosa inserire manualmente

| Sezione | Dati da inserire |
|---------|------------------|
| Pokédex | Conteggi catturati e visti per generazione (dal gioco) |
| Shiny | Data, nome, CP, IV (0–15), metodo di cattura |
| Risorse | Quantità attuali e obiettivi |
| Medaglie | Progresso attuale e soglie tier (dal profilo gioco) |
| Battaglie | Vittorie/sconfitte raid e GBL |
| Leggendari | Checkbox catturato/shiny, tentativi raid, catture |
| XP | XP totale dal profilo allenatore |

---

## Note

- I totali per generazione sono approssimativi e aggiornati alla Gen 9; puoi modificarli nel file Excel o nello script `generate_excel.py`
- La tabella XP copre i livelli 1–50 (formato classico Pokémon GO)
- Per l'app browser: se cancelli i dati del browser perdi il salvataggio locale — usa **Esporta backup** periodicamente

## Licenza

Uso personale.
