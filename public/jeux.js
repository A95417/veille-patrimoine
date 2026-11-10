// version 1.1
// Jeux d'apprentissage : quiz, cartes à retourner, vrai ou faux, paires à associer.
// Les scores sont enregistrés pour chaque utilisateur (meilleur score par jeu).

async function enregistrerScore(cle, score, total) {
  if (!cle) return;
  try { await appelApi("/api/progression", "POST", { cle, score, total }); } catch {}
}
async function lireProgression() {
  try { return (await appelApi("/api/progression")).scores || {}; } catch { return {}; }
}
const melanger = (t) => { const a = [...t]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LETTRES = ["A", "B", "C", "D", "E"];

// Pluie de confettis pour un sans-faute.
function confettis() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const z = document.createElement("div");
  z.className = "confettis"; z.setAttribute("aria-hidden", "true");
  const couleurs = ["#3a49d6", "#17663f", "#e08a3c", "#d2668c", "#e2b647", "#3f8fa8"];
  z.innerHTML = Array.from({ length: 70 }, (_, i) =>
    `<i style="left:${Math.random() * 100}%;background:${couleurs[i % couleurs.length]};animation-delay:${Math.random() * .6}s;animation-duration:${1.4 + Math.random()}s"></i>`).join("");
  document.body.appendChild(z);
  setTimeout(() => z.remove(), 3200);
}

function messageFin(score, total) {
  const p = score / total;
  if (p === 1) return "Sans faute ! Vous maîtrisez le sujet.";
  if (p >= 0.8) return "Très bien : l'essentiel est acquis.";
  if (p >= 0.5) return "Pas mal ! Relisez les explications pour consolider.";
  return "C'est en se trompant qu'on retient : relisez la fiche et retentez.";
}

// ---------------------------------------------------------------- Quiz à choix multiples (une question à la fois)
// questions : [{ question, choix: [..], bonne: index, explication, lien? }]
function quizInteractif(zone, questions, { cle, melangerQuestions = false, surFin } = {}) {
  let liste = melangerQuestions ? melanger(questions) : questions;
  let i = 0, score = 0;
  zone.classList.add("jeu");

  function question() {
    const q = liste[i];
    zone.innerHTML = `
      <div class="jeu-progres" aria-hidden="true"><span style="width:${(i / liste.length) * 100}%"></span></div>
      <div class="jeu-compteur">Question ${i + 1} sur ${liste.length} · score ${score}</div>
      <p class="jeu-question">${echapper(q.question)}</p>
      <div class="jeu-choix">${q.choix.map((c, k) => `<button type="button" class="choix" data-k="${k}"><span class="lettre">${LETTRES[k]}</span><span>${echapper(c)}</span></button>`).join("")}</div>
      <div class="jeu-retour" aria-live="polite"></div>`;
    zone.querySelectorAll(".choix").forEach((b) => b.onclick = () => repondre(Number(b.dataset.k)));
  }
  function repondre(k) {
    const q = liste[i], bon = k === q.bonne;
    if (bon) score++;
    zone.querySelectorAll(".choix").forEach((b) => {
      const n = Number(b.dataset.k);
      b.disabled = true;
      if (n === q.bonne) b.classList.add("bonne");
      else if (n === k) b.classList.add("fausse");
    });
    zone.querySelector(".jeu-retour").innerHTML = `
      <p class="${bon ? "bravo" : "rate"}"><strong>${bon ? "Bonne réponse !" : "Pas tout à fait."}</strong> ${echapper(q.explication || "")}
      ${q.lien ? ` <a href="${q.lien}">Relire le sujet →</a>` : ""}</p>
      <button type="button" class="bouton" id="jeu-suivant">${i + 1 < liste.length ? "Question suivante" : "Voir mon score"}</button>`;
    const suivant = zone.querySelector("#jeu-suivant");
    suivant.focus();
    suivant.onclick = () => { i++; i < liste.length ? question() : fin(); };
  }
  function fin() {
    enregistrerScore(cle, score, liste.length);
    if (score === liste.length) confettis();
    zone.innerHTML = `<div class="jeu-fin">
      ${anneauScore(score, liste.length)}
      <div><p class="jeu-question" style="margin:0 0 6px">${score} / ${liste.length}</p><p style="margin:0 0 14px">${messageFin(score, liste.length)}</p>
      <button type="button" class="bouton bouton-discret" id="jeu-rejouer">Recommencer</button></div></div>`;
    zone.querySelector("#jeu-rejouer").onclick = () => { liste = melanger(questions); i = 0; score = 0; question(); };
    if (surFin) surFin(score, liste.length);
  }
  question();
}

function anneauScore(score, total, taille = 84) {
  const p = total ? score / total : 0;
  const couleur = p >= 0.8 ? "var(--ok)" : p >= 0.5 ? "var(--accent)" : "var(--ko)";
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 42 42" role="img" aria-label="Score : ${score} sur ${total}">
    <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--bord)" stroke-width="5"/>
    <circle cx="21" cy="21" r="15.9" fill="none" stroke="${couleur}" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${(p * 100).toFixed(1)} ${(100 - p * 100).toFixed(1)}" stroke-dashoffset="25"/>
    <text x="21" y="24" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">${Math.round(p * 100)}%</text></svg>`;
}

// ---------------------------------------------------------------- Cartes à retourner (flashcards)
// cartes : [{ recto, verso }]
function cartesMemo(zone, cartes, { cle } = {}) {
  let liste = melanger(cartes), i = 0, sues = 0;
  zone.classList.add("jeu");
  function afficher() {
    const c = liste[i];
    zone.innerHTML = `
      <div class="jeu-compteur">Carte ${i + 1} sur ${liste.length} · cliquez sur la carte pour la retourner</div>
      <button type="button" class="memo" aria-label="Retourner la carte">
        <span class="memo-face memo-recto"><span class="memo-titre">Question</span>${echapper(c.recto)}</span>
        <span class="memo-face memo-verso"><span class="memo-titre">Réponse</span>${echapper(c.verso)}</span>
      </button>
      <div class="jeu-actions" hidden>
        <button type="button" class="bouton bouton-discret" data-r="0">À revoir</button>
        <button type="button" class="bouton" data-r="1">Je savais</button>
      </div>`;
    const memo = zone.querySelector(".memo");
    memo.onclick = () => { memo.classList.toggle("retournee"); zone.querySelector(".jeu-actions").hidden = false; };
    zone.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => {
      if (b.dataset.r === "1") sues++; else liste.push(c);     // une carte à revoir revient plus tard (au plus une fois de plus)
      i++;
      if (i < liste.length && i < cartes.length * 2) afficher();
      else fin();
    });
  }
  function fin() {
    enregistrerScore(cle, sues, cartes.length);
    zone.innerHTML = `<div class="jeu-fin">${anneauScore(Math.min(sues, cartes.length), cartes.length)}
      <div><p class="jeu-question" style="margin:0 0 6px">${Math.min(sues, cartes.length)} carte${sues > 1 ? "s" : ""} sue${sues > 1 ? "s" : ""} sur ${cartes.length}</p>
      <button type="button" class="bouton bouton-discret" id="memo-rejouer">Rejouer</button></div></div>`;
    zone.querySelector("#memo-rejouer").onclick = () => { liste = melanger(cartes); i = 0; sues = 0; afficher(); };
  }
  afficher();
}

// ---------------------------------------------------------------- Vrai ou faux express
// affirmations : [{ texte, vrai: bool, explication }]
function vraiOuFaux(zone, affirmations, { cle } = {}) {
  let liste = melanger(affirmations), i = 0, score = 0, serie = 0, meilleure = 0;
  zone.classList.add("jeu");
  function afficher() {
    const a = liste[i];
    zone.innerHTML = `
      <div class="jeu-progres" aria-hidden="true"><span style="width:${(i / liste.length) * 100}%"></span></div>
      <div class="jeu-compteur">${i + 1} / ${liste.length} · série en cours : ${serie}${serie >= 3 ? " · en feu !" : ""}</div>
      <p class="jeu-question">« ${echapper(a.texte)} »</p>
      <div class="vf-boutons">
        <button type="button" class="vf vrai" data-v="1">Vrai</button>
        <button type="button" class="vf faux" data-v="0">Faux</button>
      </div>
      <div class="jeu-retour" aria-live="polite"></div>`;
    zone.querySelectorAll(".vf").forEach((b) => b.onclick = () => repondre(b.dataset.v === "1"));
  }
  function repondre(v) {
    const a = liste[i], bon = v === a.vrai;
    if (bon) { score++; serie++; meilleure = Math.max(meilleure, serie); } else serie = 0;
    zone.querySelectorAll(".vf").forEach((b) => { b.disabled = true; if ((b.dataset.v === "1") === a.vrai) b.classList.add("bonne"); });
    zone.querySelector(".jeu-retour").innerHTML = `<p class="${bon ? "bravo" : "rate"}"><strong>${a.vrai ? "Vrai." : "Faux."}</strong> ${echapper(a.explication || "")}</p>
      <button type="button" class="bouton" id="vf-suivant">${i + 1 < liste.length ? "Suivant" : "Voir mon score"}</button>`;
    const s = zone.querySelector("#vf-suivant"); s.focus();
    s.onclick = () => { i++; i < liste.length ? afficher() : fin(); };
  }
  function fin() {
    enregistrerScore(cle, score, liste.length);
    if (score === liste.length) confettis();
    zone.innerHTML = `<div class="jeu-fin">${anneauScore(score, liste.length)}
      <div><p class="jeu-question" style="margin:0 0 6px">${score} / ${liste.length} · meilleure série : ${meilleure}</p><p style="margin:0 0 14px">${messageFin(score, liste.length)}</p>
      <button type="button" class="bouton bouton-discret" id="vf-rejouer">Rejouer</button></div></div>`;
    zone.querySelector("#vf-rejouer").onclick = () => { liste = melanger(affirmations); i = 0; score = 0; serie = 0; afficher(); };
  }
  afficher();
}

// ---------------------------------------------------------------- Paires à associer (terme ↔ définition)
// paires : [{ terme, definition }]
function pairesAAssocier(zone, paires, { cle } = {}) {
  zone.classList.add("jeu");
  let erreurs = 0, trouvees = 0, choisi = null;
  const termes = melanger(paires.map((p, k) => ({ k, t: p.terme })));
  const defs = melanger(paires.map((p, k) => ({ k, t: p.definition })));
  zone.innerHTML = `
    <div class="jeu-compteur">Cliquez sur un terme, puis sur sa définition · <span id="paires-etat">0 / ${paires.length} trouvées</span></div>
    <div class="paires">
      <div class="paires-col">${termes.map((x) => `<button type="button" class="paire terme" data-k="${x.k}">${echapper(x.t)}</button>`).join("")}</div>
      <div class="paires-col">${defs.map((x) => `<button type="button" class="paire def" data-k="${x.k}">${echapper(x.t)}</button>`).join("")}</div>
    </div>
    <div class="jeu-retour" aria-live="polite"></div>`;
  zone.querySelectorAll(".paire.terme").forEach((b) => b.onclick = () => {
    zone.querySelectorAll(".paire.terme").forEach((x) => x.classList.remove("choisie"));
    b.classList.add("choisie"); choisi = b;
  });
  zone.querySelectorAll(".paire.def").forEach((b) => b.onclick = () => {
    if (!choisi) { zone.querySelector(".jeu-retour").innerHTML = '<p class="doux">Choisissez d\'abord un terme à gauche.</p>'; return; }
    if (b.dataset.k === choisi.dataset.k) {
      b.disabled = choisi.disabled = true; b.classList.add("bonne"); choisi.classList.add("bonne"); choisi.classList.remove("choisie");
      choisi = null; trouvees++;
      zone.querySelector("#paires-etat").textContent = `${trouvees} / ${paires.length} trouvées`;
      if (trouvees === paires.length) {
        const score = Math.max(0, paires.length - erreurs);
        enregistrerScore(cle, score, paires.length);
        if (!erreurs) confettis();
        zone.querySelector(".jeu-retour").innerHTML = `<p class="bravo"><strong>Bravo, toutes les paires sont trouvées !</strong> ${erreurs ? `(${erreurs} erreur${erreurs > 1 ? "s" : ""})` : "Sans erreur."}</p>
          <button type="button" class="bouton bouton-discret" id="paires-rejouer">Rejouer</button>`;
        zone.querySelector("#paires-rejouer").onclick = () => pairesAAssocier(zone, paires, { cle });
      } else zone.querySelector(".jeu-retour").innerHTML = "";
    } else {
      erreurs++;
      b.classList.add("fausse"); setTimeout(() => b.classList.remove("fausse"), 500);
      zone.querySelector(".jeu-retour").innerHTML = '<p class="rate">Ce n\'est pas la bonne définition, réessayez.</p>';
    }
  });
}
