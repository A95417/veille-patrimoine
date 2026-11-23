// Rubrique « Allocation » : assureurs, contrats (assurance-vie, PER), portefeuilles types et leurs fonds,
// avec les commentaires « Pourquoi ce choix » visibles par tous les utilisateurs du cabinet.
// Aucune donnée client ici : uniquement l'offre des assureurs et les choix du cabinet.

import { modeles, compterQuota } from "./linkedin.js";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);
const lire = async (r) => { try { return await r.json(); } catch { return {}; } };
const maintenant = () => new Date().toISOString();
const texte = (x, max) => String(x ?? "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const TYPES = ["av", "per"];

// ISIN : 2 lettres (pays), 9 caractères, 1 chiffre de contrôle (algorithme de Luhn sur les chiffres obtenus).
export function isinValide(isin) {
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) return false;
  const chiffres = isin.split("").map((c) => (/[0-9]/.test(c) ? c : String(c.charCodeAt(0) - 55))).join("");
  let somme = 0;
  for (let i = 0; i < chiffres.length; i++) {
    let n = Number(chiffres[chiffres.length - 1 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    somme += n;
  }
  return somme % 10 === 0;
}

async function arbre(db) {
  const [a, c, p, l, n] = await Promise.all([
    db.prepare("SELECT id, nom, site, logo, maj_par, maj_le FROM alloc_assureurs ORDER BY nom COLLATE NOCASE").all(),
    db.prepare("SELECT id, assureur_id, nom, type, maj_par, maj_le FROM alloc_contrats ORDER BY nom COLLATE NOCASE").all(),
    db.prepare("SELECT id, contrat_id, nom, profil, maj_par, maj_le FROM alloc_portefeuilles ORDER BY nom COLLATE NOCASE").all(),
    db.prepare("SELECT id, portefeuille_id, ordre, nom, isin, part, sfdr, risque FROM alloc_lignes ORDER BY portefeuille_id, ordre").all(),
    db.prepare("SELECT cible, COUNT(*) AS n FROM alloc_commentaires GROUP BY cible").all(),
  ]);
  return { assureurs: a.results, contrats: c.results, portefeuilles: p.results, lignes: l.results,
    commentaires: Object.fromEntries(n.results.map((x) => [x.cible, x.n])) };
}

const TABLES = {
  assureur: { table: "alloc_assureurs", parent: null },
  contrat: { table: "alloc_contrats", parent: ["assureur_id", "alloc_assureurs"] },
  portefeuille: { table: "alloc_portefeuilles", parent: ["contrat_id", "alloc_contrats"] },
};

// Suppression en cascade faite à la main (ne dépend pas des clés étrangères de la base).
async function supprimer(db, type, id) {
  const lots = [];
  const portefeuilles = async (ids) => {
    if (!ids.length) return;
    const q = ids.map(() => "?").join(",");
    lots.push(db.prepare(`DELETE FROM alloc_lignes WHERE portefeuille_id IN (${q})`).bind(...ids));
    lots.push(db.prepare(`DELETE FROM alloc_commentaires WHERE cible IN (${q})`).bind(...ids.map((i) => "p:" + i)));
    lots.push(db.prepare(`DELETE FROM alloc_portefeuilles WHERE id IN (${q})`).bind(...ids));
  };
  const contrats = async (ids) => {
    if (!ids.length) return;
    const q = ids.map(() => "?").join(",");
    const { results } = await db.prepare(`SELECT id FROM alloc_portefeuilles WHERE contrat_id IN (${q})`).bind(...ids).all();
    await portefeuilles(results.map((r) => r.id));
    lots.push(db.prepare(`DELETE FROM alloc_contrats WHERE id IN (${q})`).bind(...ids));
  };
  if (type === "portefeuille") await portefeuilles([id]);
  if (type === "contrat") await contrats([id]);
  if (type === "assureur") {
    const { results } = await db.prepare("SELECT id FROM alloc_contrats WHERE assureur_id = ?").bind(id).all();
    await contrats(results.map((r) => r.id));
    lots.push(db.prepare("DELETE FROM alloc_assureurs WHERE id = ?").bind(id));
  }
  if (lots.length) await db.batch(lots);
}

export async function routeAllocation(request, env, chemin, moi, url) {
  const db = env.DB, methode = request.method, qui = moi.nom || moi.identifiant || moi.email;

  if (chemin === "/api/allocation" && methode === "GET") return json(await arbre(db));

  // Création, modification, suppression d'un assureur, d'un contrat ou d'un portefeuille.
  let m = chemin.match(/^\/api\/allocation\/(assureur|contrat|portefeuille)(?:\/(\d+))?$/);
  if (m) {
    const T = TABLES[m[1]], id = m[2] ? Number(m[2]) : null, d = methode === "DELETE" ? {} : await lire(request);
    const nom = texte(d.nom, 120);
    if (methode === "DELETE" && id) { await supprimer(db, m[1], id); return json({ ok: true }); }
    if (!["POST", "PUT"].includes(methode)) return erreur("Action inconnue.", 405);
    if (!nom) return erreur("Le nom est obligatoire.");
    const champs = { nom };
    if (m[1] === "contrat") { if (d.type !== undefined || methode === "POST") { if (!TYPES.includes(d.type)) return erreur("Type de contrat invalide."); champs.type = d.type; } }
    if (m[1] === "portefeuille" && d.profil !== undefined) champs.profil = texte(d.profil, 40) || null;   // profil type ou libre (40 caractères)
    if (m[1] === "assureur") {
      if (d.site !== undefined) {
        const site = texte(d.site, 200).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
        if (site && !/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(site)) return erreur("Adresse du site invalide (exemple : assureur.fr).");
        champs.site = site || null;
      }
      if (d.logo !== undefined) {
        const logo = String(d.logo || "");
        if (logo && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logo) || logo.length > 200000)) return erreur("Logo invalide ou trop lourd.");
        champs.logo = logo || null;
      }
    }
    const t = maintenant();
    if (methode === "POST") {
      if (T.parent) {
        const pid = Number(d[T.parent[0]]);
        if (!Number.isInteger(pid) || !(await db.prepare(`SELECT 1 FROM ${T.parent[1]} WHERE id = ?`).bind(pid).first())) return erreur("Élément parent introuvable.", 404);
        champs[T.parent[0]] = pid;
      }
      const cols = Object.keys(champs);
      const r = await db.prepare(`INSERT INTO ${T.table} (${cols.join(", ")}, cree_par, cree_le, maj_par, maj_le) VALUES (${cols.map(() => "?").join(", ")}, ?, ?, ?, ?)`)
        .bind(...Object.values(champs), qui, t, qui, t).run();
      return json({ ok: true, id: r.meta.last_row_id });
    }
    if (!id) return erreur("Élément manquant.");
    const r = await db.prepare(`UPDATE ${T.table} SET ${Object.keys(champs).map((k) => k + " = ?").join(", ")}, maj_par = ?, maj_le = ? WHERE id = ?`)
      .bind(...Object.values(champs), qui, t, id).run();
    if (!r.meta.changes) return erreur("Élément introuvable.", 404);
    return json({ ok: true });
  }

  // Les fonds d'un portefeuille : la liste complète est remplacée à chaque enregistrement.
  m = chemin.match(/^\/api\/allocation\/portefeuille\/(\d+)\/lignes$/);
  if (m && methode === "PUT") {
    const id = Number(m[1]), d = await lire(request);
    if (!(await db.prepare("SELECT 1 FROM alloc_portefeuilles WHERE id = ?").bind(id).first())) return erreur("Portefeuille introuvable.", 404);
    if (!Array.isArray(d.lignes) || d.lignes.length > 80) return erreur("Liste de fonds invalide (80 au plus).");
    const lignes = [];
    for (const [i, l] of d.lignes.entries()) {
      const nom = texte(l.nom, 160), isin = texte(l.isin, 12).toUpperCase();
      const part = l.part === "" || l.part == null ? null : Number(String(l.part).replace(",", "."));
      if (!nom) return erreur(`Ligne ${i + 1} : le nom du fonds est obligatoire.`);
      if (isin && !isinValide(isin)) return erreur(`Ligne ${i + 1} : le code ISIN « ${isin} » n'est pas valide.`);
      if (part !== null && (!Number.isFinite(part) || part < 0 || part > 100)) return erreur(`Ligne ${i + 1} : le poids doit être compris entre 0 et 100 %.`);
      const sfdr = l.sfdr === "" || l.sfdr == null ? null : Number(l.sfdr), risque = l.risque === "" || l.risque == null ? null : Number(l.risque);
      if (sfdr !== null && ![6, 8, 9].includes(sfdr)) return erreur(`Ligne ${i + 1} : classement SFDR invalide (article 6, 8 ou 9).`);
      if (risque !== null && !(Number.isInteger(risque) && risque >= 1 && risque <= 7)) return erreur(`Ligne ${i + 1} : le risque doit être compris entre 1 et 7.`);
      lignes.push([nom, isin || null, part === null ? null : Math.round(part * 100) / 100, sfdr, risque]);
    }
    const total = lignes.reduce((s, l) => s + (l[2] || 0), 0);
    if (total > 100.005) return erreur(`Le total des poids dépasse 100 % (${String(Math.round(total * 100) / 100).replace(".", ",")} %).`);
    const t = maintenant();
    await db.batch([
      db.prepare("DELETE FROM alloc_lignes WHERE portefeuille_id = ?").bind(id),
      ...lignes.map((l, i) => db.prepare("INSERT INTO alloc_lignes (portefeuille_id, ordre, nom, isin, part, sfdr, risque) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, i, ...l)),
      db.prepare("UPDATE alloc_portefeuilles SET maj_par = ?, maj_le = ? WHERE id = ?").bind(qui, t, id),
    ]);
    return json({ ok: true });
  }

  // Lecture d'un document d'assureur par l'IA (Gemini), uniquement à la demande et après confirmation
  // qu'il ne contient aucune donnée client. Le fichier n'est pas conservé.
  if (chemin === "/api/allocation/lire" && methode === "POST") {
    if (!env.GEMINI_API_KEY) return erreur("L'IA n'est pas configurée sur le site.", 503);
    const d = await lire(request);
    if (d.sans_donnees_client !== true) return erreur("Confirmez d'abord que le document ne contient aucune donnée client.");
    const types = ["application/pdf", "image/jpeg", "image/png"];
    if (!types.includes(d.type)) return erreur("Format accepté : PDF, JPG ou PNG.");
    const b64 = String(d.donnees || "");
    if (!/^[A-Za-z0-9+/=]+$/.test(b64) || b64.length > 11_000_000) return erreur("Fichier illisible ou trop lourd (8 Mo au plus).");
    return json(await lireDocument(env, db, b64, d.type));
  }

  // « Pourquoi ce choix » : commentaires partagés.
  if (chemin === "/api/allocation/commentaires" && methode === "GET") {
    const cible = String(url.searchParams.get("cible") || "");
    if (!/^(p:\d+|f:[A-Z0-9]{12})$/.test(cible)) return erreur("Cible invalide.");
    const { results } = await db.prepare("SELECT id, texte, auteur_id, auteur_nom, cree_le, maj_le FROM alloc_commentaires WHERE cible = ? ORDER BY cree_le").bind(cible).all();
    return json({ commentaires: results.map((c) => ({ ...c, a_moi: c.auteur_id === moi.id })) });
  }
  if (chemin === "/api/allocation/commentaires" && methode === "POST") {
    const d = await lire(request), cible = String(d.cible || ""), t = String(d.texte ?? "").trim().slice(0, 3000);
    if (!/^(p:\d+|f:[A-Z0-9]{12})$/.test(cible)) return erreur("Cible invalide.");
    if (!t) return erreur("Le commentaire est vide.");
    const h = maintenant();
    const r = await db.prepare("INSERT INTO alloc_commentaires (cible, texte, auteur_id, auteur_nom, cree_le, maj_le) VALUES (?, ?, ?, ?, ?, ?)").bind(cible, t, moi.id, qui, h, h).run();
    return json({ ok: true, id: r.meta.last_row_id });
  }
  m = chemin.match(/^\/api\/allocation\/commentaires\/(\d+)$/);
  if (m && (methode === "PUT" || methode === "DELETE")) {
    const c = await db.prepare("SELECT auteur_id FROM alloc_commentaires WHERE id = ?").bind(Number(m[1])).first();
    if (!c) return erreur("Commentaire introuvable.", 404);
    if (c.auteur_id !== moi.id && moi.role !== "admin") return erreur("Seul son auteur peut modifier ce commentaire.", 403);
    if (methode === "DELETE") { await db.prepare("DELETE FROM alloc_commentaires WHERE id = ?").bind(Number(m[1])).run(); return json({ ok: true }); }
    const t = String((await lire(request)).texte ?? "").trim().slice(0, 3000);
    if (!t) return erreur("Le commentaire est vide.");
    await db.prepare("UPDATE alloc_commentaires SET texte = ?, maj_le = ? WHERE id = ?").bind(t, maintenant(), Number(m[1])).run();
    return json({ ok: true });
  }
  return null;
}

// ---------------------------------------------------------------- Lecture d'un document par Gemini
const CONSIGNES_LECTURE = `Tu lis un document d'assureur ou de société de gestion (liste de supports, allocation, fiche de contrat).
Relève uniquement les fonds (unités de compte, OPCVM, ETF, SCPI, fonds en euros) qui y figurent, avec :
- nom : le nom du fonds tel qu'il est écrit ;
- isin : le code ISIN exactement tel qu'il est écrit (12 caractères), ou une chaîne vide s'il n'y en a pas ;
- part : le pourcentage d'allocation (poids) s'il est écrit pour ce fonds, sinon null ;
- sfdr : 6, 8 ou 9 si le classement SFDR (article 6, 8 ou 9) est écrit pour ce fonds, sinon null ;
- risque : l'indicateur de risque SRI (1 à 7) s'il est écrit pour ce fonds, sinon null.
N'invente rien : si une information n'est pas écrite, laisse-la vide. Ne recopie jamais de nom de personne, d'adresse, de numéro de contrat ou de montant personnel.`;
const SCHEMA_LECTURE = { type: "OBJECT", properties: { fonds: { type: "ARRAY", items: { type: "OBJECT",
  properties: { nom: { type: "STRING" }, isin: { type: "STRING" }, part: { type: "NUMBER", nullable: true }, sfdr: { type: "INTEGER", nullable: true }, risque: { type: "INTEGER", nullable: true } }, required: ["nom", "isin"] } } }, required: ["fonds"] };

async function lireDocument(env, db, b64, type) {
  let liste;
  try { const m = await modeles(env, db); liste = [m.fort, m.lite].filter(Boolean); } catch (e) { return { erreur: "IA indisponible : " + e.message }; }
  for (const modele of liste) {
    await compterQuota(db, modele);
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`, {
        method: "POST", signal: AbortSignal.timeout(60000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CONSIGNES_LECTURE }] },
          contents: [{ role: "user", parts: [{ inline_data: { mime_type: type, data: b64 } }, { text: "Liste les fonds de ce document." }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: SCHEMA_LECTURE, maxOutputTokens: 8192 },
        }),
      });
    } catch { continue; }
    if (r.status === 429 || r.status >= 500) continue;
    if (!r.ok) return { erreur: `L'IA a refusé le document (HTTP ${r.status}).` };
    const t = (await r.json()).candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    let d; try { d = JSON.parse(t); } catch { continue; }
    const fonds = (Array.isArray(d.fonds) ? d.fonds : []).slice(0, 120).map((f) => {
      const isin = texte(f.isin, 20).toUpperCase().replace(/\s/g, "");
      const part = Number.isFinite(f.part) && f.part >= 0 && f.part <= 100 ? Math.round(f.part * 100) / 100 : null;
      const sfdr = [6, 8, 9].includes(f.sfdr) ? f.sfdr : null, risque = Number.isInteger(f.risque) && f.risque >= 1 && f.risque <= 7 ? f.risque : null;
      return { nom: texte(f.nom, 160), isin, part, sfdr, risque, isin_ok: !isin || isinValide(isin) };
    }).filter((f) => f.nom);
    return { fonds, modele };
  }
  return { erreur: "Le quota gratuit de l'IA est atteint pour aujourd'hui, ou le service ne répond pas. Réessayez plus tard." };
}
