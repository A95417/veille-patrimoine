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

export async function routeDer(request, env, chemin, moi) {
  const db = env.DB, methode = request.method;
  const lire = async () => { try { return await request.json(); } catch { return {}; } };
  const admin = moi.role === "admin";

  if (chemin === "/api/der" && methode === "GET") {
    const contenu = (await lireEtat(db, "der_contenu"))?.valeur || null;
    const contact = (await lireEtat(db, "der_contact:" + moi.id))?.valeur || null;
    const historique = admin ? ((await lireEtat(db, "der_historique"))?.valeur || []).map((h) => ({ version: h.version, importe_le: h.importe_le, par: h.par })) : undefined;
    return json({ contenu, contact, admin, conseiller: moi.nom || "", historique });
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
