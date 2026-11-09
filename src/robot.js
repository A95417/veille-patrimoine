// Adresses réservées au robot de collecte (GitHub Actions).
// Protégées par un jeton secret (ROBOT_TOKEN) : personne d'autre ne peut écrire dans la base.

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const RETENTION_JOURS = 90;          // 3 mois d'historique
const PARAMS_MAX = 90;               // D1 accepte au plus 100 valeurs par requête

function morceaux(liste, taille) {
  const r = [];
  for (let i = 0; i < liste.length; i += taille) r.push(liste.slice(i, i + taille));
  return r;
}

async function jetonValide(request, env) {
  if (!env.ROBOT_TOKEN) return false;
  const recu = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const a = new TextEncoder().encode(recu);
  const b = new TextEncoder().encode(env.ROBOT_TOKEN);
  if (a.length !== b.length) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

const court = (t, n) => (t == null ? null : String(t).slice(0, n));

export async function routeRobot(request, env, chemin) {
  if (!(await jetonValide(request, env))) return json({ erreur: "Accès refusé." }, 403);
  const db = env.DB;
  const corps = request.method === "POST" ? await request.json().catch(() => ({})) : {};

  // 1) Parmi ces empreintes, lesquelles sont déjà en base ?
  if (chemin === "/api/robot/connus" && request.method === "POST") {
    const empreintes = (corps.empreintes || []).filter((e) => typeof e === "string");
    const connus = [];
    for (const lot of morceaux(empreintes, PARAMS_MAX)) {
      const { results } = await db
        .prepare(`SELECT empreinte FROM articles WHERE empreinte IN (${lot.map(() => "?").join(",")})`)
        .bind(...lot)
        .all();
      for (const r of results) connus.push(r.empreinte);
    }
    return json({ connus });
  }

  // 2) Sujets récents (48 h) : sert au regroupement des doublons.
  if (chemin === "/api/robot/sujets-recents" && request.method === "GET") {
    const depuis = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { results } = await db
      .prepare("SELECT id, titre FROM sujets WHERE derniere_pub >= ? ORDER BY derniere_pub DESC LIMIT 1500")
      .bind(depuis)
      .all();
    return json({ sujets: results });
  }

  // 3) Enregistrer les nouveaux sujets et articles.
  if (chemin === "/api/robot/ingerer" && request.method === "POST") {
    const maintenant = new Date().toISOString();
    const nouveaux = corps.sujets_nouveaux || [];
    const articles = corps.articles || [];
    const ordres = [];
    for (const s of nouveaux) {
      ordres.push(
        db.prepare("INSERT OR IGNORE INTO sujets (id, titre, cree_le, derniere_pub, nb_articles) VALUES (?, ?, ?, ?, 0)")
          .bind(court(s.id, 64), court(s.titre, 500), maintenant, s.derniere_pub || maintenant)
      );
    }
    for (const a of articles) {
      ordres.push(
        db.prepare(
          `INSERT OR IGNORE INTO articles (empreinte, sujet_id, source_id, source_nom, groupe, langue, titre, lien, extrait, publie_le, collecte_le)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(court(a.empreinte, 64), court(a.sujet_id, 64), court(a.source_id, 64), court(a.source_nom, 120), court(a.groupe, 20),
          court(a.langue || "fr", 5), court(a.titre, 500), court(a.lien, 1000), court(a.extrait, 3000), a.publie_le || maintenant, maintenant)
      );
    }
    // Mise à jour des compteurs et de la date la plus récente de chaque sujet touché.
    const touches = [...new Set(articles.map((a) => a.sujet_id))];
    for (const id of touches) {
      ordres.push(
        db.prepare(
          `UPDATE sujets SET nb_articles = (SELECT COUNT(*) FROM articles WHERE sujet_id = ?1),
             derniere_pub = COALESCE((SELECT MAX(publie_le) FROM articles WHERE sujet_id = ?1), derniere_pub)
           WHERE id = ?1`
        ).bind(id)
      );
    }
    for (const lot of morceaux(ordres, 80)) await db.batch(lot);
    return json({ ok: true, sujets: nouveaux.length, articles: articles.length });
  }

  // 4) Nettoyage : on ne garde que 3 mois.
  if (chemin === "/api/robot/nettoyer" && request.method === "POST") {
    const limite = new Date(Date.now() - RETENTION_JOURS * 86400 * 1000).toISOString();
    const r1 = await db.prepare("DELETE FROM articles WHERE publie_le < ?").bind(limite).run();
    const r2 = await db.prepare("DELETE FROM sujets WHERE id NOT IN (SELECT DISTINCT sujet_id FROM articles)").run();
    return json({ ok: true, articles_supprimes: r1.meta.changes, sujets_supprimes: r2.meta.changes });
  }

  // 5) Le robot note l'état de sa dernière collecte (affiché dans l'administration).
  if (chemin === "/api/robot/etat" && request.method === "POST") {
    await db.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES ('collecte', ?, ?)")
      .bind(JSON.stringify(corps).slice(0, 20000), new Date().toISOString()).run();
    return json({ ok: true });
  }

  return json({ erreur: "Adresse inconnue." }, 404);
}
