// Point d'entrée du site (le "serveur").
// Chaque visite passe ici : on vérifie la connexion avant d'afficher une page.

import {
  hacherMotDePasse, verifierMotDePasse, creerSession, utilisateurConnecte,
  supprimerSession, cookieSession, NOM_COOKIE, LONGUEUR_MIN_MDP,
  tropDeTentatives, noterTentative, effacerTentatives,
} from "./auth.js";
import { routeRobot } from "./robot.js";
import { routeLecture, avecArticles, COLONNES } from "./lecture.js";

// Pages et fichiers visibles sans être connecté.
const PAGES_PUBLIQUES = new Set(["/connexion", "/installation", "/style.css", "/commun.js", "/favicon.ico",
  "/manifest.webmanifest", "/icone-192.png", "/icone-512.png", "/apple-touch-icon.png", "/icone.svg"]);

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

  // Version audio d'un brief (MP3). Gère les demandes partielles (Range), indispensables à Safari sur iPhone.
  if (chemin === "/api/brief/audio" && methode === "GET") {
    const ligne = await db.prepare("SELECT mime, donnees FROM brief_audio WHERE jour = ? AND edition = ?")
      .bind(url.searchParams.get("jour") || "", url.searchParams.get("edition") === "soir" ? "soir" : "matin").first();
    if (!ligne) return erreur("Pas de version audio pour ce brief.", 404);
    const binaire = atob(ligne.donnees);
    const octets = new Uint8Array(binaire.length);
    for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
    const entetes = { "Content-Type": ligne.mime, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400" };
    const plage = /bytes=(\d*)-(\d*)/.exec(request.headers.get("Range") || "");
    if (plage) {
      const debut = plage[1] ? Number(plage[1]) : Math.max(0, octets.length - Number(plage[2]));
      const fin = plage[1] && plage[2] ? Math.min(Number(plage[2]), octets.length - 1) : octets.length - 1;
      if (debut >= octets.length || debut > fin) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${octets.length}` } });
      return new Response(octets.slice(debut, fin + 1), { status: 206, headers: { ...entetes, "Content-Range": `bytes ${debut}-${fin}/${octets.length}` } });
    }
    return new Response(octets, { headers: entetes });
  }

  // Actualités : fil filtrable, « À la une », détail d'un sujet, listes des filtres (voir lecture.js).
  if (methode === "GET") {
    const r = await routeLecture(chemin, url, db);
    if (r) return r;
  }

  // « Ma sélection » : sujets mis de côté par l'utilisateur connecté.
  if (chemin === "/api/favoris" && methode === "GET") {
    const { results } = await db.prepare("SELECT sujet_id FROM favoris WHERE utilisateur_id = ?").bind(moi.id).all();
    return json({ ids: results.map((r) => r.sujet_id) });
  }
  if (chemin === "/api/favoris" && methode === "POST") {
    const d = await lireJson(request);
    const id = String(d.sujet_id || "").slice(0, 64);
    if (!id) return erreur("Sujet manquant.");
    if (d.actif) {
      const existe = await db.prepare("SELECT 1 FROM sujets WHERE id = ?").bind(id).first();
      if (!existe) return erreur("Ce sujet n'existe plus.", 404);
      const n = await db.prepare("SELECT COUNT(*) AS n FROM favoris WHERE utilisateur_id = ?").bind(moi.id).first();
      if (n.n >= 300) return erreur("Votre sélection est pleine (300 sujets) : retirez-en quelques-uns.");
      await db.prepare("INSERT OR IGNORE INTO favoris (utilisateur_id, sujet_id, cree_le) VALUES (?, ?, ?)").bind(moi.id, id, new Date().toISOString()).run();
    } else {
      await db.prepare("DELETE FROM favoris WHERE utilisateur_id = ? AND sujet_id = ?").bind(moi.id, id).run();
    }
    return json({ ok: true });
  }
  if (chemin === "/api/selection" && methode === "GET") {
    const { results } = await db
      .prepare(`SELECT ${COLONNES}, f.cree_le AS mis_de_cote_le FROM favoris f JOIN sujets s ON s.id = f.sujet_id
                 WHERE f.utilisateur_id = ? ORDER BY f.cree_le DESC LIMIT 300`)
      .bind(moi.id).all();
    return json({ sujets: await avecArticles(db, results) });
  }

  // Apprendre : meilleurs scores de l'utilisateur à chaque jeu.
  if (chemin === "/api/progression" && methode === "GET") {
    const { results } = await db.prepare("SELECT cle, score, total, essais, maj_le FROM progression WHERE utilisateur_id = ?").bind(moi.id).all();
    return json({ scores: Object.fromEntries(results.map(({ cle, ...r }) => [cle, r])) });
  }
  if (chemin === "/api/progression" && methode === "POST") {
    const d = await lireJson(request);
    const cle = String(d.cle || "");
    const total = Math.floor(Number(d.total)), score = Math.floor(Number(d.score));
    if (!/^[a-z0-9:_-]{1,80}$/.test(cle) || !(total > 0 && total <= 100) || !(score >= 0 && score <= total)) return erreur("Score invalide.");
    await db.prepare(`INSERT INTO progression (utilisateur_id, cle, score, total, essais, maj_le) VALUES (?, ?, ?, ?, 1, ?)
        ON CONFLICT (utilisateur_id, cle) DO UPDATE SET
          score = CASE WHEN excluded.score * 1.0 / excluded.total >= progression.score * 1.0 / progression.total THEN excluded.score ELSE progression.score END,
          total = CASE WHEN excluded.score * 1.0 / excluded.total >= progression.score * 1.0 / progression.total THEN excluded.total ELSE progression.total END,
          essais = progression.essais + 1, maj_le = excluded.maj_le`)
      .bind(moi.id, cle, score, total, new Date().toISOString()).run();
    return json({ ok: true });
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
      const d = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = 'declencheur'").first();
      let declencheur = null;
      try { declencheur = d ? { ...JSON.parse(d.valeur), le: d.maj_le } : null; } catch {}
      return json({ collecte, totaux, declencheur });
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

// Déclencheur fiable : toutes les 15 minutes, Cloudflare demande à GitHub de lancer le robot de collecte
// (le minuteur gratuit de GitHub saute souvent des passages). Jeton GitHub limité au lancement du robot.
const DEPOT = "A95417/veille-patrimoine";
async function declencherRobot(env) {
  let etat;
  if (!env.GH_DISPATCH_TOKEN) {
    etat = { ok: false, message: "jeton GitHub absent (secret GH_DISPATCH_TOKEN)" };
  } else {
    try {
      const r = await fetch(`https://api.github.com/repos/${DEPOT}/actions/workflows/collecte.yml/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "veille-patrimoine-declencheur",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      });
      etat = r.status === 204
        ? { ok: true, message: "robot lancé" }
        : { ok: false, message: `GitHub a répondu ${r.status}${r.status === 401 ? " (jeton expiré ou révoqué)" : r.status === 403 || r.status === 404 ? " (droits du jeton insuffisants)" : ""}` };
    } catch (e) {
      etat = { ok: false, message: "GitHub injoignable : " + e.message };
    }
  }
  await env.DB.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES ('declencheur', ?, ?)")
    .bind(JSON.stringify(etat), new Date().toISOString()).run();
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(declencherRobot(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      const reponse = url.pathname.startsWith("/api/") ? await api(request, env, url) : await pages(request, env, url);
      return securiser(reponse);
    } catch (e) {
      console.error(e);
      // Pour le robot (routes protégées par jeton), on renvoie le détail : il apparaît dans les journaux GitHub.
      if (url.pathname.startsWith("/api/robot/")) return securiser(erreur("Erreur interne : " + String(e && e.message || e).slice(0, 300), 500));
      return securiser(erreur("Erreur interne du serveur.", 500));
    }
  },
};
