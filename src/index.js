// Point d'entrée du site (le "serveur").
// Chaque visite passe ici : on vérifie la connexion avant d'afficher une page.

import {
  hacherMotDePasse, verifierMotDePasse, creerSession, utilisateurConnecte,
  supprimerSession, cookieSession, NOM_COOKIE, LONGUEUR_MIN_MDP,
  tropDeTentatives, noterTentative, effacerTentatives,
} from "./auth.js";
import { routeRobot } from "./robot.js";

// Pages et fichiers visibles sans être connecté.
const PAGES_PUBLIQUES = new Set(["/connexion", "/installation", "/style.css", "/commun.js", "/favicon.ico"]);

const json = (donnees, statut = 200, entetes = {}) =>
  new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...entetes },
  });
const erreur = (message, statut = 400) => json({ erreur: message }, statut);
const normaliserEmail = (e) => String(e || "").trim().toLowerCase();
const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// En-têtes de sécurité ajoutés à toutes les pages.
function securiser(reponse) {
  const r = new Response(reponse.body, reponse);
  r.headers.set("X-Content-Type-Options", "nosniff");
  r.headers.set("X-Frame-Options", "DENY");
  r.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return r;
}

async function lireJson(request) {
  try { return await request.json(); } catch { return {}; }
}

async function nombreUtilisateurs(db) {
  const r = await db.prepare("SELECT COUNT(*) AS n FROM utilisateurs").first();
  return r?.n || 0;
}

// ---------------------------------------------------------------- API
async function api(request, env, url) {
  const db = env.DB;
  const chemin = url.pathname;
  const methode = request.method;

  // Protection contre les requêtes envoyées depuis un autre site.
  if (methode !== "GET") {
    const origine = request.headers.get("Origin");
    if (origine && origine !== url.origin) return erreur("Origine refusée.", 403);
  }

  // Adresses du robot de collecte (protégées par leur propre jeton secret).
  if (chemin.startsWith("/api/robot/")) return routeRobot(request, env, chemin);

  if (chemin === "/api/sante") {
    return json({ statut: "ok", heure_serveur: new Date().toISOString() });
  }

  // Création du tout premier compte (administrateur). Désactivée dès qu'un compte existe.
  if (chemin === "/api/installation" && methode === "GET") {
    return json({ disponible: (await nombreUtilisateurs(db)) === 0 && !!env.SETUP_CODE });
  }
  if (chemin === "/api/installation" && methode === "POST") {
    if ((await nombreUtilisateurs(db)) > 0) return erreur("L'installation est déjà faite.", 403);
    if (!env.SETUP_CODE) return erreur("Le code d'installation n'est pas configuré.", 403);
    const d = await lireJson(request);
    if (d.code !== env.SETUP_CODE) return erreur("Code d'installation incorrect.", 403);
    const email = normaliserEmail(d.email);
    if (!emailValide(email)) return erreur("Adresse e-mail invalide.");
    if (!String(d.nom || "").trim()) return erreur("Indiquez votre nom.");
    if (String(d.mot_de_passe || "").length < LONGUEUR_MIN_MDP)
      return erreur(`Le mot de passe doit faire au moins ${LONGUEUR_MIN_MDP} caractères.`);
    const r = await db
      .prepare("INSERT INTO utilisateurs (email, nom, hash, role, cree_le, derniere_connexion) VALUES (?, ?, ?, 'admin', ?, ?)")
      .bind(email, String(d.nom).trim(), await hacherMotDePasse(d.mot_de_passe), new Date().toISOString(), new Date().toISOString())
      .run();
    const { jeton, dureeMs } = await creerSession(db, r.meta.last_row_id);
    return json({ ok: true }, 200, { "Set-Cookie": cookieSession(jeton, dureeMs) });
  }

  if (chemin === "/api/connexion" && methode === "POST") {
    const d = await lireJson(request);
    const email = normaliserEmail(d.email);
    if (!email || !d.mot_de_passe) return erreur("Indiquez votre e-mail et votre mot de passe.");
    if (await tropDeTentatives(db, email))
      return erreur("Trop d'essais ratés. Réessayez dans 15 minutes.", 429);
    const u = await db.prepare("SELECT id, hash, actif FROM utilisateurs WHERE email = ?").bind(email).first();
    const bon = u ? await verifierMotDePasse(d.mot_de_passe, u.hash) : false;
    if (!u || !bon || !u.actif) {
      await noterTentative(db, email);
      return erreur("E-mail ou mot de passe incorrect.", 401);
    }
    await effacerTentatives(db, email);
    await db.prepare("UPDATE utilisateurs SET derniere_connexion = ? WHERE id = ?")
      .bind(new Date().toISOString(), u.id).run();
    const { jeton, dureeMs } = await creerSession(db, u.id);
    return json({ ok: true }, 200, { "Set-Cookie": cookieSession(jeton, dureeMs) });
  }

  if (chemin === "/api/deconnexion" && methode === "POST") {
    await supprimerSession(request, db);
    return json({ ok: true }, 200, { "Set-Cookie": `${NOM_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }

  // --- À partir d'ici, il faut être connecté.
  const moi = await utilisateurConnecte(request, db);
  if (!moi) return erreur("Vous n'êtes pas connecté.", 401);

  if (chemin === "/api/moi" && methode === "GET") return json(moi);

  // Fil d'actualités : les sujets les plus récents, avec leurs articles et leurs sources.
  if (chemin === "/api/actualites" && methode === "GET") {
    const limite = Math.min(Math.max(Number(url.searchParams.get("limite")) || 30, 1), 60);
    const avant = url.searchParams.get("avant") || "9999";
    const { results: sujets } = await db
      .prepare(
        `SELECT id, titre, derniere_pub, nb_articles, importance, categories, resume_court, ia_statut
           FROM sujets WHERE nb_articles > 0 AND derniere_pub < ? ORDER BY derniere_pub DESC LIMIT ?`
      )
      .bind(avant, limite)
      .all();
    if (sujets.length) {
      const { results: arts } = await db
        .prepare(
          `SELECT sujet_id, source_nom, groupe, langue, titre, lien, extrait, publie_le FROM articles
            WHERE sujet_id IN (${sujets.map(() => "?").join(",")}) ORDER BY publie_le DESC`
        )
        .bind(...sujets.map((s) => s.id))
        .all();
      for (const s of sujets) {
        s.articles = arts.filter((a) => a.sujet_id === s.id).map(({ sujet_id, ...a }) => a);
        try { s.categories = s.categories ? JSON.parse(s.categories) : []; } catch { s.categories = []; }
      }
    }
    return json({ sujets, suite: sujets.length === limite ? sujets[sujets.length - 1].derniere_pub : null });
  }

  if (chemin === "/api/moi/mot-de-passe" && methode === "POST") {
    const d = await lireJson(request);
    const u = await db.prepare("SELECT hash FROM utilisateurs WHERE id = ?").bind(moi.id).first();
    if (!(await verifierMotDePasse(String(d.actuel || ""), u.hash))) return erreur("Mot de passe actuel incorrect.", 403);
    if (String(d.nouveau || "").length < LONGUEUR_MIN_MDP)
      return erreur(`Le nouveau mot de passe doit faire au moins ${LONGUEUR_MIN_MDP} caractères.`);
    await db.prepare("UPDATE utilisateurs SET hash = ? WHERE id = ?").bind(await hacherMotDePasse(d.nouveau), moi.id).run();
    return json({ ok: true });
  }

  // --- Administration : réservée à l'administrateur.
  if (chemin.startsWith("/api/admin/")) {
    if (moi.role !== "admin") return erreur("Accès réservé à l'administrateur.", 403);

    // État du robot de collecte, affiché dans l'administration.
    if (chemin === "/api/admin/etat" && methode === "GET") {
      const ligne = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = 'collecte'").first();
      const totaux = await db
        .prepare("SELECT (SELECT COUNT(*) FROM articles) AS articles, (SELECT COUNT(*) FROM sujets WHERE nb_articles > 0) AS sujets")
        .first();
      let collecte = null;
      try { collecte = ligne ? { ...JSON.parse(ligne.valeur), recu_le: ligne.maj_le } : null; } catch {}
      return json({ collecte, totaux });
    }

    if (chemin === "/api/admin/utilisateurs" && methode === "GET") {
      const { results } = await db
        .prepare("SELECT id, email, nom, role, actif, cree_le, derniere_connexion FROM utilisateurs ORDER BY id")
        .all();
      return json(results);
    }

    if (chemin === "/api/admin/utilisateurs" && methode === "POST") {
      const d = await lireJson(request);
      const email = normaliserEmail(d.email);
      if (!emailValide(email)) return erreur("Adresse e-mail invalide.");
      if (!String(d.nom || "").trim()) return erreur("Indiquez le nom du collègue.");
      if (String(d.mot_de_passe || "").length < LONGUEUR_MIN_MDP)
        return erreur(`Le mot de passe provisoire doit faire au moins ${LONGUEUR_MIN_MDP} caractères.`);
      const existe = await db.prepare("SELECT id FROM utilisateurs WHERE email = ?").bind(email).first();
      if (existe) return erreur("Un compte existe déjà avec cette adresse.");
      await db
        .prepare("INSERT INTO utilisateurs (email, nom, hash, role, cree_le) VALUES (?, ?, ?, 'collegue', ?)")
        .bind(email, String(d.nom).trim(), await hacherMotDePasse(d.mot_de_passe), new Date().toISOString())
        .run();
      return json({ ok: true });
    }

    const m = chemin.match(/^\/api\/admin\/utilisateurs\/(\d+)\/(activer|desactiver|reinitialiser)$/);
    if (m && methode === "POST") {
      const id = Number(m[1]);
      const action = m[2];
      if (id === moi.id && action === "desactiver") return erreur("Vous ne pouvez pas désactiver votre propre compte.");
      const cible = await db.prepare("SELECT id FROM utilisateurs WHERE id = ?").bind(id).first();
      if (!cible) return erreur("Compte introuvable.", 404);
      if (action === "activer") {
        await db.prepare("UPDATE utilisateurs SET actif = 1 WHERE id = ?").bind(id).run();
      } else if (action === "desactiver") {
        await db.batch([
          db.prepare("UPDATE utilisateurs SET actif = 0 WHERE id = ?").bind(id),
          db.prepare("DELETE FROM sessions WHERE utilisateur_id = ?").bind(id),
        ]);
      } else {
        const d = await lireJson(request);
        if (String(d.mot_de_passe || "").length < LONGUEUR_MIN_MDP)
          return erreur(`Le mot de passe provisoire doit faire au moins ${LONGUEUR_MIN_MDP} caractères.`);
        await db.batch([
          db.prepare("UPDATE utilisateurs SET hash = ? WHERE id = ?").bind(await hacherMotDePasse(d.mot_de_passe), id),
          db.prepare("DELETE FROM sessions WHERE utilisateur_id = ?").bind(id),
        ]);
      }
      return json({ ok: true });
    }
  }

  return erreur("Adresse inconnue.", 404);
}

// ---------------------------------------------------------------- Pages
async function pages(request, env, url) {
  let chemin = url.pathname.replace(/\.html$/, "").replace(/\/index$/, "/");
  if (PAGES_PUBLIQUES.has(chemin)) return env.ASSETS.fetch(request);

  const moi = await utilisateurConnecte(request, env.DB);
  if (!moi) {
    // Aucun compte encore créé : on propose l'installation.
    const cible = (await nombreUtilisateurs(env.DB)) === 0 ? "/installation" : "/connexion";
    return Response.redirect(`${url.origin}${cible}`, 302);
  }
  if (chemin === "/admin" && moi.role !== "admin") return Response.redirect(`${url.origin}/`, 302);

  const r = await env.ASSETS.fetch(request);
  const protegee = new Response(r.body, r);
  protegee.headers.set("Cache-Control", "no-store");   // pages privées : jamais en cache partagé
  return protegee;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      const reponse = url.pathname.startsWith("/api/") ? await api(request, env, url) : await pages(request, env, url);
      return securiser(reponse);
    } catch (e) {
      console.error(e);
      return securiser(erreur("Erreur interne du serveur.", 500));
    }
  },
};
