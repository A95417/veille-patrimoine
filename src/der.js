// Rubrique DER (Document d'Entrée en Relation).
// - Le texte réglementaire du DER est rangé dans la base du site (jamais dans le code : le dépôt est public),
//   lisible après connexion, remplacé par l'administrateur (nouvelle version préparée hors du site), avec historique.
// - Le DER se consulte et se présente seulement : ni téléchargement, ni impression depuis le site.
// - Les coordonnées du conseiller (« Votre contact ») peuvent être gardées sur son compte.
// - Les informations du client ne passent JAMAIS par le serveur : aucune route ne les reçoit.
import { lireEtat, ecrireEtat } from "./linkedin.js";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);
const CHAMPS_CONTACT = ["civilite", "nom", "cabinet", "adresse", "ville", "telephone", "email"];
const HISTORIQUE = 5;

// ---------------------------------------------------------------- contrôle strict du texte importé
const estTexte = (x, max = 4000) => typeof x === "string" && x.length <= max;
const textes = (a, min, max, lg = 4000) => Array.isArray(a) && a.length >= min && a.length <= max && a.every((x) => estTexte(x, lg));
const lignes = (a, nbCol, max) => Array.isArray(a) && a.length >= 1 && a.length <= max && a.every((l) => textes(l, nbCol, nbCol, 400));
const FORMES = {
  p: (b) => estTexte(b.x) && b.x.trim() && (b.style === undefined || b.style === "gris"),
  h: (b) => estTexte(b.x, 300) && b.x.trim() && (b.style === undefined || b.style === "gris"),
  h3: (b) => estTexte(b.x, 300) && b.x.trim(),
  cle: (b) => estTexte(b.x, 300) && b.x.trim(),
  liste: (b) => textes(b.items, 1, 50),
  centre: (b) => textes(b.lignes, 1, 20),
  garanties: (b) => estTexte(b.titre, 200) && lignes(b.lignes, 3, 20),
  partenaires: (b) => estTexte(b.titre, 200) && lignes(b.lignes, 4, 300) && (b.note === undefined || estTexte(b.note, 1000)),
  contact: () => true,
  identite: () => true,
  signature: (b) => textes(b.colonnes, 1, 3, 60),
  documents: (b) => estTexte(b.titre, 200) && textes(b.items, 1, 30, 300),
};
export function verifierContenu(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) return "Fichier invalide : ce n'est pas un texte de DER.";
  if (!Array.isArray(c.sections) || c.sections.length < 3 || c.sections.length > 30) return "Fichier invalide : sections manquantes ou trop nombreuses.";
  if (c.version !== undefined && !estTexte(c.version, 120)) return "Fichier invalide : version.";
  const ids = new Set();
  let nContact = 0, nIdentite = 0;
  for (const [i, s] of c.sections.entries()) {
    const nom = `section ${i + 1}${s && estTexte(s.titre, 200) ? ` (« ${s.titre} »)` : ""}`;
    if (!s || typeof s !== "object") return `Fichier invalide : ${nom}.`;
    if (!/^[a-z0-9-]{2,40}$/.test(s.id || "") || ids.has(s.id)) return `Identifiant manquant ou en double : ${nom}.`;
    ids.add(s.id);
    if (!estTexte(s.titre, 200) || !s.titre.trim()) return `Titre manquant : ${nom}.`;
    if (s.page !== undefined && !["nouvelle", "debut"].includes(s.page)) return `Saut de page invalide : ${nom}.`;
    if (s.icone !== undefined && !/^[a-z]{2,20}$/.test(s.icone)) return `Icône invalide : ${nom}.`;
    if (!Array.isArray(s.blocs) || !s.blocs.length || s.blocs.length > 80) return `Aucun contenu : ${nom}.`;
    for (const [j, b] of s.blocs.entries()) {
      if (!b || typeof b !== "object" || !FORMES[b.t]) return `Bloc ${j + 1} inconnu dans la ${nom}.`;
      if (!FORMES[b.t](b)) return `Bloc ${j + 1} (${b.t}) mal formé dans la ${nom}.`;
      if (b.t === "contact") nContact++;
      if (b.t === "identite") nIdentite++;
    }
  }
  if (nContact !== 1 || nIdentite !== 1) return "Le texte doit contenir une fois « Votre contact » et une fois « Vos informations d'identité ».";
  if (c.contact_defaut !== undefined && (typeof c.contact_defaut !== "object" || !CHAMPS_CONTACT.every((k) => c.contact_defaut[k] === undefined || estTexte(c.contact_defaut[k], 120))))
    return "Fichier invalide : contact par défaut.";
  return null;
}
// Ne garde que les champs connus (rien d'autre n'est enregistré).
function nettoyer(c) {
  const garder = (o, cles) => Object.fromEntries(cles.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
  const CLES = { p: ["x", "style"], h: ["x", "style"], h3: ["x"], cle: ["x"], liste: ["items"], centre: ["lignes"], garanties: ["titre", "lignes"], partenaires: ["titre", "lignes", "note"],
    contact: [], identite: [], signature: ["colonnes"], documents: ["titre", "items"] };
  return { version: c.version || "", source: estTexte(c.source, 300) ? c.source : undefined, contact_defaut: c.contact_defaut ? garder(c.contact_defaut, CHAMPS_CONTACT) : undefined,
    sections: c.sections.map((s) => ({ ...garder(s, ["id", "titre", "icone", "page"]), blocs: s.blocs.map((b) => ({ t: b.t, ...garder(b, CLES[b.t]) })) })) };
}

const texte = (x, n) => String(x ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const liste = (a, n, f) => (Array.isArray(a) ? a.slice(0, n).map(f) : []);
// Écrans libres (titre, texte, image facultative) et écrans masqués du récit.
const libres = (a) => liste(a, 8, (e) => ({ titre: texte(e?.titre, 120), texte: texte(e?.texte, 1500), photo: photoId(e?.photo) })).filter((e) => e.titre || e.texte);
const masques = (a) => liste(a, 12, (e) => String(e || "")).filter((e) => /^[a-z]{2,20}$/.test(e));
const photoId = (x) => (/^[a-f0-9]{32}$/.test(String(x || "")) ? String(x) : "");

export async function routeDer(request, env, chemin, moi) {
  const db = env.DB, methode = request.method;
  const lire = async () => { try { return await request.json(); } catch { return {}; } };
  const admin = moi.role === "admin";

  if (chemin === "/api/der" && methode === "GET") {
    const contenu = (await lireEtat(db, "der_contenu"))?.valeur || null;
    const contact = (await lireEtat(db, "der_contact:" + moi.id))?.valeur || null;
    const historique = admin ? ((await lireEtat(db, "der_historique"))?.valeur || []).map((h) => ({ version: h.version, importe_le: h.importe_le, par: h.par })) : undefined;
    const cabinet = (await lireEtat(db, "der_cabinet"))?.valeur || null;
    const profil = (await lireEtat(db, "der_profil:" + moi.id))?.valeur || null;
    return json({ contenu, contact, admin, conseiller: moi.nom || "", historique, cabinet, profil });
  }
  // ---------------------------------------------------------------- récit de présentation (cabinet, conseiller)
  // Textes et photos fournis par le cabinet : rangés dans la base, visibles seulement après connexion.
  if (chemin === "/api/der/cabinet" && methode === "POST") {
    if (!admin) return erreur("Seul l'administrateur modifie la présentation du cabinet.", 403);
    const c = (await lire()).cabinet || {};
    const propre = {
      accroche: texte(c.accroche, 200), annee: texte(c.annee, 10), histoire: texte(c.histoire, 1500),
      etapes: liste(c.etapes, 8, (e) => ({ annee: texte(e?.annee, 10), texte: texte(e?.texte, 200) })).filter((e) => e.texte),
      chiffres: liste(c.chiffres, 6, (e) => ({ valeur: texte(e?.valeur, 30), libelle: texte(e?.libelle, 80) })).filter((e) => e.valeur),
      valeurs: liste(c.valeurs, 8, (e) => texte(e, 160)).filter(Boolean),
      metiers: liste(c.metiers, 10, (e) => texte(e, 120)).filter(Boolean),
      engagements: liste(c.engagements, 8, (e) => texte(e, 160)).filter(Boolean),
      libres: libres(c.libres), masques: masques(c.masques),
      directrice: { nom: texte(c.directrice?.nom, 80), role: texte(c.directrice?.role, 80), texte: texte(c.directrice?.texte, 800), photo: photoId(c.directrice?.photo) },
      logo: photoId(c.logo),
    };
    await ecrireEtat(db, "der_cabinet", propre);
    return json({ ok: true, cabinet: propre });
  }
  if (chemin === "/api/der/profil" && methode === "POST") {
    const c = (await lire()).profil || {};
    const propre = { nom: texte(c.nom, 80), titre: texte(c.titre, 120), parcours: texte(c.parcours, 1200),
      specialites: liste(c.specialites, 8, (e) => texte(e, 80)).filter(Boolean), photo: photoId(c.photo), libres: libres(c.libres), masques: masques(c.masques),
      directrice: c.directrice === true, feminin: c.feminin === true };
    await ecrireEtat(db, "der_profil:" + moi.id, propre);
    return json({ ok: true, profil: propre });
  }
  // Photos (directrice, logo, conseiller) : image JPEG ou PNG déjà réduite dans le navigateur (≤ 700 Ko).
  if (chemin === "/api/der/photo" && methode === "POST") {
    const d = await lire(), m = String(d.image || "").match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return erreur("Image invalide (JPEG, PNG ou WebP).");
    if (m[2].length > 950000) return erreur("Image trop lourde.");
    if (["directrice", "logo"].includes(d.cible) && !admin) return erreur("Seul l'administrateur modifie cette image.", 403);
    const id = crypto.randomUUID().replace(/-/g, "");
    await ecrireEtat(db, "der_photo:" + id, { type: "image/" + m[1], donnees: m[2], par: moi.id });
    return json({ ok: true, id });
  }
  const ph = chemin.match(/^\/api\/der\/photo\/([a-f0-9]{32})$/);
  if (ph && methode === "GET") {
    const v = (await lireEtat(db, "der_photo:" + ph[1]))?.valeur;
    if (!v) return new Response("Introuvable", { status: 404 });
    const octets = Uint8Array.from(atob(v.donnees), (c) => c.charCodeAt(0));
    return new Response(octets, { headers: { "Content-Type": v.type, "Cache-Control": "private, max-age=86400" } });
  }
  // Coordonnées du conseiller gardées sur son compte (ce ne sont pas des données du client).
  if (chemin === "/api/der/contact" && methode === "POST") {
    const d = await lire();
    if (d.oublier) { await ecrireEtat(db, "der_contact:" + moi.id, null); return json({ ok: true }); }
    const c = {};
    for (const k of CHAMPS_CONTACT) c[k] = String(d.contact?.[k] ?? "").replace(/[<>]/g, "").trim().slice(0, 120);
    await ecrireEtat(db, "der_contact:" + moi.id, c);
    return json({ ok: true, contact: c });
  }
  // Mise à jour du texte du DER (administrateur) : contrôle strict, ancienne version gardée.
  if (chemin === "/api/der/contenu" && methode === "POST") {
    if (!admin) return erreur("Seul l'administrateur peut mettre à jour le DER.", 403);
    const brut = await request.text();
    if (brut.length > 400000) return erreur("Fichier trop volumineux.");
    let c; try { c = JSON.parse(brut); } catch { return erreur("Ce fichier n'est pas un JSON valide."); }
    const pb = verifierContenu(c);
    if (pb) return erreur(pb);
    if (new URL(request.url).searchParams.get("verifier") === "1") return json({ ok: true, verifie: true });
    const propre = nettoyer(c);
    propre.importe_le = new Date().toISOString(); propre.par = moi.nom || "";
    const actuel = (await lireEtat(db, "der_contenu"))?.valeur;
    if (actuel) { const h = (await lireEtat(db, "der_historique"))?.valeur || []; h.unshift(actuel); await ecrireEtat(db, "der_historique", h.slice(0, HISTORIQUE)); }
    await ecrireEtat(db, "der_contenu", propre);
    return json({ ok: true, sections: propre.sections.length });
  }
  // Revenir à une version précédente (la version actuelle passe dans l'historique).
  if (chemin === "/api/der/restaurer" && methode === "POST") {
    if (!admin) return erreur("Seul l'administrateur peut restaurer le DER.", 403);
    const d = await lire(), i = Number(d.index) || 0;
    const h = (await lireEtat(db, "der_historique"))?.valeur || [];
    if (!h[i]) return erreur("Cette version n'existe plus.", 404);
    const actuel = (await lireEtat(db, "der_contenu"))?.valeur;
    const choisi = h.splice(i, 1)[0];
    if (actuel) h.unshift(actuel);
    await ecrireEtat(db, "der_historique", h.slice(0, HISTORIQUE));
    await ecrireEtat(db, "der_contenu", choisi);
    return json({ ok: true });
  }
  return null;
}
