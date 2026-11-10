// Robot des marchés (Twelve Data, offre gratuite) :
//  - pendant la séance de New York (15 h 30 - 22 h à Paris, en semaine) : relève les ETF qui suivent
//    les grands indices et signale toute baisse de plus de 2 % (bandeau « À la une ») ;
//  - chaque matin vers 6 h : enregistre les clôtures de la veille pour le brief de 7 h.
// Lancement : node scripts/marches.mjs  (variables : SITE_URL, ROBOT_TOKEN, TWELVEDATA_API_KEY)

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const CLE = process.env.TWELVEDATA_API_KEY || "";
const SEUIL_ALERTE = -2;   // en %

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

export function moment(date = new Date()) {
  const forcer = process.env.MARCHES_FORCER;
  if (["cloture", "indices", "autres", "historique"].includes(forcer)) return forcer;
  const { jour, minutes } = heureParis(date);
  const semaine = !["sam.", "dim."].includes(jour);
  if (minutes >= 6 * 60 && minutes < 6 * 60 + 30) return "cloture";                        // relevé du matin pour le brief
  if (semaine && minutes >= 15 * 60 + 30 && minutes <= 22 * 60 + 15)                       // séance de New York :
    return Math.floor(minutes / 15) % 2 === 0 ? "indices" : "autres";                       // un quart d'heure sur deux chacun
  return null;
}

async function cotations(symboles) {
  const r = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symboles.join(","))}&apikey=${CLE}`);
  const d = await r.json();
  if (d.status === "error") throw new Error(`Twelve Data : ${d.message}`);
  const parSymbole = symboles.length === 1 ? { [symboles[0]]: d } : d;
  const res = {};
  for (const s of symboles) {
    const q = parSymbole[s];
    if (!q || q.status === "error" || q.close == null) continue;
    res[s] = { cours: Number(q.close), veille: Number(q.previous_close), variation: Number(q.percent_change),
               date: q.datetime, ouvert: q.is_market_open };
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

async function releverIndices() {
  const brut = await cotations([...SUIVIS.map((s) => s.symbole), ...CHANGES]);   // 8 symboles = 8 requêtes
  return calculer(brut);
}
async function releverAutres() {
  const brut = await cotations(AUTRES.map((a) => a.symbole));                      // 4 requêtes
  return AUTRES.map((a) => {
    const q = brut[a.symbole];
    return q ? { ...a, cours: q.cours, variation: arrondi(q.variation), date: q.date } : { ...a, erreur: "indisponible" };
  });
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
async function rattraperHistorique() {
  const tous = [...new Set([...SUIVIS.map((s) => s.symbole), ...CHANGES, ...AUTRES.map((a) => a.symbole)])];
  const brut = await series(tous.slice(0, 8));
  await pause(62000);
  Object.assign(brut, await series(tous.slice(8)));
  const points = pointsHistorique(brut);
  const r = await appelSite("/api/robot/marches/historique", { points });
  console.log(`Historique des marchés : ${r.points} points enregistrés (${Object.keys(brut).length} symboles).`);
  return r;
}

export async function releverMarches(quand = moment()) {
  if (!SITE || !JETON || !CLE) throw new Error("SITE_URL, ROBOT_TOKEN et TWELVEDATA_API_KEY doivent être définis.");
  if (!quand) { console.log("Marchés : hors des heures de relevé, rien à faire."); return null; }
  if (quand === "historique") return rattraperHistorique();
  const corps = { type: quand };
  if (quand === "indices" || quand === "cloture") Object.assign(corps, await releverIndices());
  if (quand === "cloture") await pause(62000);                    // minute suivante : quota de 8 requêtes/minute
  if (quand === "autres" || quand === "cloture") corps.autres = await releverAutres();
  if (quand === "cloture") corps.alertes = [];                     // les alertes ne concernent que la séance en cours
  await appelSite("/api/robot/marches", corps);
  const ligne = [...(corps.valeurs || []), ...(corps.autres || [])].map((v) => `${v.nom} ${v.variation ?? "?"} %`).join(" · ");
  console.log(`Marchés (${quand}) : ${ligne}`);
  if (corps.alertes?.length) console.log("ALERTE :", corps.alertes.map((a) => `${a.nom} ${a.variation} %`).join(", "));
  return corps;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  releverMarches(moment()).catch((e) => { console.error("Échec du relevé des marchés :", e.message); process.exit(1); });
}
