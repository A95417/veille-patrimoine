// Schémas du brief : pour chaque actualité, un petit schéma qui la résume d'un coup d'œil
// (chiffre clé, avant / après, étapes, points clés). L'IA choisit le schéma et le remplit ;
// chaque chiffre est vérifié mot pour mot dans le titre ou le résumé du sujet, sinon il est retiré.
// Lancé seul (node scripts/schemas.mjs), il traite le dernier brief s'il n'a pas encore ses schémas.

import { choisirModeles, generer } from "./gemini.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const FORCER = /^(oui|1|true)$/i.test(process.env.SCHEMAS_FORCER || "");

async function appelSite(chemin, methode = "GET", corps) {
  const r = await fetch(SITE + chemin, {
    method: methode,
    headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!r.ok) throw new Error(`${methode} ${chemin} : HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export const MODELES = ["chiffre", "avant_apres", "etapes", "points"];
export const ICONES = ["maison", "euro", "famille", "banque", "graphique", "calendrier", "alerte", "entreprise", "bouclier", "pourcentage", "impot", "monde", "energie", "crypto", "retraite"];

const SCHEMA = {
  type: "OBJECT",
  properties: {
    schemas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          sujet_id: { type: "STRING", description: "Identifiant du sujet, recopié exactement" },
          modele: { type: "STRING", description: "chiffre, avant_apres, etapes ou points" },
          icone: { type: "STRING", description: "Une icône parmi : " + ICONES.join(", ") },
          titre: { type: "STRING", description: "Ce que montre le schéma, 45 caractères maximum" },
          chiffre: { type: "STRING", description: "modèle chiffre : le chiffre exactement comme il est écrit dans le résumé, avec son unité" },
          legende: { type: "STRING", description: "modèle chiffre : ce que mesure le chiffre, 60 caractères maximum" },
          avant_titre: { type: "STRING", description: "modèle avant_apres : 1 à 3 mots (ex. « Aujourd'hui »)" },
          avant: { type: "STRING", description: "modèle avant_apres : 50 caractères maximum" },
          apres_titre: { type: "STRING", description: "modèle avant_apres : 1 à 3 mots (ex. « Projet »)" },
          apres: { type: "STRING", description: "modèle avant_apres : 50 caractères maximum" },
          elements: { type: "ARRAY", items: { type: "STRING" }, description: "modèles etapes et points : 2 à 3 éléments de 45 caractères maximum" },
        },
        required: ["sujet_id", "modele", "icone", "titre"],
      },
    },
  },
  required: ["schemas"],
};

const CONSIGNES = `Tu prépares des schémas très simples pour aider un conseiller en gestion de patrimoine à comprendre chaque actualité d'un coup d'œil.
Pour CHAQUE sujet fourni, propose un schéma :
- "chiffre" s'il y a un chiffre clé (taux, montant, pourcentage, plafond) écrit dans le résumé ;
- "avant_apres" si l'actualité décrit un changement (règle, taux, prix, situation) ;
- "etapes" si elle décrit un calendrier ou une procédure (ce qui va se passer ensuite) ;
- "points" sinon (2 ou 3 idées clés).
Règles impératives : textes très courts et simples ; n'utilise QUE les informations du titre et du résumé du sujet ; aucun chiffre, aucune date, aucun nom qui n'y figure ; pas de conseil. En français.`;

// Garde-fou : tout chiffre affiché doit figurer dans le titre ou le résumé du sujet.
export function verifierSchema(s, sujet) {
  if (!s || !sujet) return null;
  const norm = (t) => String(t || "").replace(/[\s  ]+/g, " ").toLowerCase();
  const ref = norm(sujet.titre + " " + sujet.resume);
  const sur = (t) => !/\d/.test(t || "") || (String(t).match(/\d[\d\s  .,]*/g) || []).every((n) => ref.includes(norm(n).trim()));
  const court = (t, n) => String(t || "").trim().slice(0, n);
  const out = {
    modele: MODELES.includes(s.modele) ? s.modele : "points",
    icone: ICONES.includes(s.icone) ? s.icone : "graphique",
    titre: sur(s.titre) ? court(s.titre, 60) : "",
    chiffre: court(s.chiffre, 16), legende: sur(s.legende) ? court(s.legende, 80) : "",
    avant_titre: court(s.avant_titre, 24), avant: sur(s.avant) ? court(s.avant, 70) : "",
    apres_titre: court(s.apres_titre, 24), apres: sur(s.apres) ? court(s.apres, 70) : "",
    elements: (Array.isArray(s.elements) ? s.elements : []).map((e) => court(e, 60)).filter((e) => e && sur(e)).slice(0, 3),
  };
  if (!out.chiffre || !/\d/.test(out.chiffre) || !ref.includes(norm(out.chiffre).trim())) out.chiffre = "";
  if (out.modele === "chiffre" && !out.chiffre) out.modele = "points";
  if (out.modele === "avant_apres" && (!out.avant || !out.apres)) out.modele = "points";
  if ((out.modele === "points" || out.modele === "etapes") && out.elements.length < 2) return out.chiffre ? { ...out, modele: "chiffre" } : null;
  if (!out.titre) out.titre = court(sujet.titre, 60);
  return out;
}

export async function produireSchemas(brief) {
  const actus = brief?.actualites || [];
  if (!process.env.GEMINI_API_KEY || !actus.length) return false;
  const quota = await appelSite("/api/robot/ia/quota");
  const modeles = await choisirModeles();
  const entree = actus.map((a) => `[${a.id}] ${a.titre}\nRésumé : ${a.resume}`).join("\n\n");
  for (const modele of [modeles.principal, modeles.relais].filter(Boolean)) {
    if ((quota.compteurs?.[modele] || 0) >= 460) continue;
    await appelSite("/api/robot/ia/quota", "POST", { ajouts: { [modele]: 1 } });
    try {
      const r = await generer(modele, CONSIGNES, `SUJETS (identifiant entre crochets) :\n\n${entree}`, SCHEMA);
      if (r.quota) continue;
      const parId = Object.fromEntries(actus.map((a) => [a.id, a]));
      const schemas = {};
      for (const s of r.donnees.schemas || []) {
        const v = verifierSchema(s, parId[String(s.sujet_id || "").replace(/[[\]\s]/g, "")]);
        if (v) schemas[String(s.sujet_id).replace(/[[\]\s]/g, "")] = v;
      }
      await appelSite("/api/robot/brief/schemas", "POST", { jour: brief.jour, edition: brief.edition || "matin", schemas });
      console.log(`Schémas du brief ${brief.jour} (${brief.edition}) : ${Object.keys(schemas).length}/${actus.length} (${modele}).`);
      return true;
    } catch (e) { console.error(`Schémas : échec avec ${modele} :`, e.message); }
  }
  return false;
}

// Lancement direct : schémas du dernier brief s'ils manquent.
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { brief } = await appelSite("/api/robot/brief/dernier");
    if (brief && (FORCER || !brief.schemas)) await produireSchemas(brief);
  } catch (e) { console.error("Schémas :", e.message); }
}
