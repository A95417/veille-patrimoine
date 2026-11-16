// Garde de la collecte : le minuteur de GitHub (secours) se déclenche parfois juste après celui de Cloudflare.
// Si la dernière collecte s'est terminée il y a moins de 10 minutes, ce passage est sauté (rien n'est relu ni relevé deux fois).
// Les lancements manuels et ceux de Cloudflare ne sont jamais sautés.
import { appendFileSync } from "node:fs";
const SITE = (process.env.SITE_URL || "").replace(/\/$/, ""), JETON = process.env.ROBOT_TOKEN || "";
let passer = false;
if (process.env.EVENEMENT === "schedule") {
  try {
    const r = await fetch(`${SITE}/api/robot/collecte`, { headers: { Authorization: `Bearer ${JETON}` }, signal: AbortSignal.timeout(15000) });
    const { fin } = await r.json();
    const ecart = fin ? (Date.now() - new Date(fin).getTime()) / 60000 : Infinity;
    passer = ecart < 10;
    console.log(fin ? `Dernière collecte terminée il y a ${ecart.toFixed(1)} min : ${passer ? "passage sauté (doublon)" : "on y va"}.` : "Aucune collecte connue : on y va.");
  } catch (e) { console.log("Site injoignable pour la garde : on fait la collecte quand même.", e.message); }
}
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `passer=${passer}\n`);
