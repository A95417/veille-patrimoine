// Événements du moment : regroupe les sujets récents qui parlent du même fait (même s'ils viennent d'articles
// en langues différentes, grâce aux titres traduits en français par l'IA) et compte les sources qui en parlent.
// Sert au bandeau « En direct » de l'accueil et au brief (un sujet très repris n'est jamais oublié).
// Aucun appel à l'IA ici : uniquement les titres et les articles déjà collectés.

const PARAMS_MAX = 90;   // D1 accepte au plus 100 valeurs par requête

const VIDES = new Set(("le la les un une des du de d l au aux en et ou à a pour par sur sous dans avec sans chez entre vers après avant " +
  "ce cet cette ces son sa ses leur leurs qui que quoi dont où il elle ils elles on se ne pas plus moins très tout tous toute " +
  "est sont été être fait faire peut va vont selon face contre comme mais donc car si quand comment pourquoi quel quelle quels " +
  "nouveau nouvelle nouveaux nouvelles premier première dernier dernière grand grande fin début retour hausse baisse " +
  "the of and to in on for with at by from as is are be was were has have had it its this that after before over into new says " +
  "will would could may can not but than about up down out more less").split(/\s+/));
// Mots capitalisés trop généraux pour désigner à eux seuls un même événement.
const GENERAUX = new Set(("france français française europe européen européenne paris bourse bourses cac wall street marché marchés " +
  "etats unis usa chine monde zone euro dollar trump macron gouvernement president président état etat ministre banque banques " +
  "fed bce live direct exclusif analyse opinion").split(/\s+/));

const sansAccent = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

// Mots significatifs et noms propres d'un titre.
export function signature(titre) {
  const brut = String(titre || "").replace(/[’']/g, " ");
  const mots = brut.split(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9]+/).filter(Boolean);
  const kw = new Set(), pn = new Set();
  for (const m of mots) {
    const b = sansAccent(m.toLowerCase());
    if (b.length < 3 || VIDES.has(b)) continue;
    kw.add(b);
    if (/^[A-ZÀ-Ý]/.test(m) && !GENERAUX.has(b)) pn.add(b);
  }
  return { kw, pn };
}
function communs(a, b) { let n = 0; for (const x of a) if (b.has(x)) n++; return n; }
// Deux titres parlent du même événement : trois noms propres communs (ex. « Nvidia », « Jensen », « Huang »), ou deux
// noms propres et un autre mot commun, ou un nom propre et quatre mots communs, ou beaucoup de mots en commun.
export function memeEvenement(a, b) {
  const p = communs(a.pn, b.pn), k = communs(a.kw, b.kw), union = a.kw.size + b.kw.size - k;
  return p >= 3 || (p >= 2 && k >= 3) || (p >= 1 && k >= 4) || (k >= 4 && union && k / union >= 0.5);
}

// Regroupe des sujets (avec leurs articles) en événements.
export function regrouperEvenements(sujets) {
  const sig = sujets.map((s) => signature(s.titre_fr || s.titre));
  const parent = sujets.map((_, i) => i);
  const racine = (i) => (parent[i] === i ? i : (parent[i] = racine(parent[i])));
  for (let i = 0; i < sujets.length; i++) for (let j = i + 1; j < sujets.length; j++)
    if (racine(i) !== racine(j) && memeEvenement(sig[i], sig[j])) parent[racine(j)] = racine(i);
  const groupes = new Map();
  sujets.forEach((s, i) => { const r = racine(i); if (!groupes.has(r)) groupes.set(r, []); groupes.get(r).push(s); });
  return [...groupes.values()].map(decrire);
}

// Résumé d'un événement : sujet principal, sources distinctes, présence d'une source officielle, importance retenue.
function decrire(sujets) {
  const principal = [...sujets].sort((a, b) => (b.importance || 0) - (a.importance || 0) || (b.nb_articles || 0) - (a.nb_articles || 0)
    || String(a.cree_le || "").localeCompare(String(b.cree_le || "")))[0];
  const articles = sujets.flatMap((s) => s.articles || []).sort((a, b) => String(b.publie_le).localeCompare(String(a.publie_le)));
  const parSource = new Map();
  for (const a of articles) if (!parSource.has(a.source_nom)) parSource.set(a.source_nom, a);
  const officielle = articles.some((a) => a.groupe === "officielle");
  const nbSources = parSource.size;
  const importanceIA = Math.max(0, ...sujets.map((s) => s.importance || 0));
  // Bonus de reprise : un fait repris par au moins 3 sources monte d'un niveau, sans dépasser 4 sans source officielle.
  let importance = importanceIA;
  if (nbSources >= 3 && importanceIA >= 1) importance = Math.max(importanceIA, Math.min(officielle ? 5 : 4, importanceIA + 1));   // jamais à la baisse
  // Liens : la source officielle d'abord, puis les plus récents (une source une fois).
  const liens = [...parSource.values()].sort((a, b) => (b.groupe === "officielle") - (a.groupe === "officielle") || String(b.publie_le).localeCompare(String(a.publie_le)));
  const premier = articles.reduce((m, a) => (!m || String(a.publie_le) < m ? String(a.publie_le) : m), null);
  // Clé stable d'un passage à l'autre : le plus ancien sujet du groupe.
  const cle = [...sujets].sort((a, b) => String(a.cree_le || "").localeCompare(String(b.cree_le || "")) || String(a.id).localeCompare(String(b.id)))[0].id;
  return { cle, principal, sujets, nb_sources: nbSources, officielle, importance_ia: importanceIA, importance, liens, premiere_pub: premier,
           derniere_pub: articles[0]?.publie_le || principal.derniere_pub };
}

// Lit les sujets publiés depuis « depuis » avec leurs articles, puis les regroupe.
export async function evenementsDepuis(db, depuis, { importanceMin = null, limite = 600 } = {}) {
  const { results: sujets } = await db
    .prepare(`SELECT id, titre, titre_fr, importance, categories, resume_court, resume_detail, nb_articles, derniere_pub, cree_le
                FROM sujets WHERE derniere_pub >= ? AND nb_articles > 0 ${importanceMin != null ? "AND importance >= " + Number(importanceMin) : ""}
               ORDER BY derniere_pub DESC LIMIT ${Number(limite)}`)
    .bind(depuis).all();
  for (let i = 0; i < sujets.length; i += PARAMS_MAX) {
    const lot = sujets.slice(i, i + PARAMS_MAX);
    const { results } = await db
      .prepare(`SELECT sujet_id, source_nom, groupe, lien, publie_le FROM articles WHERE sujet_id IN (${lot.map(() => "?").join(",")}) AND publie_le >= ?`)
      .bind(...lot.map((s) => s.id), depuis).all();
    const par = new Map();
    for (const a of results) { if (!par.has(a.sujet_id)) par.set(a.sujet_id, []); par.get(a.sujet_id).push(a); }
    for (const s of lot) s.articles = par.get(s.id) || [];
  }
  return regrouperEvenements(sujets.filter((s) => s.articles.length));
}

// Annonces « En direct » : fait jugé majeur (5) et confirmé (au moins 2 sources, ou une source officielle) dans les
// dernières 24 h, ou repris par au moins 4 sources en 12 h. Les plus repris d'abord : un fait dont tout le monde parle
// passe avant une note 5 donnée par l'IA à partir d'un seul article.
export const SEUIL_SOURCES_DIRECT = 4;
export async function calculerDirect(db, maintenant = Date.now()) {
  const h24 = new Date(maintenant - 24 * 3600e3).toISOString(), h12 = new Date(maintenant - 12 * 3600e3).toISOString();
  const evts = await evenementsDepuis(db, h24);
  const retenus = [];
  for (const e of evts) {
    const recents = new Set(e.sujets.flatMap((s) => s.articles).filter((a) => a.publie_le >= h12).map((a) => a.source_nom));
    const majeur = e.importance_ia >= 5 && (e.nb_sources >= 2 || e.officielle), repris = recents.size >= SEUIL_SOURCES_DIRECT;
    if (!majeur && !repris) continue;
    if (!(e.principal.titre_fr || e.principal.titre)) continue;
    retenus.push({
      cle: e.cle, sujet_id: e.principal.id, titre: e.principal.titre_fr || e.principal.titre,
      resume: e.principal.resume_court || "", raison: majeur ? "majeur" : "repris",
      importance: e.importance, nb_sources: e.nb_sources, officielle: e.officielle,
      heure: e.premiere_pub, maj: e.derniere_pub,
      liens: e.liens.slice(0, 3).map((a) => ({ source: a.source_nom, lien: a.lien, officielle: a.groupe === "officielle" })),
    });
  }
  return retenus.sort((a, b) => b.nb_sources - a.nb_sources || (b.raison === "majeur") - (a.raison === "majeur") || String(b.heure).localeCompare(String(a.heure))).slice(0, 5);
}
