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
const LONGUEURS = {
  court: "TRÈS COURT : 250 à 400 caractères au total, accroche comprise. Accroche + 2 ou 3 phrases courtes + conclusion. Pas de liste, pas de paragraphe de contexte.",
  moyen: "COURT : 500 à 800 caractères au total, accroche comprise. Une seule idée développée en 3 ou 4 paragraphes d'une ou deux lignes.",
};

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

async function appelGemini(env, modele, consignes, contenu, schema, temperature = 0.6, essai = 1) {
  let r;
  try {
    r = await fetch(`${API}/models/${modele}:generateContent`, {
    signal: AbortSignal.timeout(35000),   // au-delà, on passe au modèle suivant plutôt que de faire attendre
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: consignes }] },
      contents: [{ role: "user", parts: [{ text: contenu }] }],
      generationConfig: { temperature, responseMimeType: "application/json", responseSchema: schema, maxOutputTokens: 4096 },
    }),
  });
  } catch (e) { return { erreur: e.name === "TimeoutError" ? "délai dépassé (35 s)" : e.message }; }
  if (r.status === 429) return { quota: true };
  if (r.status >= 500 && essai < 2) {   // surcharge passagère chez Google : une nouvelle tentative, puis modèle suivant
    await new Promise((ok) => setTimeout(ok, 2000));
    return appelGemini(env, modele, consignes, contenu, schema, temperature, essai + 1);
  }
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
    const t = Date.now();
    const r = await appelGemini(env, modele, consignes, contenu, schema);
    details.push(`${modele} : ${r.donnees ? "ok" : r.quota ? "quota" : r.erreur} en ${Math.round((Date.now() - t) / 1000)} s`);
    if (r.donnees) return { ...r, modele, details };
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
    visuel: {
      type: "OBJECT",
      description: "Contenu de l'image qui résume le post. Textes très courts. Uniquement des informations présentes dans le post et la source.",
      properties: {
        modele: { type: "STRING", description: "Le schéma le plus parlant : chiffre (un chiffre clé), points (3 points à retenir), comparaison (avant / après ou A / B), etapes (2 à 4 étapes), question (une question forte)" },
        surtitre: { type: "STRING", description: "Thème en 1 à 3 mots (ex. « Transmission »)" },
        titre: { type: "STRING", description: "Titre de l'image, 60 caractères maximum" },
        chiffre: { type: "STRING", description: "modèle chiffre : le chiffre exactement comme dans la source, avec son unité" },
        chiffre_legende: { type: "STRING", description: "modèle chiffre : ce que mesure le chiffre, 70 caractères maximum" },
        points: { type: "ARRAY", items: { type: "STRING" }, description: "modèles points et etapes : 2 à 4 éléments de 55 caractères maximum" },
        gauche_titre: { type: "STRING", description: "modèle comparaison : titre de la colonne de gauche (2 à 3 mots)" },
        gauche: { type: "ARRAY", items: { type: "STRING" }, description: "modèle comparaison : 1 à 3 lignes de 40 caractères maximum" },
        droite_titre: { type: "STRING" },
        droite: { type: "ARRAY", items: { type: "STRING" } },
        conclusion: { type: "STRING", description: "Message final de l'image, 70 caractères maximum" },
      },
      required: ["modele", "surtitre", "titre", "conclusion"],
    },
  },
  required: ["accroches", "corps", "hashtags", "appels_action", "a_verifier", "visuel"],
};

const CONSIGNES_POST = `Tu aides un conseiller en gestion de patrimoine (CGP) français à rédiger un post LinkedIn.
Règles impératives :
- Français professionnel, phrases courtes, post aéré (paragraphes de 1 à 3 lignes séparés par une ligne vide).
- N'invente AUCUN fait, chiffre, date, nom, taux ou citation : utilise uniquement les informations de la SOURCE fournie. S'il manque une information, reste général. Si la source est un simple thème sans contenu, n'écris aucun chiffre.
- Pas de conseil personnalisé, pas de promesse de rendement ou de gain, pas de superlatifs commerciaux ; mentionne les risques quand le sujet s'y prête. Le message doit être clair, exact et non trompeur.
- Aucune donnée personnelle, aucun client réel.
- Pas plus de 2 émojis, sobres, et aucun si le ton est « expert ».
- Si la source vient de la presse, termine le corps par « Source : » suivi du nom du média.
- Respecte l'approche, le ton et la longueur demandés : la LONGUEUR est une contrainte stricte. Sur LinkedIn, les textes longs ne sont pas lus : chaque mot doit compter.
- Une seule idée par post. Accroche percutante (moins de 100 caractères), sans point d'exclamation en série.
- Le « visuel » résume le post en un coup d'œil : textes très courts, aucun chiffre ni fait absent de la source.`;

// Le visuel ne doit contenir aucun chiffre absent de la source : un élément douteux est retiré (ou le modèle change).
const MODELES = ["chiffre", "points", "comparaison", "etapes", "question"];
export function nettoyerVisuel(v, reference) {
  if (!v || typeof v !== "object") return null;
  const norm = (t) => String(t || "").replace(/[\s\u00a0\u202f]+/g, " ").toLowerCase();
  const ref = norm(reference);
  const sur = (t) => !/\d/.test(t) || (String(t).match(/\d[\d\s\u00a0\u202f.,]*(?:\s?%|\s?€|\s?ans?)?/g) || []).every((n) => ref.includes(norm(n).trim()));
  const court = (t, n) => String(t || "").trim().slice(0, n);
  const liste = (l, n, m) => (Array.isArray(l) ? l : []).map((x) => court(x, m)).filter((x) => x && sur(x)).slice(0, n);
  const out = {
    modele: MODELES.includes(v.modele) ? v.modele : "points",
    surtitre: court(v.surtitre, 30), titre: sur(v.titre) ? court(v.titre, 70) : "",
    chiffre: court(v.chiffre, 16), chiffre_legende: sur(v.chiffre_legende) ? court(v.chiffre_legende, 80) : "",
    points: liste(v.points, 4, 70),
    gauche_titre: court(v.gauche_titre, 24), gauche: liste(v.gauche, 3, 48),
    droite_titre: court(v.droite_titre, 24), droite: liste(v.droite, 3, 48),
    conclusion: sur(v.conclusion) ? court(v.conclusion, 80) : "",
  };
  // Le chiffre clé doit figurer mot pour mot dans la source.
  if (!out.chiffre || !/\d/.test(out.chiffre) || !ref.includes(norm(out.chiffre).trim())) { out.chiffre = ""; out.chiffre_legende = ""; }
  if (out.modele === "chiffre" && !out.chiffre) out.modele = out.points.length >= 2 ? "points" : "question";
  if ((out.modele === "points" || out.modele === "etapes") && out.points.length < 2) out.modele = "question";
  if (out.modele === "comparaison" && (!out.gauche.length || !out.droite.length)) out.modele = out.points.length >= 2 ? "points" : "question";
  if (!out.titre) out.titre = court(v.surtitre, 60) || "À retenir";
  return out;
}

export async function routeLinkedin(request, env, chemin, moi) {
  const db = env.DB;

  // Idées du moment (mises en cache) + actualités récentes pour un choix manuel.
  if (chemin === "/api/linkedin/sujets" && request.method === "GET") {
    const sujets = await sujetsRecents(db);
    let cache = await lireEtat(db, "linkedin_idees");
    const frais = cache && Date.now() - new Date(cache.maj_le) < DUREE_IDEES_MS;
    const echec = await lireEtat(db, "linkedin_idees_erreur");
    const echecRecent = echec && Date.now() - new Date(echec.maj_le) < 20 * 60e3;   // après un échec, on attend 20 min avant de réessayer
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

  // Signature des visuels (nom du conseiller + cabinet), propre à chaque utilisateur.
  if (chemin === "/api/linkedin/signature") {
    const cle = "signature:" + (moi?.id ?? "robot");
    if (request.method === "GET") {
      const s = await lireEtat(db, cle);
      return json(s?.valeur || { nom: moi?.nom || "", cabinet: "" });
    }
    if (request.method === "POST") {
      let d = {};
      try { d = await request.json(); } catch {}
      const v = { nom: String(d.nom || "").trim().slice(0, 60), cabinet: String(d.cabinet || "").trim().slice(0, 60) };
      await ecrireEtat(db, cle, v);
      return json(v);
    }
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
      visuel: nettoyerVisuel(p.visuel, source + "\n" + (p.corps || "") + "\n" + (p.accroches || []).join("\n")),
      accroches: (p.accroches || []).slice(0, 3),
      corps: String(p.corps || ""),
      hashtags: (p.hashtags || []).map((h) => "#" + String(h).replace(/^#+/, "").replace(/\s+/g, "")).filter((h) => h.length > 1).slice(0, 5),
      appels_action: (p.appels_action || []).slice(0, 2),
      a_verifier: (p.a_verifier || []).slice(0, 5),
      lien, modele: r.modele, restants: LIMITE_JOUR - compteur.n, ...(moi ? {} : { details: r.details }),
    });
  }
  return null;
}
