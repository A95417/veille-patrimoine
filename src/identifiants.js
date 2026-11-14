// Identifiants de connexion : initiale du nom de famille + « . » + prénom, en minuscules, sans accents ni espaces.
// Exemple : Shehram ALI → « a.shehram » ; Jean-Pierre Élie → « e.jean-pierre ». En cas de doublon : « a.shehram2 ».

export function normaliser(t) {
  return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[\s']+/g, "").replace(/[^a-z0-9.\-]/g, "");
}
export const identifiantValide = (t) => /^[a-z0-9][a-z0-9.\-]{1,40}$/.test(t);

// Sépare prénom et nom de famille d'un nom affiché. Un mot en MAJUSCULES est pris comme nom de famille ;
// sinon, le premier mot est le prénom et le reste le nom de famille (« Shehram Ali »).
export function decouperNom(nomComplet) {
  const mots = String(nomComplet || "").trim().split(/\s+/).filter(Boolean);
  if (mots.length < 2) return { prenom: mots[0] || "", nom: "" };
  const majuscules = mots.filter((m) => m.length >= 2 && m === m.toUpperCase() && /\p{L}/u.test(m));
  if (majuscules.length && majuscules.length < mots.length) return { prenom: mots.filter((m) => !majuscules.includes(m)).join(" "), nom: majuscules.join(" ") };
  return { prenom: mots[0], nom: mots.slice(1).join(" ") };
}

export function proposerIdentifiant(prenom, nom) {
  const p = normaliser(prenom), n = normaliser(nom).replace(/[^a-z0-9]/g, "");
  return n ? `${n[0]}.${p}` : p;
}

// Premier identifiant libre à partir d'une base (base, base2, base3…).
export async function identifiantLibre(db, base, saufId = -1) {
  for (let i = 1; i < 100; i++) {
    const essai = i === 1 ? base : base + i;
    const pris = await db.prepare("SELECT id FROM utilisateurs WHERE identifiant = ? AND id != ?").bind(essai, saufId).first();
    if (!pris) return essai;
  }
  return base + Date.now();
}

// Donne un identifiant aux comptes qui n'en ont pas encore (comptes créés avant cette fonction).
export async function assurerIdentifiants(db) {
  const { results } = await db.prepare("SELECT id, nom, email FROM utilisateurs WHERE identifiant IS NULL ORDER BY id").all();
  for (const u of results) {
    const { prenom, nom } = decouperNom(u.nom);
    const base = proposerIdentifiant(prenom, nom) || normaliser(u.email.split("@")[0]);
    await db.prepare("UPDATE utilisateurs SET identifiant = ? WHERE id = ?").bind(await identifiantLibre(db, base, u.id), u.id).run();
  }
}
