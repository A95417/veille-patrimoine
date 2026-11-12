import { routeLinkedin } from "./linkedin.js";
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
    const connus = [], sansImage = [];
    for (const lot of morceaux(empreintes, PARAMS_MAX)) {
      const { results } = await db
        .prepare(`SELECT empreinte, image IS NULL AS sans_image FROM articles WHERE empreinte IN (${lot.map(() => "?").join(",")})`)
        .bind(...lot)
        .all();
      for (const r of results) { connus.push(r.empreinte); if (r.sans_image) sansImage.push(r.empreinte); }
    }
    return json({ connus, sans_image: sansImage });
  }

  // 1 bis) Images ajoutées après coup à des articles déjà connus (adresse fournie par le flux de l'éditeur).
  if (chemin === "/api/robot/images" && request.method === "POST") {
    const images = (corps.images || []).filter((i) => typeof i.empreinte === "string" && /^https:\/\//.test(i.image || "")).slice(0, 500);
    if (images.length) await db.batch(images.map((i) =>
      db.prepare("UPDATE articles SET image = ? WHERE empreinte = ? AND image IS NULL").bind(court(i.image, 1000), court(i.empreinte, 64))));
    return json({ ok: true, images: images.length });
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
          `INSERT OR IGNORE INTO articles (empreinte, sujet_id, source_id, source_nom, groupe, langue, titre, lien, extrait, publie_le, collecte_le, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(court(a.empreinte, 64), court(a.sujet_id, 64), court(a.source_id, 64), court(a.source_nom, 120), court(a.groupe, 20),
          court(a.langue || "fr", 5), court(a.titre, 500), court(a.lien, 1000), court(a.extrait, 3000), a.publie_le || maintenant, maintenant,
          /^https:\/\//.test(a.image || "") ? court(a.image, 1000) : null)
      );
      ordres.push(db.prepare("INSERT INTO recherche (sujet_id, contenu) VALUES (?, ?)")
        .bind(court(a.sujet_id, 64), `${court(a.titre, 500)} ${court(a.extrait, 3000) || ""}`));
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
    await db.prepare("DELETE FROM recherche WHERE sujet_id NOT IN (SELECT id FROM sujets)").run();
    await db.prepare("DELETE FROM favoris WHERE sujet_id NOT IN (SELECT id FROM sujets)").run();
    return json({ ok: true, articles_supprimes: r1.meta.changes, sujets_supprimes: r2.meta.changes });
  }

  // 5) Le robot note l'état de sa dernière collecte (affiché dans l'administration).
  if (chemin === "/api/robot/etat" && request.method === "POST") {
    await db.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES ('collecte', ?, ?)")
      .bind(JSON.stringify(corps).slice(0, 20000), new Date().toISOString()).run();
    return json({ ok: true });
  }

  // Version audio d'un brief (MP3 en base64, produit par le robot).
  if (chemin === "/api/robot/brief/audio" && request.method === "POST") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(corps.jour || "") || typeof corps.donnees !== "string" || corps.donnees.length > 1900000
        || !/^audio\/(mpeg|mp4|ogg|wav)$/.test(corps.mime || "")) return json({ erreur: "Audio invalide." }, 400);
    await db.prepare("INSERT OR REPLACE INTO brief_audio (jour, edition, mime, donnees, duree, cree_le) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(corps.jour, corps.edition === "soir" ? "soir" : "matin", corps.mime, corps.donnees, Number(corps.duree) || null, new Date().toISOString()).run();
    await db.prepare("DELETE FROM brief_audio WHERE jour < ?").bind(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)).run();
    return json({ ok: true });
  }
  // Brief le plus récent (pour produire sa version audio après coup).
  if (chemin === "/api/robot/brief/dernier" && request.method === "GET") {
    const b = await db.prepare("SELECT jour, edition, contenu FROM briefs ORDER BY jour DESC, edition = 'soir' DESC LIMIT 1").first();
    let contenu = null;
    try { contenu = b ? JSON.parse(b.contenu) : null; } catch {}
    const audio = b ? await db.prepare("SELECT 1 AS x FROM brief_audio WHERE jour = ? AND edition = ?").bind(b.jour, b.edition).first() : null;
    return json({ brief: b ? { ...contenu, jour: b.jour, edition: b.edition } : null, audio: !!audio });
  }

  // 5 bis) Date du dernier relevé de clôture (le robot ne le refait pas plusieurs fois le même matin).
  if (chemin === "/api/robot/marches/cloture" && request.method === "GET") {
    const l = await db.prepare("SELECT maj_le FROM etat WHERE cle = 'marches_cloture'").first();
    return json({ maj_le: l ? l.maj_le : null });
  }

  // 5 bis) Relevé des marchés (séance de New York) ou clôtures du matin (pour le brief).
  if (chemin === "/api/robot/marches" && request.method === "POST") {
    const cle = { cloture: "marches_cloture", indices: "marches_direct", autres: "marches_autres" }[corps.type];
    if (!cle) return json({ erreur: "Type de relevé inconnu." }, 400);
    await db.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES (?, ?, ?)")
      .bind(cle, JSON.stringify(corps).slice(0, 20000), new Date().toISOString()).run();
    // Les clôtures du matin alimentent aussi l'historique (mini-courbes sur 30 jours).
    if (corps.type === "cloture") await ajouterHistorique(db, [...(corps.valeurs || []), ...(corps.autres || [])]
      .map((v) => ({ symbole: v.symbole, jour: String(v.date || "").slice(0, 10), cours: v.cours_local ?? v.cours })));
    return json({ ok: true });
  }

  // 5 ter) Rattrapage de l'historique des cours (lancé une fois à la main).
  if (chemin === "/api/robot/marches/historique" && request.method === "POST") {
    const n = await ajouterHistorique(db, corps.points || []);
    return json({ ok: true, points: n });
  }

  // ------------------------------------------------------------ Brief matinal (étape 7)

  // 9) Données du brief : sujets majeurs des dernières 24 h + clôtures relevées le matin.
  if (chemin === "/api/robot/brief/donnees" && request.method === "GET") {
    const u = new URL(request.url).searchParams;
    const jour = u.get("jour") || "";
    const edition = u.get("edition") === "soir" ? "soir" : "matin";
    const existe = await db.prepare("SELECT 1 AS x FROM briefs WHERE jour = ? AND edition = ?").bind(jour, edition).first();
    // Matin : les dernières 24 heures. Soir : depuis 7 h ce matin (date fournie par le robot).
    const depuisDemande = u.get("depuis");
    const depuis = depuisDemande && !isNaN(new Date(depuisDemande)) ? new Date(depuisDemande).toISOString()
      : new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { results: sujets } = await db
      .prepare(`SELECT id, titre, titre_fr, importance, categories, resume_court, resume_detail, nb_articles, derniere_pub
                  FROM sujets WHERE derniere_pub >= ? AND importance >= 2 AND nb_articles > 0
                 ORDER BY importance DESC, nb_articles DESC, derniere_pub DESC LIMIT 25`)
      .bind(depuis).all();
    for (const lot of morceaux(sujets, PARAMS_MAX)) {
      if (!lot.length) continue;
      const { results } = await db
        .prepare(`SELECT sujet_id, source_nom, lien, publie_le FROM articles WHERE sujet_id IN (${lot.map(() => "?").join(",")}) ORDER BY publie_le DESC`)
        .bind(...lot.map((s) => s.id)).all();
      for (const s of lot) s.sources = results.filter((a) => a.sujet_id === s.id).map(({ sujet_id, ...a }) => a);
    }
    const lireEtat = async (cle) => {
      const l = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = ?").bind(cle).first();
      try { return l ? { ...JSON.parse(l.valeur), maj_le: l.maj_le } : null; } catch { return null; }
    };
    const marches = await lireEtat("marches_cloture");
    // Pour le soir : la séance du jour (indices et autres marchés relevés pendant la séance de New York).
    const direct = edition === "soir" ? await lireEtat("marches_direct") : null;
    const autres = edition === "soir" ? await lireEtat("marches_autres") : null;
    // Chiffres du jour des 3 briefs précédents (pour ne pas reprendre le même).
    const { results: precedents } = await db
      .prepare("SELECT contenu FROM briefs WHERE NOT (jour = ? AND edition = ?) ORDER BY jour DESC, edition = 'soir' DESC LIMIT 3")
      .bind(jour, edition).all();
    const chiffres_precedents = precedents.map((r) => { try { return JSON.parse(r.contenu).chiffre_du_jour; } catch { return null; } }).filter(Boolean);
    return json({ jour, edition, existe: !!existe, sujets, marches, direct, autres, chiffres_precedents });
  }

  // 10) Enregistrer le brief du jour ; on ne garde que 3 mois d'historique.
  if (chemin === "/api/robot/brief" && request.method === "POST") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(corps.jour || "")) return json({ erreur: "Jour invalide." }, 400);
    const edition = corps.edition === "soir" ? "soir" : "matin";
    await db.batch([
      db.prepare("INSERT OR REPLACE INTO briefs (jour, edition, contenu, cree_le) VALUES (?, ?, ?, ?)")
        .bind(corps.jour, edition, JSON.stringify(corps.contenu).slice(0, 60000), new Date().toISOString()),
      db.prepare("DELETE FROM briefs WHERE jour < ?").bind(new Date(Date.now() - 92 * 86400000).toISOString().slice(0, 10)),
    ]);
    return json({ ok: true });
  }

  // ------------------------------------------------------------ IA (étape 4)

  // 6) Travail à faire : sujets à classer, puis sujets importants à résumer en détail.
  if (chemin === "/api/robot/ia/travail" && request.method === "GET") {
    const u = new URL(request.url);
    const nbTri = Math.min(Number(u.searchParams.get("tri")) || 36, 120);
    const nbDetail = Math.min(Number(u.searchParams.get("detail")) || 10, 40);
    const { results: aTrier } = await db
      .prepare(`SELECT id, titre, derniere_pub FROM sujets WHERE ia_statut = 'a_faire' AND nb_articles > 0 AND ia_essais < 3
                ORDER BY derniere_pub DESC LIMIT ?`).bind(nbTri).all();
    const { results: aDetailler } = await db
      .prepare(`SELECT id, titre, derniere_pub, importance FROM sujets WHERE ia_statut = 'a_detailler' AND ia_essais < 3
                ORDER BY importance DESC, derniere_pub DESC LIMIT ?`).bind(nbDetail).all();
    const tous = [...aTrier, ...aDetailler];
    if (tous.length) {
      for (const lot of morceaux(tous, PARAMS_MAX)) {
        const { results } = await db
          .prepare(`SELECT sujet_id, source_nom, groupe, langue, titre, lien, extrait, publie_le FROM articles
                     WHERE sujet_id IN (${lot.map(() => "?").join(",")}) ORDER BY publie_le`)
          .bind(...lot.map((s) => s.id)).all();
        for (const s of lot) s.articles = results.filter((a) => a.sujet_id === s.id).map(({ sujet_id, ...a }) => a);
      }
    }
    return json({ a_trier: aTrier, a_detailler: aDetailler });
  }

  // 7) Résultats de l'IA.
  if (chemin === "/api/robot/ia/resultats" && request.method === "POST") {
    const maintenant = new Date().toISOString();
    const ordres = [];
    for (const t of corps.tri || []) {
      const imp = Math.max(1, Math.min(5, Math.round(Number(t.importance) || 1)));
      const cats = [...new Set((t.categories || []).map((c) => String(c).slice(0, 80)))].slice(0, 4);
      ordres.push(db.prepare(
        `UPDATE sujets SET importance = ?, categories = ?, titre_fr = ?, resume_court = ?, ia_statut = ?, ia_modele = ?, ia_le = ?,
                resume_detail = CASE WHEN ? >= 3 THEN resume_detail ELSE NULL END WHERE id = ?`
      ).bind(imp, JSON.stringify(cats), court(t.titre_fr, 500), court(t.resume_court, 1500), imp >= 3 ? "a_detailler" : "court",
        court(t.modele, 60), maintenant, imp, t.id));
      ordres.push(db.prepare("INSERT INTO recherche (sujet_id, contenu) VALUES (?, ?)")
        .bind(t.id, `${court(t.titre_fr, 500) || ""} ${court(t.resume_court, 1500) || ""}`));
      ordres.push(db.prepare("DELETE FROM sujet_categories WHERE sujet_id = ?").bind(t.id));
      for (const c of cats) ordres.push(db.prepare("INSERT OR IGNORE INTO sujet_categories (sujet_id, categorie) VALUES (?, ?)").bind(t.id, c));
    }
    for (const d of corps.details || []) {
      ordres.push(db.prepare(`UPDATE sujets SET resume_detail = ?, ia_statut = 'detail', ia_modele = ?, ia_le = ? WHERE id = ?`)
        .bind(JSON.stringify(d.resume_detail).slice(0, 12000), court(d.modele, 60), maintenant, d.id));
    }
    for (const id of corps.echecs || []) {
      ordres.push(db.prepare("UPDATE sujets SET ia_essais = ia_essais + 1 WHERE id = ?").bind(id));
    }
    for (const lot of morceaux(ordres, 80)) await db.batch(lot);
    return json({ ok: true });
  }

  // 7 bis) Contrôle de la rubrique LinkedIn (idées + une rédaction d'essai), pour les vérifications automatiques.
  if (chemin === "/api/robot/linkedin/essai" && request.method === "POST") {
    await db.prepare("DELETE FROM etat WHERE cle IN ('linkedin_idees_erreur', 'linkedin_idees')").run();   // essai : on force un nouveau calcul
    const base = "https://site.local";
    const idees = await (await routeLinkedin(new Request(base + "/api/linkedin/sujets"), env, "/api/linkedin/sujets", null)).json();
    let post = null;
    if (corps.rediger && idees.sujets?.length) {
      const sujet = idees.idees?.[0]?.sujet_id || idees.sujets[0].id;
      post = await (await routeLinkedin(new Request(base + "/api/linkedin/rediger", { method: "POST", body: JSON.stringify({ sujet_id: sujet, approche: idees.idees?.[0]?.approche || "decryptage", ton: "sobre", longueur: "court" }) }),
        env, "/api/linkedin/rediger", null)).json();
    }
    const diag = await db.prepare("SELECT valeur FROM etat WHERE cle = 'linkedin_idees_erreur'").first();
    return json({ diagnostic: diag?.valeur || null, nb_idees: idees.idees?.filter((i) => !i.simple).length || 0, nb_sujets: idees.sujets?.length || 0, ia: idees.ia, idees: idees.idees?.map((i) => i.titre), post });
  }

  // 8) Compteur de requêtes IA du jour (remis à zéro à minuit, heure de Californie, comme chez Google).
  if (chemin === "/api/robot/ia/quota") {
    const jour = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    const ligne = await db.prepare("SELECT valeur FROM etat WHERE cle = 'ia_quota'").first();
    let q = { jour, compteurs: {} };
    try { const lu = JSON.parse(ligne?.valeur || "{}"); if (lu.jour === jour) q = lu; } catch {}
    if (request.method === "POST") {
      for (const [modele, n] of Object.entries(corps.ajouts || {})) q.compteurs[modele] = (q.compteurs[modele] || 0) + Number(n || 0);
      await db.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES ('ia_quota', ?, ?)")
        .bind(JSON.stringify(q), new Date().toISOString()).run();
    }
    return json(q);
  }

  return json({ erreur: "Adresse inconnue." }, 404);
}

// Enregistre des points { symbole, jour, cours } et efface ceux de plus de 120 jours.
async function ajouterHistorique(db, points) {
  const valides = points.filter((p) => p.symbole && /^\d{4}-\d{2}-\d{2}$/.test(p.jour) && typeof p.cours === "number" && isFinite(p.cours));
  if (!valides.length) return 0;
  const requete = db.prepare("INSERT OR REPLACE INTO historique_marches (symbole, jour, cours) VALUES (?, ?, ?)");
  await db.batch([
    ...valides.map((p) => requete.bind(String(p.symbole).slice(0, 20), p.jour, p.cours)),
    db.prepare("DELETE FROM historique_marches WHERE jour < ?").bind(new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10)),
  ]);
  return valides.length;
}
