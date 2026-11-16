// Robot des marchés (Twelve Data, offre gratuite) :
//  - pendant la séance de New York (15 h 30 - 22 h à Paris, en semaine) : relève les ETF qui suivent
//    les grands indices et signale toute baisse de plus de 2 % (bandeau « À la une ») ;
//  - chaque matin vers 6 h : enregistre les clôtures de la veille pour le brief de 7 h.
//  - une fois par heure pendant la séance (et le matin) : relève les grandes actions (cours et valorisation).
// Lancement : node scripts/marches.mjs  (variables : SITE_URL, ROBOT_TOKEN, TWELVEDATA_API_KEY)

import { ACTIONS, SYMBOLES_ACTIONS, calculerActions, coursHistorique } from "./actions.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const CLE = process.env.TWELVEDATA_API_KEY || "";
const SEUIL_ALERTE = -2;   // en %
const MINUTE = Number(process.env.MARCHES_PAUSE_MS || 62000);   // attente entre deux lots (8 crédits par minute)

// Les indices eux-mêmes sont réservés aux offres payantes : on utilise des ETF cotés à New York qui les répliquent.
// "devise" : on retire l'effet du change pour obtenir la variation dans la devise de l'indice.
export const SUIVIS = [
  { symbole: "SPY", nom: "S&P 500", via: "ETF SPY", devise: null },
  { symbole: "QQQ", nom: "Nasdaq 100", via: "ETF QQQ", devise: null },
  { symbole: "DIA", nom: "Dow Jones", via: "ETF DIA", devise: null },
  { symbole: "FEZ", nom: "Euro Stoxx 50", via: "ETF FEZ, en euros", devise: "EUR/USD" },
  { symbole: "EWQ", nom: "Actions françaises (≈ CAC 40)", via: "ETF EWQ, en euros", devise: "EUR/USD" },
  { symbole: "EWJ", nom: "Actions japonaises (≈ Nikkei)", via: "ETF EWJ, en yens", devise: "USD/JPY" },
];
const CHANGES = ["EUR/USD", "USD/JPY"];
const AUTRES = [
  { symbole: "EUR/USD", nom: "Euro / dollar", via: "taux de change" },
  { symbole: "XAU/USD", nom: "Or", via: "once, en dollars" },
  { symbole: "BNO", nom: "Pétrole Brent", via: "ETF BNO, en dollars" },
  { symbole: "BTC/USD", nom: "Bitcoin", via: "en dollars" },
];

// ---------------------------------------------------------------- outils
function heureParis(date = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map((x) => [x.type, x.value]));
  return { jour: p.weekday, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

// Jours de fermeture de la Bourse de New York (calendrier NYSE) et demi-séances (fermeture à 13 h).
export const FERIES_NY = new Set(["2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24"]);
const DEMI_SEANCES_NY = new Set(["2026-11-27", "2026-12-24", "2027-11-26"]);
// Heure de New York : la séance (9 h 30 - 16 h) ne tombe pas toujours à 15 h 30 - 22 h à Paris (changements d'heure décalés en mars et en novembre).
function seanceNY(date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).map((x) => [x.type, x.value]));
  const jour = `${p.year}-${p.month}-${p.day}`, minutes = Number(p.hour) * 60 + Number(p.minute);
  const ouvrable = !["Sat", "Sun"].includes(p.weekday) && !FERIES_NY.has(jour);
  const fin = DEMI_SEANCES_NY.has(jour) ? 13 * 60 : 16 * 60;
  return { ouvrable, minutes, fin };
}

export function moment(date = new Date()) {
  const forcer = process.env.MARCHES_FORCER;
  if (["cloture", "indices", "autres", "actions", "historique"].includes(forcer)) return forcer;
  const { minutes } = heureParis(date);
  // Relevé du matin pour le brief : large fenêtre (4 h 30 - 7 h 15), car GitHub espace parfois les passages d'une heure.
  if (minutes >= 4 * 60 + 30 && minutes < 7 * 60 + 15) return "cloture";
  const ny = seanceNY(date);
  if (ny.ouvrable && ny.minutes >= 9 * 60 + 30 && ny.minutes <= ny.fin + 15)          // séance de New York (+ 15 min pour la clôture) :
    // un quart d'heure sur deux chacun ; le dernier quart d'heure de chaque heure, les grandes actions en plus
    return Math.floor(minutes / 15) % 2 === 0 ? "indices" : Math.floor(minutes / 15) % 4 === 3 ? "autres+actions" : "autres";
  return null;
}

async function cotations(symboles, essai = 1) {
  const r = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symboles.join(","))}&apikey=${CLE}`);
  const d = await r.json();
  // Limite de 8 requêtes par minute atteinte (par exemple deux passages rapprochés) : on attend la minute suivante.
  if (d.status === "error" && /current minute/i.test(d.message || "") && essai === 1) {
    console.log("Twelve Data : limite par minute atteinte, nouvel essai dans 62 s.");
    await pause(MINUTE);
    return cotations(symboles, 2);
  }
  // Crédits du jour épuisés : ce n'est pas une panne, on attend le lendemain (pas d'échec rouge du robot).
  if (d.status === "error" && /run out of api credits for the day|daily limit/i.test(d.message || "")) { const e = new Error("crédits Twelve Data du jour épuisés"); e.quota = true; throw e; }
  if (d.status === "error") throw new Error(`Twelve Data : ${d.message}`);
  const parSymbole = symboles.length === 1 ? { [symboles[0]]: d } : d;
  const res = {};
  for (const s of symboles) {
    const q = parSymbole[s];
    if (!q || q.status === "error" || q.close == null) continue;
    res[s] = { cours: Number(q.close), veille: Number(q.previous_close), variation: Number(q.percent_change),
               date: q.datetime, ouvert: q.is_market_open, bourse: q.exchange };
  }
  return res;
}

// Variation dans la devise de l'indice : (1 + variation en dollars) / (1 + variation du change) - 1.
export function variationLocale(variationUsd, variationChange, devise) {
  if (!devise || variationChange == null || isNaN(variationChange)) return variationUsd;
  const fx = devise === "USD/JPY" ? -variationChange : variationChange;   // EUR/USD monte = l'euro monte ; USD/JPY monte = le yen baisse
  return ((1 + variationUsd / 100) / (1 + fx / 100) - 1) * 100;
}

// Cours dans la devise de l'indice (pour l'historique) : ETF en dollars converti en euros ou en yens.
export function coursLocal(coursUsd, devise, taux) {
  if (!devise) return coursUsd;
  if (!taux) return null;
  return devise === "USD/JPY" ? coursUsd * taux : coursUsd / taux;
}

async function appelSite(chemin, corps) {
  const r = await fetch(SITE + chemin, {
    method: "POST",
    headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  if (!r.ok) throw new Error(`${chemin} → HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// ---------------------------------------------------------------- relevés
export function calculer(brut) {
  const valeurs = SUIVIS.map((s) => {
    const q = brut[s.symbole];
    if (!q) return { ...s, erreur: "indisponible" };
    const change = s.devise ? brut[s.devise]?.variation : null;
    return { nom: s.nom, via: s.via, symbole: s.symbole, cours: q.cours, date: q.date,
             cours_local: coursLocal(q.cours, s.devise, brut[s.devise]?.cours),
             variation: Math.round(variationLocale(q.variation, change, s.devise) * 100) / 100 };
  });
  const alertes = valeurs.filter((v) => typeof v.variation === "number" && v.variation <= SEUIL_ALERTE);
  return { valeurs, alertes };
}

const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
const arrondi = (x) => (typeof x === "number" && !isNaN(x) ? Math.round(x * 100) / 100 : null);

// Niveaux officiels des indices en points (clôtures publiées, gratuites) : FRED (Réserve fédérale de Saint-Louis)
// pour le S&P 500, le Nasdaq 100, le Dow Jones et le Nikkei ; fichier officiel de STOXX pour l'Euro Stoxx 50.
// Aucune source gratuite autorisée pour le CAC 40 : sa carte garde la variation sans niveau.
const NIVEAUX = [
  { etf: "SPY", fred: "SP500" }, { etf: "QQQ", fred: "NASDAQ100" }, { etf: "DIA", fred: "DJIA" }, { etf: "EWJ", fred: "NIKKEI225" },
  { etf: "FEZ", stoxx: "sx5e" },
];
const UA = { "User-Agent": "veille-patrimoine (github.com/A95417/veille-patrimoine)" };
// Lit les deux dernières valeurs d'une série [[date ISO, valeur]] (les jours sans cotation sont ignorés).
function deuxDernieres(points) {
  const ok = points.filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(v) && v > 0).sort((a, b) => a[0].localeCompare(b[0]));
  if (!ok.length) return null;
  const [date, valeur] = ok.at(-1), prec = ok.at(-2);
  return { valeur, date, precedent: prec ? prec[1] : null, date_precedente: prec ? prec[0] : null };
}
export function lireFred(csv) {
  return deuxDernieres(csv.trim().split("\n").slice(1).map((l) => { const [d, v] = l.split(","); return [d, v === "" || v === "." ? NaN : Number(v)]; }));
}
export function lireStoxx(txt) {
  return deuxDernieres(txt.trim().split("\n").map((l) => l.split(";")).filter((c) => /^\d{2}\.\d{2}\.\d{4}$/.test(c[0]))
    .map(([d, , v]) => [`${d.slice(6, 10)}-${d.slice(3, 5)}-${d.slice(0, 2)}`, Number(v)]));
}
export async function niveauxIndices() {
  const res = {}, depuis = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  for (const n of NIVEAUX) {
    try {
      if (n.fred) {
        const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${n.fred}&cosd=${depuis}`, { headers: UA, signal: AbortSignal.timeout(20000) });
        const v = r.ok ? lireFred(await r.text()) : null;
        if (v) res[n.etf] = { ...v, source: "FRED (Réserve fédérale de Saint-Louis)", lien: `https://fred.stlouisfed.org/series/${n.fred}` };
        await pause(1100);   // FRED demande une seconde entre deux requêtes
      } else {
        const lien = `https://www.stoxx.com/document/Indices/Current/HistoricalData/h_3m${n.stoxx}.txt`;
        const r = await fetch(lien, { headers: UA, signal: AbortSignal.timeout(20000) });
        const v = r.ok ? lireStoxx(await r.text()) : null;
        if (v) res[n.etf] = { ...v, source: "STOXX (fichier officiel)", lien };
      }
    } catch (e) { console.log(`Niveau ${n.fred || n.stoxx} indisponible : ${e.message}`); }
  }
  return res;
}

async function releverIndices() {
  const brut = await cotations([...SUIVIS.map((s) => s.symbole), ...CHANGES]);   // 8 symboles = 8 requêtes
  const r = calculer(brut);
  const niveaux = await niveauxIndices().catch(() => ({}));
  for (const v of r.valeurs) if (niveaux[v.symbole]) v.niveau = niveaux[v.symbole];
  return r;
}
async function releverAutres() {
  const brut = await cotations(AUTRES.map((a) => a.symbole));                      // 4 requêtes
  return AUTRES.map((a) => {
    const q = brut[a.symbole];
    return q ? { ...a, cours: q.cours, variation: arrondi(q.variation), date: q.date } : { ...a, erreur: "indisponible" };
  });
}

// Grandes actions : 20 cotations, par lots pour respecter 8 crédits par minute.
// "deja" = crédits déjà utilisés dans la minute en cours (le premier lot est réduit d'autant).
async function cotationsParLots(symboles, deja = 0) {
  const res = {};
  let reste = [...symboles], place = 8 - deja;
  while (reste.length) {
    if (place <= 0) { await pause(MINUTE); place = 8; }
    const lot = reste.slice(0, place); reste = reste.slice(place);
    Object.assign(res, await cotations(lot));
    place -= lot.length;
  }
  return res;
}
async function releverActions(eurusd, deja = 0) {
  const brut = await cotationsParLots(SYMBOLES_ACTIONS, deja);
  const valeurs = calculerActions(brut, eurusd);
  return { valeurs, eurusd: eurusd?.cours ?? null, ouvert: Object.values(brut).some((q) => q.ouvert === true) };
}

// Rattrapage unique de l'historique (40 dernières séances) : 12 symboles, en deux lots pour respecter 8 requêtes/minute.
async function series(symboles) {
  const r = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symboles.join(","))}&interval=1day&outputsize=40&apikey=${CLE}`);
  const d = await r.json();
  if (d.status === "error") throw new Error(`Twelve Data : ${d.message}`);
  const parSymbole = symboles.length === 1 ? { [symboles[0]]: d } : d;
  const res = {};
  for (const s of symboles) {
    const v = parSymbole[s]?.values;
    if (Array.isArray(v)) res[s] = new Map(v.map((x) => [x.datetime.slice(0, 10), Number(x.close)]));
  }
  return res;
}
export function pointsHistorique(brut) {
  const points = [];
  for (const s of [...SUIVIS, ...AUTRES]) {
    const serie = brut[s.symbole];
    if (!serie) continue;
    for (const [jour, cours] of serie) {
      const c = s.devise ? coursLocal(cours, s.devise, brut[s.devise]?.get(jour)) : cours;
      if (typeof c === "number" && isFinite(c)) points.push({ symbole: s.symbole, jour, cours: Math.round(c * 10000) / 10000 });
    }
  }
  return points;
}
export function pointsActions(brut) {
  const points = [], fx = brut["EUR/USD"];
  for (const a of ACTIONS) {
    const serie = brut[a.affiche || a.parts[0].symbole];
    if (!serie) continue;
    for (const [jour, cours] of serie) {
      const c = coursHistorique(a, cours, fx?.get(jour));
      if (typeof c === "number" && isFinite(c)) points.push({ symbole: a.id, jour, cours: Math.round(c * 10000) / 10000 });
    }
  }
  return points;
}
async function rattraperHistorique() {
  const tous = [...new Set([...SUIVIS.map((s) => s.symbole), ...CHANGES, ...AUTRES.map((a) => a.symbole),
    ...ACTIONS.map((a) => a.affiche || a.parts[0].symbole)])];
  const brut = {};
  for (let i = 0; i < tous.length; i += 8) {
    if (i) await pause(MINUTE);
    Object.assign(brut, await series(tous.slice(i, i + 8)));
  }
  const points = [...pointsHistorique(brut), ...pointsActions(brut)];
  const r = await appelSite("/api/robot/marches/historique", { points });
  console.log(`Historique des marchés : ${r.points} points enregistrés (${Object.keys(brut).length} symboles).`);
  return r;
}

export async function releverMarches(quand = moment()) {
  if (!SITE || !JETON || !CLE) throw new Error("SITE_URL, ROBOT_TOKEN et TWELVEDATA_API_KEY doivent être définis.");
  if (!quand) { console.log("Marchés : hors des heures de relevé, rien à faire."); return null; }
  if (quand === "historique") return rattraperHistorique();
  // Clôtures : un seul relevé par matin (la fenêtre 4 h 30 - 7 h 15 compte plusieurs passages du robot).
  if (quand === "cloture" && !process.env.MARCHES_FORCER) {
    try {
      const r = await fetch(SITE + "/api/robot/marches/cloture", { headers: { Authorization: `Bearer ${JETON}` } });
      const { maj_le } = r.ok ? await r.json() : {};
      const jourParis = (d) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
      if (maj_le && jourParis(new Date(maj_le)) === jourParis(new Date()) && heureParis(new Date(maj_le)).minutes >= 4 * 60 + 30) {
        console.log("Marchés : clôtures déjà relevées ce matin, rien à faire.");
        return null;
      }
    } catch {}
  }
  const avecActions = quand === "autres+actions" || quand === "actions" || quand === "cloture";
  const type = quand === "autres+actions" ? "autres" : quand;
  const corps = { type };
  let credits = 0;
  if (type === "indices" || type === "cloture") { Object.assign(corps, await releverIndices()); credits = 8; }
  if (type === "cloture") { await pause(MINUTE); credits = 0; }   // minute suivante : quota de 8 requêtes/minute
  if (type === "autres" || type === "cloture") { corps.autres = await releverAutres(); credits += AUTRES.length; }
  if (type === "cloture") corps.alertes = [];                     // les alertes ne concernent que la séance en cours
  if (type !== "actions") {
    await appelSite("/api/robot/marches", corps);
    const ligne = [...(corps.valeurs || []), ...(corps.autres || [])].map((v) => `${v.nom} ${v.variation ?? "?"} %`).join(" · ");
    console.log(`Marchés (${type}) : ${ligne}`);
    if (corps.alertes?.length) console.log("ALERTE :", corps.alertes.map((a) => `${a.nom} ${a.variation} %`).join(", "));
  }
  if (avecActions) {
    // Le change euro/dollar du même relevé sert à exprimer les sociétés européennes en euros.
    let fx = corps.autres?.find((a) => a.symbole === "EUR/USD");
    if (!fx) { const b = await cotations(["EUR/USD"]); fx = b["EUR/USD"]; credits += 1; }
    try {
      const r = await releverActions(fx && { cours: fx.cours, variation: fx.variation }, credits);
      await appelSite("/api/robot/marches", { type: "actions", cloture: type === "cloture", ...r });
      console.log(`Grandes actions : ${r.valeurs.filter((v) => !v.erreur).length}/${r.valeurs.length} relevées · ` +
        r.valeurs.slice(0, 5).map((v) => `${v.nom} ${v.valo_usd ? Math.round(v.valo_usd / 1e9) + " Md$" : "?"}`).join(" · "));
    } catch (e) { console.error("Grandes actions : échec du relevé :", e.message); }
  }
  return corps;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  releverMarches(moment()).catch((e) => {
    if (e.quota) { console.log("Marchés : " + e.message + ", prochain relevé demain."); return; }
    console.error("Échec du relevé des marchés :", e.message); process.exit(1);
  });
}
