// Brief matinal : chaque jour vers 7 h (heure de Paris), rédige un récapitulatif à partir
//  - des clôtures relevées vers 6 h (scripts/marches.mjs),
//  - des sujets les plus importants des dernières 24 heures (déjà classés et résumés par l'IA),
// puis un seul appel à l'IA pour la synthèse et les points « à retenir pour mes rendez-vous clients ».
// Lancement : node scripts/brief.mjs  (variables : SITE_URL, ROBOT_TOKEN, GEMINI_API_KEY ; BRIEF_FORCER=oui pour un essai)

import { choisirModeles, generer, LIMITES } from "./gemini.mjs";
import { REGLES } from "./ia.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const FORCER = /^(oui|1|true)$/i.test(process.env.BRIEF_FORCER || "");
const HEURE_BRIEF = 6 * 60 + 45;     // à partir de 6 h 45 : le passage du robot de 6 h 52 le produit, prêt vers 7 h
const HEURE_LIMITE = 12 * 60;        // si GitHub a beaucoup de retard, on le produit quand même jusqu'à midi

export function maintenantParis(date = new Date()) {
  const jour = date.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
  const [h, m] = date.toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).split(":");
  return { jour, minutes: Number(h) * 60 + Number(m) };
}

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

// Les 5 à 10 actualités majeures : importance 3 et plus ; complétées par du niveau 2 s'il y en a moins de 5.
export function choisirActualites(sujets) {
  const majeurs = sujets.filter((s) => s.importance >= 3).slice(0, 10);
  const complements = sujets.filter((s) => s.importance === 2).slice(0, Math.max(0, 5 - majeurs.length));
  return [...majeurs, ...complements].map((s) => {
    let detail = null;
    try { detail = s.resume_detail ? JSON.parse(s.resume_detail) : null; } catch {}
    let categories = [];
    try { categories = s.categories ? JSON.parse(s.categories) : []; } catch {}
    const sources = [...new Map((s.sources || []).map((a) => [a.source_nom, a])).values()].slice(0, 3);
    return {
      id: s.id,
      titre: s.titre_fr || s.titre,
      importance: s.importance,
      categories,
      resume: (detail && detail.essentiel) || s.resume_court || "",
      sources: sources.map((a) => ({ nom: a.source_nom, lien: a.lien })),
    };
  });
}

const CONSIGNES_BRIEF = `${REGLES}

TA TÂCHE : préparer le brief matinal des conseillers à partir UNIQUEMENT des éléments fournis (sujets déjà résumés et chiffres de marché).
- "synthese" : 3 à 4 phrases qui donnent le panorama de la matinée (les faits les plus importants d'abord). Rien qui ne figure dans les éléments fournis.
- "commentaire_marches" : 1 à 2 phrases qui décrivent les variations de marché fournies (sans les expliquer par des causes non fournies). Chaîne vide si aucun chiffre n'est fourni.
- "a_retenir" : 3 à 5 points pour les rendez-vous clients de la journée. Chaque point : 1 à 2 phrases simples, prêtes à être dites, sans conseil personnalisé ni recommandation d'achat ou de vente, et rattaché au sujet dont il parle par son "sujet_id" (recopié exactement).
- "chiffre_du_jour" : LE chiffre le plus utile pour un conseiller en patrimoine aujourd'hui, pris tel quel dans un résumé fourni (taux, montant, pourcentage, plafond…). Les variations de marché ne comptent pas. "valeur" : le chiffre exactement comme il est écrit, avec son unité (ex. « 1,6 % » ; une date comme « 31 décembre » n'est pas un chiffre). "libelle" : 6 à 14 mots qui disent ce qu'il mesure. "sujet_id" : le sujet d'où il vient. Si aucun résumé ne contient de chiffre utile, laisse "valeur" vide.`;

const SCHEMA_BRIEF = {
  type: "OBJECT",
  properties: {
    synthese: { type: "STRING" },
    commentaire_marches: { type: "STRING" },
    a_retenir: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { texte: { type: "STRING" }, sujet_id: { type: "STRING" } }, required: ["texte", "sujet_id"] },
    },
    chiffre_du_jour: {
      type: "OBJECT",
      properties: { valeur: { type: "STRING" }, libelle: { type: "STRING" }, sujet_id: { type: "STRING" } },
      required: ["valeur", "libelle", "sujet_id"],
    },
  },
  required: ["synthese", "commentaire_marches", "a_retenir", "chiffre_du_jour"],
};

// Garde-fou : le chiffre doit figurer mot pour mot dans le résumé du sujet cité (sinon on ne l'affiche pas).
export function verifierChiffre(c, actualites) {
  if (!c || !c.valeur || !/\d/.test(c.valeur) || !c.libelle) return null;
  const sujet = actualites.find((a) => a.id === c.sujet_id);
  if (!sujet) return null;
  const norm = (t) => String(t).replace(/[\s\u00a0\u202f]+/g, " ").toLowerCase();
  if (!norm(sujet.titre + " " + sujet.resume).includes(norm(c.valeur).trim())) return null;
  const source = sujet.sources[0] || null;
  return { valeur: c.valeur.trim().slice(0, 24), libelle: c.libelle.trim().slice(0, 140), sujet_id: sujet.id,
           source: source ? source.nom : null };
}

const texteMarches = (m) => !m ? "(aucun relevé disponible)" :
  [...(m.valeurs || []), ...(m.autres || [])].filter((v) => typeof v.variation === "number")
    .map((v) => `${v.nom} : ${v.variation > 0 ? "+" : ""}${v.variation} % (${v.via})`).join("\n");

export async function produireBrief(date = new Date()) {
  if (!SITE || !JETON) throw new Error("SITE_URL et ROBOT_TOKEN doivent être définis.");
  const { jour, minutes } = maintenantParis(date);
  if (!FORCER && (minutes < HEURE_BRIEF || minutes >= HEURE_LIMITE)) { console.log("Brief : pas l'heure, rien à faire."); return null; }
  const d = await appelSite(`/api/robot/brief/donnees?jour=${jour}`);
  if (d.existe && !FORCER) { console.log(`Brief du ${jour} : déjà rédigé.`); return null; }

  const actualites = choisirActualites(d.sujets);
  // Clôtures : seulement si elles datent de moins de 18 h (relevé de 6 h du jour même).
  const marches = d.marches && Date.now() - new Date(d.marches.maj_le) < 18 * 3600 * 1000
    ? { maj_le: d.marches.maj_le, valeurs: d.marches.valeurs || [], autres: d.marches.autres || [] } : null;

  const contenu = { jour, genere_le: new Date().toISOString(), marches, actualites, synthese: "", commentaire_marches: "", a_retenir: [], chiffre_du_jour: null, ia_modele: null };

  // Un seul appel à l'IA : le modèle le plus performant (quota réservé pour le brief), sinon un Flash-Lite.
  if (process.env.GEMINI_API_KEY && actualites.length) {
    const modeles = await choisirModeles();
    const quota = await appelSite("/api/robot/ia/quota");
    const utilise = (m) => quota.compteurs?.[m] || 0;
    const candidats = [
      modeles.fort && utilise(modeles.fort) < LIMITES.fort.par_jour ? modeles.fort : null,
      utilise(modeles.principal) < LIMITES.lite.par_jour ? modeles.principal : null,
      modeles.relais && utilise(modeles.relais) < LIMITES.lite.par_jour ? modeles.relais : null,
    ].filter(Boolean);
    const entree = `CHIFFRES DE MARCHÉ (clôtures de la veille, estimations via des fonds indiciels) :\n${texteMarches(marches)}\n\n` +
      `SUJETS DES DERNIÈRES 24 HEURES (du plus important au moins important) :\n` +
      actualites.map((a) => `SUJET id=${a.id} — importance ${a.importance}/5 — ${a.categories.join(", ")}\n  Titre : ${a.titre}\n  Résumé : ${a.resume}`).join("\n\n");
    const ajouts = {};
    for (const modele of candidats) {
      try {
        ajouts[modele] = (ajouts[modele] || 0) + 1;
        const r = await generer(modele, CONSIGNES_BRIEF, entree, SCHEMA_BRIEF);
        if (r.quota) continue;
        const ids = new Set(actualites.map((a) => a.id));
        contenu.synthese = r.donnees.synthese || "";
        contenu.commentaire_marches = marches ? r.donnees.commentaire_marches || "" : "";
        contenu.a_retenir = (r.donnees.a_retenir || []).filter((p) => p.texte && ids.has(p.sujet_id)).slice(0, 5);
        contenu.chiffre_du_jour = verifierChiffre(r.donnees.chiffre_du_jour, actualites);
        contenu.ia_modele = modele;
        break;
      } catch (e) {
        console.error(`Brief : échec avec ${modele} :`, e.message);
      }
    }
    await appelSite("/api/robot/ia/quota", "POST", { ajouts });
  }

  await appelSite("/api/robot/brief", "POST", { jour, contenu });
  console.log(`Brief du ${jour} enregistré : ${actualites.length} actualités, ${contenu.a_retenir.length} points à retenir, ` +
    `marchés ${marches ? "oui" : "non"}, IA ${contenu.ia_modele || "indisponible (brief sans synthèse)"}.`);
  if (contenu.synthese) console.log("Synthèse :", contenu.synthese);
  console.log("Chiffre du jour :", contenu.chiffre_du_jour ? `${contenu.chiffre_du_jour.valeur} — ${contenu.chiffre_du_jour.libelle}` : "aucun (rien de vérifiable)");
  return contenu;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  produireBrief().catch((e) => { console.error("Échec du brief :", e.message); process.exit(1); });
}
