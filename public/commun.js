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

// Carte d'un sujet (accueil, recherche).
const GROUPES = { officielle: "Officiel", presse: "Presse", international: "International", crypto: "Crypto" };
function carte(s) {
  const principal = s.articles[s.articles.length - 1] || s.articles[0];
  const n = s.importance || 0;
  const lien = `/sujet?id=${encodeURIComponent(s.id)}`;
  const sources = [...new Map(s.articles.map((a) => [a.source_nom, a])).values()];
  const texte = s.resume_court || (s.articles.find((a) => a.extrait && a.extrait.length > 40) || {}).extrait || "";
  return `<article class="sujet ${n >= 4 ? "n" + n : ""}">
    <div class="meta">
      ${n ? `<span class="niveau n${n}" title="Importance attribuée par l'IA">${n}/5</span>` : ""}
      <span>${GROUPES[principal.groupe] || ""}</span><span>·</span><span>${quand(s.derniere_pub)}</span>
      ${(s.categories || []).map((c) => `<span class="cat">${echapper(c)}</span>`).join("")}
    </div>
    <h3><a href="${lien}">${echapper(s.titre_fr || s.titre)}</a></h3>
    ${texte ? `<p class="resume">${echapper(texte)}</p>` : ""}
    <div class="sources">
      ${sources.slice(0, 4).map((a) => `<a class="source" href="${echapper(a.lien)}" target="_blank" rel="noopener noreferrer">${echapper(a.source_nom)} ↗</a>`).join("")}
      ${s.articles.length > 1 ? `<span class="doux" style="font-size:.8rem">${s.articles.length} articles</span>` : ""}
      <a class="lien-detail" href="${lien}">${n >= 3 ? "Résumé détaillé →" : "Détails →"}</a>
    </div>
  </article>`;
}

// Page « bientôt disponible » pour les rubriques des étapes suivantes.
function pageBientot(titre, texte) {
  document.getElementById("contenu").innerHTML =
    `<h1>${titre}</h1><div class="carte"><p><strong>Bientôt disponible.</strong></p><p class="doux">${texte}</p>
     <p><a href="/">← Retour aux actualités</a></p></div>`;
}

// Barre de navigation commune aux pages privées.
async function chargerEntete(pageActive) {
  const moi = await appelApi("/api/moi");
  const liens = [
    ["/", "Accueil"], ["/brief", "Brief du jour"], ["/marches", "Marchés"], ["/recherche", "Recherche"],
  ];
  if (moi.role === "admin") liens.push(["/admin", "Administration"]);
  const nav = liens
    .map(([href, nom]) => `<a href="${href}" class="${href === pageActive ? "actif" : ""}">${nom}</a>`)
    .join("");
  document.getElementById("entete").innerHTML = `
    <div class="entete-contenu">
      <a class="logo" href="/">Veille Patrimoine</a>
      <nav class="nav">${nav}</nav>
      <div class="outils">
        <button class="bouton bouton-discret" onclick="basculerTheme()" title="Mode clair / sombre">◐</button>
        <button class="bouton bouton-discret" id="btn-deconnexion">Se déconnecter</button>
      </div>
    </div>`;
  document.getElementById("btn-deconnexion").onclick = async () => {
    await appelApi("/api/deconnexion", "POST", {});
    location.href = "/connexion";
  };
  return moi;
}
