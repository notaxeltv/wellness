const STORAGE_KEY = "pokemon-go-tracker-v1";

const XP_TABLE = [
  0, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 35000,
  50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000,
  600000, 700000, 800000, 900000, 1000000, 1250000, 1500000, 1750000, 2000000, 2500000,
  3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000,
  12000000, 14000000, 16000000, 18000000, 20000000, 22500000, 25000000, 27500000, 30000000, 30000000,
];

const GENERATIONS = [
  { name: "Gen 1 - Kanto", total: 151 },
  { name: "Gen 2 - Johto", total: 100 },
  { name: "Gen 3 - Hoenn", total: 135 },
  { name: "Gen 4 - Sinnoh", total: 107 },
  { name: "Gen 5 - Unova", total: 156 },
  { name: "Gen 6 - Kalos", total: 72 },
  { name: "Gen 7 - Alola", total: 88 },
  { name: "Gen 8 - Galar", total: 96 },
  { name: "Gen 9 - Paldea", total: 120 },
];

const DEFAULT_MEDALS = [
  "Collezionista", "Breeder", "Scienziato", "Giovane", "Pescatore",
  "Giornalista", "Gentiluomo", "Pilot", "Camper", "Backpacker",
  "Great League Veteran", "Ultra League Veteran", "Master League Veteran",
  "Battle Girl", "Black Belt", "Bird Keeper", "Bug Catcher",
  "Hex Maniac", "Hiker", "Kindler", "Punk Girl", "Schoolkid",
  "Ruin Maniac", "Rocker", "Swimmer", "Fairy Tale Girl",
];

const DEFAULT_LEGENDARIES = [
  "Mewtwo", "Rayquaza", "Groudon", "Kyogre", "Dialga", "Palkia",
  "Giratina", "Reshiram", "Zekrom", "Kyurem", "Xerneas", "Yveltal",
  "Zygarde", "Solgaleo", "Lunala", "Necrozma", "Zacian", "Zamazenta",
  "Eternatus", "Calyrex", "Koraidon", "Miraidon",
];

const DEFAULT_RESOURCES = [
  { name: "Stardust", current: 0, goal: 1000000 },
  { name: "Poké Ball", current: 0, goal: 0 },
  { name: "Great Ball", current: 0, goal: 0 },
  { name: "Ultra Ball", current: 0, goal: 0 },
  { name: "Caramelle rare", current: 0, goal: 0 },
  { name: "Monete amicizia", current: 0, goal: 0 },
  { name: "Pass Raid", current: 0, goal: 0 },
];

function defaultState() {
  return {
    xp: 0,
    buddy: { name: "", km: 0, candy: 0, hearts: 0 },
    pokedex: GENERATIONS.map((g) => ({ ...g, caught: 0, seen: 0 })),
    shinies: [],
    resources: DEFAULT_RESOURCES.map((r) => ({ ...r })),
    medals: DEFAULT_MEDALS.map((name) => ({
      name,
      progress: 0,
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    })),
    battles: { raidWins: 0, raidLosses: 0, gblWins: 0, gblLosses: 0, gblRank: 1 },
    legendaries: DEFAULT_LEGENDARIES.map((name) => ({
      name,
      caught: false,
      shiny: false,
      iv: "",
      lastCatch: "",
      attempts: 0,
      captures: 0,
    })),
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return { ...base, ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function pct(n, d) {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function calcIV(att, def, sta) {
  const a = Number(att), d = Number(def), s = Number(sta);
  if ([a, d, s].some((v) => Number.isNaN(v))) return null;
  return (a + d + s) / 45;
}

function calcLevel(xp) {
  let level = 1;
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 50);
}

function calcXpProgress(xp) {
  const level = calcLevel(xp);
  if (level >= 50) return { remaining: 0, pct: 100 };
  const currentBase = XP_TABLE[level - 1] ?? 0;
  const nextBase = XP_TABLE[level] ?? XP_TABLE[XP_TABLE.length - 1];
  const span = nextBase - currentBase;
  const progress = span > 0 ? ((xp - currentBase) / span) * 100 : 100;
  return { remaining: Math.max(0, nextBase - xp), pct: Math.min(100, progress) };
}

function calcMedalTier(m) {
  const p = Number(m.progress) || 0;
  if (m.platinum && p >= m.platinum) return "Platino";
  if (m.gold && p >= m.gold) return "Oro";
  if (m.silver && p >= m.silver) return "Argento";
  if (m.bronze && p >= m.bronze) return "Bronzo";
  return "Nessuno";
}

function calcMedalProgress(m) {
  const p = Number(m.progress) || 0;
  const tier = calcMedalTier(m);
  if (tier === "Platino") return 100;
  const thresholds = [
    { tier: "Nessuno", cur: 0, next: m.bronze },
    { tier: "Bronzo", cur: m.bronze, next: m.silver },
    { tier: "Argento", cur: m.silver, next: m.gold },
    { tier: "Oro", cur: m.gold, next: m.platinum },
  ];
  const idx = thresholds.findIndex((t) => t.tier === tier);
  if (idx < 0) return 0;
  const { cur, next } = thresholds[idx];
  if (!next || next <= cur) return p > 0 && cur ? Math.min(100, (p / cur) * 100) : 0;
  return Math.min(100, ((p - cur) / (next - cur)) * 100);
}

function tierClass(tier) {
  const map = { Bronzo: "tier-bronze", Argento: "tier-silver", Oro: "tier-gold", Platino: "tier-platinum" };
  return map[tier] || "tier-none";
}

function bindInput(id, getter, setter) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = getter();
  el.addEventListener("input", () => {
    setter(el.type === "number" ? Number(el.value) || 0 : el.value);
    saveState();
  });
}

function renderDashboard() {
  const totalSpecies = state.pokedex.reduce((s, g) => s + g.total, 0);
  const totalCaught = state.pokedex.reduce((s, g) => s + (Number(g.caught) || 0), 0);
  const caughtPct = totalSpecies ? (totalCaught / totalSpecies) * 100 : 0;

  document.getElementById("dash-pokedex-pct").textContent = `${caughtPct.toFixed(1)}%`;
  document.getElementById("dash-pokedex-count").textContent = `${totalCaught} / ${totalSpecies}`;

  const level = calcLevel(state.xp);
  const xpProg = calcXpProgress(state.xp);
  document.getElementById("dash-level").textContent = String(level);
  document.getElementById("dash-xp-progress").textContent =
    level >= 50 ? "Livello massimo!" : `${xpProg.pct.toFixed(1)}% verso lv. ${level + 1}`;

  const shinyNames = state.shinies.map((s) => s.name?.trim()).filter(Boolean);
  const uniqueShiny = new Set(shinyNames).size;
  document.getElementById("dash-shiny-count").textContent = String(state.shinies.length);
  document.getElementById("dash-shiny-unique").textContent = `${uniqueShiny} specie uniche`;

  const { raidWins, raidLosses } = state.battles;
  const raidTotal = raidWins + raidLosses;
  document.getElementById("dash-raid-wr").textContent = raidTotal ? pct(raidWins, raidTotal) : "—";
  document.getElementById("dash-raid-record").textContent = `${raidWins}V - ${raidLosses}P`;

  document.getElementById("calc-level").textContent = String(level);
  document.getElementById("calc-xp-remaining").textContent =
    level >= 50 ? "—" : xpProg.remaining.toLocaleString("it-IT");
  document.getElementById("xp-bar").style.width = `${xpProg.pct}%`;
  document.getElementById("xp-bar-label").textContent = `${xpProg.pct.toFixed(1)}% del livello attuale`;

  const km = Number(state.buddy.km) || 0;
  const candy = Number(state.buddy.candy) || 0;
  document.getElementById("buddy-ratio").textContent = km > 0 ? (candy / km).toFixed(2) : "—";

  const bars = document.getElementById("gen-bars");
  bars.innerHTML = state.pokedex
    .map((g) => {
      const c = Number(g.caught) || 0;
      const p = g.total ? (c / g.total) * 100 : 0;
      return `<div class="gen-bar-item">
        <label><span>${g.name}</span><span>${c}/${g.total} (${p.toFixed(1)}%)</span></label>
        <div class="gen-bar-track"><div class="gen-bar-fill" style="width:${p}%"></div></div>
      </div>`;
    })
    .join("");
}

function renderPokedex() {
  const body = document.getElementById("pokedex-body");
  body.innerHTML = state.pokedex
    .map((g, i) => {
      const caught = Number(g.caught) || 0;
      const seen = Number(g.seen) || 0;
      const missing = g.total - caught;
      return `<tr>
        <td>${g.name}</td>
        <td>${g.total}</td>
        <td><input type="number" min="0" max="${g.total}" data-pd="caught" data-i="${i}" value="${caught}" /></td>
        <td><input type="number" min="0" max="${g.total}" data-pd="seen" data-i="${i}" value="${seen}" /></td>
        <td>${missing}</td>
        <td>${pct(caught, g.total)}</td>
        <td>${pct(seen, g.total)}</td>
      </tr>`;
    })
    .join("");

  body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const i = Number(input.dataset.i);
      const field = input.dataset.pd;
      state.pokedex[i][field] = Number(input.value) || 0;
      saveState();
    });
  });

  const totalSpecies = state.pokedex.reduce((s, g) => s + g.total, 0);
  const totalCaught = state.pokedex.reduce((s, g) => s + (Number(g.caught) || 0), 0);
  const totalSeen = state.pokedex.reduce((s, g) => s + (Number(g.seen) || 0), 0);
  document.getElementById("pd-total-species").textContent = totalSpecies;
  document.getElementById("pd-total-caught").textContent = totalCaught;
  document.getElementById("pd-total-seen").textContent = totalSeen;
  document.getElementById("pd-total-missing").textContent = totalSpecies - totalCaught;
  document.getElementById("pd-total-caught-pct").textContent = pct(totalCaught, totalSpecies);
  document.getElementById("pd-total-seen-pct").textContent = pct(totalSeen, totalSpecies);
}

function renderShinies() {
  const body = document.getElementById("shiny-body");
  body.innerHTML = state.shinies
    .map((s, i) => {
      const iv = calcIV(s.att, s.def, s.sta);
      const ivStr = iv !== null ? `${(iv * 100).toFixed(1)}%` : "—";
      return `<tr>
        <td><input type="date" data-sh="date" data-i="${i}" value="${s.date || ""}" /></td>
        <td><input type="text" data-sh="name" data-i="${i}" value="${s.name || ""}" placeholder="Nome" /></td>
        <td><input type="number" data-sh="cp" data-i="${i}" value="${s.cp || ""}" min="0" /></td>
        <td><input type="number" data-sh="att" data-i="${i}" value="${s.att ?? ""}" min="0" max="15" /></td>
        <td><input type="number" data-sh="def" data-i="${i}" value="${s.def ?? ""}" min="0" max="15" /></td>
        <td><input type="number" data-sh="sta" data-i="${i}" value="${s.sta ?? ""}" min="0" max="15" /></td>
        <td class="iv-cell">${ivStr}</td>
        <td><input type="text" data-sh="method" data-i="${i}" value="${s.method || ""}" placeholder="Raid, wild..." /></td>
        <td><input type="text" data-sh="notes" data-i="${i}" value="${s.notes || ""}" /></td>
        <td><button class="delete-btn" data-del-shiny="${i}">✕</button></td>
      </tr>`;
    })
    .join("");

  body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const i = Number(input.dataset.i);
      const field = input.dataset.sh;
      const val = input.type === "number" ? (input.value === "" ? "" : Number(input.value)) : input.value;
      state.shinies[i][field] = val;
      saveState();
    });
  });

  body.querySelectorAll("[data-del-shiny]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.shinies.splice(Number(btn.dataset.delShiny), 1);
      saveState();
    });
  });

  const ivs = state.shinies.map((s) => calcIV(s.att, s.def, s.sta)).filter((v) => v !== null);
  const avgIv = ivs.length ? ivs.reduce((a, b) => a + b, 0) / ivs.length : null;
  const perfect = ivs.filter((v) => v >= 0.999).length;

  document.getElementById("shiny-total").textContent = String(state.shinies.length);
  document.getElementById("shiny-avg-iv").textContent = avgIv !== null ? `${(avgIv * 100).toFixed(1)}%` : "—";
  document.getElementById("shiny-perfect").textContent = String(perfect);
}

function renderResources() {
  const grid = document.getElementById("resources-grid");
  grid.innerHTML = state.resources
    .map((r, i) => {
      const cur = Number(r.current) || 0;
      const goal = Number(r.goal) || 0;
      const progress = goal > 0 ? Math.min(100, (cur / goal) * 100) : 0;
      return `<div class="resource-card">
        <h4>${r.name}</h4>
        <label>Attuale <input type="number" data-res="current" data-i="${i}" value="${cur}" min="0" /></label>
        <label>Obiettivo <input type="number" data-res="goal" data-i="${i}" value="${goal}" min="0" /></label>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <p class="hint">${goal > 0 ? `${progress.toFixed(1)}% dell'obiettivo` : "Nessun obiettivo impostato"}</p>
      </div>`;
    })
    .join("");

  grid.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const i = Number(input.dataset.i);
      state.resources[i][input.dataset.res] = Number(input.value) || 0;
      saveState();
    });
  });
}

function renderMedals() {
  const body = document.getElementById("medals-body");
  body.innerHTML = state.medals
    .map((m, i) => {
      const tier = calcMedalTier(m);
      const prog = calcMedalProgress(m);
      return `<tr>
        <td>${m.name}</td>
        <td><input type="number" data-md="progress" data-i="${i}" value="${m.progress || 0}" min="0" /></td>
        <td><input type="number" data-md="bronze" data-i="${i}" value="${m.bronze || 0}" min="0" /></td>
        <td><input type="number" data-md="silver" data-i="${i}" value="${m.silver || 0}" min="0" /></td>
        <td><input type="number" data-md="gold" data-i="${i}" value="${m.gold || 0}" min="0" /></td>
        <td><input type="number" data-md="platinum" data-i="${i}" value="${m.platinum || 0}" min="0" /></td>
        <td><span class="tier-badge ${tierClass(tier)}">${tier}</span></td>
        <td>${prog.toFixed(1)}%</td>
      </tr>`;
    })
    .join("");

  body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const i = Number(input.dataset.i);
      state.medals[i][input.dataset.md] = Number(input.value) || 0;
      saveState();
    });
  });
}

function renderBattles() {
  const { raidWins, raidLosses, gblWins, gblLosses } = state.battles;
  const raidTotal = raidWins + raidLosses;
  const gblTotal = gblWins + gblLosses;
  document.getElementById("raid-total").textContent = String(raidTotal);
  document.getElementById("raid-wr").textContent = raidTotal ? pct(raidWins, raidTotal) : "—";
  document.getElementById("gbl-total").textContent = String(gblTotal);
  document.getElementById("gbl-wr").textContent = gblTotal ? pct(gblWins, gblTotal) : "—";
}

function renderLegendaries() {
  const body = document.getElementById("legendary-body");
  body.innerHTML = state.legendaries
    .map((l, i) => {
      const wr = l.attempts > 0 ? pct(l.captures, l.attempts) : "—";
      return `<tr>
        <td>${l.name}</td>
        <td><input type="checkbox" data-lg="caught" data-i="${i}" ${l.caught ? "checked" : ""} /></td>
        <td><input type="checkbox" data-lg="shiny" data-i="${i}" ${l.shiny ? "checked" : ""} /></td>
        <td><input type="number" data-lg="iv" data-i="${i}" value="${l.iv || ""}" min="0" max="100" step="0.1" style="width:70px" /></td>
        <td><input type="date" data-lg="lastCatch" data-i="${i}" value="${l.lastCatch || ""}" /></td>
        <td><input type="number" data-lg="attempts" data-i="${i}" value="${l.attempts || 0}" min="0" /></td>
        <td><input type="number" data-lg="captures" data-i="${i}" value="${l.captures || 0}" min="0" /></td>
        <td>${wr}</td>
      </tr>`;
    })
    .join("");

  body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const i = Number(input.dataset.i);
      const field = input.dataset.lg;
      if (input.type === "checkbox") {
        state.legendaries[i][field] = input.checked;
      } else if (input.type === "number") {
        state.legendaries[i][field] = input.value === "" ? "" : Number(input.value);
      } else {
        state.legendaries[i][field] = input.value;
      }
      saveState();
    });
    input.addEventListener("change", () => input.dispatchEvent(new Event("input")));
  });
}

function renderAll() {
  renderDashboard();
  renderPokedex();
  renderShinies();
  renderResources();
  renderMedals();
  renderBattles();
  renderLegendaries();
}

function initTabs() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

function initBindings() {
  bindInput("xp-total", () => state.xp, (v) => { state.xp = v; });
  bindInput("buddy-name", () => state.buddy.name, (v) => { state.buddy.name = v; });
  bindInput("buddy-km", () => state.buddy.km, (v) => { state.buddy.km = v; });
  bindInput("buddy-candy", () => state.buddy.candy, (v) => { state.buddy.candy = v; });
  bindInput("buddy-hearts", () => state.buddy.hearts, (v) => { state.buddy.hearts = v; });

  bindInput("raid-wins", () => state.battles.raidWins, (v) => { state.battles.raidWins = v; });
  bindInput("raid-losses", () => state.battles.raidLosses, (v) => { state.battles.raidLosses = v; });
  bindInput("gbl-wins", () => state.battles.gblWins, (v) => { state.battles.gblWins = v; });
  bindInput("gbl-losses", () => state.battles.gblLosses, (v) => { state.battles.gblLosses = v; });
  bindInput("gbl-rank", () => state.battles.gblRank, (v) => { state.battles.gblRank = v; });

  document.getElementById("add-shiny-btn").addEventListener("click", () => {
    state.shinies.unshift({
      date: new Date().toISOString().slice(0, 10),
      name: "",
      cp: "",
      att: "",
      def: "",
      sta: "",
      method: "",
      notes: "",
    });
    saveState();
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pokemon-go-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = { ...defaultState(), ...JSON.parse(reader.result) };
        saveState();
        alert("Backup importato con successo!");
      } catch {
        alert("File non valido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
}

initTabs();
initBindings();
renderAll();
