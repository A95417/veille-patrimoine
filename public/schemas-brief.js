// version 1.0 — schémas du brief (un par actualité), graphique des marchés et lecture « Express » façon stories.
// Les schémas sont préparés par le robot (scripts/schemas.mjs) : chaque chiffre a été vérifié dans le résumé du sujet.

const PICTOS_SCHEMA = {
  maison: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
  euro: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 100 7M7 11h6M7 13.5h6"/>',
  famille: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c.5-4 3-6 5.5-6s5 2 5.5 6M13.5 20c.4-3 2-4.5 3.5-4.5s3.2 1.5 3.6 4.5"/>',
  banque: '<path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  graphique: '<path d="M4 20V4M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>',
  calendrier: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  alerte: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  entreprise: '<path d="M4 21V7l8-4v18M12 9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/>',
  bouclier: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  pourcentage: '<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  impot: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12l6 5M9.5 16.5h.01M14.5 12.5h.01"/>',
  monde: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  energie: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  crypto: '<circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4a2 2 0 010 4h-4zM9.5 11.5h4.5a2 2 0 010 4H9.5zM9.5 7.5v8M11 6v1.5M11 15.5V17"/>',
  retraite: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const pictoSchema = (nom, taille = 22) => `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PICTOS_SCHEMA[nom] || PICTOS_SCHEMA.graphique}</svg>`;
const typoFr = (t) => String(t || "").replace(/ milliards? d['’]euros/g, "\u202fMd€").replace(/ millions? d['’]euros/g, "\u202fM€").replace(/(\d) euros\b/g, "$1\u202f€").replace(/(\d)[   ]?(%|€)/g, "$1 $2");

// Le schéma d'une actualité (HTML, aux couleurs de son thème).
function schemaActu(s) {
  if (!s) return "";
  const e = (t) => echapper(typoFr(t));
  let corps = "";
  if (s.modele === "chiffre") corps = `<div class="sch-chiffre"><span class="sch-valeur">${e(s.chiffre)}</span><span class="sch-legende">${e(s.legende)}</span></div>`;
  else if (s.modele === "avant_apres") corps = `<div class="sch-aa"><div class="sch-boite"><span class="sch-etiquette">${e(s.avant_titre || "Avant")}</span>${e(s.avant)}</div>
      <span class="sch-fleche" aria-hidden="true">→</span><div class="sch-boite sch-apres"><span class="sch-etiquette">${e(s.apres_titre || "Après")}</span>${e(s.apres)}</div></div>`;
  else if (s.modele === "etapes") corps = `<ol class="sch-etapes">${s.elements.map((x, i) => `<li><span class="sch-num">${i + 1}</span><span>${e(x)}</span></li>`).join("")}</ol>`;
  else corps = `<ul class="sch-points">${s.elements.map((x) => `<li><span class="sch-coche" aria-hidden="true">✓</span><span>${e(x)}</span></li>`).join("")}</ul>`;
  return `<figure class="schema" aria-label="Schéma : ${echapper(s.titre)}"><figcaption><span class="sch-icone">${pictoSchema(s.icone)}</span>${e(s.titre)}</figcaption>${corps}</figure>`;
}

// Graphique des marchés : barres horizontales de part et d'autre de zéro (vert = hausse, rouge = baisse).
function graphiqueMarches(valeurs) {
  if (!valeurs.length) return "";
  const max = Math.max(...valeurs.map((v) => Math.abs(v.variation)), 0.5);
  return `<div class="g-marches" role="img" aria-label="Variations des marchés">${valeurs.map((v) => {
    const l = Math.abs(v.variation) / max * 50, neg = v.variation < 0;
    return `<div class="gm-ligne"><span class="gm-nom">${echapper(nomCourt(v))}</span><span class="gm-piste"><span class="gm-zero"></span>
      <span class="gm-barre ${neg ? "neg" : "pos"}" style="${neg ? `right:50%` : `left:50%`};width:${l.toFixed(1)}%"></span></span>
      <span class="gm-val ${neg ? "neg" : "pos"}">${v.variation > 0 ? "+" : ""}${String(v.variation).replace(".", ",")} %</span></div>`;
  }).join("")}</div>`;
}

// ---------------------------------------------------------------- Lecture « Express » : une carte par écran, on glisse pour passer à la suivante.
function ouvrirExpress(b, valeurs) {
  const cartes = [];
  const phrases = (b.synthese || "").split(/(?<=[.!?])\s+/).filter(Boolean);
  cartes.push(`<div class="ex-tete">${b.edition === "soir" ? "Le point du soir" : "Le brief du matin"}</div>
    <h2 class="ex-grand">${(b.actualites || []).length} actualités à connaître</h2>
    <ul class="ex-liste">${phrases.slice(0, 4).map((p) => `<li>${echapper(typoFr(p))}</li>`).join("")}</ul>
    <p class="ex-aide">Touchez à droite ou glissez pour avancer →</p>`);
  if (b.chiffre_du_jour) cartes.push(`<div class="ex-tete">Le chiffre du jour</div><div class="ex-chiffre">${echapper(typoFr(b.chiffre_du_jour.valeur))}</div>
    <p class="ex-texte">${echapper(b.chiffre_du_jour.libelle)}</p>`);
  for (const a of b.actualites || []) {
    const t = themeDe(a.categories), s = (b.schemas || {})[a.id];
    const premiere = (a.resume || "").split(/(?<=[.!?])\s+/)[0] || "";
    cartes.push(`<div class="th-${t.id}" style="display:contents"><div class="ex-tete"><span class="etiquette">${echapper((a.categories || [])[0] || t.nom)}</span></div>
      <h2 class="ex-titre">${echapper(a.titre)}</h2>
      ${s ? schemaActu(s) : `<p class="ex-texte">${echapper(premiere)}</p>`}
      ${s ? `<p class="ex-texte petit">${echapper(premiere)}</p>` : ""}
      <a class="ex-lien" href="${lienSujet(a.id)}">En savoir plus →</a></div>`);
  }
  if (valeurs.length) cartes.push(`<div class="ex-tete">Les marchés</div>${graphiqueMarches(valeurs)}${b.commentaire_marches ? `<p class="ex-texte petit">${echapper(b.commentaire_marches)}</p>` : ""}`);
  if ((b.a_retenir || []).length) cartes.push(`<div class="ex-tete">${b.edition === "soir" ? "Pour demain" : "Pour vos rendez-vous"}</div>
    <ol class="ex-retenir">${b.a_retenir.map((p) => `<li>${echapper(p.texte)}</li>`).join("")}</ol>`);
  cartes.push(`<div class="ex-tete">C'est fini !</div><h2 class="ex-grand">Vous êtes à jour 🎉</h2>
    <div class="ex-fin">${(b.quiz || []).length ? `<button type="button" class="bouton" data-ex-quiz>Tester mes connaissances</button>` : ""}<button type="button" class="bouton bouton-discret" data-ex-fermer>Lire le brief complet</button></div>`);

  const z = document.createElement("div");
  z.className = "express"; z.setAttribute("role", "dialog"); z.setAttribute("aria-modal", "true"); z.setAttribute("aria-label", "Brief en version Express");
  z.innerHTML = `<div class="ex-barres">${cartes.map(() => '<span><i></i></span>').join("")}</div>
    <button type="button" class="ex-fermer" data-ex-fermer aria-label="Fermer">✕</button>
    <div class="ex-carte" aria-live="polite"></div>
    <button type="button" class="ex-zone ex-prec" aria-label="Carte précédente"></button><button type="button" class="ex-zone ex-suiv" aria-label="Carte suivante"></button>`;
  document.body.appendChild(z); document.body.style.overflow = "hidden";
  let i = 0;
  const montrer = (n) => {
    i = Math.max(0, Math.min(cartes.length - 1, n));
    z.querySelector(".ex-carte").innerHTML = cartes[i];
    z.querySelectorAll(".ex-barres span").forEach((s, k) => s.classList.toggle("vu", k <= i));
    z.querySelector(".ex-prec").hidden = i === 0;
  };
  const fermer = () => { z.remove(); document.body.style.overflow = ""; document.removeEventListener("keydown", clavier); };
  const clavier = (e) => { if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); montrer(i + 1); } else if (e.key === "ArrowLeft") montrer(i - 1); else if (e.key === "Escape") fermer(); };
  document.addEventListener("keydown", clavier);
  z.addEventListener("click", (e) => {
    if (e.target.closest("[data-ex-fermer]")) return fermer();
    if (e.target.closest("[data-ex-quiz]")) { fermer(); document.getElementById("b-quiz")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (e.target.closest(".ex-suiv")) { if (i === cartes.length - 1) fermer(); else montrer(i + 1); }
    if (e.target.closest(".ex-prec")) montrer(i - 1);
  });
  let x0 = null;
  z.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  z.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) montrer(i + (dx < 0 ? 1 : -1)); x0 = null; });
  montrer(0);
  z.querySelector(".ex-fermer").focus();
}
