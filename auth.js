// Sécurité : hachage des mots de passe, sessions, limitation des tentatives.
// Aucun mot de passe n'est jamais stocké en clair.

const ITERATIONS = 25000;          // force du hachage (limitée par l'offre gratuite Cloudflare)
const DUREE_SESSION_MS = 30 * 24 * 3600 * 1000;   // 30 jours
const MAX_TENTATIVES = 5;          // essais ratés autorisés…
const FENETRE_TENTATIVES_MS = 15 * 60 * 1000;     // … sur 15 minutes
export const NOM_COOKIE = "veille_session";
export const LONGUEUR_MIN_MDP = 10;

const enc = new TextEncoder();

function versB64(octets) {
  let s = "";
  for (const o of new Uint8Array(octets)) s += String.fromCharCode(o);
  return btoa(s);
}
function depuisB64(texte) {
  return Uint8Array.from(atob(texte), (c) => c.charCodeAt(0));
}
function versHex(octets) {
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(motDePasse, sel, iterations) {
  const cle = await crypto.subtle.importKey("raw", enc.encode(motDePasse), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sel, iterations }, cle, 256);
}

// Renvoie une chaîne du type "pbkdf2$25000$<sel>$<empreinte>"
export async function hacherMotDePasse(motDePasse) {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const empreinte = await pbkdf2(motDePasse, sel, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${versB64(sel)}$${versB64(empreinte)}`;
}

export async function verifierMotDePasse(motDePasse, stocke) {
  const [algo, iter, selB64, empreinteB64] = String(stocke).split("$");
  if (algo !== "pbkdf2") return false;
  const calcule = new Uint8Array(await pbkdf2(motDePasse, depuisB64(selB64), Number(iter)));
  const attendu = depuisB64(empreinteB64);
  if (calcule.length !== attendu.length) return false;
  return crypto.subtle.timingSafeEqual(calcule, attendu);
}

async function empreinteJeton(jeton) {
  return versHex(await crypto.subtle.digest("SHA-256", enc.encode(jeton)));
}

export function lireCookie(request, nom) {
  const entete = request.headers.get("Cookie") || "";
  for (const morceau of entete.split(";")) {
    const [k, ...v] = morceau.trim().split("=");
    if (k === nom) return v.join("=");
  }
  return null;
}

export function cookieSession(jeton, dureeMs) {
  const maxAge = Math.floor(dureeMs / 1000);
  return `${NOM_COOKIE}=${jeton}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

// Crée une session et renvoie le jeton à mettre dans le cookie.
export async function creerSession(db, utilisateurId) {
  const jeton = versHex(crypto.getRandomValues(new Uint8Array(32)));
  const maintenant = Date.now();
  await db
    .prepare("INSERT INTO sessions (id_hash, utilisateur_id, expire_le, cree_le) VALUES (?, ?, ?, ?)")
    .bind(await empreinteJeton(jeton), utilisateurId, maintenant + DUREE_SESSION_MS, maintenant)
    .run();
  return { jeton, dureeMs: DUREE_SESSION_MS };
}

// Renvoie l'utilisateur connecté, ou null.
export async function utilisateurConnecte(request, db) {
  const jeton = lireCookie(request, NOM_COOKIE);
  if (!jeton || !/^[0-9a-f]{64}$/.test(jeton)) return null;
  const ligne = await db
    .prepare(
      `SELECT u.id, u.email, u.nom, u.role, u.actif, s.expire_le
         FROM sessions s JOIN utilisateurs u ON u.id = s.utilisateur_id
        WHERE s.id_hash = ?`
    )
    .bind(await empreinteJeton(jeton))
    .first();
  if (!ligne || !ligne.actif || ligne.expire_le < Date.now()) return null;
  return { id: ligne.id, email: ligne.email, nom: ligne.nom, role: ligne.role };
}

export async function supprimerSession(request, db) {
  const jeton = lireCookie(request, NOM_COOKIE);
  if (!jeton) return;
  await db.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(await empreinteJeton(jeton)).run();
}

// Limitation des essais : true si l'adresse est temporairement bloquée.
export async function tropDeTentatives(db, email) {
  const depuis = Date.now() - FENETRE_TENTATIVES_MS;
  const r = await db
    .prepare("SELECT COUNT(*) AS n FROM tentatives WHERE email = ? AND horodatage > ?")
    .bind(email, depuis)
    .first();
  return (r?.n || 0) >= MAX_TENTATIVES;
}

export async function noterTentative(db, email) {
  const maintenant = Date.now();
  await db.batch([
    db.prepare("INSERT INTO tentatives (email, horodatage) VALUES (?, ?)").bind(email, maintenant),
    db.prepare("DELETE FROM tentatives WHERE horodatage < ?").bind(maintenant - 24 * 3600 * 1000),
  ]);
}

export async function effacerTentatives(db, email) {
  await db.prepare("DELETE FROM tentatives WHERE email = ?").bind(email).run();
}
