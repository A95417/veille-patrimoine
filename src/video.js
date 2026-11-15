// Création Post › Vidéo : scénario proposé par l'IA (validé et modifiable), fabrication par le robot GitHub (gratuit),
// suivi en direct (étape, temps restant), galerie, téléchargement (MP4, miniature, sous-titres .srt).
// Précautions : chiffres jamais inventés (calculés par le code ou tirés des données du site, sinon signalés « à vérifier »),
// aucune donnée client, 3 vidéos par jour, une seule fabrication à la fois, 10 vidéos gardées au plus.
import { lireEtat, ecrireEtat, generer } from "./linkedin.js";
import { routeLecture } from "./lecture.js";

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const erreur = (m, s = 400) => json({ erreur: m }, s);
const DEPOT = "A95417/veille-patrimoine";
const LIMITE_JOUR = 3, GARDER = 10, MORCEAU = 524_288, TAILLE_MAX_BASE = 420e6;   // morceaux de 512 Ko (base64)
const VOIX = ["Sadachbia", "Fenrir", "Kore", "Charon"];
const FORMATS = ["9:16", "4:5"];
const MODELES = ["deux_profils", "chiffre_semaine", "echeance", "mythe", "libre"];
const jourParis = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
const court = (s, n) => String(s ?? "").trim().slice(0, n);
const nbFr = (n) => Math.round(n).toLocaleString("fr-FR").replace(/\s/g, " ");
// Décodage base64 natif quand il existe (quasi gratuit en temps de calcul), sinon méthode classique.
function deBase64(s) {
  if (typeof Uint8Array.fromBase64 === "function") return Uint8Array.fromBase64(s);
  const bin = atob(s), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const COORD_FICTIVES = { cabinet: "BSC PATRIMOINE", activite: "Conseil en gestion de patrimoine", mail: "contact@example.com", telephone: "06 39 98 12 34", fictives: true };

// ---------------------------------------------------------------- Gabarits autorisés et leurs paramètres (liste blanche)
const PERSOS = ["lea", "tom", "tom_age", "conseil"];
const P = {   // nom → [type, longueur max ou valeurs permises]
  personnage: ["enum", PERSOS], personnage_gauche: ["enum", PERSOS], personnage_droite: ["enum", PERSOS],
  humeur: ["enum", ["sourire", "neutre", "souci", "surpris"]], decor: ["enum", ["appartement", "cafe", "bureau"]],
  nom: ["txt", 16], sous_nom: ["txt", 16], notification_titre: ["txt", 26], notification_texte: ["txt", 36], bocal: ["bool"],
  puces: ["liste", 16, 2], bulle: ["txt", 18], bandeau: ["txt", 28], gros_texte: ["txt", 16], petit_texte: ["txt", 34],
  titre_hausse: ["txt", 30], titre_baisse: ["txt", 30], tampon1: ["txt", 14], tampon2: ["txt", 14],
  libelle: ["txt", 18], de: ["num", 0, 120], a: ["num", 0, 120], unite: ["txt", 12], montant: ["txt", 16],
  gauche: ["txt", 14], droite: ["txt", 14], signe: ["enum", ["=", "≠"]], question: ["txt", 26],
  texte: ["txt", 12], legende: ["txt", 26], boule: ["bool"], titre: ["txt", 30], puce: ["txt", 18], courbe: ["txt", 14],
  colonnes: ["colonnes"], valeur: ["txt", 14], source: ["txt", 50], comparaison: ["txt", 34], points: ["liste", 30, 3],
  mythe: ["txt", 60], realite: ["txt", 60], questions: ["bool"], haut: ["txt", 30], gros: ["txt", 12],
  gauche_nom: ["txt", 22], droite_nom: ["txt", 22], note: ["txt", 60],
};
const GABARITS = {
  accroche: "ouverture choc (2 premières secondes) : personnage sur son téléphone + gros chiffre ou mot qui claque. p : personnage, bandeau, gros_texte, petit_texte",
  personnage: "personnage en situation réelle. p : personnage, humeur, decor (appartement|cafe|bureau), nom, sous_nom (ex. « 25 ans »), notification_titre + notification_texte (virement, rappel…), bocal (true = épargne qui se remplit), puces (2 max), bulle (pensée courte)",
  marche: "marchés qui montent puis baissent, deux tampons. Texte en 4 phrases courtes. p : tampon1, tampon2, titre_hausse, titre_baisse",
  calendrier: "le temps qui passe (âges, années). p : libelle, de, a, unite, personnage (qui entre ensuite), montant",
  comparaison: "deux colonnes chiffrées (UNIQUEMENT avec les chiffres de la SIMULATION). Texte : 1re phrase = profil de gauche, 2e = profil de droite. p : bandeau, gauche_nom, droite_nom, note",
  egalite: "deux personnages, même effort, puis une question. p : gauche, droite, signe, question, personnage_gauche, personnage_droite",
  grand_mot: "un mot ou chiffre géant, puis option boule de neige (intérêts composés). p : texte, legende, boule",
  bocaux: "« chaque situation est unique » : 3 bocaux de tailles différentes, une puce, une courbe. p : titre, colonnes [{libelle, niveau 0-1}], puce, courbe",
  chiffre: "un chiffre clé (UNIQUEMENT un chiffre des DONNÉES) avec sa source. p : bandeau, valeur, libelle, source, comparaison",
  liste: "2 ou 3 réflexes ou étapes. p : titre, points",
  mythe: "idée reçue barrée puis réalité. p : mythe, realite",
  sablier: "le temps, message final fort. p : questions, haut, gros",
};

function nettoyerP(p, type) {
  const o = {};
  for (const [k, v] of Object.entries(p || {})) {
    const r = P[k]; if (!r || v == null || v === "") continue;
    if (r[0] === "enum" && r[1].includes(v)) o[k] = v;
    else if (r[0] === "txt") o[k] = court(v, r[1]);
    else if (r[0] === "bool") o[k] = !!v;
    else if (r[0] === "num" && Number.isFinite(Number(v))) o[k] = Math.max(r[1], Math.min(r[2], Math.round(Number(v))));
    else if (r[0] === "liste" && Array.isArray(v)) o[k] = v.map((x) => court(x, r[1])).filter(Boolean).slice(0, r[2]);
    else if (r[0] === "colonnes" && Array.isArray(v)) o[k] = v.slice(0, 3).map((c) => ({ libelle: court(c?.libelle, 12), niveau: Math.max(.1, Math.min(.95, Number(c?.niveau) || .5)) }));
  }
  return o;
}

// Calcul d'épargne mensuelle (versements en fin de mois, capitalisation mensuelle) : chiffres « exemple fictif ».
export function simuler(s) {
  const nb = (x, d) => (x !== "" && x != null && Number.isFinite(Number(x)) ? Number(x) : d);
  const m = Math.max(10, Math.min(5000, nb(s.mensuel, 100))), taux = Math.max(0, Math.min(10, nb(s.taux, 4))) / 100;
  const a1 = Math.max(16, Math.min(80, nb(s.age1, 25))), a2 = Math.max(a1 + 1, Math.min(85, nb(s.age2, 35))), fin = Math.max(a2 + 1, Math.min(90, nb(s.age_fin, 65)));
  const fv = (mois) => { const i = taux / 12; return i ? m * ((1 + i) ** mois - 1) / i : m * mois; };
  const A = { versements: m * 12 * (fin - a1), capital: fv(12 * (fin - a1)) }, B = { versements: m * 12 * (fin - a2), capital: fv(12 * (fin - a2)) };
  return { mensuel: m, taux: taux * 100, age1: a1, age2: a2, age_fin: fin, A, B, ecart: A.capital - B.capital, attente: a2 - a1 };
}

// Chiffres présents dans un texte (« 49 000 € », « 4 % », « 2,44 »).
// Chiffres d'un texte, avec ce qui suit (unité) : « 49 000 € », « 4,4 % », « 7 ans ». Les milliers ne sont séparés que par une
// espace suivie d'exactement 3 chiffres (« en 2026 12 000 » donne bien 2026 et 12 000).
function nombresUnites(t) {
  const r = [], re = /\d{1,3}(?:[ \u202f\u00a0]\d{3})+(?![\d])(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g;
  let m;
  while ((m = re.exec(String(t)))) {
    const brut = m[0].replace(/[ \u202f\u00a0]/g, "");
    const v = /^\d{1,3}\.\d{3}$/.test(brut) ? parseFloat(brut.replace(".", "")) : parseFloat(brut.replace(",", "."));   // « 2.000 » = 2 000
    if (Number.isFinite(v)) r.push({ v, unite: /^\s*(%|€|euros?|ans?\b|mois\b)/i.test(String(t).slice(re.lastIndex)) });
  }
  return r;
}
const nombres = (t) => nombresUnites(t).map((x) => x.v);
function autorises(valeurs) {
  const s = new Set();
  // valeur exacte, et arrondis raisonnables (« près de 118 000 » pour 118 196) : jamais d'arrondi grossier sur un petit nombre
  for (const v of valeurs) {
    if (!Number.isFinite(v)) continue;
    s.add(+v.toFixed(2)); s.add(+v.toFixed(1)); s.add(Math.round(v));
    const pas = Math.abs(v) >= 10000 ? [100, 500, 1000] : Math.abs(v) >= 1000 ? [10, 100] : Math.abs(v) >= 200 ? [10] : [];
    for (const q of pas) { s.add(Math.round(v / q) * q); s.add(Math.floor(v / q) * q); s.add(Math.ceil(v / q) * q); }
  }
  return s;
}
// Signale les chiffres du scénario qui ne viennent ni du calcul, ni des données, ni du sujet saisi.
function chiffresAVerifier(scenes, permis, post = "") {
  const r = [];
  const ok = ({ v, unite }) => (Number.isInteger(v) ? permis.has(v) || (!unite && v <= 3) : permis.has(+v.toFixed(2)) || permis.has(+v.toFixed(1)));
  const verifier = (t, scene) => { for (const x of nombresUnites(t)) if (!ok(x)) r.push({ scene, chiffre: x.v, texte: court(t, 80) }); };
  scenes.forEach((s, i) => {
    if (s.type === "fin") return;
    verifier(s.texte, i + 1);
    for (const v of Object.values(s.p || {})) {
      if (typeof v === "string") verifier(v, i + 1);
      else if (typeof v === "number") { if (!ok({ v, unite: true })) r.push({ scene: i + 1, chiffre: v, texte: String(v) }); }
      else if (Array.isArray(v)) v.forEach((x) => verifier(typeof x === "string" ? x : x?.libelle || "", i + 1));
    }
  });
  if (post) verifier(post.replace(/#\S+/g, ""), "texte de publication");
  return r;
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    titre: { type: "STRING" },
    scenes: { type: "ARRAY", items: { type: "OBJECT", properties: {
      type: { type: "STRING", enum: Object.keys(GABARITS) },
      texte: { type: "STRING" },
      p: { type: "OBJECT", properties: Object.fromEntries(Object.entries(P).map(([k, r]) => [k,
        r[0] === "bool" ? { type: "BOOLEAN" } : r[0] === "num" ? { type: "NUMBER" } : r[0] === "liste" ? { type: "ARRAY", items: { type: "STRING" } }
          : r[0] === "colonnes" ? { type: "ARRAY", items: { type: "OBJECT", properties: { libelle: { type: "STRING" }, niveau: { type: "NUMBER" } } } }
            : r[0] === "enum" ? { type: "STRING", enum: r[1] } : { type: "STRING" }])) },
    }, required: ["type", "texte"] } },
    texte_post: { type: "STRING" },
    hashtags: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["titre", "scenes", "texte_post"],
};

function fin(cabinet) {
  const nom = court(cabinet || "BSC Patrimoine", 30);
  const parle = nom === nom.toUpperCase() ? nom.split(" ").map((m, i) => (i === 0 && m.length <= 4 ? m : m.charAt(0) + m.slice(1).toLowerCase())).join(" ") : nom;
  return { type: "fin", texte: `Et si on prenait le temps d'en parler ? ${parle}. Premier échange offert, sans engagement.`, p: { question: "Et si on prenait le temps d'en parler ?", offre: "Premier échange offert · sans engagement" } };
}
const MOTS_PAR_S = 2.85;   // débit mesuré de la voix Sadachbia accélérée (×1,08)
const nbMots = (t) => String(t).split(/\s+/).filter((m) => /[\p{L}\d]/u.test(m)).length;
const dureeEstimee = (scenes) => Math.round(scenes.reduce((n, s) => n + nbMots(s.texte), 0) / MOTS_PAR_S + 4);

async function donneesDuSite(db, modele) {
  const lire = async (ch) => { try { return await (await routeLecture(ch, new URL("https://x" + ch), db)).json(); } catch { return null; } };
  if (modele === "chiffre_semaine") {
    const m = await lire("/api/marches"), series = m?.taux?.series || [];
    return series.filter((s) => s.points?.length).map((s) => { const [date, v] = s.points[s.points.length - 1], prec = s.points.length > 1 ? s.points[s.points.length - 2][1] : null;
      return { libelle: s.nom, detail: s.detail, valeur: v, date, precedent: prec, source: s.source, lien: s.lien }; });
  }
  if (modele === "echeance") {
    const c = await lire("/api/calendrier");
    return (c?.echeances || []).slice(0, 6).map((e) => ({ date: e.date, titre: e.titre, detail: e.detail, source: e.conseil ? "service-public.gouv.fr" : "impots.gouv.fr", lien: e.lien }));
  }
  return [];
}

async function proposerScenario(env, db, d, coord) {
  const modele = MODELES.includes(d.modele) ? d.modele : "libre", duree = [30, 45, 60].includes(Number(d.duree)) ? Number(d.duree) : 45;
  const sujet = court(d.sujet, 300);
  const sim = modele === "deux_profils" ? simuler(d.simulation || {}) : null;
  const data = await donneesDuSite(db, modele);
  if ((modele === "chiffre_semaine" || modele === "echeance") && !data.length) throw new Error("Les données du site ne sont pas encore disponibles pour ce modèle (taux ou calendrier). Réessayez plus tard.");
  const mots = Math.round((duree - 4) * MOTS_PAR_S);
  let donnees = "";
  if (sim) donnees = `SIMULATION (exemple fictif, calculée par le site) : ${sim.mensuel} € par mois, rendement fictif de ${String(sim.taux).replace(".", ",")} % par an.
- Profil 1 commence à ${sim.age1} ans : à ${sim.age_fin} ans il a versé ${nbFr(sim.A.versements)} € et dispose d'environ ${nbFr(sim.A.capital)} €.
- Profil 2 commence à ${sim.age2} ans (il attend ${sim.attente} ans) : à ${sim.age_fin} ans il a versé ${nbFr(sim.B.versements)} € et dispose d'environ ${nbFr(sim.B.capital)} €.
- Écart : environ ${nbFr(sim.ecart)} €. Arrondis permis : au millier le plus proche.`;
  else if (data.length) donnees = "DONNÉES OFFICIELLES (seuls chiffres et dates autorisés, cite la source) :\n" + data.map((x) => "- " + JSON.stringify(x)).join("\n");
  const consignes = `Tu écris le scénario d'une vidéo courte verticale (TikTok, Reels, LinkedIn) pour le cabinet ${coord.cabinet || "BSC Patrimoine"}, conseil en gestion de patrimoine.
Public : 18-29 ans et un peu plus âgés. Ton énergique, clair, professionnel, jamais enfantin. Français impeccable.
RÈGLES STRICTES :
- N'utilise AUCUN chiffre, montant, taux, date ou règle fiscale qui ne figure pas dans les DONNÉES ou la SIMULATION fournies. Sans données, reste qualitatif (pas de chiffre).
- Pas de promesse de rendement, pas de conseil personnalisé, pas de nom de produit commercial ou de marque, aucune donnée client.
- Écris les nombres en chiffres avec espaces (49 000 €, 4 %).
- Texte lu : phrases courtes, ponctuées (une idée par phrase), environ ${mots} mots au total.
- Structure : 1re scène de type « accroche » (on doit comprendre l'enjeu en 2 secondes), puis 4 à 8 scènes variées, une phrase du type « chaque situation est unique » (gabarit bocaux conseillé), et une conclusion forte (gabarit sablier conseillé). N'écris PAS la scène de fin : elle est ajoutée automatiquement.
- Personnages disponibles : lea (femme, 25 ans), tom (homme, 25 ans), tom_age (le même à 35 ans, barbe, veste), conseil (conseiller).
- Les paramètres « p » sont des textes très courts affichés à l'écran : ne pas répéter mot pour mot la phrase lue.
GABARITS :
${Object.entries(GABARITS).map(([k, v]) => `- ${k} : ${v}`).join("\n")}
Termine par texte_post (2 à 4 lignes pour accompagner la vidéo, avec « Investir comporte un risque de perte en capital. »${sim ? " et « Exemple fictif. »" : ""}) et 3 à 5 hashtags.`;
  const demande = `MODÈLE : ${modele}\nSUJET : ${sujet || (modele === "deux_profils" ? "Commencer tôt à épargner : le temps est le meilleur allié" : modele === "chiffre_semaine" ? "Le chiffre de la semaine" : modele === "echeance" ? "Une échéance fiscale à ne pas rater" : modele === "mythe" ? "Une idée reçue sur l'épargne ou le patrimoine" : "")}\nDURÉE VISÉE : ${duree} secondes\n${donnees}`;
  let r = await generer(env, db, consignes, demande, SCHEMA, "fort");
  // Si Gemini refuse le schéma (trop détaillé), on redemande en JSON libre : le site filtre de toute façon chaque champ.
  if (!r.donnees && (r.details || []).some((d) => /HTTP 400/.test(d)))
    r = await generer(env, db, consignes + `\nRéponds uniquement en JSON : {"titre": "...", "scenes": [{"type": "accroche", "texte": "...", "p": {...}}], "texte_post": "...", "hashtags": ["..."]}`, demande, undefined, "fort");
  if (!r.donnees) throw new Error(r.erreur || "L'IA n'a pas répondu.");
  let scenes = (r.donnees.scenes || []).filter((s) => GABARITS[s.type] && court(s.texte, 400))
    .map((s) => ({ type: s.type, texte: court(s.texte, 400), p: nettoyerP(s.p, s.type) })).slice(0, 11);
  if (!sim) scenes = scenes.filter((s) => s.type !== "comparaison");
  if (scenes.length < 3) throw new Error("Le scénario proposé est incomplet. Réessayez.");
  scenes.push(fin(coord.cabinet));
  const permis = autorises([...(sim ? [sim.mensuel, sim.taux, sim.age1, sim.age2, sim.age_fin, sim.attente, sim.A.versements, sim.A.capital, sim.B.versements, sim.B.capital, sim.ecart,
      sim.A.capital - sim.A.versements, sim.B.capital - sim.B.versements, sim.A.versements - sim.B.versements, ...[.5, 1.5, 2, 3].map((k) => sim.mensuel * k)] : []),
    ...(data.length ? [new Date().getFullYear(), new Date().getFullYear() + 1] : []),
    ...data.flatMap((x) => [x.valeur, x.precedent, ...nombres(x.date || ""), ...nombres(x.titre || ""), ...nombres(x.detail || "")]), ...nombres(sujet)]);
  const tags = (r.donnees.hashtags || []).map((h) => "#" + String(h).replace(/^#/, "").replace(/\s+/g, "")).filter((h) => h.length > 2).slice(0, 5);
  let post = court(r.donnees.texte_post, 900);
  if (!/perte en capital/i.test(post)) post += "\nInvestir comporte un risque de perte en capital.";
  if (sim && !/fictif/i.test(post)) post += "\nExemple fictif à visée pédagogique.";
  const texte_post = post + (tags.length ? "\n\n" + tags.join(" ") : "");
  return {
    modele, sujet: sujet || court(r.donnees.titre, 120), duree, scenes, texte_post,
    donnees: { simulation: sim, data, permis: [...permis] }, a_verifier: chiffresAVerifier(scenes, permis, texte_post),
  };
}

// Applique les chiffres calculés aux scènes « comparaison » (jamais ceux de l'IA).
function avecChiffres(scenes, donnees) {
  const sim = donnees?.simulation;
  return scenes.map((s) => {
    if (s.type !== "comparaison" || !sim) return s;
    return { ...s, p: { ...s.p, unite: "€", gauche: { nom: s.p.gauche_nom || `Dès ${sim.age1} ans`, valeur: Math.round(sim.A.capital), verse: Math.round(sim.A.versements), personnage: "lea" },
      droite: { nom: s.p.droite_nom || `Dès ${sim.age2} ans`, valeur: Math.round(sim.B.capital), verse: Math.round(sim.B.versements), personnage: "tom_age" },
      note: `Exemple fictif : ${sim.mensuel} €/mois, ${String(sim.taux).replace(".", ",")} %/an, non garanti` } };
  });
}

async function lanceesDuJour(db) { const c = (await lireEtat(db, "video_jour"))?.valeur; return c?.jour === jourParis() ? c.n : 0; }
async function compterLancement(db) { await ecrireEtat(db, "video_jour", { jour: jourParis(), n: (await lanceesDuJour(db)) + 1 }); }
async function coordonnees(db) { return (await lireEtat(db, "video_coordonnees"))?.valeur || COORD_FICTIVES; }
function mentions(v, coord) {
  const m = [];
  const donnees = JSON.parse(v.donnees || "{}");
  if (donnees.simulation) m.push("Exemple fictif à visée pédagogique, rendement non garanti.");
  else if (donnees.data?.length) m.push("Sources : " + [...new Set(donnees.data.map((x) => x.source).filter(Boolean))].join(", ") + ".");
  m.push("Investir comporte un risque de perte en capital.");
  if (coord.fictives) m.push("Coordonnées fictives (provisoires).");
  return m;
}

async function declencher(env, id) {
  if (!env.GH_DISPATCH_TOKEN) return "jeton GitHub absent (secret GH_DISPATCH_TOKEN)";
  try {
    const r = await fetch(`https://api.github.com/repos/${DEPOT}/actions/workflows/video.yml/dispatches`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "veille-patrimoine-video", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main", inputs: { video_id: id } }),
    });
    return r.status === 204 ? null : `GitHub a répondu ${r.status}${r.status === 403 || r.status === 404 ? " (droits du jeton insuffisants pour lancer le robot vidéo)" : ""}`;
  } catch (e) { return "GitHub injoignable : " + e.message; }
}

// Délais dépassés, file d'attente : remis en ordre à chaque consultation (pas besoin de minuteur).
async function entretenir(env) {
  const db = env.DB, maintenant = Date.now(), iso = new Date().toISOString();
  const { results } = await db.prepare("SELECT id, statut, lance_le, demarre_le, maj_le FROM videos WHERE statut IN ('attente', 'en_cours', 'file')").all();
  for (const v of results) {
    const depuis = (x) => (maintenant - new Date(x || 0)) / 1000;
    let msg = null;
    if (v.statut === "attente" && depuis(v.lance_le) > 420) msg = "Le robot n'a pas démarré (GitHub ne l'a pas lancé à temps). Relancez la génération.";
    if (v.statut === "en_cours" && depuis(v.maj_le) > 420) msg = "Le robot ne donne plus de nouvelles (incident technique). Relancez la génération.";
    if ((v.statut === "en_cours" || v.statut === "attente") && depuis(v.lance_le) > 1500) msg = "Délai maximum dépassé (25 min). Relancez la génération.";
    if (msg) await db.prepare("UPDATE videos SET statut = 'erreur', erreur = ?, maj_le = ? WHERE id = ?").bind(msg, iso, v.id).run();
  }
  const suivante = await db.prepare("SELECT id FROM videos WHERE statut = 'file' ORDER BY lance_le LIMIT 1").first();
  if (suivante) {
    const go = await db.prepare(`UPDATE videos SET statut = 'attente', lance_le = ?, maj_le = ?, etape = 'Démarrage du robot', progression = 0
      WHERE id = ? AND statut = 'file' AND NOT EXISTS (SELECT 1 FROM videos WHERE statut IN ('attente', 'en_cours'))`).bind(iso, iso, suivante.id).run();
    if (go.meta.changes === 1) {
      const pb = await declencher(env, suivante.id);
      if (pb) await db.prepare("UPDATE videos SET statut = 'erreur', erreur = ? WHERE id = ?").bind(pb, suivante.id).run();
    }
  }
}

export { entretenir as entretenirVideos };
async function nettoyerAnciennes(db) {
  // morceaux des vidéos échouées ou annulées : inutiles, on libère la place
  await db.prepare("DELETE FROM video_morceaux WHERE video_id IN (SELECT id FROM videos WHERE statut IN ('erreur', 'annule', 'brouillon'))").run();
  const { results } = await db.prepare("SELECT id FROM videos WHERE statut IN ('pret', 'a_verifier') ORDER BY termine_le DESC LIMIT -1 OFFSET ?").bind(GARDER).all();
  for (const v of results) await db.batch([db.prepare("DELETE FROM video_morceaux WHERE video_id = ?").bind(v.id), db.prepare("DELETE FROM videos WHERE id = ?").bind(v.id)]);
}

const COLS = "v.id, v.utilisateur_id, u.nom AS auteur, v.cree_le, v.maj_le, v.statut, v.modele, v.sujet, v.format, v.voix, v.duree_cible, v.etape, v.progression, v.eta_s, v.lance_le, v.demarre_le, v.termine_le, v.erreur, v.alertes, v.duree, v.taille, v.duree_fabrication, v.miniature IS NOT NULL AS a_miniature";
function sortie(v, complet = false) {
  const o = { ...v, alertes: JSON.parse(v.alertes || "[]"), a_miniature: !!v.a_miniature };
  if (complet) { o.storyboard = JSON.parse(v.storyboard || "null"); o.a_verifier = JSON.parse(v.a_verifier || "[]"); o.texte_post = v.texte_post; o.donnees = JSON.parse(v.donnees || "{}"); delete o.donnees.permis; }
  return o;
}

// ---------------------------------------------------------------- Routes du site (utilisateur connecté)
export async function routeVideo(request, env, chemin, moi, url) {
  const db = env.DB, methode = request.method, iso = new Date().toISOString();
  const lire = async () => { try { return await request.json(); } catch { return {}; } };
  const proprio = (v) => v && (v.utilisateur_id === moi.id || moi.role === "admin");

  if (chemin === "/api/video/reglages" && methode === "GET") {
    const lancees = await lanceesDuJour(db);
    return json({ coordonnees: await coordonnees(db), voix: VOIX, formats: FORMATS, limite_jour: LIMITE_JOUR, lancees_aujourdhui: lancees, admin: moi.role === "admin" });
  }
  if (chemin === "/api/video/reglages" && methode === "POST") {
    if (moi.role !== "admin") return erreur("Seul l'administrateur peut modifier les coordonnées du cabinet.", 403);
    const d = await lire();
    if (d.fictives) { await db.prepare("DELETE FROM etat WHERE cle = 'video_coordonnees'").run(); return json({ coordonnees: COORD_FICTIVES }); }
    const c = { cabinet: court(d.cabinet, 30) || "BSC PATRIMOINE", activite: court(d.activite, 44) || "Conseil en gestion de patrimoine", mail: court(d.mail, 60), telephone: court(d.telephone, 24), fictives: false };
    if (c.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.mail)) return erreur("Adresse e-mail invalide.");
    if (c.telephone && !/^[+\d][\d .]{7,22}$/.test(c.telephone)) return erreur("Numéro de téléphone invalide.");
    await ecrireEtat(db, "video_coordonnees", c);
    return json({ coordonnees: c });
  }

  if (chemin === "/api/video/liste" && methode === "GET") {
    await entretenir(env);
    const { results } = await db.prepare(`SELECT ${COLS} FROM videos v LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id ORDER BY v.cree_le DESC LIMIT 40`).all();
    return json({ videos: results.map((v) => sortie(v)) });
  }

  if (chemin === "/api/video/scenario" && methode === "POST") {
    if (!env.GEMINI_API_KEY) return erreur("L'IA n'est pas configurée sur le site.", 503);
    const d = await lire();
    const brouillons = await db.prepare("SELECT COUNT(*) AS n FROM videos WHERE statut = 'brouillon' AND cree_le >= ?").bind(new Date(Date.now() - 86400e3).toISOString()).first();
    if (brouillons.n >= 20) return erreur("Trop de scénarios proposés aujourd'hui (20) : réutilisez un brouillon existant.", 429);
    const coord = await coordonnees(db);
    let s;
    try { s = await proposerScenario(env, db, d, coord); } catch (e) { return erreur(e.message, 502); }
    const id = crypto.randomUUID();
    const format = FORMATS.includes(d.format) ? d.format : "9:16", voix = VOIX.includes(d.voix) ? d.voix : "Sadachbia";
    await db.prepare(`INSERT INTO videos (id, utilisateur_id, cree_le, maj_le, statut, modele, sujet, format, voix, duree_cible, storyboard, donnees, a_verifier, texte_post)
      VALUES (?, ?, ?, ?, 'brouillon', ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, moi.id, iso, iso, s.modele, s.sujet, format, voix, s.duree, JSON.stringify(s.scenes), JSON.stringify(s.donnees), JSON.stringify(s.a_verifier), s.texte_post).run();
    const v = await db.prepare(`SELECT ${COLS}, v.storyboard, v.a_verifier, v.texte_post, v.donnees FROM videos v LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id WHERE v.id = ?`).bind(id).first();
    return json({ video: sortie(v, true) });
  }

  const m = chemin.match(/^\/api\/video\/([0-9a-f-]{36})(?:\/([a-z]+))?$/);
  if (!m) return null;
  const [, id, action] = m;
  const v = await db.prepare(`SELECT ${COLS}, v.storyboard, v.a_verifier, v.texte_post, v.donnees, v.morceaux, v.srt FROM videos v LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id WHERE v.id = ?`).bind(id).first();
  if (!v) return erreur("Vidéo introuvable.", 404);

  if (!action && methode === "GET") {
    if (["attente", "en_cours", "file"].includes(v.statut)) { await entretenir(env); return json({ video: sortie(await db.prepare(`SELECT ${COLS}, v.storyboard, v.a_verifier, v.texte_post, v.donnees FROM videos v LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id WHERE v.id = ?`).bind(id).first(), true) }); }
    return json({ video: sortie(v, true) });
  }

  if (action === "storyboard" && methode === "POST") {
    if (!proprio(v)) return erreur("Seul l'auteur peut modifier ce scénario.", 403);
    if (!["brouillon", "erreur", "annule"].includes(v.statut)) return erreur("Cette vidéo est déjà lancée.", 409);
    const d = await lire();
    const ancien = JSON.parse(v.storyboard || "[]");
    let scenes = (Array.isArray(d.scenes) ? d.scenes : ancien).filter((s) => GABARITS[s?.type] || s?.type === "fin")
      .map((s) => s.type === "fin" ? null : { type: s.type, texte: court(s.texte, 400), p: nettoyerP(s.p, s.type) }).filter((s) => s && s.texte).slice(0, 11);
    if (scenes.length < 2) return erreur("Il faut au moins deux scènes avec du texte.");
    scenes.push(fin((await coordonnees(db)).cabinet));
    const don = JSON.parse(v.donnees || "{}"), permis = new Set(don.permis || []);
    let post = court(d.texte_post ?? v.texte_post, 1500);
    if (!/perte en capital/i.test(post)) post += "\nInvestir comporte un risque de perte en capital.";
    if (don.simulation && !/fictif/i.test(post)) post += "\nExemple fictif à visée pédagogique.";
    const format = FORMATS.includes(d.format) ? d.format : v.format, voix = VOIX.includes(d.voix) ? d.voix : v.voix;
    await db.prepare("UPDATE videos SET storyboard = ?, a_verifier = ?, texte_post = ?, format = ?, voix = ?, statut = 'brouillon', erreur = NULL, maj_le = ? WHERE id = ?")
      .bind(JSON.stringify(scenes), JSON.stringify(chiffresAVerifier(scenes, permis, post)), post, format, voix, iso, id).run();
    return json({ video: sortie(await db.prepare(`SELECT ${COLS}, v.storyboard, v.a_verifier, v.texte_post, v.donnees FROM videos v LEFT JOIN utilisateurs u ON u.id = v.utilisateur_id WHERE v.id = ?`).bind(id).first(), true) });
  }

  if (action === "lancer" && methode === "POST") {
    if (!proprio(v)) return erreur("Seul l'auteur peut lancer cette vidéo.", 403);
    if (!["brouillon", "erreur", "annule"].includes(v.statut)) return erreur("Cette vidéo est déjà lancée.", 409);
    if ((await lanceesDuJour(db)) >= LIMITE_JOUR) return erreur(`Limite atteinte : ${LIMITE_JOUR} vidéos par jour pour préserver le quota gratuit de la voix. Réessayez demain.`, 429);
    const taille = (await db.prepare("SELECT 1").run()).meta?.size_after || 0;
    if (taille > TAILLE_MAX_BASE) return erreur("La base du site est presque pleine : supprimez d'anciennes vidéos avant d'en créer une nouvelle.", 507);
    await entretenir(env);
    await db.prepare("DELETE FROM video_morceaux WHERE video_id = ?").bind(id).run();
    // Démarrage immédiat seulement si aucune fabrication n'est en cours (vérifié dans la même requête : pas de double lancement).
    const go = await db.prepare(`UPDATE videos SET statut = 'attente', lance_le = ?, maj_le = ?, demarre_le = NULL, etape = 'Démarrage du robot', progression = 0, eta_s = NULL, erreur = NULL, alertes = NULL
      WHERE id = ? AND statut IN ('brouillon', 'erreur', 'annule') AND NOT EXISTS (SELECT 1 FROM videos WHERE statut IN ('attente', 'en_cours'))`).bind(iso, iso, id).run();
    if (go.meta.changes === 1) {
      const pb = await declencher(env, id);
      if (pb) { await db.prepare("UPDATE videos SET statut = 'erreur', erreur = ?, lance_le = NULL WHERE id = ?").bind(pb, id).run(); return erreur(pb, 502); }
    } else {
      const r2 = await db.prepare("UPDATE videos SET statut = 'file', lance_le = ?, maj_le = ?, etape = 'En file d''attente', progression = 0, erreur = NULL, alertes = NULL WHERE id = ? AND statut IN ('brouillon', 'erreur', 'annule')").bind(iso, iso, id).run();
      if (r2.meta.changes !== 1) return erreur("Cette vidéo est déjà lancée.", 409);
    }
    await compterLancement(db);
    return json({ ok: true });
  }

  if (action === "annuler" && methode === "POST") {
    if (!proprio(v)) return erreur("Seul l'auteur peut annuler.", 403);
    if (!["attente", "en_cours", "file"].includes(v.statut)) return erreur("Cette vidéo n'est pas en cours de fabrication.");
    await db.batch([db.prepare("UPDATE videos SET statut = 'annule', etape = NULL, maj_le = ?, lance_le = NULL WHERE id = ?").bind(iso, id), db.prepare("DELETE FROM video_morceaux WHERE video_id = ?").bind(id)]);
    await entretenir(env);
    return json({ ok: true });
  }

  if (action === "dupliquer" && methode === "POST") {
    const nid = crypto.randomUUID();
    await db.prepare(`INSERT INTO videos (id, utilisateur_id, cree_le, maj_le, statut, modele, sujet, format, voix, duree_cible, storyboard, donnees, a_verifier, texte_post)
      SELECT ?, ?, ?, ?, 'brouillon', modele, sujet, format, voix, duree_cible, storyboard, donnees, a_verifier, texte_post FROM videos WHERE id = ?`).bind(nid, moi.id, iso, iso, id).run();
    return json({ id: nid });
  }

  if (action === "supprimer" && methode === "POST") {
    if (!proprio(v)) return erreur("Seul l'auteur ou l'administrateur peut supprimer cette vidéo.", 403);
    if (["attente", "en_cours"].includes(v.statut)) return erreur("Annulez d'abord la fabrication en cours.", 409);
    await db.batch([db.prepare("DELETE FROM video_morceaux WHERE video_id = ?").bind(id), db.prepare("DELETE FROM videos WHERE id = ?").bind(id)]);
    return json({ ok: true });
  }

  if (action === "miniature" && methode === "GET") {
    const l = await db.prepare("SELECT miniature FROM videos WHERE id = ?").bind(id).first();
    if (!l?.miniature) return erreur("Pas de miniature.", 404);
    return new Response(deBase64(l.miniature), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400", "Content-Disposition": `inline; filename="miniature-${id.slice(0, 8)}.jpg"` } });
  }
  if (action === "srt" && methode === "GET") {
    if (!v.srt) return erreur("Pas de sous-titres.", 404);
    return new Response(v.srt, { headers: { "Content-Type": "application/x-subrip; charset=utf-8", "Content-Disposition": `attachment; filename="sous-titres-${id.slice(0, 8)}.srt"`, "Cache-Control": "private, no-store" } });
  }
  // Fichier vidéo : lecture par plages (Range), indispensable à Safari sur iPhone, morceau par morceau.
  if (action === "fichier" && methode === "GET") {
    if (!["pret", "a_verifier"].includes(v.statut) || !v.taille) return erreur("La vidéo n'est pas prête.", 404);
    const total = v.taille, plage = /bytes=(\d*)-(\d*)/.exec(request.headers.get("Range") || "");
    let debut = 0, finO = total - 1;
    if (plage) {
      debut = plage[1] ? Number(plage[1]) : Math.max(0, total - Number(plage[2]));
      finO = plage[1] && plage[2] ? Math.min(Number(plage[2]), total - 1) : total - 1;
      if (debut >= total || debut > finO) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
      finO = Math.min(finO, debut + MORCEAU * 2 - 1);   // au plus deux morceaux par réponse
    }
    const tel = url.searchParams.get("telecharger") ? { "Content-Disposition": `attachment; filename="video-${id.slice(0, 8)}.mp4"` } : {};
    const ent = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400", ...tel };
    if (!plage && total > MORCEAU * 2) {
      // sans plage : envoi en flux, un morceau à la fois (jamais toute la vidéo en mémoire)
      const { readable, writable } = new TransformStream();
      (async () => {
        const w = writable.getWriter();
        try { for (let n = 0; n < (v.morceaux || 0); n++) { const r = await db.prepare("SELECT donnees FROM video_morceaux WHERE video_id = ? AND n = ?").bind(id, n).first(); if (!r) throw new Error("morceau manquant"); await w.write(deBase64(r.donnees)); } await w.close(); }
        catch (e) { await w.abort(e).catch(() => {}); }
      })();
      return new Response(readable, { headers: { ...ent, "Content-Length": String(total) } });
    }
    const n1 = Math.floor(debut / MORCEAU), n2 = Math.floor(finO / MORCEAU);
    const { results } = await db.prepare("SELECT n, donnees FROM video_morceaux WHERE video_id = ? AND n BETWEEN ? AND ? ORDER BY n").bind(id, n1, n2).all();
    if (results.length !== n2 - n1 + 1) return erreur("Fichier incomplet.", 500);
    const out = new Uint8Array(finO - debut + 1);
    let pos = 0;
    for (const r of results) {
      const b = deBase64(r.donnees), base = r.n * MORCEAU;
      const a = Math.max(debut, base) - base, z = Math.min(finO + 1, base + b.length) - base;
      out.set(b.subarray(a, z), pos); pos += z - a;
    }
    return new Response(out, plage ? { status: 206, headers: { ...ent, "Content-Range": `bytes ${debut}-${finO}/${total}` } } : { headers: ent });
  }
  return null;
}

// ---------------------------------------------------------------- Routes du robot (jeton ROBOT_TOKEN vérifié avant)
export async function routeVideoRobot(request, env, chemin) {
  const db = env.DB, iso = new Date().toISOString();
  const m = chemin.match(/^\/api\/robot\/video\/([0-9a-f-]{36})(?:\/(etat|fin|morceau)(?:\/(\d+))?)?$/);
  if (!m) return json({ erreur: "Adresse inconnue." }, 404);
  const [, id, action, n] = m;
  const v = await db.prepare("SELECT * FROM videos WHERE id = ?").bind(id).first();
  if (!v) return json({ erreur: "Vidéo introuvable." }, 404);

  if (!action && request.method === "GET") {
    const coord = await coordonnees(db), scenes = avecChiffres(JSON.parse(v.storyboard || "[]"), JSON.parse(v.donnees || "{}"));
    return json({ statut: v.statut, job: { format: v.format, voix: v.voix, scenes, duree_estimee: dureeEstimee(scenes),
      config: { cabinet: coord.cabinet, activite: coord.activite, mail: coord.mail, telephone: coord.telephone, mentions: mentions(v, coord) } } });
  }
  if (action === "etat" && request.method === "POST") {
    const d = await request.json().catch(() => ({}));
    if (v.statut === "annule") return json({ annule: true });
    if (d.erreur) {
      if (!["pret", "a_verifier"].includes(v.statut)) await db.batch([db.prepare("UPDATE videos SET statut = 'erreur', erreur = ?, maj_le = ? WHERE id = ?").bind(court(d.erreur, 300), iso, id), db.prepare("DELETE FROM video_morceaux WHERE video_id = ?").bind(id)]);
      await entretenir(env);
      return json({ ok: true });
    }
    if (!["attente", "en_cours"].includes(v.statut)) return json({ annule: true });
    await db.prepare("UPDATE videos SET statut = 'en_cours', demarre_le = COALESCE(demarre_le, ?), etape = ?, progression = ?, eta_s = ?, maj_le = ? WHERE id = ?")
      .bind(iso, court(d.etape, 60), Math.max(0, Math.min(1, Number(d.progression) || 0)), d.preparation ? null : Math.max(0, Math.round(Number(d.eta_s) || 0)), iso, id).run();
    return json({ ok: true });
  }
  if (action === "morceau" && request.method === "PUT") {
    if (v.statut !== "en_cours") return json({ annule: true }, 409);
    const b = (await request.text()).trim();   // base64
    if (b.length > MORCEAU * 1.4 || Number(n) > 80 || !/^[A-Za-z0-9+/=]+$/.test(b)) return json({ erreur: "Morceau invalide." }, 413);
    await db.prepare("INSERT OR REPLACE INTO video_morceaux (video_id, n, donnees) VALUES (?, ?, ?)").bind(id, Number(n), b).run();
    return json({ ok: true });
  }
  if (action === "fin" && request.method === "POST") {
    if (v.statut !== "en_cours") return json({ annule: true }, 409);
    const d = await request.json().catch(() => ({}));
    const nb = await db.prepare("SELECT COUNT(*) AS n FROM video_morceaux WHERE video_id = ?").bind(id).first();
    if (nb.n !== Number(d.morceaux) || Math.ceil(Number(d.taille) / MORCEAU) !== nb.n) return json({ erreur: `Fichier incomplet (${nb.n}/${d.morceaux} morceaux).` }, 400);
    const mini = typeof d.miniature === "string" && d.miniature.length < 1_200_000 && /^[A-Za-z0-9+/=]+$/.test(d.miniature) ? d.miniature : null;
    const alertes = (Array.isArray(d.alertes) ? d.alertes : []).map((a) => court(a, 160)).slice(0, 10);
    await db.prepare(`UPDATE videos SET statut = ?, etape = NULL, progression = 1, eta_s = 0, termine_le = ?, maj_le = ?, duree = ?, taille = ?, morceaux = ?, srt = ?, miniature = ?, alertes = ?, duree_fabrication = ? WHERE id = ?`)
      .bind(alertes.length ? "a_verifier" : "pret", iso, iso, Number(d.duree) || null, Number(d.taille), Number(d.morceaux), court(d.srt, 20000), mini, JSON.stringify(alertes), Number(d.duree_fabrication) || null, id).run();
    await nettoyerAnciennes(db);
    await entretenir(env);
    return json({ ok: true });
  }
  return json({ erreur: "Adresse inconnue." }, 404);
}
