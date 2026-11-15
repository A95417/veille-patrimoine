// Relevé des taux (sources officielles et gratuites : API publique de la Banque centrale européenne).
// Une fois par jour suffit : les séries sont quotidiennes (€STR, taux de dépôt) ou mensuelles (OAT, Bund, inflation).
const SITE = process.env.SITE_URL, JETON = process.env.ROBOT_TOKEN;
const ESSAI = process.env.TAUX_ESSAI === "oui";

export const SERIES = [
  { id: "estr", nom: "€STR", detail: "taux interbancaire au jour le jour de la zone euro", cle: "EST/B.EU000A2X2A25.WT", freq: "jour" },
  { id: "depot", nom: "Taux de dépôt BCE", detail: "taux directeur de la Banque centrale européenne", cle: "FM/D.U2.EUR.4F.KR.DFR.LEV", freq: "jour" },
  { id: "euribor3m", nom: "Euribor 3 mois", detail: "moyenne mensuelle", cle: "FM/M.U2.EUR.RT.MM.EURIBOR3MD_.HSTA", freq: "mois" },
  { id: "oat10", nom: "OAT 10 ans (France)", detail: "taux long terme, moyenne mensuelle", cle: "IRS/M.FR.L.L40.CI.0000.EUR.N.Z", freq: "mois" },
  { id: "bund10", nom: "Bund 10 ans (Allemagne)", detail: "taux long terme, moyenne mensuelle", cle: "IRS/M.DE.L.L40.CI.0000.EUR.N.Z", freq: "mois" },
  { id: "inflation_fr", nom: "Inflation France", detail: "indice harmonisé, sur un an", cle: "ICP/M.FR.N.000000.4.ANR", freq: "mois" },
  { id: "inflation_ze", nom: "Inflation zone euro", detail: "indice harmonisé, sur un an", cle: "ICP/M.U2.N.000000.4.ANR", freq: "mois" },
];

async function serie(s) {
  const n = s.freq === "jour" ? 400 : 26;
  const url = `https://data-api.ecb.europa.eu/service/data/${s.cle}?format=csvdata&lastNObservations=${n}`;
  const r = await fetch(url, { headers: { Accept: "text/csv", "User-Agent": "VeillePatrimoineBot/1.0" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${s.id} : HTTP ${r.status}`);
  const lignes = (await r.text()).trim().split("\n");
  const tete = lignes.shift().split(",");
  const iT = tete.indexOf("TIME_PERIOD"), iV = tete.indexOf("OBS_VALUE");
  const points = lignes.map((l) => l.split(",")).map((c) => [c[iT], Number(c[iV])]).filter(([t, v]) => t && Number.isFinite(v));
  if (!points.length) throw new Error(`${s.id} : aucune donnée`);
  // Quotidien : on garde un point par semaine sur un an (léger) + le dernier.
  const garde = s.freq === "jour" ? points.filter((_, i) => i % 5 === 0 || i === points.length - 1) : points;
  return { id: s.id, nom: s.nom, detail: s.detail, freq: s.freq, source: "Banque centrale européenne", lien: `https://data.ecb.europa.eu/data/datasets/${s.cle.replace("/", "/").split("/")[0]}/${s.cle.replace("/", ".")}`, points: garde };
}

async function principal() {
  const heure = Number(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric" }).format(new Date()));
  if (!ESSAI && process.env.TAUX_FORCER !== "oui" && heure !== 9) { console.log("Taux : pas l'heure (relevé vers 9 h), rien à faire."); return; }
  const resultats = [], erreurs = [];
  for (const s of SERIES) {
    try { resultats.push(await serie(s)); } catch (e) { erreurs.push(String(e.message)); }
  }
  for (const r of resultats) console.log(r.id, r.points.length, "points, dernier :", r.points.at(-1));
  if (erreurs.length) console.log("Erreurs :", erreurs);
  if (ESSAI) return;
  if (!resultats.length) { process.exitCode = 1; return; }
  const rep = await fetch(`${SITE}/api/robot/taux`, {
    method: "POST", headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ releve_le: new Date().toISOString(), series: resultats, erreurs }),
  });
  console.log("Envoi au site :", rep.status, (await rep.text()).slice(0, 200));
}
principal().catch((e) => { console.error(e); process.exitCode = 1; });
