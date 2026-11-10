// Robot de collecte : lit les flux RSS des sources actives, écarte les articles déjà connus,
// regroupe les articles qui parlent du même sujet, puis les envoie au site.
// Lancement : node scripts/collecte.mjs  (variables : SITE_URL, ROBOT_TOKEN)

import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { telecharger, analyserFlux } from "./flux.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const AGE_MAX_JOURS = 7;          // on ignore les articles plus vieux (premier passage, flux d'archives)
const MAX_PAR_FLUX = 50;
const SIMULTANES = 6;             // nombre de flux lus en même temps

// ---------------------------------------------------------------- outils
async function appelSite(chemin, methode = "GET", corps) {
  const r = await fetch(SITE + chemin, {
    method: methode,
    headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`${chemin} → HTTP ${r.status} ${texte.slice(0, 200)}`);
  return JSON.parse(texte);
}

// Lien sans paramètres de suivi (utm…), pour reconnaître le même article.
export function normaliserLien(lien) {
  try {
    const u = new URL(lien.trim());
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|xtor|at_|fbclid|gclid|ref$|cmp)/i.test(k)) u.searchParams.delete(k);
    u.hostname = u.hostname.replace(/^www\./, "");
    return u.toString().replace(/\/$/, "");
  } catch {
    return lien.trim();
  }
}
export const empreinte = (lien) => createHash("sha256").update(normaliserLien(lien)).digest("hex").slice(0, 32);

// Mots significatifs d'un titre, pour comparer deux titres.
const MOTS_VIDES = new Set(("le la les un une des du de d l au aux et ou en a à pour par sur dans avec sans ce ces cet cette son sa ses leur leurs " +
  "qui que quoi dont est sont été être plus moins pas ne se il elle ils elles on nous vous vers chez entre après avant comme mais " +
  "the a an of to in on for and or is are was were be by with at from as its it this that these those will can has have new says " +
  "after over into than about up out how why what when vs").split(" "));

export function motsCles(titre) {
  const mots = String(titre)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%€$]+/g, " ")
    .split(" ")
    .filter((m) => m.length > 2 && !MOTS_VIDES.has(m));
  return new Set(mots);
}

export function similarite(a, b) {
  let communs = 0;
  for (const m of a) if (b.has(m)) communs++;
  const union = a.size + b.size - communs;
  return { communs, jaccard: union ? communs / union : 0 };
}
// Deux titres parlent du même sujet s'ils partagent beaucoup de mots significatifs.
export const memeSujet = (a, b) => {
  const s = similarite(a, b);
  return s.communs >= 3 && s.jaccard >= 0.45;
};

async function enParallele(liste, n, travail) {
  const resultats = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < liste.length) { const k = i++; resultats[k] = await travail(liste[k]); }
  }));
  return resultats;
}

// Certains flux (BOFiP) n'ont pas de date standard mais l'écrivent dans le texte : "publié le 04/11/2026".
export function dateDansTexte(texte) {
  const m = String(texte || "").match(/publi[ée]e? le (\d{2})\/(\d{2})\/(\d{4})/i);
  return m ? `${m[3]}-${m[2]}-${m[1]}T12:00:00.000Z` : null;
}

// ---------------------------------------------------------------- collecte
export async function lireSources(sources) {
  const taches = [];
  for (const s of sources) for (const url of s.flux || []) taches.push({ source: s, url });
  const limiteAge = Date.now() - AGE_MAX_JOURS * 86400000;
  const bilan = [];
  const lus = await enParallele(taches, SIMULTANES, async ({ source, url }) => {
    const r = await telecharger(url);
    const flux = r.ok ? analyserFlux(r.texte) : null;
    if (!flux) {
      bilan.push({ source: source.id, url, ok: false, raison: r.erreur || `HTTP ${r.statut}` });
      return [];
    }
    for (const a of flux.articles) if (!a.date) a.date = dateDansTexte(a.resume) || dateDansTexte(a.titre);
    const articles = flux.articles
      .filter((a) => a.titre && /^https?:\/\//.test(a.lien))
      .filter((a) => !a.date || new Date(a.date).getTime() >= limiteAge)
      .slice(0, MAX_PAR_FLUX)
      .map((a) => ({
        empreinte: empreinte(a.lien),
        source_id: source.id,
        source_nom: source.nom,
        groupe: source.groupe,
        langue: source.langue || "fr",
        titre: a.titre.slice(0, 500),
        lien: a.lien,
        extrait: a.resume ? a.resume.slice(0, 3000) : null,
        image: source.images === false ? null : a.image || null,   // "images": false dans sources.json pour ne pas afficher celles d'une source
        publie_le: a.date && new Date(a.date).getTime() <= Date.now() + 3600000 ? a.date : new Date().toISOString(),
      }));
    bilan.push({ source: source.id, url, ok: true, articles: articles.length });
    return articles;
  });
  // Un même lien peut figurer dans deux flux (ex. deux rubriques du Figaro) : on n'en garde qu'un.
  const parEmpreinte = new Map();
  for (const a of lus.flat()) if (!parEmpreinte.has(a.empreinte)) parEmpreinte.set(a.empreinte, a);
  return { articles: [...parEmpreinte.values()], bilan };
}

// Attribue un sujet à chaque nouvel article : un sujet récent qui lui ressemble, sinon un nouveau sujet.
export function regrouper(nouveaux, sujetsRecents) {
  const sujets = sujetsRecents.map((s) => ({ id: s.id, mots: motsCles(s.titre) }));
  const sujetsNouveaux = [];
  // Les plus anciens d'abord : le premier article d'un sujet lui donne son titre.
  const tries = [...nouveaux].sort((a, b) => a.publie_le.localeCompare(b.publie_le));
  for (const a of tries) {
    const mots = motsCles(a.titre);
    const trouve = sujets.find((s) => memeSujet(mots, s.mots));
    if (trouve) {
      a.sujet_id = trouve.id;
      for (const m of mots) trouve.mots.add(m);   // le sujet s'enrichit des mots du nouvel article
    } else {
      const s = { id: randomUUID(), mots };
      sujets.push(s);
      sujetsNouveaux.push({ id: s.id, titre: a.titre, derniere_pub: a.publie_le });
      a.sujet_id = s.id;
    }
  }
  return { articles: tries, sujetsNouveaux };
}

export async function collecter() {
  if (!SITE || !JETON) throw new Error("SITE_URL et ROBOT_TOKEN doivent être définis.");
  const debut = Date.now();
  const config = JSON.parse(await readFile(new URL("../config/sources.json", import.meta.url), "utf8"));
  const sources = config.sources.filter((s) => s.actif !== false);

  const { articles, bilan } = await lireSources(sources);
  console.log(`${articles.length} articles lus dans ${bilan.length} flux.`);

  const connus = new Set(), sansImage = new Set();
  for (let i = 0; i < articles.length; i += 400) {
    const r = await appelSite("/api/robot/connus", "POST", { empreintes: articles.slice(i, i + 400).map((a) => a.empreinte) });
    r.connus.forEach((e) => connus.add(e));
    (r.sans_image || []).forEach((e) => sansImage.add(e));
  }
  // Articles déjà connus dont le flux fournit maintenant une image : on la rattache.
  const images = articles.filter((a) => a.image && sansImage.has(a.empreinte)).map((a) => ({ empreinte: a.empreinte, image: a.image }));
  for (let i = 0; i < images.length; i += 400) await appelSite("/api/robot/images", "POST", { images: images.slice(i, i + 400) });
  if (images.length) console.log(`${images.length} images rattachées à des articles déjà connus.`);
  const nouveaux = articles.filter((a) => !connus.has(a.empreinte));
  console.log(`${nouveaux.length} nouveaux articles.`);

  let sujetsCrees = 0;
  if (nouveaux.length) {
    const { sujets } = await appelSite("/api/robot/sujets-recents");
    const { articles: classes, sujetsNouveaux } = regrouper(nouveaux, sujets);
    sujetsCrees = sujetsNouveaux.length;
    // Envoi par paquets, en gardant chaque nouveau sujet avec ses articles.
    for (let i = 0; i < classes.length; i += 150) {
      const paquet = classes.slice(i, i + 150);
      const ids = new Set(paquet.map((a) => a.sujet_id));
      await appelSite("/api/robot/ingerer", "POST", {
        sujets_nouveaux: sujetsNouveaux.filter((s) => ids.has(s.id)),
        articles: paquet,
      });
    }
    // Un nouveau sujet dont les articles sont répartis sur deux paquets a déjà été créé au premier : INSERT OR IGNORE.
  }

  const menage = await appelSite("/api/robot/nettoyer", "POST", {});
  const etat = {
    fin: new Date().toISOString(),
    duree_s: Math.round((Date.now() - debut) / 1000),
    flux_ok: bilan.filter((b) => b.ok).length,
    flux_en_erreur: bilan.filter((b) => !b.ok).map((b) => `${b.source} (${b.raison})`),
    articles_lus: articles.length,
    nouveaux: nouveaux.length,
    sujets_crees: sujetsCrees,
    supprimes_3_mois: menage.articles_supprimes,
  };
  await appelSite("/api/robot/etat", "POST", etat);
  console.log(JSON.stringify(etat, null, 2));
  return etat;
}

// Lancement direct (et non import pour les tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  collecter().catch((e) => { console.error("Échec de la collecte :", e.message); process.exit(1); });
}
