// Notifications Web Push (brief de 7 h et de 18 h).
// Clés VAPID : créées par le site lui-même la première fois et conservées dans la base (jamais dans le code).
// Chiffrement du message : norme « aes128gcm » (RFC 8291), signature VAPID : ES256 (RFC 8292).

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const concat = (...l) => { const t = new Uint8Array(l.reduce((s, x) => s + x.length, 0)); let o = 0; for (const x of l) { t.set(x, o); o += x.length; } return t; };

async function hmac(cle, donnees) {
  const k = await crypto.subtle.importKey("raw", cle, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, donnees));
}

// Clés VAPID du site (créées une seule fois).
async function clesVapid(db) {
  const l = await db.prepare("SELECT valeur FROM etat WHERE cle = 'vapid'").first();
  if (l) return JSON.parse(l.valeur);
  const paire = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", paire.privateKey);
  const publique = b64u(await crypto.subtle.exportKey("raw", paire.publicKey));
  const v = { jwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d }, publique };
  // INSERT OR IGNORE : si deux requêtes créent une clé en même temps, la première gagne.
  await db.prepare("INSERT OR IGNORE INTO etat (cle, valeur, maj_le) VALUES ('vapid', ?, ?)").bind(JSON.stringify(v), new Date().toISOString()).run();
  return JSON.parse((await db.prepare("SELECT valeur FROM etat WHERE cle = 'vapid'").first()).valeur);
}

async function jetonVapid(vapid, audience, contact) {
  const tete = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const corps = b64u(enc.encode(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: contact })));
  const cle = await crypto.subtle.importKey("jwk", { ...vapid.jwk, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, cle, enc.encode(`${tete}.${corps}`));
  return `${tete}.${corps}.${b64u(sig)}`;
}

// Chiffre le message pour un abonnement (RFC 8291).
export async function chiffrer(message, p256dh, auth) {
  const uaPublic = deb64u(p256dh), secretAuth = deb64u(auth);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaCle = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaCle }, eph.privateKey, 256));
  const prkCle = await hmac(secretAuth, ecdh);
  const ikm = await hmac(prkCle, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic, new Uint8Array([1])));
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(sel, ikm);
  const cek = (await hmac(prk, concat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);
  const k = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const clair = concat(enc.encode(message), new Uint8Array([2]));   // 0x02 : dernier (et unique) bloc
  const chiffre = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, k, clair));
  const rs = new Uint8Array([0, 0, 16, 0]);   // taille d'enregistrement : 4096
  return concat(sel, rs, new Uint8Array([asPublic.length]), asPublic, chiffre);
}

async function envoyer(db, abo, message, contact) {
  const vapid = await clesVapid(db);
  const jeton = await jetonVapid(vapid, new URL(abo.endpoint).origin, contact);
  const corps = await chiffrer(JSON.stringify(message), abo.p256dh, abo.auth);
  const r = await fetch(abo.endpoint, {
    method: "POST",
    headers: { Authorization: `vapid t=${jeton}, k=${vapid.publique}`, TTL: "21600", Urgency: "normal", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream" },
    body: corps,
  });
  if (r.status === 404 || r.status === 410) await db.prepare("DELETE FROM push_abonnements WHERE endpoint = ?").bind(abo.endpoint).run();
  else if (r.ok) await db.prepare("UPDATE push_abonnements SET dernier_envoi = ? WHERE endpoint = ?").bind(new Date().toISOString(), abo.endpoint).run();
  return r.status;
}

// Envoi à tous les abonnés d'une édition (appelé par le robot quand un brief est prêt).
export async function envoyerATous(db, edition, message, origine) {
  const { results } = await db.prepare("SELECT * FROM push_abonnements").all();
  const cibles = results.filter((a) => (a.editions || "").split(",").includes(edition));
  const statuts = await Promise.all(cibles.map((a) => envoyer(db, a, message, origine).catch(() => 0)));
  return { abonnes: cibles.length, envoyes: statuts.filter((s) => s >= 200 && s < 300).length, statuts };
}

// Routes pour l'utilisateur connecté.
export async function routeNotifications(request, env, chemin, moi) {
  const db = env.DB, origine = new URL(request.url).origin;
  const lire = async () => { try { return await request.json(); } catch { return {}; } };
  if (chemin === "/api/push/cle") return json({ cle: (await clesVapid(db)).publique });
  if (chemin === "/api/push/etat" && request.method === "POST") {
    const d = await lire();
    const a = await db.prepare("SELECT editions FROM push_abonnements WHERE endpoint = ? AND utilisateur_id = ?").bind(String(d.endpoint || ""), moi.id).first();
    return json({ abonne: !!a, editions: a ? a.editions.split(",") : [] });
  }
  if (chemin === "/api/push/abonnement" && request.method === "POST") {
    const d = await lire(), a = d.abonnement || {};
    if (!/^https:\/\//.test(a.endpoint || "") || !a.keys?.p256dh || !a.keys?.auth) return json({ erreur: "Abonnement invalide." }, 400);
    const editions = (Array.isArray(d.editions) ? d.editions : ["matin", "soir"]).filter((e) => e === "matin" || e === "soir").join(",") || "matin,soir";
    await db.prepare(`INSERT INTO push_abonnements (endpoint, utilisateur_id, p256dh, auth, editions, cree_le) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET utilisateur_id = excluded.utilisateur_id, p256dh = excluded.p256dh, auth = excluded.auth, editions = excluded.editions`)
      .bind(a.endpoint, moi.id, a.keys.p256dh, a.keys.auth, editions, new Date().toISOString()).run();
    return json({ ok: true, editions: editions.split(",") });
  }
  if (chemin === "/api/push/desabonnement" && request.method === "POST") {
    const d = await lire();
    await db.prepare("DELETE FROM push_abonnements WHERE endpoint = ? AND utilisateur_id = ?").bind(String(d.endpoint || ""), moi.id).run();
    return json({ ok: true });
  }
  if (chemin === "/api/push/test" && request.method === "POST") {
    const { results } = await db.prepare("SELECT * FROM push_abonnements WHERE utilisateur_id = ?").bind(moi.id).all();
    if (!results.length) return json({ erreur: "Aucun appareil abonné." }, 400);
    const statuts = await Promise.all(results.map((a) => envoyer(db, a, { titre: "🔔 Notifications activées", corps: "Vous serez prévenu dès que le brief est prêt.", url: "/brief" }, origine).catch((e) => String(e.message))));
    return json({ statuts });
  }
  return null;
}
