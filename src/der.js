// Rubrique DER (Document d'Entrée en Relation).
// - Le texte réglementaire du DER est rangé dans la base du site (jamais dans le code : le dépôt est public),
//   lisible après connexion, mis à jour par l'administrateur (fichier JSON).
// - Les coordonnées du conseiller (« Votre contact ») peuvent être gardées sur son compte.
// - Les informations du client ne passent JAMAIS par le serveur : aucune route ne les reçoit.
import { lireEtat, ecrireEtat } from "./linkedin.js";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);
const CHAMPS_CONTACT = ["civilite", "nom", "cabinet", "adresse", "ville", "telephone", "email"];
const BLOCS = ["p", "h", "h3", "cle", "liste", "centre", "garanties", "partenaires", "contact", "identite", "signature", "documents"];

// Contrôle du contenu importé : structure attendue, textes seuls (le site n'affiche jamais de HTML venu du fichier).
function verifierContenu(c) {
  if (!c || typeof c !== "object" || !Array.isArray(c.sections) || !c.sections.length) return "Fichier invalide : sections manquantes.";
  if (c.sections.length > 30) return "Fichier invalide : trop de sections.";
  const texte = (x) => typeof x === "string" && x.length <= 4000;
  for (const s of c.sections) {
    if (!/^[a-z0-9-]{2,40}$/.test(s?.id || "") || !texte(s.titre) || !Array.isArray(s.blocs)) return `Section invalide : ${String(s?.id || "?").slice(0, 40)}.`;
    for (const b of s.blocs) {
      if (!BLOCS.includes(b?.t)) return `Bloc inconnu dans « ${s.titre} ».`;
      const valeurs = JSON.stringify(b);
      if (valeurs.length > 20000) return `Bloc trop long dans « ${s.titre} ».`;
    }
  }
  return null;
}

export async function routeDer(request, env, chemin, moi) {
  const db = env.DB, methode = request.method;
  const lire = async () => { try { return await request.json(); } catch { return {}; } };
  const admin = moi.role === "admin";

  if (chemin === "/api/der" && methode === "GET") {
    const contenu = (await lireEtat(db, "der_contenu"))?.valeur || null;
    const contact = (await lireEtat(db, "der_contact:" + moi.id))?.valeur || null;
    return json({ contenu, contact, admin, conseiller: moi.nom || "" });
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
  // Mise à jour du texte du DER (administrateur), par exemple chaque année.
  if (chemin === "/api/der/contenu" && methode === "POST") {
    if (!admin) return erreur("Seul l'administrateur peut mettre à jour le DER.", 403);
    const brut = await request.text();
    if (brut.length > 300000) return erreur("Fichier trop volumineux.");
    let c; try { c = JSON.parse(brut); } catch { return erreur("Ce fichier n'est pas un JSON valide."); }
    const pb = verifierContenu(c);
    if (pb) return erreur(pb);
    c.importe_le = new Date().toISOString();
    await ecrireEtat(db, "der_contenu", c);
    return json({ ok: true, sections: c.sections.length });
  }
  return null;
}
