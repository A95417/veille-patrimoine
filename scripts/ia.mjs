// Robot IA : classe les nouveaux sujets (catégories + importance + résumé court),
// puis rédige le résumé détaillé des sujets importants (niveau 3 à 5).
// Lancement : node scripts/ia.mjs  (variables : SITE_URL, ROBOT_TOKEN, GEMINI_API_KEY)

import { choisirModeles, generer, LIMITES } from "./gemini.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const MAX_APPELS_PAR_PASSAGE = 20;   // le robot passe toutes les 15 min : ~1 900 appels possibles/jour, bien plus que nécessaire
const TAILLE_LOT_TRI = 10;           // sujets classés en un seul appel
const RESERVE_FORT_BRIEF = 4;        // appels du modèle "fort" gardés pour le brief de 7 h

// ---------------------------------------------------------------- catégories
export const CATEGORIES = [
  "Fiscalité & loi de finances", "Législation patrimoniale", "Assurance-vie", "Épargne retraite (PER)",
  "Immobilier & SCPI", "Transmission & succession", "Marchés actions", "Taux & obligations",
  "Matières premières", "Devises", "Crypto", "Macroéconomie", "Banques centrales", "Géopolitique",
  "Réglementation financière (AMF/ACPR)", "Private equity & non coté", "Épargne réglementée",
  "Retraite & réformes", "Prévoyance & protection sociale", "Fiscalité du dirigeant & des entreprises",
  "Finance durable & ESG", "Alertes arnaques", "Profession & conformité CGP", "Autre",
];

// ---------------------------------------------------------------- consignes (modifiables)
const REGLES = `Tu es l'assistant de veille d'un cabinet de gestion de patrimoine en France. Tu prépares de l'information pour des conseillers qui échangent avec leurs clients (épargnants, investisseurs, chefs d'entreprise, retraités, contribuables soumis à l'IFI).

RÈGLES STRICTES, À RESPECTER SANS EXCEPTION :
1. Tu n'utilises QUE les informations présentes dans les articles fournis (titre et chapô). N'ajoute aucun fait, chiffre, date, nom, taux ou montant qui n'y figure pas, même si tu crois le connaître.
2. Tu ne disposes que du titre et du chapô gratuits publiés par la source, jamais de l'article complet. Si une information manque, écris-le simplement (« l'extrait ne le précise pas »).
3. Jamais de recommandation d'investissement personnalisée : pas de « achetez », « vendez », « vous devriez placer ». Formulations générales et prudentes uniquement.
4. Rédige en français clair et professionnel, même si l'article est en anglais.
5. Pas de spéculation ni d'opinion. Reste factuel.
6. N'attribue jamais une position, une proposition ou une intention à une personne si l'extrait ne l'énonce pas explicitement. Un thème cité dans un titre (« retraite à 65 ans ») ne dit pas qui propose quoi.`;

const CONSIGNES_TRI = `${REGLES}

TA TÂCHE : pour chaque sujet fourni, donne :
- "importance" de 1 à 5, du point de vue d'un gestionnaire de patrimoine français :
  5 = décision ou événement majeur, effectif ou acté : mesure fiscale ou patrimoniale adoptée ou publiée, décision de taux de la BCE ou de la Fed, chute marquée des marchés, nouveau taux du Livret A, réforme votée de l'assurance-vie, du PER, des successions ou de l'IFI.
  4 = texte ou chiffre officiel important : projet de loi, amendement adopté en commission ou en séance, nouvelle doctrine fiscale BOFiP concernant les particuliers ou les dirigeants, chiffre macroéconomique officiel clé (inflation, croissance, chômage en France ou en zone euro), décision d'un régulateur (AMF, ACPR).
  3 = utile pour échanger avec un client : tendance des placements, de l'immobilier ou des SCPI, mouvement de marché notable, discours d'un banquier central, analyse argumentée sur l'épargne ou la fiscalité, actualité crypto majeure.
  2 = secondaire : déclaration ou proposition politique sans texte en discussion (meeting, interview, programme de campagne), actualité d'une entreprise, information sectorielle, actualité internationale peu liée à l'épargne des clients.
  1 = hors sujet pour un gestionnaire de patrimoine.
  En cas d'hésitation entre deux niveaux, choisis le plus bas.
- "categories" : 1 à 3 catégories, choisies uniquement dans la liste autorisée (« Autre » si rien ne convient). Les catégories de produits et de règles (Assurance-vie, Épargne retraite (PER), Épargne réglementée, Fiscalité, Législation patrimoniale, Transmission & succession, Retraite & réformes, Prévoyance…) concernent UNIQUEMENT la France : un dispositif étranger (401(k), IRA, ISA, fiscalité américaine…) va dans « Autre », « Marchés actions » ou « Macroéconomie » selon le cas.
- "titre_fr" : le titre en français. Si l'article est en anglais, traduis-le fidèlement ; s'il est déjà en français, recopie-le tel quel.
- "resume_court" : 2 à 3 phrases factuelles en français qui disent ce que l'article apporte. N'écris pas ce qui manque dans l'extrait (pas de « l'extrait ne précise pas »). Si seul le titre est disponible, commence par « D'après le titre publié par la source, ».
Réponds pour TOUS les sujets, en recopiant exactement leur "id".`;

const CONSIGNES_DETAIL = `${REGLES}

TA TÂCHE : rédige le résumé détaillé du sujet fourni (un ou plusieurs articles de sources différentes sur le même événement) :
- "essentiel" : 2 à 3 phrases qui disent ce qui s'est passé.
- "points_cles" : 2 à 6 puces sur le FOND : mesures, décisions, chiffres, montants, taux, échéances, personnes concernées. Les chiffres et dates précis SEULEMENT s'ils figurent dans les articles. Pas de puce de pure présentation (« Lieu : … », « Date du déplacement : … ») sauf si cette information compte pour le client. S'il y a peu de fond, mets peu de puces.
- "contexte" : pourquoi c'est important, en 2 à 4 phrases, en restant dans ce que disent les articles. Si les articles ne donnent pas de contexte, dis-le.
- "impact_clients" : 1 à 4 profils concernés parmi : épargnants, investisseurs, chefs d'entreprise, retraités, contribuables IFI, propriétaires immobiliers, futurs retraités, héritiers et donateurs. Pour chacun, une phrase sur l'impact possible, prudente et non personnalisée.
- "parler_client" : 2 à 3 phrases simples, prêtes à être dites en rendez-vous, sans jargon, sans conseil personnalisé.
- "limites" : une phrase qui précise sur quoi repose le résumé (titre seul, chapô, plusieurs sources) et ce qui reste à vérifier dans l'article original.`;

// ---------------------------------------------------------------- schémas de réponse JSON
const SCHEMA_TRI = {
  type: "OBJECT",
  properties: {
    sujets: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          importance: { type: "INTEGER" },
          categories: { type: "ARRAY", items: { type: "STRING", enum: CATEGORIES } },
          titre_fr: { type: "STRING" },
          resume_court: { type: "STRING" },
        },
        required: ["id", "importance", "categories", "titre_fr", "resume_court"],
      },
    },
  },
  required: ["sujets"],
};
const SCHEMA_DETAIL = {
  type: "OBJECT",
  properties: {
    essentiel: { type: "STRING" },
    points_cles: { type: "ARRAY", items: { type: "STRING" } },
    contexte: { type: "STRING" },
    impact_clients: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { profil: { type: "STRING" }, impact: { type: "STRING" } }, required: ["profil", "impact"] },
    },
    parler_client: { type: "STRING" },
    limites: { type: "STRING" },
  },
  required: ["essentiel", "points_cles", "contexte", "impact_clients", "parler_client", "limites"],
};

// ---------------------------------------------------------------- présentation des sujets à l'IA
function presenter(sujet, maxArticles, maxCar) {
  const lignes = sujet.articles.slice(0, maxArticles).map((a, i) =>
    `  Article ${i + 1} — ${a.source_nom} (${a.langue === "en" ? "en anglais" : "en français"}, publié le ${a.publie_le.slice(0, 10)})\n` +
    `  Titre : ${a.titre}\n  Chapô : ${a.extrait ? a.extrait.slice(0, maxCar) : "(aucun, titre seul)"}`);
  return `SUJET id=${sujet.id}\n${lignes.join("\n")}`;
}

// ---------------------------------------------------------------- appels au site
async function appelSite(chemin, methode = "GET", corps) {
  const r = await fetch(SITE + chemin, {
    method: methode,
    headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${chemin} → HTTP ${r.status} ${t.slice(0, 200)}`);
  return JSON.parse(t);
}

// ---------------------------------------------------------------- gestion du quota et du rythme
export function creerGestionnaire(modeles, compteurs) {
  const dernierAppel = {};
  const epuise = new Set();
  const ajouts = {};
  let appels = 0;
  const utilise = (m) => (compteurs[m] || 0) + (ajouts[m] || 0);
  const plafond = (m) => (m === modeles.fort ? LIMITES.fort.par_jour - RESERVE_FORT_BRIEF : LIMITES.lite.par_jour);
  const dispo = (m) => m && !epuise.has(m) && utilise(m) < plafond(m);
  return {
    get appels() { return appels; },
    ajouts,
    // Renvoie le modèle à utiliser, ou null s'il n'y a plus de quota.
    choisir(prefereFort) {
      if (appels >= MAX_APPELS_PAR_PASSAGE) return null;
      if (prefereFort && dispo(modeles.fort)) return modeles.fort;
      if (dispo(modeles.principal)) return modeles.principal;
      if (dispo(modeles.relais)) return modeles.relais;
      return null;
    },
    async appeler(modele, consignes, contenu, schema) {
      const parMinute = modele === modeles.fort ? LIMITES.fort.par_minute : LIMITES.lite.par_minute;
      const attente = (dernierAppel[modele] || 0) + 60000 / parMinute - Date.now();
      if (attente > 0) await new Promise((r) => setTimeout(r, attente));
      dernierAppel[modele] = Date.now();
      appels++;
      ajouts[modele] = (ajouts[modele] || 0) + 1;
      const r = await generer(modele, consignes, contenu, schema);
      if (r.quota) epuise.add(modele);
      return r;
    },
  };
}

// ---------------------------------------------------------------- travail principal
export async function traiter() {
  if (!SITE || !JETON || !process.env.GEMINI_API_KEY) throw new Error("SITE_URL, ROBOT_TOKEN et GEMINI_API_KEY doivent être définis.");
  const modeles = await choisirModeles();
  console.log("Modèles retenus :", modeles);
  const quota = await appelSite("/api/robot/ia/quota");
  const g = creerGestionnaire(modeles, quota.compteurs || {});
  const bilan = { classes: 0, details: 0, echecs: 0 };
  try {
    await travailler(g, bilan);
  } finally {
    // Toujours enregistrer la consommation, même en cas d'erreur.
    await appelSite("/api/robot/ia/quota", "POST", { ajouts: g.ajouts });
    console.log("Bilan IA :", JSON.stringify({ ...bilan, appels: g.appels, utilisation_du_jour: g.ajouts }));
  }
  return bilan;
}

async function travailler(g, bilan) {
  const travail = await appelSite(`/api/robot/ia/travail?tri=${TAILLE_LOT_TRI * 6}&detail=15`);

  // 1) Classement par lots : les plus récents d'abord.
  for (let i = 0; i < travail.a_trier.length; i += TAILLE_LOT_TRI) {
    const lot = travail.a_trier.slice(i, i + TAILLE_LOT_TRI);
    const modele = g.choisir(false);
    if (!modele) break;
    const contenu = `Catégories autorisées : ${CATEGORIES.join(" ; ")}\n\n` + lot.map((s) => presenter(s, 3, 600)).join("\n\n");
    try {
      const r = await g.appeler(modele, CONSIGNES_TRI, contenu, SCHEMA_TRI);
      if (r.quota) { i -= TAILLE_LOT_TRI; continue; }          // on retente le même lot avec le modèle suivant
      const recus = new Map((r.donnees.sujets || []).map((s) => [s.id, s]));
      const tri = [], echecs = [];
      for (const s of lot) {
        const t = recus.get(s.id);
        if (t && t.resume_court) tri.push({ ...t, categories: (t.categories || []).filter((c) => CATEGORIES.includes(c)), modele });
        else echecs.push(s.id);
      }
      await appelSite("/api/robot/ia/resultats", "POST", { tri, echecs });
      bilan.classes += tri.length; bilan.echecs += echecs.length;
      // Les sujets importants qu'on vient de classer passent en tête pour le résumé détaillé.
      for (const t of tri) if (t.importance >= 3) {
        const s = lot.find((x) => x.id === t.id);
        travail.a_detailler.unshift({ ...s, importance: t.importance });
      }
    } catch (e) {
      console.error("Classement : échec du lot :", e.message);
      await appelSite("/api/robot/ia/resultats", "POST", { echecs: lot.map((s) => s.id) });
      bilan.echecs += lot.length;
    }
  }

  // 2) Résumés détaillés : importance la plus haute d'abord.
  travail.a_detailler.sort((a, b) => (b.importance || 0) - (a.importance || 0));
  const dejaFaits = new Set();
  for (const s of travail.a_detailler) {
    if (dejaFaits.has(s.id)) continue;
    dejaFaits.add(s.id);
    const modele = g.choisir(s.importance === 5);
    if (!modele) break;
    try {
      const r = await g.appeler(modele, CONSIGNES_DETAIL, presenter(s, 6, 1500), SCHEMA_DETAIL);
      if (r.quota) { dejaFaits.delete(s.id); continue; }
      await appelSite("/api/robot/ia/resultats", "POST", { details: [{ id: s.id, resume_detail: r.donnees, modele }] });
      bilan.details++;
    } catch (e) {
      console.error(`Résumé détaillé : échec pour ${s.id} :`, e.message);
      await appelSite("/api/robot/ia/resultats", "POST", { echecs: [s.id] });
      bilan.echecs++;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  traiter().catch((e) => { console.error("Échec du robot IA :", e.message); process.exit(1); });
}
