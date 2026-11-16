// Apprendre › Vidéos : une vidéo de cours par fiche, fabriquée la nuit par le robot GitHub (voix gratuite non utilisée)
// et rangée dans les fichiers joints du dépôt GitHub (gratuit). Le site lit la vidéo à travers lui-même :
// la page reste derrière la connexion, et le lecteur reçoit le bon type de fichier (lecture sur iPhone).
import { nettoyerTout } from "./texte.js";
import { lireEtat, ecrireEtat } from "./linkedin.js";
import { voixRestantes } from "./video.js";

const DEPOT = "A95417/veille-patrimoine", ETIQUETTE = "cours-videos";
const json = (d, s = 200) => new Response(JSON.stringify(nettoyerTout(d)), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);
const idOk = (x) => /^[a-z0-9-]{2,60}$/.test(String(x || ""));
const court = (s, n) => String(s ?? "").trim().slice(0, n);
const liste = async (db, cle) => ((await lireEtat(db, cle))?.valeur || []).filter(idOk);

async function etatCours(db) {
  return { videos: (await lireEtat(db, "cours_videos"))?.valeur || {}, priorite: await liste(db, "cours_priorite"), refaire: await liste(db, "cours_refaire"),
    erreurs: (await lireEtat(db, "cours_erreurs"))?.valeur || {} };
}
const fichier = (id, ext, v) => `https://github.com/${DEPOT}/releases/download/${ETIQUETTE}/${id}${v ? "-" + v : ""}.${ext}`;

// ---------------------------------------------------------------- pages du site (utilisateur connecté)
export async function routeCours(request, env, chemin, moi) {
  const db = env.DB, methode = request.method;
  const lire = async () => { try { return await request.json(); } catch { return {}; } };

  if (chemin === "/api/cours" && methode === "GET") {
    const e = await etatCours(db);
    return json({ ...e, erreurs: moi.role === "admin" ? e.erreurs : {}, admin: moi.role === "admin" });
  }
  // Ordre de fabrication : les fiches choisies passent en premier.
  if (chemin === "/api/cours/priorite" && methode === "POST") {
    if (moi.role !== "admin") return erreur("Seul l'administrateur choisit l'ordre de fabrication.", 403);
    const d = await lire(), ids = (Array.isArray(d.ids) ? d.ids : []).filter(idOk).slice(0, 60);
    await ecrireEtat(db, "cours_priorite", [...new Set(ids)]);
    return json({ ok: true, priorite: ids });
  }
  const m = chemin.match(/^\/api\/cours\/([a-z0-9-]{2,60})\/(video|miniature|refaire)$/);
  if (!m) return null;
  const [, id, action] = m;
  const e = await etatCours(db), v = e.videos[id];

  if (action === "refaire" && methode === "POST") {
    if (moi.role !== "admin") return erreur("Seul l'administrateur peut demander une nouvelle version.", 403);
    await ecrireEtat(db, "cours_refaire", [...new Set([id, ...e.refaire])]);
    return json({ ok: true });
  }
  if (!v) return erreur("Pas encore de vidéo pour cette fiche.", 404);
  // Lecture par plages (Range), indispensable à Safari sur iPhone.
  const entetes = {};
  const plage = request.headers.get("Range");
  if (plage && action === "video") entetes.Range = plage;
  const r = await fetch(fichier(id, action === "video" ? "mp4" : "jpg", v.version), { headers: entetes, cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!r.ok && r.status !== 206) return erreur("Vidéo momentanément indisponible.", 502);
  const h = new Headers();
  for (const k of ["Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]) if (r.headers.get(k)) h.set(k, r.headers.get(k));
  h.set("Content-Type", action === "video" ? "video/mp4" : "image/jpeg");
  h.set("Accept-Ranges", "bytes");
  h.set("Cache-Control", "private, max-age=86400");
  return new Response(r.body, { status: r.status, headers: h });
}

// ---------------------------------------------------------------- robot (jeton vérifié avant)
export async function routeCoursRobot(request, env, chemin, corps) {
  const db = env.DB;
  if (chemin === "/api/robot/cours" && request.method === "GET") {
    const e = await etatCours(db);
    return json({ ...e, restant_voix: await voixRestantes(db) });
  }
  const m = chemin.match(/^\/api\/robot\/cours\/([a-z0-9-]{2,60})(?:\/(echec))?$/);
  if (!m || request.method !== "POST") return json({ erreur: "Adresse inconnue." }, 404);
  const [, id, echec] = m, d = corps || {};
  const erreurs = (await lireEtat(db, "cours_erreurs"))?.valeur || {};
  if (echec) {
    erreurs[id] = { erreur: court(d.erreur, 300), le: new Date().toISOString() };
    await ecrireEtat(db, "cours_erreurs", erreurs);
    return json({ ok: true });
  }
  const videos = (await lireEtat(db, "cours_videos"))?.valeur || {};
  videos[id] = {
    titre: court(d.titre, 120), verifie: court(d.verifie, 40), duree: Math.round(Number(d.duree) || 0), taille: Number(d.taille) || 0, version: court(d.version, 20),
    chapitres: (Array.isArray(d.chapitres) ? d.chapitres : []).slice(0, 12).map((c) => ({ titre: court(c.titre, 80), t: Math.max(0, Number(c.t) || 0) })),
    resume: court(d.resume, 600), fait_le: new Date().toISOString(),
  };
  delete erreurs[id];
  await ecrireEtat(db, "cours_videos", videos);
  await ecrireEtat(db, "cours_erreurs", erreurs);
  await ecrireEtat(db, "cours_refaire", (await liste(db, "cours_refaire")).filter((x) => x !== id));
  return json({ ok: true });
}
