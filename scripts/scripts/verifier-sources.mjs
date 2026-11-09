// Robot de vérification des sources.
// Pour chaque source de config/sources.json : teste les flux connus, cherche les flux
// annoncés sur le site, vérifie le fichier robots.txt, puis écrit un rapport.
// Lancement : node scripts/verifier-sources.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { telecharger, analyserFlux, decouvrirFlux, USER_AGENT } from "./flux.mjs";

const CHEMINS_COURANTS = ["/feed", "/feed/", "/rss", "/rss.xml", "/feed.xml", "/atom.xml"];
const MAX_ESSAIS_PAR_SOURCE = 12;

// --- robots.txt : le site interdit-il aux robots l'adresse visée ?
const cacheRobots = new Map();
async function robotsAutorise(url) {
  const u = new URL(url);
  if (!cacheRobots.has(u.origin)) {
    const r = await telecharger(`${u.origin}/robots.txt`, 10000);
    cacheRobots.set(u.origin, r.ok ? r.texte : "");
  }
  const regles = [];
  let concerne = false;
  for (const ligne of cacheRobots.get(u.origin).split(/\r?\n/)) {
    const [cle, ...reste] = ligne.split(":");
    const valeur = reste.join(":").trim();
    const k = cle.trim().toLowerCase();
    if (k === "user-agent") concerne = valeur === "*" || USER_AGENT.toLowerCase().includes(valeur.toLowerCase());
    else if (concerne && (k === "disallow" || k === "allow") && valeur) regles.push([k, valeur]);
  }
  // La règle la plus précise (la plus longue) l'emporte.
  let verdict = true, longueur = -1;
  for (const [k, motif] of regles) {
    const re = new RegExp("^" + motif.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(u.pathname + u.search) && motif.length > longueur) { verdict = k === "allow"; longueur = motif.length; }
  }
  return verdict;
}

async function testerFlux(url) {
  const r = await telecharger(url);
  if (!r.ok) return { url, ok: false, raison: r.erreur || `erreur HTTP ${r.statut}` };
  const flux = analyserFlux(r.texte);
  if (!flux) return { url, ok: false, raison: "pas un flux RSS (page web ou contenu bloqué)" };
  const a = flux.articles;
  if (!a.length) return { url, ok: false, raison: "flux vide" };
  const dates = a.map((x) => x.date).filter(Boolean).sort().reverse();
  const avecResume = a.filter((x) => x.resume.length >= 80);
  const longueurMoy = Math.round(a.reduce((s, x) => s + x.resume.length, 0) / a.length);
  const ageJours = dates[0] ? Math.round((Date.now() - new Date(dates[0])) / 86400000) : null;
  return {
    url: r.url, ok: true, titre: flux.titre, format: flux.format,
    nb_articles: a.length, dernier_article: dates[0] || null, age_jours: ageJours,
    part_avec_resume: Math.round((100 * avecResume.length) / a.length), longueur_resume_moy: longueurMoy,
    robots_ok: await robotsAutorise(r.url),
    exemple: a[0]?.titre?.slice(0, 120) || "",
  };
}

function verdict(f) {
  if (!f.ok) return "❌ mort";
  if (!f.robots_ok) return "⛔ interdit (robots.txt)";
  if (f.age_jours !== null && f.age_jours > 30) return "💤 inactif";
  if (f.longueur_resume_moy < 80) return "🟡 titres seulement";
  return "✅ fonctionne";
}

async function verifierSource(src) {
  const essais = new Set(src.flux || []);
  const decouverts = [];
  if (src.site) {
    const page = await telecharger(src.site);
    if (page.ok) for (const f of decouvrirFlux(page.texte, page.url)) { essais.add(f); decouverts.push(f); }
    const origine = new URL(src.site).origin;
    for (const c of CHEMINS_COURANTS) essais.add(origine + c);
  }
  const resultats = [];
  for (const url of [...essais].slice(0, MAX_ESSAIS_PAR_SOURCE)) {
    const r = await testerFlux(url);
    r.origine = (src.flux || []).includes(url) ? "connu" : decouverts.includes(url) ? "annoncé par le site" : "essai";
    resultats.push(r);
  }
  // On garde : les flux connus (même morts, pour le signaler) + les flux trouvés qui marchent, sans doublon.
  const vus = new Set();
  const utiles = resultats.filter((r) => {
    if (!r.ok && r.origine !== "connu") return false;
    const cle = r.ok ? r.url : "x" + r.url;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });
  return { id: src.id, nom: src.nom, groupe: src.groupe, flux: utiles };
}

const config = JSON.parse(await readFile(new URL("../config/sources.json", import.meta.url), "utf8"));
const sources = config.sources.filter((s) => s.actif !== false);
const rapport = [];
for (const src of sources) {
  process.stdout.write(`Vérification : ${src.nom}… `);
  const r = await verifierSource(src);
  console.log(r.flux.filter((f) => f.ok).length + " flux valide(s)");
  rapport.push(r);
}

// --- Rapport lisible (Markdown)
const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
let md = `# Rapport de vérification des sources\n\nGénéré le ${date} (heure de Paris).\n\n`;
md += "Légende : ✅ fonctionne · 🟡 titres seulement (résumés très courts) · 💤 inactif (rien depuis 30 jours) · ⛔ interdit par robots.txt · ❌ mort\n\n";
const groupes = { officielle: "Sources officielles", presse: "Presse française", international: "International", crypto: "Crypto" };
for (const [g, titre] of Object.entries(groupes)) {
  md += `## ${titre}\n\n| Source | Verdict | Flux | Articles | Dernier article | Résumés |\n|---|---|---|---|---|---|\n`;
  for (const s of rapport.filter((x) => x.groupe === g)) {
    if (!s.flux.length) { md += `| **${s.nom}** | ❌ aucun flux trouvé | – | – | – | – |\n`; continue; }
    for (const f of s.flux) {
      const jour = f.dernier_article ? new Date(f.dernier_article).toLocaleDateString("fr-FR") : "?";
      md += f.ok
        ? `| **${s.nom}** | ${verdict(f)} | ${f.url} | ${f.nb_articles} | ${jour} | ${f.part_avec_resume} % (moy. ${f.longueur_resume_moy} car.) |\n`
        : `| **${s.nom}** | ${verdict(f)} | ${f.url} | – | – | ${f.raison} |\n`;
    }
  }
  md += "\n";
}
await mkdir(new URL("../rapports/", import.meta.url), { recursive: true });
await writeFile(new URL("../rapports/sources.md", import.meta.url), md);
await writeFile(new URL("../rapports/sources.json", import.meta.url), JSON.stringify(rapport, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, md);
console.log("\nRapport écrit dans rapports/sources.md");
