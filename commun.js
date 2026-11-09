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
