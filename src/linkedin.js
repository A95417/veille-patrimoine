// Rubrique « LinkedIn » : idées de posts tirées de l'actualité, et rédaction d'un post court et professionnel.
// L'IA (Gemini, offre gratuite) n'utilise que les informations fournies : actualité du site, fiche « Apprendre » ou sujet saisi.
// Aucune donnée client ne doit être saisie (rappelé à l'écran).

const API = "https://generativelanguage.googleapis.com/v1beta";
const LIMITE_JOUR = 40;            // rédactions par jour, tous utilisateurs confondus (préserve le quota gratuit)
const DUREE_IDEES_MS = 4 * 3600e3; // les idées du moment sont recalculées toutes les 4 heures au plus

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);

export const APPROCHES = {
  decryptage: "Décryptage d'actualité : expliquer ce qui change, pour qui, et pourquoi c'est important.",
  pedagogie: "Pédagogie : expliquer simplement la notion patrimoniale qui se cache derrière le sujet.",
  conseils: "Points d'attention : 3 réflexes concrets à avoir, formulés de façon générale (jamais un conseil personnalisé).",
  opinion: "Point de vue : une prise de position nuancée et argumentée du conseiller, qui reste factuelle.",
  chiffre: "Le chiffre clé : partir d'un chiffre présent dans la source et l'expliquer.",
  idee_recue: "Idée reçue : corriger une croyance courante liée au sujet.",
  question: "Question au réseau : présenter le sujet en quelques lignes et inviter à l'échange.",
};
const TONS = { sobre: "sobre et professionnel", chaleureux: "chaleureux et accessible", expert: "expert et précis" };
const LONGUEURS = { court: "entre 500 et 750 caractères", moyen: "entre 900 et 1 300 caractères" };

const jourParis = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
const jourGoogle = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

async function lireEtat(db, cle) {
  const l = await db.prepare("SELECT valeur, maj_le FROM etat WHERE cle = ?").bind(cle).first();
  if (!l) return null;
  try { return { valeur: JSON.parse(l.valeur), maj_le: l.maj_le }; } catch { return null; }
}
const ecrireEtat = (db, cle, valeur) =>
  db.prepare("INSERT OR REPLACE INTO etat (cle, valeur, maj_le) VALUES (?, ?, ?)").bind(cle, JSON.stringify(valeur), new Date().toISOString()).run();

// Compteur partagé avec le robot (même clé que /api/robot/ia/quota), pour ne pas dépasser l'offre gratuite.
async function compterQuota(db, modele) {
  const jour = jourGoogle();
  const lu = await lireEtat(db, "ia_quota");
  const q = lu?.valeur?.jour === jour ? lu.valeur : { jour, compteurs: {} };
  q.compteurs[modele] = (q.compteurs[modele] || 0) + 1;
  await ecrireEtat(db, "ia_quota", q);
  return q;
}

// Modèles disponibles avec la clé (liste mise en cache 24 h) : Flash pour la qualité, Flash-Lite en relais.
async function modeles(env, db) {
  const cache = await lireEtat(db, "linkedin_modeles");
  if (cache && Date.now() - new Date(cache.maj_le) < 86400e3 && cache.valeur.lite) return cache.valeur;
  const r = await fetch(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": env.GEMINI_API_KEY } });
  if (!r.ok) throw new Error(`liste des modèles indisponible (HTTP ${r.status})`);
  const noms = ((await r.json()).models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /^gemini-\d/.test(n) && !/(tts|image|audio|live|embedding|robotics|native|computer|vision|transcribe|translate)/i.test(n));
  const v = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  const tri = (l) => [...l].sort((a, b) => v(b) - v(a) || /preview|exp/.test(a) - /preview|exp/.test(b) || a.length - b.length);
  const choix = { lite: tri(noms.filter((n) => /flash-lite/.test(n)))[0], fort: tri(noms.filter((n) => /flash/.test(n) && !/lite/.test(n)))[0] };
  if (!choix.lite && !choix.fort) throw new Error("aucun modèle disponible");
  await ecrireEtat(db, "linkedin_modeles", choix);
  return choix;
}

async function appelGemini(env, modele, consignes, contenu, schema, temperature = 0.6) {
  const r = await fetch(`${API}/models/${modele}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: consignes }] },
      contents: [{ role: "user", parts: [{ text: contenu }] }],
      generationConfig: { temperature, responseMimeType: "application/json", responseSchema: schema, maxOutputTokens: 4096 },
    }),
  });
  if (r.status === 429) return { quota: true };
  if (!r.ok) return { erreur: `HTTP ${r.status} : ${(await r.text()).slice(0, 200)}` };
  const d = await r.json();
  const t = d.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  try { return { donnees: JSON.parse(t) }; } catch { return { erreur: "réponse illisible" }; }
}

// Essaie Flash (meilleure plume) tant que son petit quota le permet, sinon Flash-Lite.
async function generer(env, db, consignes, contenu, schema, preferer = "fort") {
  const m = await modeles(env, db);
  const lu = await lireEtat(db, "ia_quota");
  const compte = lu?.valeur?.jour === jourGoogle() ? lu.valeur.compteurs : {};
  const ordre = (preferer === "fort" && m.fort && (compte[m.fort] || 0) < 14 ? [m.fort, m.lite] : [m.lite, m.fort]).filter(Boolean);
  const details = [];
  for (const modele of ordre) {
    await compterQuota(db, modele);
    const r = await appelGemini(env, modele, consignes, contenu, schema);
    if (r.donnees) return { ...r, modele };
    details.push(`${modele} : ${r.quota ? "quota" : r.erreur}`);
  }
  return { erreur: "L'IA est momentanément indisponible (quota gratuit atteint ou surcharge). Réessayez plus tard.", details };
}

// Actualités récentes et importantes : la matière première des posts.
async function sujetsRecents(db, n = 30) {
  const depuis = new Date(Date.now() - 4 * 86400e3).toISOString();
  const { results } = await db.prepare(`SELECT s.id, COALESCE(s.titre_fr, s.titre) AS titre, s.importance, s.categories, s.resume_court, s.derniere_pub,
      (SELECT GROUP_CONCAT(DISTINCT a.source_nom) FROM articles a WHERE a.sujet_id = s.id) AS sources
    FROM sujets s WHERE s.derniere_pub >= ? AND s.resume_court IS NOT NULL AND COALESCE(s.importance, 0) >= 3
    ORDER BY s.importance DESC, s.derniere_pub DESC LIMIT ?`).bind(depuis, n).all();
  return results.map((s) => { try { s.categories = JSON.parse(s.categories || "[]"); } catch { s.categories = []; } return s; });
}

const SCHEMA_IDEES = {
  type: "OBJECT",
  properties: {
    idees: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          sujet_id: { type: "STRING" },
          titre: { type: "STRING", description: "Idée de post en une phrase accrocheuse (moins de 90 caractères)" },
          approche: { type: "STRING", description: "Une de ces valeurs exactement : " + Object.keys(APPROCHES).join(", ") },
          pourquoi: { type: "STRING", description: "Pourquoi ce sujet intéresse le réseau d'un CGP (une phrase)" },
        },
        required: ["sujet_id", "titre", "approche", "pourquoi"],
      },
    },
  },
  required: ["idees"],
};

const SCHEMA_POST = {
  type: "OBJECT",
  properties: {
    accroches: { type: "ARRAY", items: { type: "STRING" }, description: "3 accroches différentes (première ligne du post, moins de 140 caractères)" },
    corps: { type: "STRING", description: "Le post SANS l'accroche ni les hashtags : paragraphes courts séparés par une ligne vide" },
    hashtags: { type: "ARRAY", items: { type: "STRING" }, description: "3 à 5 hashtags sans espace, commençant par #" },
    appels_action: { type: "ARRAY", items: { type: "STRING" }, description: "2 phrases de conclusion possibles (question ou invitation)" },
    a_verifier: { type: "ARRAY", items: { type: "STRING" }, description: "Points factuels du post à vérifier avant publication" },
  },
  required: ["accroches", "corps", "hashtags", "appels_action", "a_verifier"],
};

const CONSIGNES_POST = `Tu aides un conseiller en gestion de patrimoine (CGP) français à rédiger un post LinkedIn.
Règles impératives :
- Français professionnel, phrases courtes, post aéré (paragraphes de 1 à 3 lignes séparés par une ligne vide).
- N'invente AUCUN fait, chiffre, date, nom, taux ou citation : utilise uniquement les informations de la SOURCE fournie. S'il manque une information, reste général. Si la source est un simple thème sans contenu, n'écris aucun chiffre.
- Pas de conseil personnalisé, pas de promesse de rendement ou de gain, pas de superlatifs commerciaux ; mentionne les risques quand le sujet s'y prête. Le message doit être clair, exact et non trompeur.
- Aucune donnée personnelle, aucun client réel.
- Pas plus de 2 émojis, sobres, et aucun si le ton est « expert ».
- Si la source vient de la presse, termine le corps par « Source : » suivi du nom du média.
- Respecte l'approche, le ton et la longueur demandés (la longueur inclut l'accroche).`;

export async function routeLinkedin(request, env, chemin, moi) {
  const db = env.DB;

  // Idées du moment (mises en cache) + actualités récentes pour un choix manuel.
  if (chemin === "/api/linkedin/sujets" && request.method === "GET") {
    const sujets = await sujetsRecents(db);
    let cache = await lireEtat(db, "linkedin_idees");
    const frais = cache && Date.now() - new Date(cache.maj_le) < DUREE_IDEES_MS;
    const echec = await lireEtat(db, "linkedin_idees_erreur");
    const echecRecent = echec && Date.now() - new Date(echec.maj_le) < 3600e3;   // après un échec, on attend 1 h avant de réessayer
    if (!frais && !echecRecent && env.GEMINI_API_KEY && sujets.length >= 3) {
      const liste = sujets.slice(0, 20).map((s) => `[${s.id}] ${s.titre} — ${s.resume_court}`).join("\n");
      const r = await generer(env, db,
        "Tu proposes à un conseiller en gestion de patrimoine des idées de posts LinkedIn à partir d'actualités. Choisis les 6 sujets les plus utiles pour son réseau (épargnants, chefs d'entreprise, familles), varie les approches, et n'invente rien : appuie-toi sur le texte fourni. Réponds en français.",
        `ACTUALITÉS (identifiant entre crochets) :\n${liste}`, SCHEMA_IDEES, "lite");
      const ids = new Set(sujets.map((s) => s.id));
      const idees = (r.donnees?.idees || []).map((i) => ({ ...i, sujet_id: String(i.sujet_id || "").replace(/[\[\]\s]/g, "") }))
        .filter((i) => ids.has(i.sujet_id) && APPROCHES[i.approche]).slice(0, 6);
      if (idees.length) { await ecrireEtat(db, "linkedin_idees", idees); await db.prepare("DELETE FROM etat WHERE cle = 'linkedin_idees_erreur'").run(); cache = { valeur: idees, maj_le: new Date().toISOString() }; }
      else await ecrireEtat(db, "linkedin_idees_erreur", { erreur: r.erreur || null, details: r.details || null, brut: JSON.stringify(r.donnees || null).slice(0, 600) });
    }
    const parId = Object.fromEntries(sujets.map((s) => [s.id, s]));
    let idees = (cache?.valeur || []).filter((i) => parId[i.sujet_id]).map((i) => ({ ...i, sujet: parId[i.sujet_id] }));
    // Sans idées de l'IA : les actualités les plus importantes, présentées telles quelles (rien d'inventé).
    if (!idees.length) idees = sujets.slice(0, 6).map((s) => ({ sujet_id: s.id, titre: s.titre, approche: "decryptage", pourquoi: s.resume_court, sujet: s, simple: true }));
    return json({ idees, sujets, ia: !!env.GEMINI_API_KEY, approches: APPROCHES });
  }

  // Rédaction d'un post.
  if (chemin === "/api/linkedin/rediger" && request.method === "POST") {
    if (!env.GEMINI_API_KEY) return erreur("L'IA n'est pas encore configurée sur le site (clé absente).", 503);
    let d = {};
    try { d = await request.json(); } catch {}
    const approche = APPROCHES[d.approche] ? d.approche : "decryptage";
    const ton = TONS[d.ton] ? d.ton : "sobre";
    const longueur = LONGUEURS[d.longueur] ? d.longueur : "court";
    const consigne = String(d.consigne || "").slice(0, 200);

    // Limite quotidienne (tous utilisateurs) pour préserver l'offre gratuite.
    const cleJour = "linkedin_compteur";
    const c = await lireEtat(db, cleJour);
    const compteur = c?.valeur?.jour === jourParis() ? c.valeur : { jour: jourParis(), n: 0 };
    if (compteur.n >= LIMITE_JOUR) return erreur(`Limite de ${LIMITE_JOUR} posts par jour atteinte (offre gratuite de l'IA). Réessayez demain.`, 429);

    let source = "", lien = null;
    if (d.sujet_id) {
      const s = await db.prepare("SELECT id, COALESCE(titre_fr, titre) AS titre, resume_court, resume_detail FROM sujets WHERE id = ?").bind(String(d.sujet_id)).first();
      if (!s) return erreur("Actualité introuvable.", 404);
      const { results: arts } = await db.prepare("SELECT source_nom, lien, extrait FROM articles WHERE sujet_id = ? ORDER BY publie_le DESC LIMIT 4").bind(s.id).all();
      let detail = "";
      try { const r = JSON.parse(s.resume_detail || "null"); if (r) detail = [r.essentiel, ...(r.points_cles || []), r.contexte].filter(Boolean).join("\n"); } catch {}
      source = `ACTUALITÉ : ${s.titre}\nRÉSUMÉ : ${s.resume_court}\n${detail ? "DÉTAIL :\n" + detail + "\n" : ""}MÉDIAS : ${[...new Set(arts.map((a) => a.source_nom))].join(", ")}`;
      lien = arts[0] ? { nom: arts[0].source_nom, url: arts[0].lien } : null;
    } else if (d.fiche && d.fiche.titre) {
      source = `FICHE PÉDAGOGIQUE VÉRIFIÉE (sources officielles) : ${String(d.fiche.titre).slice(0, 120)}\n${String(d.fiche.contenu || "").slice(0, 4000)}\n(Ne pas écrire « Source : » pour une fiche ; les chiffres de la fiche peuvent être utilisés tels quels.)`;
    } else if (String(d.theme || "").trim()) {
      source = `THÈME LIBRE (aucun contenu factuel fourni : n'écris aucun chiffre ni aucune règle précise) : ${String(d.theme).slice(0, 300)}`;
    } else return erreur("Choisissez une actualité, une fiche ou un thème.");

    const demande = `${source}\n\nAPPROCHE : ${APPROCHES[approche]}\nTON : ${TONS[ton]}\nLONGUEUR : ${LONGUEURS[longueur]}${consigne ? `\nPRÉCISION DU CONSEILLER : ${consigne}` : ""}`;
    const r = await generer(env, db, CONSIGNES_POST, demande, SCHEMA_POST, "fort");
    if (!r.donnees) return erreur(r.erreur || "Rédaction impossible pour le moment.", 503);
    compteur.n++;
    await ecrireEtat(db, cleJour, compteur);
    const p = r.donnees;
    return json({
      accroches: (p.accroches || []).slice(0, 3),
      corps: String(p.corps || ""),
      hashtags: (p.hashtags || []).map((h) => "#" + String(h).replace(/^#+/, "").replace(/\s+/g, "")).filter((h) => h.length > 1).slice(0, 5),
      appels_action: (p.appels_action || []).slice(0, 2),
      a_verifier: (p.a_verifier || []).slice(0, 5),
      lien, modele: r.modele, restants: LIMITE_JOUR - compteur.n,
    });
  }
  return null;
}
