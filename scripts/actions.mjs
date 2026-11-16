// Grandes actions suivies sur la page Marchés : cours (Twelve Data, offre gratuite : actions cotées aux États-Unis)
// et nombre d'actions publié par chaque société (relevé à la main dans les documents officiels, à mettre à jour chaque trimestre).
// Valorisation = cours × nombre d'actions. Les sociétés européennes sont suivies par leur certificat coté à New York (ADR) :
// "ratio" = nombre d'ADR pour une action ordinaire (cours de l'action = cours de l'ADR × ratio).
// Prochaine mise à jour des nombres d'actions conseillée : février 2027 (après les rapports annuels).

const SEC = (cik, chemin) => `https://www.sec.gov/Archives/edgar/data/${cik}/${chemin}`;

export const ACTIONS = [
  // États-Unis (formulaires 10-Q / 10-K déposés à la SEC, page de garde)
  { id: "NVDA", nom: "Nvidia", pays: "US", secteur: "Semi-conducteurs", parts: [{ symbole: "NVDA", nombre: 24_100_000_000 }],
    au: "2026-08-21", source: "10-Q, SEC", lien: SEC("0001045810", "000104581026000075/nvda-20260726.htm") },
  { id: "AAPL", nom: "Apple", pays: "US", secteur: "Technologie", parts: [{ symbole: "AAPL", nombre: 14_532_182_000 }],
    au: "2026-10-23", source: "10-K, SEC", lien: SEC("320193", "000032019326000026/aapl-20260926.htm") },
  { id: "MSFT", nom: "Microsoft", pays: "US", secteur: "Logiciels", parts: [{ symbole: "MSFT", nombre: 7_426_194_552 }],
    au: "2026-10-22", source: "10-Q, SEC", lien: SEC("0000789019", "000119312526436133/msft-20260930.htm") },
  // Alphabet : actions A et B (B non cotée, convertible en A) au cours de GOOGL, actions C au cours de GOOG.
  { id: "GOOGL", nom: "Alphabet (Google)", pays: "US", secteur: "Internet", parts: [{ symbole: "GOOGL", nombre: 6_715_000_000 }, { symbole: "GOOG", nombre: 5_579_000_000 }],
    au: "2026-10-21", source: "10-Q, SEC", lien: SEC("0001652044", "000165204426000084/goog-20260930.htm") },
  { id: "AMZN", nom: "Amazon", pays: "US", secteur: "Commerce, cloud", parts: [{ symbole: "AMZN", nombre: 10_813_138_306 }],
    au: "2026-10-21", source: "10-Q, SEC", lien: SEC("0001018724", "000101872426000040/amzn-20260930.htm") },
  // Meta : actions A et B (B non cotée, convertible en A) au cours de META.
  { id: "META", nom: "Meta", pays: "US", secteur: "Internet", parts: [{ symbole: "META", nombre: 2_214_472_367 + 341_768_886 }],
    au: "2026-10-16", source: "10-Q, SEC", lien: SEC("0001326801", "000162828026066773/meta-20260930.htm") },
  { id: "AVGO", nom: "Broadcom", pays: "US", secteur: "Semi-conducteurs", parts: [{ symbole: "AVGO", nombre: 4_773_629_865 }],
    au: "2026-08-28", source: "10-Q, SEC", lien: SEC("0001730168", "000173016826000080/avgo-20260802.htm") },
  { id: "TSLA", nom: "Tesla", pays: "US", secteur: "Automobile", parts: [{ symbole: "TSLA", nombre: 3_952_757_946 }],
    au: "2026-10-15", source: "10-Q, SEC", lien: SEC("0001318605", "000162828026066775/tsla-20260930.htm") },
  { id: "BRK", nom: "Berkshire Hathaway", pays: "US", secteur: "Holding, assurance", parts: [{ symbole: "BRK.A", nombre: 480_476 }, { symbole: "BRK.B", nombre: 1_403_805_594 }],
    au: "2026-10-28", source: "10-Q, SEC", lien: SEC("0001067983", "000119312526452412/brka-20260930.htm"), affiche: "BRK.B" },
  { id: "JPM", nom: "JPMorgan Chase", pays: "US", secteur: "Banque", parts: [{ symbole: "JPM", nombre: 2_655_609_509 }],
    au: "2026-09-30", source: "10-Q, SEC", lien: "https://jpmorganchaseco.gcs-web.com/static-files/4e2abe87-70ad-43c9-a40a-fa4d8f2465cf" },
  // Europe (certificats cotés à New York ; nombre d'actions publié par la société)
  { id: "ASML", nom: "ASML", pays: "NL", secteur: "Semi-conducteurs", parts: [{ symbole: "ASML", nombre: 383_100_000, ratio: 1 }],
    au: "2026-09-27", source: "nombre moyen d'actions du 3e trimestre 2026, comptes publiés", lien: SEC("0000937966", "000162828026065813/financial_statementsxusx.htm") },
  { id: "SAP", nom: "SAP", pays: "DE", secteur: "Logiciels", parts: [{ symbole: "SAP", nombre: 1_150_000_000, ratio: 1 }],
    au: "2026-09-30", source: "nombre moyen d'actions du 3e trimestre 2026, comptes publiés", lien: SEC("1000184", "000110465926118617/tm2628113d1_ex99-1.htm") },
  { id: "NVO", nom: "Novo Nordisk", pays: "DK", secteur: "Santé", parts: [{ symbole: "NVO", nombre: 4_465_000_000 - 55_754_876, ratio: 1 }],
    au: "2026-11-02", source: "communiqué de la société (hors actions autodétenues)", lien: "https://www.globenewswire.com/news-release/2026/11/03/3394423/0/en/novo-nordisk-a-s-share-repurchase-programme.html", devise: "DKK" },
  { id: "TTE", nom: "TotalEnergies", pays: "FR", secteur: "Énergie", parts: [{ symbole: "TTE", nombre: 2_281_656_714, ratio: 1 }],
    au: "2026-10-31", source: "information mensuelle de la société", lien: "https://finance.yahoo.com/markets/stocks/articles/totalenergies-se-information-concerning-total-163400287.html" },
  { id: "MC", nom: "LVMH", pays: "FR", secteur: "Luxe", parts: [{ symbole: "LVMUY", nombre: 494_606_080, ratio: 5 }],
    au: "2026-10-31", source: "information mensuelle de la société", lien: "https://www.globenewswire.com/news-release/2026/11/05/3396144/0/fr/lvmh-information-mensuelle-relative-au-nombre-total-de-droits-de-vote-et-d-actions-composant-le-capital-social.html" },
  { id: "RMS", nom: "Hermès", pays: "FR", secteur: "Luxe", parts: [{ symbole: "HESAY", nombre: 105_569_412, ratio: 10 }],
    au: "2026-10-31", source: "information mensuelle de la société", lien: "https://fr.finance.yahoo.com/actualites/herm%C3%A8s-international-actions-droits-vote-170000548.html" },
  { id: "OR", nom: "L'Oréal", pays: "FR", secteur: "Cosmétiques", parts: [{ symbole: "LRLCY", nombre: 532_649_827, ratio: 5 }],
    au: "2026-09-30", source: "information mensuelle de la société", lien: "https://www.webdisclosure.com/press-release/loreal-epa-or-declaration-du-nombre-total-de-droits-de-vote-et-du-nombre-dactions-composant-le-capital-au-30-septembre-2026-Su0meuV3FDC" },
  { id: "AIR", nom: "Airbus", pays: "FR", secteur: "Aéronautique", parts: [{ symbole: "EADSY", nombre: 792_283_683, ratio: 4 }],
    au: "2026-09-30", source: "site de la société", lien: "https://www.airbus.com/en/investors/share-price-and-information" },
];

// Tous les symboles à relever (20 cotations, soit 20 crédits Twelve Data).
export const SYMBOLES_ACTIONS = [...new Set(ACTIONS.flatMap((a) => a.parts.map((p) => p.symbole)))];

// Calcule cours, variation et valorisation à partir des cotations brutes ({ symbole: { cours, veille, variation, date } }).
// eurusd = { cours, variation } : sert à exprimer les sociétés européennes en euros (variation sans l'effet du change).
export function calculerActions(brut, eurusd) {
  return ACTIONS.map((a) => {
    const qs = a.parts.map((p) => brut[p.symbole]);
    if (qs.some((q) => !q || !(q.cours > 0))) return { id: a.id, nom: a.nom, pays: a.pays, secteur: a.secteur, erreur: "indisponible" };
    const valo = a.parts.reduce((s, p, i) => s + qs[i].cours * (p.ratio || 1) * p.nombre, 0);
    const valoVeille = a.parts.reduce((s, p, i) => s + (qs[i].veille || qs[i].cours) * (p.ratio || 1) * p.nombre, 0);
    const principal = a.parts.findIndex((p) => p.symbole === (a.affiche || a.parts[0].symbole));
    const q = qs[principal], p = a.parts[principal];
    const europe = a.pays !== "US";
    const coursUsd = q.cours * (p.ratio || 1);
    const fx = eurusd?.cours > 0 ? eurusd.cours : null;
    // Variation : celle de l'action affichée ; pour l'Europe, sans l'effet du change (variation en euros).
    const varUsd = q.variation;
    const varLocale = europe && typeof eurusd?.variation === "number" ? ((1 + varUsd / 100) / (1 + eurusd.variation / 100) - 1) * 100 : varUsd;
    return {
      id: a.id, nom: a.nom, pays: a.pays, secteur: a.secteur, symbole: p.symbole, date: q.date,
      cours: europe && fx ? coursUsd / fx : coursUsd, devise: europe ? "EUR" : "USD", cours_usd: coursUsd,
      variation: Math.round(varLocale * 100) / 100, variation_usd: Math.round(varUsd * 100) / 100,
      valo_usd: Math.round(valo), valo_eur: fx ? Math.round(valo / fx) : null,
      valo_variation: valoVeille > 0 ? Math.round((valo / valoVeille - 1) * 10000) / 100 : null,
      actions: { nombre: a.parts.reduce((s, x) => s + x.nombre, 0), au: a.au, source: a.source, lien: a.lien,
                 a_mettre_a_jour: Date.now() - new Date(a.au + "T12:00:00Z") > 200 * 86400000 },
      via: europe ? `certificat ${p.symbole} coté à New York${p.ratio > 1 ? ` (${p.ratio} certificats = 1 action)` : ""}` : `${p.symbole}, ${q.bourse || "New York"}`,
    };
  }).sort((x, y) => (y.valo_usd || 0) - (x.valo_usd || 0));
}

// Cours de clôture en devise locale (historique) : action US en dollars, européenne en euros.
export function coursHistorique(a, coursAdr, tauxEurUsd) {
  const p = a.parts.find((x) => x.symbole === (a.affiche || a.parts[0].symbole));
  const usd = coursAdr * (p.ratio || 1);
  if (a.pays === "US") return usd;
  return tauxEurUsd > 0 ? usd / tauxEurUsd : null;
}
