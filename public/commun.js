// version 8.0
// Outils partagés par toutes les pages.

// Thème clair / sombre (mémorisé sur cet appareil uniquement).
(function appliquerTheme() {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch {}
})();

function basculerTheme() {
  const actuel = document.documentElement.dataset.theme
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const suivant = actuel === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = suivant;
  try { localStorage.setItem("theme", suivant); } catch {}
}

// Appel au serveur. Renvoie les données, ou lève une erreur avec un message lisible.
async function appelApi(chemin, methode = "GET", donnees) {
  const options = { method: methode, headers: {}, credentials: "same-origin" };
  if (donnees !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(donnees);
  }
  const r = await fetch(chemin, options);
  let corps = {};
  try { corps = await r.json(); } catch {}
  if (r.status === 401 && !chemin.startsWith("/api/connexion")) {
    location.href = "/connexion";
    throw new Error("Session expirée.");
  }
  if (!r.ok) throw new Error(corps.erreur || "Une erreur est survenue.");
  return corps;
}

function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.className = "message " + (type || "");
}

// Échappe le texte avant de l'insérer dans la page (sécurité).
function echapper(texte) {
  return String(texte ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Date lisible : "il y a 5 min", "aujourd'hui à 9:30", "4 nov. à 14:00".
function quand(iso) {
  const d = new Date(iso), maintenant = new Date();
  const min = Math.round((maintenant - d) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (min < 24 * 60 && d.getDate() === maintenant.getDate())
    return `aujourd'hui à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------- Thèmes et illustrations
// Les 24 catégories de l'IA sont regroupées en 9 grands thèmes (filtres de l'accueil, couleurs, illustrations).
const THEMES = [
  { id: "fisc", nom: "Fiscalité", cats: ["Fiscalité & loi de finances", "Fiscalité du dirigeant & des entreprises", "Législation patrimoniale"] },
  { id: "immo", nom: "Immobilier", cats: ["Immobilier & SCPI"] },
  { id: "epargne", nom: "Épargne & retraite", cats: ["Assurance-vie", "Épargne retraite (PER)", "Épargne réglementée", "Retraite & réformes", "Prévoyance & protection sociale"] },
  { id: "transmission", nom: "Transmission", cats: ["Transmission & succession"] },
  { id: "economie", nom: "Économie & taux", cats: ["Taux & obligations", "Banques centrales", "Macroéconomie", "Géopolitique"] },
  { id: "regl", nom: "Réglementation", cats: ["Réglementation financière (AMF/ACPR)", "Profession & conformité CGP", "Alertes arnaques"] },
  { id: "marches", nom: "Marchés", cats: ["Marchés actions", "Matières premières", "Devises", "Private equity & non coté", "Finance durable & ESG"] },
  { id: "crypto", nom: "Crypto", cats: ["Crypto"] },
];
const THEME_AUTRE = { id: "autre", nom: "Autre", cats: ["Autre"] };
function themeDe(categories) {
  for (const c of categories || []) {
    const t = THEMES.find((x) => x.cats.includes(c));
    if (t) return t;
  }
  return THEME_AUTRE;
}

// Petits dessins vectoriels, un par thème (couleurs adaptées au mode clair/sombre par la feuille de style).
const DESSINS = {
  fisc: `<circle class="f1" cx="262" cy="92" r="52"/><rect class="fc s3" x="58" y="20" width="72" height="90" rx="7" stroke-width="3"/>
    <path class="s3" d="M73 44H115M73 60H115M73 76H101" stroke-width="3" stroke-linecap="round"/>
    <circle class="s3" cx="166" cy="72" r="19" stroke-width="3"/><path class="s3" d="M157 72l7 7 11-13" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  immo: `<circle class="f1" cx="72" cy="30" r="48"/><path class="f2" d="M146 106V64l42-30 42 30v42z"/><rect class="f0" x="177" y="78" width="22" height="28"/>
    <path class="f3" d="M234 106V74l28-20 28 20v32z"/><rect class="f0" x="254" y="84" width="14" height="22"/>`,
  epargne: `<circle class="f1" cx="252" cy="34" r="46"/><ellipse class="f3" cx="118" cy="96" rx="44" ry="10"/><ellipse class="f2" cx="118" cy="84" rx="44" ry="10"/>
    <ellipse class="f3" cx="118" cy="72" rx="44" ry="10"/><ellipse class="f2" cx="118" cy="60" rx="44" ry="10"/>
    <path class="s3" d="M204 102V74M226 102V60M248 102V46" stroke-width="10" stroke-linecap="round"/>`,
  transmission: `<circle class="f1" cx="70" cy="86" r="46"/><circle class="f3" cx="150" cy="44" r="16"/><path class="f3" d="M124 104c0-20 12-34 26-34s26 14 26 34z"/>
    <circle class="f2" cx="222" cy="62" r="12"/><path class="f2" d="M202 106c0-16 9-26 20-26s20 10 20 26z"/>
    <path class="s3" d="M176 50c20-6 34-2 40 4" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/>`,
  economie: `<circle class="f1" cx="252" cy="40" r="56"/><rect class="f3" x="40" y="58" width="22" height="46" rx="3"/><rect class="f2" x="72" y="44" width="22" height="60" rx="3"/>
    <rect class="f1" x="104" y="64" width="22" height="40" rx="3"/><path class="s3" d="M30 34l34-12 34 8 34-16" stroke-width="3" stroke-linecap="round"/>`,
  regl: `<circle class="f1" cx="70" cy="34" r="44"/><path class="f3" d="M150 40l50-22 50 22z"/><rect class="f2" x="160" y="46" width="12" height="46"/><rect class="f2" x="194" y="46" width="12" height="46"/>
    <rect class="f2" x="228" y="46" width="12" height="46"/><rect class="f3" x="146" y="94" width="108" height="10" rx="2"/>`,
  marches: `<circle class="f1" cx="260" cy="88" r="50"/><path class="s3" d="M40 70V100M40 30V44" stroke-width="2"/><rect class="f3" x="33" y="44" width="14" height="26" rx="2"/>
    <path class="s3" d="M80 52V92M80 18V30" stroke-width="2"/><rect class="f2" x="73" y="30" width="14" height="22" rx="2"/>
    <path class="s3" d="M120 40V76M120 12V22" stroke-width="2"/><rect class="f3" x="113" y="22" width="14" height="18" rx="2"/>
    <path class="s2" d="M150 96l30-20 26 8 40-40" stroke-width="3" stroke-linecap="round"/>`,
  crypto: `<circle class="f2" cx="118" cy="62" r="40"/><circle class="s3" cx="118" cy="62" r="28" stroke-width="3" style="stroke:var(--i0)"/>
    <circle class="f1" cx="198" cy="54" r="28"/><path class="s3" d="M222 96l30-16 20 10 30-30" stroke-width="3" stroke-linecap="round"/>`,
  autre: `<circle class="f1" cx="90" cy="60" r="44"/><circle class="f2" cx="170" cy="48" r="22"/><circle class="f3" cx="226" cy="78" r="12"/>`,
};
function illustration(themeId, hauteur = 110) {
  return `<svg class="ill th-${themeId}" viewBox="0 0 320 120" height="${hauteur}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <rect class="f0" width="320" height="120"/>${DESSINS[themeId] || DESSINS.autre}</svg>`;
}
// Version miniature (pastille carrée) pour les listes.
const PICTOS = {
  fisc: `<rect class="fc s3" x="5" y="3" width="12" height="16" rx="2" stroke-width="1.8"/><path class="s3" d="M8 8h6M8 12h6" stroke-width="1.8" stroke-linecap="round"/>`,
  immo: `<path class="s3" d="M3 11l8-6 8 6M5 10v9h12v-9" stroke-width="1.8" stroke-linejoin="round"/>`,
  epargne: `<ellipse class="s3" cx="11" cy="15" rx="7" ry="2.5" stroke-width="1.8"/><ellipse class="s3" cx="11" cy="10" rx="7" ry="2.5" stroke-width="1.8"/><ellipse class="s3" cx="11" cy="5.5" rx="7" ry="2.5" stroke-width="1.8"/>`,
  transmission: `<circle class="s3" cx="7" cy="7" r="3" stroke-width="1.8"/><circle class="s3" cx="15" cy="10" r="2.4" stroke-width="1.8"/><path class="s3" d="M2 19c0-4 2-6 5-6s5 2 5 6M11 19c0-3 2-5 4-5s4 2 4 5" stroke-width="1.8"/>`,
  economie: `<path class="s3" d="M4 19V12M9 19V7M14 19V10M19 19V4" stroke-width="2.2" stroke-linecap="round"/>`,
  regl: `<path class="s3" d="M3 8l8-4 8 4zM5 9v8M11 9v8M17 9v8M3 19h16" stroke-width="1.8" stroke-linejoin="round"/>`,
  marches: `<path class="s3" d="M3 16l5-5 4 3 7-8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  crypto: `<circle class="s3" cx="11" cy="11" r="8" stroke-width="1.8"/><path class="s3" d="M9 7v8M9 7h3a2 2 0 010 4H9h3.5a2 2 0 010 4H9" stroke-width="1.6"/>`,
  autre: `<circle class="s3" cx="11" cy="11" r="6" stroke-width="1.8"/>`,
};
function picto(themeId) {
  return `<span class="ligne-pastille th-${themeId}"><svg class="ill" viewBox="0 0 22 22" aria-hidden="true" focusable="false">${PICTOS[themeId] || PICTOS.autre}</svg></span>`;
}

// ---------------------------------------------------------------- Cartes d'actualité
const lienSujet = (id) => `/sujet?id=${encodeURIComponent(id)}`;
function sourcesUniques(s) { return [...new Map((s.articles || []).map((a) => [a.source_nom, a])).values()]; }
function texteCourt(s) {
  return s.resume_court || ((s.articles || []).find((a) => a.extrait && a.extrait.length > 40) || {}).extrait || "";
}

// Grande carte illustrée (sujets importants).
function carte(s) {
  const n = s.importance || 0;
  const t = themeDe(s.categories);
  const sources = sourcesUniques(s);
  const texte = texteCourt(s);
  return `<article class="sujet th-${t.id} ${n >= 5 ? "n5" : ""}">
    ${illustration(t.id)}
    <div class="sujet-corps">
      <div class="meta">
        <span class="etiquette">${echapper((s.categories && s.categories[0]) || t.nom)}</span>
        ${n ? `<span class="niveau n${n}" title="Importance attribuée par l'IA">Importance ${n}/5</span>` : ""}
      </div>
      <h3><a href="${lienSujet(s.id)}">${echapper(s.titre_fr || s.titre)}</a></h3>
      ${texte ? `<p class="resume">${echapper(texte)}</p>` : ""}
      <div class="sources">
        ${sources.slice(0, 3).map((a) => `<a class="source" href="${echapper(a.lien)}" target="_blank" rel="noopener noreferrer">${echapper(a.source_nom)} ↗</a>`).join("")}
        <span>${quand(s.derniere_pub)}</span>
      </div>
    </div>
  </article>`;
}

// Ligne compacte (actualités secondaires).
function ligne(s) {
  const n = s.importance || 0;
  const t = themeDe(s.categories);
  const sources = sourcesUniques(s);
  return `<div class="ligne">
    ${picto(t.id)}
    <div style="min-width:0">
      <a class="titre-ligne" href="${lienSujet(s.id)}">${echapper(s.titre_fr || s.titre)}</a>
      <div class="meta">
        <span>${echapper(t.nom)}</span><span>·</span>
        <span>${sources.slice(0, 2).map((a) => echapper(a.source_nom)).join(", ")}</span><span>·</span>
        <span>${quand(s.derniere_pub)}</span>${n ? `<span>· ${n}/5</span>` : ""}
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- Marchés (relevés du robot)
// Rassemble, pour chaque marché, le relevé le plus récent (séance en cours ou clôture du matin), avec son historique.
async function donneesMarches() {
  const { direct, autres, cloture, historique = {} } = await appelApi("/api/marches");
  const plusRecent = (a, b) => (!a ? b : !b ? a : new Date(a.maj_le) >= new Date(b.maj_le) ? a : b);
  const sIndices = plusRecent(direct, cloture);
  const sAutres = plusRecent(autres, cloture && cloture.autres ? { valeurs: cloture.autres, maj_le: cloture.maj_le } : null);
  const avec = (liste, source) => (liste || []).map((v) => ({ ...v, maj_le: source.maj_le, historique: historique[v.symbole] || [] }));
  return [
    ...(sIndices ? avec(sIndices.valeurs, sIndices) : []),
    ...(sAutres ? avec(sAutres.autres || sAutres.valeurs, sAutres) : []),
  ];
}
function formatVariation(v) {
  if (typeof v !== "number" || isNaN(v)) return '<span class="doux">–</span>';
  return `<span class="${v < 0 ? "var-neg" : "var-pos"}">${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2).replace(".", ",")} %</span>`;
}
function formatCours(v) {
  if (typeof v.cours !== "number" || !v.symbole || /^(SPY|QQQ|DIA|FEZ|EWQ|EWJ|BNO)$/.test(v.symbole)) return "";
  const d = v.symbole === "EUR/USD" ? 4 : v.cours > 1000 ? 0 : 2;
  return v.cours.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
}
// Variation sur ~30 jours, d'après l'historique des clôtures.
function variation30j(historique) {
  const h = (historique || []).slice(-31);
  if (h.length < 10) return null;
  return (h[h.length - 1][1] / h[0][1] - 1) * 100;
}
// Mini-courbe SVG (30 derniers points). Couleur : hausse ou baisse sur la période.
function sparkline(historique, largeur = 64, hauteur = 20) {
  const h = (historique || []).slice(-31).map((p) => p[1]);
  if (h.length < 5) return `<svg width="${largeur}" height="${hauteur}" aria-hidden="true"></svg>`;
  const min = Math.min(...h), max = Math.max(...h), e = max - min || 1;
  const pts = h.map((v, i) => `${(i / (h.length - 1) * largeur).toFixed(1)},${(hauteur - 2 - (v - min) / e * (hauteur - 4)).toFixed(1)}`);
  const couleur = h[h.length - 1] >= h[0] ? "var(--ok)" : "var(--ko)";
  return `<svg class="sparkline" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" aria-hidden="true">
    <polyline points="${pts.join(" ")}" vector-effect="non-scaling-stroke" fill="none" stroke="${couleur}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
const nomCourt = (v) => v.nom.replace(/ \(≈ .*\)/, "").replace("Actions françaises", "CAC 40 ≈").replace("Actions japonaises", "Nikkei ≈");

// Page « bientôt disponible » pour les rubriques des étapes suivantes.
function pageBientot(titre, texte) {
  document.getElementById("contenu").innerHTML =
    `<h1>${titre}</h1><div class="carte"><p><strong>Bientôt disponible.</strong></p><p class="doux">${texte}</p>
     <p><a href="/">← Retour aux actualités</a></p></div>`;
}

// ---------------------------------------------------------------- En-tête commun aux pages privées
const LOGO = `<svg width="30" height="30" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="var(--accent)"/>
  <path d="M7 18l5-5 4 3 5-7" fill="none" stroke="var(--accent-texte)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
async function chargerEntete(pageActive) {
  const moi = await appelApi("/api/moi");
  const liens = [["/", "Aujourd'hui"], ["/brief", "Brief"], ["/recherche", "Recherche"], ["/marches", "Marchés"]];
  if (moi.role === "admin") liens.push(["/admin", "Administration"]);
  const nav = liens
    .map(([href, nom]) => `<a href="${href}" class="${href === pageActive ? "actif" : ""}" ${href === pageActive ? 'aria-current="page"' : ""}>${nom}</a>`)
    .join("");
  document.getElementById("entete").innerHTML = `
    <div class="entete-contenu">
      <a class="logo" href="/">${LOGO}Veille Patrimoine</a>
      <nav class="nav" aria-label="Menu principal">${nav}</nav>
      <form class="recherche-entete" action="/recherche" method="get" role="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="color:var(--doux)"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        <label class="sr" for="recherche-rapide">Rechercher</label>
        <input id="recherche-rapide" name="q" type="search" placeholder="PER, IFI, LMNP…" autocomplete="off">
      </form>
      <div class="outils">
        <button class="icone-bouton" type="button" onclick="basculerTheme()" title="Mode clair / sombre" aria-label="Basculer le mode clair ou sombre">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z" fill="currentColor"/></svg>
        </button>
        <button class="icone-bouton" type="button" id="btn-deconnexion" title="Se déconnecter" aria-label="Se déconnecter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 16l-4-4 4-4M6 12h10"/></svg>
        </button>
      </div>
    </div>`;
  document.getElementById("btn-deconnexion").onclick = async () => {
    await appelApi("/api/deconnexion", "POST", {});
    location.href = "/connexion";
  };
  return moi;
}
