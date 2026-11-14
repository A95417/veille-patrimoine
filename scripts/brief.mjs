// Briefs : chaque jour vers 7 h (édition du matin) et vers 18 h (édition du soir, heure de Paris).
// Matin : clôtures de la veille + sujets des dernières 24 h. Soir : séance du jour + sujets parus depuis 7 h.
// Brief matinal : rédigé à partir
//  - des clôtures relevées vers 6 h (scripts/marches.mjs),
//  - des sujets les plus importants des dernières 24 heures (déjà classés et résumés par l'IA),
// puis un seul appel à l'IA pour la synthèse et les points « à retenir pour mes rendez-vous clients ».
// Lancement : node scripts/brief.mjs  (variables : SITE_URL, ROBOT_TOKEN, GEMINI_API_KEY ;
//   BRIEF_FORCER=matin ou soir pour un essai, ou oui = l'édition de l'heure qu'il est)

import { choisirModeles, generer, LIMITES } from "./gemini.mjs";
import { REGLES } from "./ia.mjs";
import { produireAudio } from "./audio.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const FORCE = (process.env.BRIEF_FORCER || "").toLowerCase();
const FORCER = /^(oui|1|true|matin|soir)$/.test(FORCE);
// Fenêtres (minutes depuis minuit, heure de Paris) : le premier passage du robot dans la fenêtre rédige l'édition.
const FENETRES = {
  matin: [6 * 60 + 45, 12 * 60],      // prêt vers 7 h ; produit quand même jusqu'à midi en cas de retard
  soir: [17 * 60 + 45, 23 * 60],      // prêt vers 18 h ; jusqu'à 23 h en cas de retard
};
export function editionDuMoment(minutes) {
  if (FORCE === "matin" || FORCE === "soir") return FORCE;
  for (const [e, [debut, fin]] of Object.entries(FENETRES)) if (minutes >= debut && minutes < fin) return e;
  return FORCER ? (minutes < 15 * 60 ? "matin" : "soir") : null;
}
// 7 h du matin (heure de Paris) du jour donné, en date universelle.
export function septHeuresParis(jour) {
  for (const decalage of [1, 2]) {                 // Paris = UTC+1 (hiver) ou UTC+2 (été)
    const d = new Date(`${jour}T${String(7 - decalage).padStart(2, "0")}:00:00Z`);
    if (maintenantParis(d).minutes === 7 * 60) return d;
  }
  return new Date(`${jour}T06:00:00Z`);
}

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

const CONSIGNES_COMMUNES = `
- "commentaire_marches" : 1 à 2 phrases qui décrivent les variations de marché fournies (sans les expliquer par des causes non fournies). Chaîne vide si aucun chiffre n'est fourni.
- "quiz" : exactement 3 questions à choix multiples pour vérifier qu'un conseiller a bien retenu l'actualité, chacune sur un sujet différent fourni. "question" courte ; "choix" : 4 réponses plausibles et de même longueur ; "bonne" : le numéro (0 à 3) de la seule bonne réponse, qui doit découler UNIQUEMENT du résumé fourni ; "explication" : 1 phrase ; "sujet_id" recopié exactement. Pas de question sur un chiffre de marché.`;

const CONSIGNES = {
  matin: `${REGLES}

TA TÂCHE : préparer le brief matinal des conseillers à partir UNIQUEMENT des éléments fournis (sujets déjà résumés et chiffres de marché).
- "synthese" : 3 à 4 phrases qui donnent le panorama de la matinée (les faits les plus importants d'abord). Rien qui ne figure dans les éléments fournis.${CONSIGNES_COMMUNES}
- "a_retenir" : 3 à 5 points pour les rendez-vous clients de la journée.`,
  soir: `${REGLES}

TA TÂCHE : préparer le brief du soir des conseillers (« le point de la journée ») à partir UNIQUEMENT des éléments fournis : les sujets parus depuis 7 h ce matin et les chiffres de la séance du jour.
- "synthese" : 3 à 4 phrases qui résument ce qui s'est passé dans la journée (les faits les plus importants d'abord). Rien qui ne figure dans les éléments fournis.${CONSIGNES_COMMUNES}
- "a_retenir" : 3 à 5 points à garder en tête pour les rendez-vous clients de demain.`,
};
const CONSIGNES_FIN = ` Chaque point des "a_retenir" : 1 à 2 phrases simples, prêtes à être dites, sans conseil personnalisé ni recommandation d'achat ou de vente, et rattaché au sujet dont il parle par son "sujet_id" (recopié exactement).
- "chiffres_candidats" : jusqu'à 3 chiffres utiles pour un conseiller en patrimoine aujourd'hui, du plus utile au moins utile, chacun pris tel quel dans un résumé fourni (taux, montant, pourcentage, plafond…), et chacun tiré d'un sujet différent. Les variations de marché ne comptent pas. "valeur" : le chiffre exactement comme il est écrit dans le résumé, avec son unité (ex. « 1,6 % » ; une date comme « 31 décembre » n'est pas un chiffre). "libelle" : 6 à 14 mots qui disent ce qu'il mesure. "sujet_id" : le sujet d'où il vient. Liste vide si aucun résumé ne contient de chiffre utile. N'inclus jamais un chiffre de la liste « CHIFFRES DÉJÀ PUBLIÉS ».`;

const SCHEMA_BRIEF = {
  type: "OBJECT",
  properties: {
    synthese: { type: "STRING" },
    commentaire_marches: { type: "STRING" },
    a_retenir: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { texte: { type: "STRING" }, sujet_id: { type: "STRING" } }, required: ["texte", "sujet_id"] },
    },
    chiffres_candidats: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { valeur: { type: "STRING" }, libelle: { type: "STRING" }, sujet_id: { type: "STRING" } }, required: ["valeur", "libelle", "sujet_id"] },
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" }, choix: { type: "ARRAY", items: { type: "STRING" } }, bonne: { type: "INTEGER" },
          explication: { type: "STRING" }, sujet_id: { type: "STRING" },
        },
        required: ["question", "choix", "bonne", "explication", "sujet_id"],
      },
    },
  },
  required: ["synthese", "commentaire_marches", "a_retenir", "chiffres_candidats", "quiz"],
};

// Garde-fou du quiz : 4 choix distincts, une bonne réponse valide, un sujet existant.
export function verifierQuiz(quiz, actualites) {
  const ids = new Set(actualites.map((a) => a.id));
  return (quiz || []).filter((q) => q && q.question && Array.isArray(q.choix) && q.choix.length === 4
      && new Set(q.choix.map((c) => String(c).trim().toLowerCase())).size === 4
      && Number.isInteger(q.bonne) && q.bonne >= 0 && q.bonne < 4 && ids.has(q.sujet_id))
    .slice(0, 3)
    .map((q) => ({ question: String(q.question).slice(0, 300), choix: q.choix.map((c) => String(c).slice(0, 160)),
                   bonne: q.bonne, explication: String(q.explication || "").slice(0, 400), sujet_id: q.sujet_id }));
}

// Garde-fou : le chiffre doit figurer mot pour mot dans le résumé du sujet cité (sinon on ne l'affiche pas).
export function verifierChiffre(c, actualites, precedents = []) {
  if (!c || !c.valeur || !/\d/.test(c.valeur) || !c.libelle) return null;
  // Pas deux fois le même chiffre d'affilée (même valeur, ou même sujet) : on n'affiche rien plutôt qu'une redite.
  const compacte = (t) => String(t || "").replace(/[\s\u00a0\u202f]+/g, "").toLowerCase();
  if (precedents.some((p) => p && (compacte(p.valeur) === compacte(c.valeur) || p.sujet_id === c.sujet_id))) return null;
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
  const edition = editionDuMoment(minutes);
  if (!edition) { console.log("Brief : pas l'heure, rien à faire."); return null; }
  const depuis = edition === "soir" ? septHeuresParis(jour).toISOString() : "";
  const d = await appelSite(`/api/robot/brief/donnees?jour=${jour}&edition=${edition}${depuis ? "&depuis=" + encodeURIComponent(depuis) : ""}`);
  // Un brief enregistré sans synthèse (IA surchargée) est retenté aux passages suivants de la fenêtre.
  const rattrapage = d.existe && !FORCER && d.sans_ia === true;
  if (d.existe && !FORCER && !rattrapage) { console.log(`Brief du ${jour} (${edition}) : déjà rédigé.`); return null; }
  if (rattrapage) console.log(`Brief du ${jour} (${edition}) : rédigé sans synthèse, nouvel essai avec l'IA.`);

  const actualites = choisirActualites(d.sujets);
  const recent = (m, heures) => m && Date.now() - new Date(m.maj_le) < heures * 3600 * 1000;
  let marches = null;
  if (edition === "matin") {
    // Clôtures : seulement si elles datent de moins de 18 h (relevé du matin même).
    if (recent(d.marches, 18)) marches = { maj_le: d.marches.maj_le, valeurs: d.marches.valeurs || [], autres: d.marches.autres || [] };
  } else if (recent(d.direct, 10) || recent(d.autres, 10)) {
    // Soir : la séance du jour (Europe clôturée, New York en cours), si elle a été relevée aujourd'hui.
    marches = { maj_le: (recent(d.direct, 10) ? d.direct : d.autres).maj_le,
                valeurs: recent(d.direct, 10) ? d.direct.valeurs || [] : [], autres: recent(d.autres, 10) ? d.autres.autres || [] : [] };
  }

  const contenu = { jour, edition, depuis: depuis || null, genere_le: new Date().toISOString(), marches, actualites, synthese: "",
                    commentaire_marches: "", a_retenir: [], chiffre_du_jour: null, quiz: [], ia_modele: null };

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
    const entree = (edition === "matin"
        ? `CHIFFRES DE MARCHÉ (clôtures de la veille, estimations via des fonds indiciels) :\n${texteMarches(marches)}\n\nSUJETS DES DERNIÈRES 24 HEURES`
        : `CHIFFRES DE MARCHÉ (séance du jour : Europe clôturée, New York en cours ; estimations via des fonds indiciels) :\n${texteMarches(marches)}\n\nSUJETS PARUS DEPUIS 7 H CE MATIN`) +
      ` (du plus important au moins important) :\n` +
      actualites.map((a) => `SUJET id=${a.id} — importance ${a.importance}/5 — ${a.categories.join(", ")}\n  Titre : ${a.titre}\n  Résumé : ${a.resume}`).join("\n\n") +
      `\n\nCHIFFRES DÉJÀ PUBLIÉS (à ne pas reprendre) :\n` +
      ((d.chiffres_precedents || []).map((c) => `- ${c.valeur} : ${c.libelle}`).join("\n") || "(aucun)");
    const ajouts = {};
    for (const modele of candidats) {
      try {
        ajouts[modele] = (ajouts[modele] || 0) + 1;
        const r = await generer(modele, CONSIGNES[edition] + CONSIGNES_FIN, entree, SCHEMA_BRIEF);
        if (r.quota) continue;
        const ids = new Set(actualites.map((a) => a.id));
        contenu.synthese = r.donnees.synthese || "";
        contenu.commentaire_marches = marches ? r.donnees.commentaire_marches || "" : "";
        contenu.a_retenir = (r.donnees.a_retenir || []).filter((p) => p.texte && ids.has(p.sujet_id)).slice(0, 5);
        // Plusieurs candidats : on garde le premier qui passe les contrôles (présent mot pour mot, pas déjà publié).
        const candidats = (r.donnees.chiffres_candidats || []).slice(0, 3);
        contenu.chiffre_du_jour = null;
        for (const c of candidats) { contenu.chiffre_du_jour = verifierChiffre(c, actualites, d.chiffres_precedents || []); if (contenu.chiffre_du_jour) break; }
        if (!contenu.chiffre_du_jour && candidats.length) console.log("Chiffres proposés mais non retenus :", candidats.map((c) => c.valeur).join(" | "));
        contenu.quiz = verifierQuiz(r.donnees.quiz, actualites);
        contenu.ia_modele = modele;
        break;
      } catch (e) {
        console.error(`Brief : échec avec ${modele} :`, e.message);
      }
    }
    await appelSite("/api/robot/ia/quota", "POST", { ajouts });
  }

  if (rattrapage && !contenu.ia_modele) {   // toujours pas d'IA : on garde le brief existant (et son audio)
    console.log(`Brief du ${jour} (${edition}) : IA toujours indisponible, nouvel essai au prochain passage.`);
    return null;
  }
  await appelSite("/api/robot/brief", "POST", { jour, edition, contenu });
  console.log(`Brief du ${jour} (${edition}) enregistré : ${actualites.length} actualités, ${contenu.a_retenir.length} points à retenir, ` +
    `marchés ${marches ? "oui" : "non"}, IA ${contenu.ia_modele || "indisponible (brief sans synthèse)"}.`);
  if (contenu.synthese) console.log("Synthèse :", contenu.synthese);
  console.log(`Quiz : ${contenu.quiz.length} question(s) validée(s).`);
  // Version audio (voix naturelle) : un échec ne bloque pas le brief, le site lira alors avec la voix de l'appareil.
  try { await produireAudio({ ...contenu, jour, edition }); } catch (e) { console.error("Audio : échec,", e.message); }
  console.log("Chiffre du jour :", contenu.chiffre_du_jour ? `${contenu.chiffre_du_jour.valeur} — ${contenu.chiffre_du_jour.libelle}` : "aucun (rien de vérifiable)");
  return contenu;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  produireBrief().catch((e) => { console.error("Échec du brief :", e.message); process.exit(1); });
}
