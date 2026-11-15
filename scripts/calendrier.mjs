// Calendrier fiscal des particuliers, relevé sur la page officielle d'impots.gouv.fr (mois en cours + 2 suivants).
// Une fois par jour (vers 9 h). robots.txt d'impots.gouv.fr vérifié : ces pages sont autorisées aux robots.
import { telecharger, texteBrut } from "./flux.mjs";
const SITE = process.env.SITE_URL, JETON = process.env.ROBOT_TOKEN;
const ESSAI = process.env.CALENDRIER_ESSAI === "oui";
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function analyser(html, annee, url) {
  const items = [];
  // Chaque bloc commence par un jour (h3) suivi de ses cartes (h4 + description).
  const blocs = html.split(/<h3 class="fr-display--sm/).slice(1);
  for (const b of blocs) {
    const m = b.match(/<\/span>\s*(\d{1,2})\s*<p class="fr-text--regular --month">\s*([^<]+?)\s*<\/p>/);
    if (!m) continue;
    const jour = Number(m[1]), mois = MOIS.indexOf(m[2].trim().toLowerCase());
    if (mois < 0) continue;
    const aPartir = /À partir du/.test(b.slice(0, 200));
    const date = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
    for (const c of b.matchAll(/<h4 class="fr-card__title[^"]*"[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<div class="fr-card__desc">([\s\S]*?)<\/div>/g)) {
      const titre = texteBrut(c[1]), detail = texteBrut(c[2]).slice(0, 320);
      if (titre) items.push({ date, a_partir: aPartir, titre, detail, lien: url });
    }
  }
  return items;
}

async function principal() {
  const heure = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric" }).format(new Date()));
  if (!ESSAI && process.env.CALENDRIER_FORCER !== "oui" && (heure !== 9 || new Date().getUTCMinutes() >= 20)) { console.log("Calendrier : pas l'heure, rien à faire."); return; }
  const tous = [];
  const d = new Date();
  for (let i = 0; i < 3; i++) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1));
    const cle = `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, "0")}`;
    const url = `https://www.impots.gouv.fr/particulier/calendrier-fiscal/${cle}`;
    const r = await telecharger(url, 30000);
    if (!r.ok) { console.log(`Calendrier ${cle} : HTTP ${r.statut}`); continue; }
    const items = analyser(r.texte, m.getUTCFullYear(), url);
    console.log(`Calendrier ${cle} : ${items.length} échéances`);
    tous.push(...items);
  }
  if (ESSAI) { console.log(JSON.stringify(tous.slice(0, 8), null, 1)); return; }
  if (!tous.length) { console.log("Calendrier : rien de lu, on garde le précédent."); return; }
  const rep = await fetch(`${SITE}/api/robot/calendrier`, {
    method: "POST", headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ releve_le: new Date().toISOString(), echeances: tous.slice(0, 80) }),
  });
  console.log("Envoi au site :", rep.status, (await rep.text()).slice(0, 200));
}
if (import.meta.url === `file://${process.argv[1]}`) principal().catch((e) => { console.error(e); process.exitCode = 1; });
