import type Database from 'better-sqlite3';

interface SeedExercise {
  nome: string;
  categoria: 'corpo_libero' | 'loop_bands' | 'zaino_pesi';
  gruppoMuscolare: string;
  descrizione: string;
  istruzioni: string;
  livello: 'principiante' | 'intermedio' | 'avanzato';
}

// Esercizi pensati per un rientro graduale dopo ~1 anno di inattività,
// usando solo corpo libero, loop bands e uno zaino caricato con bottiglie d'acqua.
const EXERCISES: SeedExercise[] = [
  {
    nome: 'Squat a corpo libero',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'gambe',
    descrizione: 'Esercizio base per quadricipiti e glutei, ottimo per ripartire.',
    istruzioni:
      'Piedi larghi come le spalle, scendi piegando ginocchia e anche come per sederti su una sedia, schiena dritta, poi risali.',
    livello: 'principiante',
  },
  {
    nome: 'Affondi alternati',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'gambe',
    descrizione: 'Rinforza gambe e glutei migliorando anche l’equilibrio.',
    istruzioni:
      'Fai un passo avanti, scendi finché entrambe le ginocchia sono a 90°, torna in piedi e alterna la gamba.',
    livello: 'principiante',
  },
  {
    nome: 'Piegamenti sulle ginocchia',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'petto',
    descrizione: 'Variante facilitata del push-up, ideale dopo un lungo stop.',
    istruzioni:
      'Mani a terra larghezza spalle, ginocchia a terra, scendi con il petto verso il pavimento e risali controllando il movimento.',
    livello: 'principiante',
  },
  {
    nome: 'Piegamenti classici (push-up)',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'petto',
    descrizione: 'Push-up completo per petto, spalle e tricipiti.',
    istruzioni:
      'Corpo in linea retta dalla testa ai talloni, scendi flettendo i gomiti a 45°, risali senza inarcare la schiena.',
    livello: 'intermedio',
  },
  {
    nome: 'Plank',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'core',
    descrizione: 'Isometrico fondamentale per la stabilità del core.',
    istruzioni:
      'Avambracci a terra, corpo in linea retta, addome contratto, respira normalmente mantenendo la posizione.',
    livello: 'principiante',
  },
  {
    nome: 'Superman',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'schiena',
    descrizione: 'Rinforza la catena posteriore, utile contro il mal di schiena.',
    istruzioni:
      'Sdraiato a pancia in giù, alza contemporaneamente braccia, petto e gambe, mantieni 2 secondi e torna giù controllando.',
    livello: 'principiante',
  },
  {
    nome: 'Ponte glutei (glute bridge)',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'gambe',
    descrizione: 'Attiva glutei e core, ottimo per la salute della schiena bassa.',
    istruzioni:
      'Sdraiato supino, ginocchia flesse, piedi a terra: spingi sui talloni alzando il bacino, contrai i glutei in alto.',
    livello: 'principiante',
  },
  {
    nome: 'Mountain climber',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'cardio',
    descrizione: 'Esercizio cardio-core dinamico per fiato e addominali.',
    istruzioni:
      'In posizione di plank alto, porta alternativamente le ginocchia al petto con ritmo controllato.',
    livello: 'intermedio',
  },
  {
    nome: 'Jumping jack',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'cardio',
    descrizione: 'Riscaldamento cardio a basso impatto tecnico.',
    istruzioni: 'Salta apricando gambe e braccia lateralmente, poi torna alla posizione di partenza.',
    livello: 'principiante',
  },
  {
    nome: 'Dip tricipiti su sedia',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'braccia',
    descrizione: 'Isola i tricipiti usando una sedia stabile.',
    istruzioni:
      'Mani sul bordo della sedia, gambe distese avanti, scendi flettendo i gomiti e risali senza forzare le spalle.',
    livello: 'intermedio',
  },
  {
    nome: 'Wall sit',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'gambe',
    descrizione: 'Isometrico per quadricipiti appoggiato al muro, basso impatto sulle articolazioni.',
    istruzioni: 'Schiena al muro, scendi finché le ginocchia sono a 90°, mantieni la posizione respirando.',
    livello: 'principiante',
  },
  {
    nome: 'Burpee facilitato',
    categoria: 'corpo_libero',
    gruppoMuscolare: 'corpo_intero',
    descrizione: 'Versione senza salto/push-up per reintrodurre gradualmente il metabolico.',
    istruzioni:
      'Da in piedi, accovacciati, mani a terra, porta i piedi indietro in plank, poi torna in piedi senza saltare.',
    livello: 'intermedio',
  },
  {
    nome: 'Squat con loop band',
    categoria: 'loop_bands',
    gruppoMuscolare: 'gambe',
    descrizione: 'Aggiunge tensione costante allo squat classico.',
    istruzioni: 'Band posizionata sopra le ginocchia, esegui lo squat mantenendo tensione contro la band.',
    livello: 'principiante',
  },
  {
    nome: 'Monster walk laterale',
    categoria: 'loop_bands',
    gruppoMuscolare: 'gambe',
    descrizione: 'Attiva medio gluteo, utile per stabilità di ginocchia e anche.',
    istruzioni: 'Band sopra le caviglie o ginocchia, semi-squat leggero, cammina lateralmente mantenendo tensione.',
    livello: 'principiante',
  },
  {
    nome: 'Band pull-apart',
    categoria: 'loop_bands',
    gruppoMuscolare: 'schiena',
    descrizione: 'Ottimo per postura e mobilità delle spalle.',
    istruzioni: 'Band tesa davanti al petto a braccia distese, apri le braccia lateralmente stringendo le scapole.',
    livello: 'principiante',
  },
  {
    nome: 'Rematore con band (row)',
    categoria: 'loop_bands',
    gruppoMuscolare: 'schiena',
    descrizione: 'Rinforza la schiena alta, utile per compensare il lavoro da metalworker.',
    istruzioni: 'Band fissata a un punto stabile, tira verso l’addome stringendo le scapole, poi rilascia.',
    livello: 'principiante',
  },
  {
    nome: 'Chest press con band',
    categoria: 'loop_bands',
    gruppoMuscolare: 'petto',
    descrizione: 'Simula la spinta su panca usando la resistenza elastica.',
    istruzioni: 'Band dietro la schiena, spingi le maniglie avanti all’altezza del petto, poi torna indietro controllando.',
    livello: 'principiante',
  },
  {
    nome: 'Alzate laterali con band',
    categoria: 'loop_bands',
    gruppoMuscolare: 'spalle',
    descrizione: 'Isola i deltoidi laterali per spalle più solide.',
    istruzioni: 'Band sotto i piedi, alza le braccia lateralmente fino all’altezza delle spalle, scendi lentamente.',
    livello: 'principiante',
  },
  {
    nome: 'Curl bicipiti con band',
    categoria: 'loop_bands',
    gruppoMuscolare: 'braccia',
    descrizione: 'Lavoro isolato per i bicipiti con resistenza progressiva.',
    istruzioni: 'Band sotto i piedi, gomiti fermi ai fianchi, fletti gli avambracci verso le spalle.',
    livello: 'principiante',
  },
  {
    nome: 'Zaino squat',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'gambe',
    descrizione: 'Squat caricato usando lo zaino con bottiglie d’acqua come sovraccarico progressivo.',
    istruzioni: 'Zaino ben allacciato sulle spalle, esegui lo squat controllando la discesa e la risalita.',
    livello: 'intermedio',
  },
  {
    nome: 'Affondi con zaino',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'gambe',
    descrizione: 'Affondi caricati per forza e stabilità unilaterale.',
    istruzioni: 'Con lo zaino sulle spalle, esegui affondi alternati mantenendo il busto stabile.',
    livello: 'intermedio',
  },
  {
    nome: 'Shoulder press con zaino',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'spalle',
    descrizione: 'Spinta sopra la testa per rinforzare le spalle in modo funzionale.',
    istruzioni: 'Tieni lo zaino con entrambe le mani davanti al petto, spingi sopra la testa e riabbassa controllando.',
    livello: 'intermedio',
  },
  {
    nome: 'Rematore con zaino',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'schiena',
    descrizione: 'Rematore da busto flesso per rinforzare la schiena.',
    istruzioni: 'Busto flesso a 45°, zaino tenuto con entrambe le mani, tira verso l’addome stringendo le scapole.',
    livello: 'intermedio',
  },
  {
    nome: 'Farmer carry con zaino',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'corpo_intero',
    descrizione: 'Camminata con carico per forza generale, presa e postura.',
    istruzioni: 'Indossa lo zaino e cammina per il tempo/distanza indicata mantenendo il busto eretto.',
    livello: 'principiante',
  },
  {
    nome: 'Step-up con zaino',
    categoria: 'zaino_pesi',
    gruppoMuscolare: 'gambe',
    descrizione: 'Sali su un gradino o sedia stabile con carico per forza unilaterale.',
    istruzioni: 'Zaino sulle spalle, sali su un gradino stabile alternando la gamba di spinta, scendi controllando.',
    livello: 'intermedio',
  },
];

interface SeedPlanExercise {
  nomeEsercizio: string;
  serie: number;
  ripetizioni: string;
  riposoSecondi: number;
  note?: string;
}

interface SeedPlan {
  nome: string;
  descrizione: string;
  livello: 'principiante' | 'intermedio' | 'avanzato';
  giorniSettimana: string;
  durataStimataMinuti: number;
  esercizi: SeedPlanExercise[];
}

const PLANS: SeedPlan[] = [
  {
    nome: 'Full Body Corpo Libero – Ripartenza',
    descrizione:
      'Allenamento introduttivo a corpo libero pensato per riattivare tutto il corpo dopo un lungo stop, con basso impatto articolare.',
    livello: 'principiante',
    giorniSettimana: 'Lunedì',
    durataStimataMinuti: 30,
    esercizi: [
      { nomeEsercizio: 'Squat a corpo libero', serie: 3, ripetizioni: '12-15', riposoSecondi: 60 },
      { nomeEsercizio: 'Piegamenti sulle ginocchia', serie: 3, ripetizioni: '8-10', riposoSecondi: 60 },
      { nomeEsercizio: 'Ponte glutei (glute bridge)', serie: 3, ripetizioni: '12-15', riposoSecondi: 45 },
      { nomeEsercizio: 'Superman', serie: 3, ripetizioni: '10-12', riposoSecondi: 45 },
      { nomeEsercizio: 'Plank', serie: 3, ripetizioni: '20-30 sec', riposoSecondi: 45 },
      { nomeEsercizio: 'Jumping jack', serie: 2, ripetizioni: '30 sec', riposoSecondi: 30 },
    ],
  },
  {
    nome: 'Full Body con Loop Bands',
    descrizione:
      'Sessione con elastici per lavorare in modo controllato su schiena, spalle e gambe con tensione costante.',
    livello: 'principiante',
    giorniSettimana: 'Mercoledì',
    durataStimataMinuti: 35,
    esercizi: [
      { nomeEsercizio: 'Squat con loop band', serie: 3, ripetizioni: '12-15', riposoSecondi: 60 },
      { nomeEsercizio: 'Rematore con band (row)', serie: 3, ripetizioni: '12-15', riposoSecondi: 60 },
      { nomeEsercizio: 'Chest press con band', serie: 3, ripetizioni: '10-12', riposoSecondi: 60 },
      { nomeEsercizio: 'Band pull-apart', serie: 3, ripetizioni: '15-20', riposoSecondi: 45 },
      { nomeEsercizio: 'Monster walk laterale', serie: 3, ripetizioni: '10 passi/lato', riposoSecondi: 45 },
      { nomeEsercizio: 'Curl bicipiti con band', serie: 2, ripetizioni: '12-15', riposoSecondi: 45 },
    ],
  },
  {
    nome: 'Forza con Zaino Pesato',
    descrizione:
      'Allenamento di forza funzionale con lo zaino caricato di bottiglie d’acqua, per introdurre gradualmente il sovraccarico prima del ritorno in palestra.',
    livello: 'intermedio',
    giorniSettimana: 'Venerdì',
    durataStimataMinuti: 35,
    esercizi: [
      { nomeEsercizio: 'Zaino squat', serie: 4, ripetizioni: '10-12', riposoSecondi: 75 },
      { nomeEsercizio: 'Affondi con zaino', serie: 3, ripetizioni: '8-10/lato', riposoSecondi: 75 },
      { nomeEsercizio: 'Rematore con zaino', serie: 3, ripetizioni: '10-12', riposoSecondi: 60 },
      { nomeEsercizio: 'Shoulder press con zaino', serie: 3, ripetizioni: '8-10', riposoSecondi: 60 },
      { nomeEsercizio: 'Step-up con zaino', serie: 3, ripetizioni: '8-10/lato', riposoSecondi: 60 },
      { nomeEsercizio: 'Farmer carry con zaino', serie: 2, ripetizioni: '40 metri', riposoSecondi: 60 },
    ],
  },
];

export function seedDatabase(db: Database.Database): void {
  const exerciseCount = db.prepare('SELECT COUNT(*) as c FROM exercises').get() as { c: number };
  if (exerciseCount.c > 0) return;

  const insertExercise = db.prepare(
    `INSERT INTO exercises (nome, categoria, gruppo_muscolare, descrizione, istruzioni, livello)
     VALUES (@nome, @categoria, @gruppoMuscolare, @descrizione, @istruzioni, @livello)`
  );
  const insertPlan = db.prepare(
    `INSERT INTO workout_plans (nome, descrizione, livello, giorni_settimana, durata_stimata_minuti)
     VALUES (@nome, @descrizione, @livello, @giorniSettimana, @durataStimataMinuti)`
  );
  const insertPlanExercise = db.prepare(
    `INSERT INTO workout_plan_exercises (plan_id, exercise_id, ordine, serie, ripetizioni, riposo_secondi, note)
     VALUES (@planId, @exerciseId, @ordine, @serie, @ripetizioni, @riposoSecondi, @note)`
  );

  const seedTx = db.transaction(() => {
    const exerciseIdByName = new Map<string, number>();
    for (const ex of EXERCISES) {
      const info = insertExercise.run(ex);
      exerciseIdByName.set(ex.nome, Number(info.lastInsertRowid));
    }

    for (const plan of PLANS) {
      const planInfo = insertPlan.run(plan);
      const planId = Number(planInfo.lastInsertRowid);
      plan.esercizi.forEach((pe, idx) => {
        const exerciseId = exerciseIdByName.get(pe.nomeEsercizio);
        if (!exerciseId) return;
        insertPlanExercise.run({
          planId,
          exerciseId,
          ordine: idx,
          serie: pe.serie,
          ripetizioni: pe.ripetizioni,
          riposoSecondi: pe.riposoSecondi,
          note: pe.note ?? null,
        });
      });
    }
  });

  seedTx();
}

const PASTI_DEFAULT: Array<{ slot: number; nome: string; orario: string }> = [
  { slot: 1, nome: 'Colazione', orario: '07:30' },
  { slot: 2, nome: 'Spuntino metà mattina', orario: '10:00' },
  { slot: 3, nome: 'Pranzo', orario: '13:00' },
  { slot: 4, nome: 'Spuntino pomeridiano', orario: '16:00' },
  { slot: 5, nome: 'Cena', orario: '19:30' },
  { slot: 6, nome: 'Spuntino serale', orario: '21:30' },
];

export function ensureMealsForDate(db: Database.Database, isoDate: string): void {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO meals (data, slot, nome_pasto, orario_previsto, completato)
     VALUES (@data, @slot, @nomePasto, @orario, 0)`
  );
  const tx = db.transaction(() => {
    for (const pasto of PASTI_DEFAULT) {
      insert.run({ data: isoDate, slot: pasto.slot, nomePasto: pasto.nome, orario: pasto.orario });
    }
  });
  tx();
}
