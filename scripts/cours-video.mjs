// Robot « Apprendre › Vidéos » (GitHub Actions, la nuit) : une vidéo de cours par fiche, à partir du contenu vérifié de la fiche.
// Étapes pour chaque fiche : script de cours (IA, chiffres contrôlés contre la fiche) → voix (texte seul) → nettoyage →
// calage → animation → musique calme → montage → contrôles → fichiers joints du dépôt GitHub → le site est prévenu.
// Variables : SITE_URL, ROBOT_TOKEN, GEMINI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY ; FICHES (liste forcée, facultative) ; MAX (vidéos par passage).
import fs from "node:fs";
import vm from "node:vm";
import { execFileSync, spawn } from "node:child_process";
import { choisirModeles, generer, choisirModeleVoix, genererVoix } from "./gemini.mjs";
import "../public/video-apercu.js";   // même comptage des syllabes que le site

const SITE = (process.env.SITE_URL || "").replace(/\/$/, ""), JETON = process.env.ROBOT_TOKEN || "";
const GH = process.env.GITHUB_TOKEN || "", DEPOT = process.env.GITHUB_REPOSITORY || "A95417/veille-patrimoine", ETIQUETTE = "cours-videos";
const M = "video/moteur", RESERVE_VOIX = 2;   // voix gardées pour le brief audio du matin
const ESSAI = process.env.ESSAI === "1";       // banc d'essai : rien n'est envoyé sur GitHub
const court = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const py = (...a) => execFileSync("python3", a, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

async function site(chemin, corps, methode = corps === undefined ? "GET" : "POST") {
  const r = await fetch(SITE + chemin, { method: methode, headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" }, body: corps === undefined ? undefined : JSON.stringify(corps) });
  const t = await r.text();
  if (!r.ok) throw new Error(`site ${chemin} : HTTP ${r.status} ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : {};
}

// ---------------------------------------------------------------- les fiches (mêmes fichiers que le site)
export function chargerFiches(racine = "public") {
  const code = ["fiches.js", "fiches-suite.js", "fiches-nouvelles.js", "fiches-approfondies.js"].map((f) => fs.readFileSync(`${racine}/${f}`, "utf8")).join("\n;\n");
  const ctx = vm.createContext({ console, encodeURIComponent });
  vm.runInContext(code + "\n;globalThis.__R = { FICHES, APPROFONDI: typeof APPROFONDI !== 'undefined' ? APPROFONDI : {} };", ctx);
  const { FICHES, APPROFONDI } = ctx.__R;
  for (const f of FICHES) {   // même fusion que la page d'une fiche
    const A = APPROFONDI[f.id]; if (!A) continue;
    if (A.verifie) f.verifie = A.verifie;
    for (const k of ["quiz", "pieges"]) if (A[k]) f[k] = [...(f[k] || []), ...A[k]];
    if (A.remplacer) Object.assign(f, A.remplacer);
    f._approfondi = A;
  }
  return FICHES;
}
// Tout le contenu vérifié de la fiche, en texte (seule source autorisée pour le script).
export function texteFiche(f) {
  const l = [`FICHE : ${f.titre} — ${f.sousTitre || ""}`, `EN UNE PHRASE : ${f.enUnePhrase}`];
  (f.chiffres || []).forEach((c) => l.push(`CHIFFRE CLÉ : ${c.valeur} — ${c.libelle}`));
  (f.essentiel || []).forEach((e, i) => l.push(`ESSENTIEL ${i + 1} : ${e.titre}. ${e.texte}`));
  (f.schema || []).forEach((e, i) => l.push(`ÉTAPE ${i + 1} : ${e.titre} — ${e.texte}`));
  (f.fiscalite || []).forEach((t) => { l.push(`TABLEAU « ${t.titre} » (${t.colonnes.join(" | ")}) :`); t.lignes.forEach((r) => l.push("  - " + r.join(" | "))); if (t.note) l.push("  Note : " + t.note); });
  (f.pourQui || []).forEach((x) => l.push("POUR QUI : " + x));
  (f.pasPourQui || []).forEach((x) => l.push("À ÉVITER SI : " + x));
  (f.pieges || []).forEach((x) => l.push("PIÈGE : " + x));
  if (f.cas) l.push(`CAS PRATIQUE : ${f.cas.enonce} Question : ${f.cas.question} Réponse : ${f.cas.reponse}`);
  (f._approfondi?.blocs || []).forEach((b) => b.points.forEach((p) => l.push(`DÉTAIL (${b.titre}) : ${p.t}`)));
  return l.join("\n");
}
// Durée selon la richesse de la fiche : 1 min 30 pour une fiche simple, jusqu'à 4 min pour une fiche dense.
export function dureeCible(f) {
  const score = (f.essentiel || []).length + (f.schema || []).length + (f.fiscalite || []).reduce((n, t) => n + t.lignes.length, 0) + (f.pieges || []).length
    + Math.round((f._approfondi?.blocs || []).reduce((n, b) => n + b.points.length, 0) / 2);
  return Math.max(90, Math.min(240, Math.round((60 + score * 5) / 15) * 15));
}

// ---------------------------------------------------------------- script de cours
const TYPES = ["chapitre", "personnage", "chiffre", "liste", "frise", "tableau", "mythe", "quiz", "recap", "grand_mot", "egalite", "bocaux"];
const PERSOS = ["lea", "tom", "tom_age", "conseil", "ines", "hugo", "sarah", "isaac", "michel", "francoise"];
const LIEUX = ["appartement", "salon", "cuisine", "chambre_soir", "bureau", "coworking", "banque", "rue", "parc", "cafe", "mer", "maison_vente"];
const SCHEMA = {
  type: "OBJECT", properties: {
    scenes: { type: "ARRAY", items: { type: "OBJECT", properties: {
      type: { type: "STRING", enum: TYPES }, texte: { type: "STRING" },
      p: { type: "OBJECT", properties: {
        titre: { type: "STRING" }, sous_titre: { type: "STRING" }, personnage: { type: "STRING", enum: PERSOS }, humeur: { type: "STRING", enum: ["sourire", "neutre", "souci", "surpris"] },
        decor: { type: "STRING", enum: LIEUX }, nom: { type: "STRING" }, bulle: { type: "STRING" }, puces: { type: "ARRAY", items: { type: "STRING" } },
        valeur: { type: "STRING" }, libelle: { type: "STRING" }, bandeau: { type: "STRING" }, points: { type: "ARRAY", items: { type: "STRING" } },
        etapes: { type: "ARRAY", items: { type: "OBJECT", properties: { titre: { type: "STRING" }, texte: { type: "STRING" } } } },
        colonnes: { type: "ARRAY", items: { type: "STRING" } }, lignes: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } },
        mythe: { type: "STRING" }, realite: { type: "STRING" }, quiz_index: { type: "NUMBER" }, texte: { type: "STRING" }, legende: { type: "STRING" },
        gauche: { type: "STRING" }, droite: { type: "STRING" }, signe: { type: "STRING" }, question: { type: "STRING" },
      } },
    }, required: ["type", "texte"] } },
    resume: { type: "STRING" },
  }, required: ["scenes"],
};
const GABARITS = `- chapitre : début d'un chapitre. Texte lu : le titre du chapitre puis une courte phrase qui annonce ce qu'on va voir (« Chapitre 2 » est ajouté automatiquement). p : titre (40 car.), sous_titre (50 car.)
- personnage : un personnage en situation concrète. p : personnage, humeur, decor, nom, bulle (18 car.), puces (2 × 16 car.)
- chiffre : un chiffre clé de la fiche. p : bandeau (26), valeur (14, exactement comme dans la fiche), libelle (34)
- liste : 2 ou 3 points. p : titre (28), points (3 × 30 car.)
- frise : 2 à 4 étapes. Texte lu : une phrase d'introduction, puis exactement une phrase par étape. p : titre (30), etapes [{titre (26), texte (60)}]
- tableau : un tableau très simple. Texte lu : une phrase d'introduction, puis exactement une phrase par ligne. p : titre (30), colonnes (2 ou 3, 24 car.), lignes (2 à 4 lignes de cellules de 30 car. max)
- mythe : idée reçue puis réalité (2 phrases). p : mythe (60), realite (60)
- quiz : une question du quiz de la fiche. p : quiz_index (numéro de la question dans la liste QUIZ). Le texte lu est écrit par le site : mets texte = "quiz".
- recap : 3 à 5 points à retenir. Texte lu : « Ce qu'il faut retenir. » puis exactement une phrase par point. p : titre (22), points (5 × 60 car.)
- grand_mot : un mot ou chiffre géant. p : texte (12), legende (26)
- egalite : deux situations côte à côte. p : gauche (14), droite (14), signe (= ou ≠), question (26)
- bocaux : « chaque situation est unique ». p : titre (30)`;

function consignes(f, duree, mots) {
  return `Tu écris le script d'une VIDÉO DE COURS (formation interne d'un cabinet de conseil en gestion de patrimoine) qui apprend la fiche « ${f.titre} ».
Ce n'est PAS une publicité : c'est un cours clair, ludique et professionnel, pour bien comprendre et retenir.
RÈGLES STRICTES :
- N'utilise QUE le contenu de la FICHE fournie. N'ajoute aucun chiffre, taux, seuil, date, durée ou règle qui n'y figure pas mot pour mot. N'invente rien.
- Aucune promesse, aucun conseil personnalisé, aucune marque, aucun appel à prendre rendez-vous.
- Texte lu : phrases courtes, à l'oral, vouvoiement, une idée par phrase. Écris les nombres en chiffres (152 500 €, 8 ans, 12,8 %).
- LONGUEUR (indispensable) : environ ${mots} mots lus au total (entre ${Math.round(mots * .93)} et ${Math.round(mots * 1.07)}), pour une vidéo d'environ ${Math.round(duree / 60 * 10) / 10} minutes.
- STRUCTURE :
  1. une scène « personnage » (le conseiller, personnage conseil, décor bureau) qui annonce : « Dans cette vidéo, vous allez apprendre… » (3 points) ;
  2. 3 à 5 chapitres, chacun ouvert par une scène « chapitre », puis 2 à 4 scènes variées et illustrées : l'essentiel, comment ça marche (frise), la fiscalité ou les chiffres (tableau, chiffre), les pièges (mythe, personnage avec humeur souci), un mini cas pratique (personnage) ;
  3. 1 ou 2 scènes « quiz » placées après le chapitre concerné (questions de la liste QUIZ) ;
  4. une scène « recap » (« À retenir ») juste avant la fin. N'écris pas la scène de fin : elle est ajoutée automatiquement.
- Varie les visuels, les personnages (selon le sujet : jeunes actifs, famille, retraités, chef d'entreprise) et les décors.
- Les paramètres « p » sont des textes très courts affichés à l'écran, sans répéter mot pour mot la phrase lue.
- resume : 2 phrases qui résument le cours (affiché sous la vidéo).
VISUELS DISPONIBLES (type : usage. paramètres) :
${GABARITS}`;
}

// Chiffres autorisés : ceux de la fiche (et les petits nombres sans unité : « 3 points », « chapitre 2 »).
const nombres = (t) => (String(t).match(/\d[\d\s  ]*(?:[.,]\d+)?/g) || []).map((n) => n.replace(/[\s  ]/g, "").replace(",", ".")).filter(Boolean);
function chiffresInconnus(scenes, permis) {
  const r = new Set();
  const voir = (t) => nombres(t).forEach((n) => { if (!permis.has(n) && !(/^\d$/.test(n)) && !/^20[2-3]\d$/.test(n)) r.add(n); });
  for (const s of scenes) { if (s.type === "quiz") continue; voir(s.texte); voir(JSON.stringify(s.p || {})); }
  return [...r];
}

// Nombre de phrases lues (même découpage que le calage de la voix).
const nbPhrases = (t) => (String(t).replace(/\s+/g, " ").trim().match(/[^.?!…;]+[.?!…;]*/g) || []).filter((m) => /[A-Za-zÀ-ÿ0-9]/.test(m)).length;
// Nettoyage : seuls les visuels connus, des textes courts ; le quiz vient de la fiche (question, réponses, bonne réponse).
// Texte affiché raccourci sans jamais couper un mot ni un nombre (« 100 000 € » reste entier ou disparaît).
function coupe(t, n) {
  const x = String(t ?? "").replace(/\s+/g, " ").trim().replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0").replace(/(\d) (?=[€%])/g, "$1\u00a0");
  if (x.length <= n) return x;
  const c = x.slice(0, n + 1), i = c.lastIndexOf(" ");
  return (i > n * .5 ? c.slice(0, i) : x.slice(0, n).replace(/[\d\u00a0.,]+$/, "")).replace(/[\s,;:–—(-]+$/, "").trim();
}
function nettoyer(scenes, f) {
  const quizF = (f.quiz || []).filter((q) => Array.isArray(q.choix) && q.choix.length >= 2 && q.choix.length <= 4);
  const usages = new Set();
  const out = [];
  for (const s of scenes || []) {
    if (!TYPES.includes(s?.type)) continue;
    const p = s.p || {};
    if (s.type === "quiz") {
      const q = quizF[Number(p.quiz_index)] || quizF.find((_, i) => !usages.has(i));
      if (!q) continue;
      const i = quizF.indexOf(q); if (usages.has(i)) continue; usages.add(i);
      const bonne = Number(q.bonne) || 0;
      const debutQ = `Petit quiz. ${coupe(q.question, 200)}`;
      out.push({ type: "quiz", texte: `${debutQ} Trois, deux, un. La bonne réponse : ${coupe(q.choix[bonne], 80).replace(/[.?!…;]+$/, "")}.`,
        p: { question: coupe(q.question, 110), choix: q.choix.map((c) => coupe(c, 34)), bonne, i_compte: nbPhrases(debutQ) } });
      continue;
    }
    const texte = court(s.texte, 700);
    if (!texte) continue;
    const c = (k, n) => (p[k] ? coupe(p[k], n) : undefined);
    const q = { titre: c("titre", 60), sous_titre: c("sous_titre", 50), personnage: PERSOS.includes(p.personnage) ? p.personnage : undefined, humeur: p.humeur,
      decor: LIEUX.includes(p.decor) ? p.decor : undefined, nom: c("nom", 16), bulle: c("bulle", 18), puces: (p.puces || []).map((x) => coupe(x, 16)).slice(0, 2),
      valeur: c("valeur", 14), libelle: c("libelle", 34), bandeau: c("bandeau", 26), points: (p.points || []).map((x) => coupe(x, s.type === "recap" ? 60 : 30)).filter(Boolean).slice(0, s.type === "recap" ? 5 : 3),
      etapes: (p.etapes || []).map((e) => ({ titre: coupe(e?.titre, 26), texte: coupe(e?.texte, 60) })).filter((e) => e.titre).slice(0, 4),
      colonnes: (p.colonnes || []).map((x) => coupe(x, 24)).slice(0, 3), lignes: (p.lignes || []).filter(Array.isArray).map((l) => l.map((x) => coupe(x, 30)).slice(0, 3)).slice(0, 4),
      mythe: c("mythe", 60), realite: c("realite", 60), texte: c("texte", 12), legende: c("legende", 26), gauche: c("gauche", 14), droite: c("droite", 14),
      signe: p.signe === "≠" ? "≠" : "=", question: c("question", 26) };
    for (const k of Object.keys(q)) if (q[k] === undefined || (Array.isArray(q[k]) && !q[k].length)) delete q[k];
    if (s.type === "tableau" && (!q.colonnes || !q.lignes)) continue;
    if (s.type === "frise" && !q.etapes) continue;
    out.push({ type: s.type, texte, p: q });
  }
  // chapitres numérotés dans l'ordre
  const chap = out.filter((s) => s.type === "chapitre");
  chap.forEach((s, i) => { s.p.numero = i + 1; s.p.total = chap.length; if (!/^chapitre/i.test(s.texte)) s.texte = `Chapitre ${i + 1}. ${s.texte}`; });
  return out;
}
const finCours = (f) => ({ type: "fin_cours", texte: "Bravo, vous avez terminé ce cours. Pour ancrer ce que vous avez appris, testez-vous sur la fiche.",
  p: { titre_fiche: f.titre, verifie: f.verifie } });

export async function ecrireScript(f, modeles) {
  const duree = dureeCible(f), fin = finCours(f);
  const finS = (globalThis.VideoApercu.syllabes(fin.texte) + globalThis.VideoApercu.syllabes(`Cours vidéo. ${f.titre}.`)) / 4.45;
  const mots = Math.round((duree - 3.6 - finS) * 2.68);
  const source = texteFiche(f), permis = new Set(nombres(source));
  const quiz = (f.quiz || []).filter((q) => Array.isArray(q.choix) && q.choix.length >= 2 && q.choix.length <= 4).map((q, i) => `[${i}] ${q.question}`).join("\n");
  let demande = `FICHE (seule source autorisée) :\n"""\n${source}\n"""\n\nQUIZ (numéro entre crochets) :\n${quiz}\n\nDURÉE VISÉE : ${duree} secondes (≈ ${mots} mots lus).`;
  let meilleur = null;
  for (let essai = 1; essai <= 3; essai++) {
    let r = await generer(modeles.fort || modeles.principal, consignes(f, duree, mots), demande, SCHEMA);
    if (r.quota && modeles.fort) r = await generer(modeles.principal, consignes(f, duree, mots), demande, SCHEMA);
    if (!r.donnees) throw new Error("quota de l'IA atteint pour aujourd'hui");
    const scenes = nettoyer(r.donnees.scenes, f), inconnus = chiffresInconnus(scenes, permis);
    const total = [...scenes, fin, { texte: `Cours vidéo. ${f.titre}.` }].reduce((n, s) => n + globalThis.VideoApercu.syllabes(s.texte), 0) / 4.45 + 3.6;
    const ecart = Math.abs(total - duree) / duree;
    console.log(`  script ${essai} : ${scenes.length} scènes, ≈ ${Math.round(total)} s (visé ${duree} s), chiffres hors fiche : ${inconnus.join(", ") || "aucun"}`);
    if (!inconnus.length && (!meilleur || ecart < meilleur.ecart)) meilleur = { scenes, resume: court(r.donnees.resume, 600), ecart, total };
    if (meilleur && meilleur.ecart <= .12) break;
    demande += `\n\nCORRECTION DEMANDÉE : ${inconnus.length ? `retire ces chiffres absents de la fiche : ${inconnus.join(", ")}. ` : ""}${ecart > .12 ? `le script fait ≈ ${Math.round(total)} s au lieu de ${duree} s : ${total < duree ? "développe" : "resserre"} pour atteindre ≈ ${mots} mots.` : ""}`;
  }
  if (!meilleur) throw new Error("le script contenait des chiffres absents de la fiche (3 essais)");
  if (meilleur.scenes.length < 6) throw new Error("script trop court");
  const ouverture = { type: "titre_cours", texte: `Cours vidéo. ${f.titre.replace(/[.?!…;]/g, " ").trim()}.`, p: { titre: f.titre, sous_titre: f.sousTitre } };
  return { duree, scenes: [ouverture, ...meilleur.scenes, fin], resume: meilleur.resume, estime: Math.round(meilleur.total) };
}

// ---------------------------------------------------------------- fabrication (même chaîne que les vidéos du site)
async function fabriquer(f, script, modeleVoix) {
  fs.rmSync("cours", { recursive: true, force: true }); fs.mkdirSync("cours");
  const job = { format: "9:16", voix: "Sadachbia", scenes: script.scenes, graine: 1 + ([...f.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 997), sous_titres: "mot",
    config: { cabinet: "Veille Patrimoine", mentions: [] } };
  fs.writeFileSync("cours/job.json", JSON.stringify(job));
  const texte = script.scenes.map((s) => s.texte.trim()).join("\n");
  if (!ESSAI) await site("/api/robot/ia/quota", { ajouts: { [modeleVoix]: 1 } });
  const v = await genererVoix(modeleVoix, texte, "Sadachbia");
  if (v.quota) throw Object.assign(new Error("quota de la voix atteint"), { quota: true });
  fs.writeFileSync("cours/voix.pcm", v.pcm);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(v.taux), "-ac", "1", "-i", "cours/voix.pcm", "cours/voix_brute.flac"]);
  const rapport = py(`${M}/nettoyer_voix.py`, "cours/voix_brute.flac", "cours/voix.flac", "1.08");
  if (!/pics saturés restants : aucun/.test(rapport)) throw new Error("grésillement dans la voix après nettoyage");
  console.log("  " + py(`${M}/calage.py`, "cours/job.json", "cours/voix.flac", "cours/calage.json").trim());
  const cal = JSON.parse(fs.readFileSync("cours/calage.json", "utf8"));
  await new Promise((ok, ko) => {
    const p = spawn("node", [`${M}/rendu.mjs`, "cours/job.json", "cours/calage.json", "cours/sortie", "4"], { stdio: ["ignore", "pipe", "inherit"] });
    p.stdout.on("data", (d) => { const t = String(d); if (!/PROGRESSION/.test(t)) process.stdout.write("  " + t); });
    p.on("close", (c) => (c === 0 ? ok() : ko(new Error("le rendu des images a échoué"))));
  });
  py(`${M}/son.py`, "cours/calage.json", "cours/sortie/evenements.json", "cours/musique.wav", "cours/bruitages.wav", "calme");
  execFileSync("bash", [`${M}/monter.sh`, "cours/sortie/video_muette.mp4", "cours/voix.flac", "cours/musique.wav", "cours/bruitages.wav", "cours/video.mp4", String(cal.duree_totale)], { stdio: "inherit" });
  const alertes = JSON.parse(fs.readFileSync("cours/sortie/alertes.json", "utf8"));
  if (alertes.length) throw new Error("contrôle automatique : " + alertes.slice(0, 3).join(" ; "));
  const chapitres = [{ titre: "Introduction", t: 0 }, ...script.scenes.map((s, i) => [s, cal.scenes[i]]).filter(([s]) => s.type === "chapitre").map(([s, c]) => ({ titre: s.p.titre || "Chapitre", t: Math.round(c.debut * 10) / 10 })),
    ...script.scenes.map((s, i) => [s, cal.scenes[i]]).filter(([s]) => s.type === "recap").slice(0, 1).map(([, c]) => ({ titre: "À retenir", t: Math.round(c.debut * 10) / 10 }))];
  return { duree: cal.duree_totale, chapitres, video: "cours/video.mp4", miniature: "cours/sortie/miniature.jpg" };
}

// ---------------------------------------------------------------- fichiers joints du dépôt GitHub (gratuit)
async function gh(chemin, opts = {}) {
  const r = await fetch(chemin.startsWith("http") ? chemin : `https://api.github.com/repos/${DEPOT}${chemin}`, { ...opts, headers: { Authorization: `Bearer ${GH}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) } });
  if (r.status === 204) return {};
  const t = await r.text();
  if (!r.ok) throw Object.assign(new Error(`GitHub ${r.status} ${t.slice(0, 200)}`), { statut: r.status });
  return t ? JSON.parse(t) : {};
}
async function publication() {
  try { return await gh(`/releases/tags/${ETIQUETTE}`); }
  catch (e) {
    if (e.statut !== 404) throw e;
    return gh("/releases", { method: "POST", body: JSON.stringify({ tag_name: ETIQUETTE, target_commitish: "main", name: "Vidéos de cours (Apprendre)",
      body: "Vidéos pédagogiques fabriquées automatiquement à partir des fiches vérifiées de la rubrique Apprendre. Contenu pédagogique, ne constitue pas un conseil." }) });
  }
}
async function envoyer(rel, nom, chemin, type) {
  const octets = fs.readFileSync(chemin);
  await gh(`https://uploads.github.com/repos/${DEPOT}/releases/${rel.id}/assets?name=${encodeURIComponent(nom)}`, { method: "POST", headers: { "Content-Type": type, "Content-Length": String(octets.length) }, body: octets });
}
async function rangerAnciennes(rel, id, garder) {
  const assets = await gh(`/releases/${rel.id}/assets?per_page=100`);
  for (const a of assets) if (a.name.startsWith(id + "-") && !a.name.startsWith(garder)) await gh(`/releases/assets/${a.id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- passage du robot
export async function principal() {
  const fiches = chargerFiches();
  const forcees = (process.env.FICHES || "").split(/[\s,]+/).filter(Boolean);
  const etat = ESSAI ? { videos: {}, priorite: [], refaire: [], restant_voix: 12 } : await site("/api/robot/cours");
  const aFaire = [];
  const ajouter = (id) => { const f = fiches.find((x) => x.id === id); if (f && !aFaire.includes(f)) aFaire.push(f); };
  forcees.forEach(ajouter);
  if (!forcees.length) etat.refaire.forEach(ajouter), etat.priorite.forEach((id) => { if (!etat.videos[id]) ajouter(id); }), fiches.forEach((f) => { const v = etat.videos[f.id]; if (!v || v.verifie !== f.verifie) ajouter(f.id); });
  const max = Math.max(0, Math.min(Number(process.env.MAX || 3), forcees.length ? 99 : etat.restant_voix - RESERVE_VOIX));
  console.log(`${aFaire.length} fiche(s) à faire, ${max} possible(s) ce passage (voix restantes pour l'équipe : ${etat.restant_voix}).`);
  if (!max || !aFaire.length) return;
  const modeles = await choisirModeles(), modeleVoix = await choisirModeleVoix();
  if (!modeleVoix) throw new Error("aucun modèle de voix disponible");
  const rel = ESSAI ? null : await publication();
  for (const f of aFaire.slice(0, max)) {
    console.log(`\n▶ ${f.titre} (${f.id})`);
    try {
      const script = await ecrireScript(f, modeles);
      fs.writeFileSync(`script-${f.id}.json`, JSON.stringify(script, null, 1));
      const v = await fabriquer(f, script, modeleVoix);
      const version = Date.now().toString(36);
      if (ESSAI) { fs.copyFileSync(v.video, `cours-${f.id}.mp4`); fs.copyFileSync(v.miniature, `cours-${f.id}.jpg`);
        fs.writeFileSync(`cours-${f.id}.json`, JSON.stringify({ titre: f.titre, verifie: f.verifie, duree: v.duree, version: "essai", chapitres: v.chapitres, resume: script.resume })); console.log(`  ESSAI : cours-${f.id}.mp4, ${Math.round(v.duree)} s, chapitres ${JSON.stringify(v.chapitres)}`); continue; }
      await envoyer(rel, `${f.id}-${version}.mp4`, v.video, "video/mp4");
      await envoyer(rel, `${f.id}-${version}.jpg`, v.miniature, "image/jpeg");
      await site(`/api/robot/cours/${f.id}`, { titre: f.titre, verifie: f.verifie, duree: v.duree, taille: fs.statSync(v.video).size, version, chapitres: v.chapitres, resume: script.resume });
      await rangerAnciennes(rel, f.id, `${f.id}-${version}`);
      console.log(`  ✓ en ligne : ${Math.round(v.duree)} s`);
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
      if (!ESSAI) await site(`/api/robot/cours/${f.id}/echec`, { erreur: e.message }).catch(() => {});
      if (e.quota || /quota/.test(e.message)) break;
    }
  }
}
if (import.meta.url === `file://${process.argv[1]}`) principal().catch((e) => { console.error(e); process.exit(1); });
