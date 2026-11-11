// Lecture des actualités pour les pages du site (utilisateurs connectés).
// Fil filtrable, bandeau « À la une », détail d'un sujet, listes pour les filtres.

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

export const COLONNES = "s.id, s.titre, s.titre_fr, s.derniere_pub, s.nb_articles, s.importance, s.categories, s.resume_court, s.ia_statut";

// Ajoute à chaque sujet ses articles (sources, liens, dates).
export async function avecArticles(db, sujets, extraits = true) {
  if (!sujets.length) return sujets;
  const { results } = await db
    .prepare(`SELECT sujet_id, source_id, source_nom, groupe, langue, titre, lien, image, ${extraits ? "extrait," : ""} publie_le FROM articles
               WHERE sujet_id IN (${sujets.map(() => "?").join(",")}) ORDER BY publie_le DESC`)
    .bind(...sujets.map((s) => s.id))
    .all();
  for (const s of sujets) {
    s.articles = results.filter((a) => a.sujet_id === s.id).map(({ sujet_id, ...a }) => a);
    try { s.categories = s.categories ? JSON.parse(s.categories) : []; } catch { s.categories = []; }
  }
  return sujets;
}

// Sigles du métier (produits français) : on cherche le sigle et sa forme développée,
// et seulement dans les sujets couverts par au moins une source française.
const SIGLES = {
  per: '(per OR "plan d epargne retraite" OR "plan epargne retraite")',
  perco: '(perco OR "epargne retraite")',
  pea: '(pea OR "plan d epargne en actions")',
  ifi: '(ifi OR "fortune immobiliere")',
  av: '"assurance vie"',
  lmnp: '(lmnp OR "loueur en meuble")',
  pee: '(pee OR "epargne salariale")',
  csg: 'csg',
  scpi: 'scpi',
};

// Transforme la saisie en requête plein texte :
// mots de 4 lettres et plus = début de mot ("assur" trouve "assurance") ; mots courts = mot exact ; sigles = forme développée.
export function construireRequete(saisie) {
  const mots = String(saisie || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const retenus = mots.slice(0, 8);
  const termes = retenus.map((m) => SIGLES[m] || (m.length >= 4 ? `"${m}"*` : `"${m}"`));
  return { requete: termes.join(" AND "), francais: retenus.some((m) => SIGLES[m]) };
}

// Alertes « baisse de plus de 2 % » : seulement celles de la séance du jour (heure de Paris).
async function alertesDuJour(db) {
  const l = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = 'marches_direct'").first();
  if (!l) return [];
  const jour = (d) => new Date(d).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  if (jour(l.maj_le) !== jour(Date.now())) return [];
  try { return (JSON.parse(l.valeur).alertes || []).map((a) => ({ ...a, maj_le: l.maj_le })); } catch { return []; }
}

const PERIODES = { "24h": 1, "7j": 7, "30j": 30, "90j": 90 };

export async function routeLecture(chemin, url, db) {
  const p = url.searchParams;

  // Fil d'actualités, avec filtres combinables.
  if (chemin === "/api/actualites") {
    const limite = Math.min(Math.max(Number(p.get("limite")) || 30, 1), 60);
    const conditions = ["s.nb_articles > 0", "s.derniere_pub < ?"];
    const valeurs = [p.get("avant") || "9999"];
    // Une ou plusieurs catégories (un « thème » de l'accueil en regroupe plusieurs).
    const categories = p.getAll("categorie").filter(Boolean).slice(0, 12);
    if (categories.length) {
      conditions.push(`EXISTS (SELECT 1 FROM sujet_categories c WHERE c.sujet_id = s.id AND c.categorie IN (${categories.map(() => "?").join(",")}))`);
      valeurs.push(...categories);
    }
    if (p.get("source")) {
      conditions.push("EXISTS (SELECT 1 FROM articles a WHERE a.sujet_id = s.id AND a.source_id = ?)");
      valeurs.push(p.get("source"));
    }
    if (Number(p.get("importance")) > 1) {
      conditions.push("s.importance >= ?");
      valeurs.push(Number(p.get("importance")));
    }
    if (PERIODES[p.get("periode")]) {
      conditions.push("s.derniere_pub >= ?");
      valeurs.push(new Date(Date.now() - PERIODES[p.get("periode")] * 86400000).toISOString());
    }
    // Option : masquer les sujets jugés hors sujet (importance 1) — activée par défaut.
    if (p.get("tout") !== "1") conditions.push("(s.importance IS NULL OR s.importance > 1)");
    const { results } = await db
      .prepare(`SELECT ${COLONNES} FROM sujets s WHERE ${conditions.join(" AND ")} ORDER BY s.derniere_pub DESC LIMIT ?`)
      .bind(...valeurs, limite)
      .all();
    await avecArticles(db, results);
    return json({ sujets: results, suite: results.length === limite ? results[results.length - 1].derniere_pub : null });
  }

  // Bandeau « À la une » : sujets de niveau 5 des dernières 36 heures.
  if (chemin === "/api/une") {
    const depuis = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
    const { results } = await db
      .prepare(`SELECT ${COLONNES} FROM sujets s WHERE s.importance = 5 AND s.derniere_pub >= ? ORDER BY s.derniere_pub DESC LIMIT 6`)
      .bind(depuis)
      .all();
    await avecArticles(db, results, false);
    return json({ sujets: results, alertes_marches: await alertesDuJour(db) });
  }

  // Derniers relevés de marché (page Marchés).
  if (chemin === "/api/marches") {
    const lire = async (cle) => {
      const l = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = ?").bind(cle).first();
      try { return l ? { ...JSON.parse(l.valeur), maj_le: l.maj_le } : null; } catch { return null; }
    };
    // Historique des clôtures (40 derniers jours) pour les mini-courbes.
    const { results: points } = await db
      .prepare("SELECT symbole, jour, cours FROM historique_marches WHERE jour >= ? ORDER BY jour")
      .bind(new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10))
      .all();
    const historique = {};
    for (const pt of points) (historique[pt.symbole] ||= []).push([pt.jour, pt.cours]);
    return json({ direct: await lire("marches_direct"), autres: await lire("marches_autres"), cloture: await lire("marches_cloture"), historique });
  }

  // Détail d'un sujet : résumé complet et toutes ses sources.
  if (chemin === "/api/sujet") {
    const s = await db
      .prepare(`SELECT ${COLONNES}, s.resume_detail, s.ia_le FROM sujets s WHERE s.id = ?`)
      .bind(p.get("id") || "")
      .first();
    if (!s) return json({ erreur: "Sujet introuvable (il a peut-être plus de 3 mois)." }, 404);
    await avecArticles(db, [s]);
    try { s.resume_detail = s.resume_detail ? JSON.parse(s.resume_detail) : null; } catch { s.resume_detail = null; }
    return json(s);
  }

  // Recherche plein texte (titres, chapôs, résumés), insensible aux accents.
  if (chemin === "/api/recherche") {
    const { requete, francais } = construireRequete(p.get("q"));
    if (!requete) return json({ sujets: [] });
    const filtreFr = francais ? "AND EXISTS (SELECT 1 FROM articles a WHERE a.sujet_id = s.id AND a.langue = 'fr')" : "";
    const { results: ids } = await db
      .prepare("SELECT sujet_id, MIN(rank) AS pertinence FROM recherche WHERE recherche MATCH ? GROUP BY sujet_id ORDER BY pertinence LIMIT 90")
      .bind(requete)
      .all();
    if (!ids.length) return json({ sujets: [] });
    const { results } = await db
      .prepare(`SELECT ${COLONNES} FROM sujets s WHERE s.id IN (${ids.map(() => "?").join(",")}) AND s.nb_articles > 0 ${filtreFr} ORDER BY s.derniere_pub DESC`)
      .bind(...ids.map((r) => r.sujet_id))
      .all();
    await avecArticles(db, results);
    return json({ sujets: results });
  }

  // Briefs (matin et soir) : celui demandé (ou le plus récent), et la liste des éditions disponibles.
  if (chemin === "/api/brief") {
    const jour = p.get("jour"), edition = p.get("edition");
    const b = jour
      ? await db.prepare("SELECT jour, edition, contenu, cree_le FROM briefs WHERE jour = ? AND edition = ?").bind(jour, edition === "soir" ? "soir" : "matin").first()
      : await db.prepare("SELECT jour, edition, contenu, cree_le FROM briefs ORDER BY jour DESC, edition = 'soir' DESC LIMIT 1").first();
    const { results: editions } = await db.prepare("SELECT jour, edition FROM briefs ORDER BY jour DESC, edition = 'soir' DESC LIMIT 200").all();
    let contenu = null;
    try { contenu = b ? JSON.parse(b.contenu) : null; } catch {}
    const audio = b ? await db.prepare("SELECT duree FROM brief_audio WHERE jour = ? AND edition = ?").bind(b.jour, b.edition).first() : null;
    return json({
      brief: b ? { ...contenu, jour: b.jour, edition: b.edition, cree_le: b.cree_le, audio: audio ? { duree: audio.duree } : null } : null,
      editions,
      jours: [...new Set(editions.map((e) => e.jour))],
    });
  }

  // Quiz de l'actu : les questions rédigées par l'IA avec les derniers briefs (jeu de la rubrique Apprendre).
  if (chemin === "/api/quiz-actu") {
    const { results } = await db.prepare("SELECT jour, edition, contenu FROM briefs ORDER BY jour DESC, edition = 'soir' DESC LIMIT 14").all();
    const quiz = [];
    for (const r of results) {
      try {
        const c = JSON.parse(r.contenu);
        if ((c.quiz || []).length) quiz.push({ jour: r.jour, edition: r.edition, questions: c.quiz });
      } catch {}
    }
    return json({ quiz });
  }

  // Catégories des sujets des dernières 24 heures (graphique « Les thèmes du jour » ; regroupées en thèmes par la page).
  if (chemin === "/api/themes") {
    const depuis = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { results } = await db
      .prepare(`SELECT s.categories FROM sujets s WHERE s.derniere_pub >= ? AND s.nb_articles > 0
                 AND (s.importance IS NULL OR s.importance > 1) LIMIT 1000`)
      .bind(depuis)
      .all();
    const sujets = results.map((r) => { try { return r.categories ? JSON.parse(r.categories) : []; } catch { return []; } });
    return json({ sujets });
  }

  // Valeurs proposées dans les filtres.
  if (chemin === "/api/filtres") {
    const { results: sources } = await db
      .prepare("SELECT source_id AS id, MAX(source_nom) AS nom, COUNT(*) AS n FROM articles GROUP BY source_id ORDER BY nom")
      .all();
    const { results: categories } = await db
      .prepare("SELECT categorie AS nom, COUNT(*) AS n FROM sujet_categories GROUP BY categorie ORDER BY n DESC")
      .all();
    return json({ sources, categories });
  }

  return null;
}
