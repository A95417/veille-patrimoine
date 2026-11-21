// Rubrique DER : le document d'entrée en relation du cabinet, consulté et présenté au client (ni téléchargement, ni impression).
// RÈGLE : les informations du client ne quittent jamais cette page. Elles ne sont envoyées à aucun serveur,
// ni gardées dans le navigateur (pas de stockage local), et s'effacent : page quittée ou rechargée,
// bouton « Nouveau client » (avec « Annuler » 5 s) et 15 minutes sans activité (en pause pendant la présentation).
(function () {
  const zone = document.getElementById("der-zone");
  const INACTIVITE = 15 * 60 * 1000;
  let C = null, moi = null, admin = false, historique = [];
  const client = { civilite: "M.", nom: "", prenom: "", naissance: "", telephone: "", email: "" };
  let contact = {};

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Mise en forme du texte réglementaire : ***gras italique***, **gras**, *italique*, retours à la ligne, liens.
  const fmt = (s) => esc(s)
    .replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/(https:\/\/[^\s;<]+[^\s;<.,])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g, "<br>");
  const brut = (s) => String(s ?? "").replace(/\*+/g, "");
  const aujourdhui = () => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const dateFr = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : "");

  // ---------------------------------------------------------------- pictogrammes (traits simples, couleurs du cabinet)
  const P = {
    intro: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
    contact: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    identite: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.4"/><path d="M5.5 16.5c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4M15 10h3M15 13.5h3"/>',
    cabinet: '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6M9 11h.01M15 11h.01"/>',
    cif: '<path d="M4 19V5M4 19h16"/><path d="M7 15l4-4 3 3 5-6"/><path d="M15 8h4v4"/>',
    assurance: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    financement: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
    immobilier: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    durabilite: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
    mediateurs: '<path d="M12 4v16M5 20h14"/><path d="M4 8h16"/><path d="M6 8l-3 6c0 1.7 1.3 3 3 3s3-1.3 3-3zM18 8l-3 6c0 1.7 1.3 3 3 3s3-1.3 3-3z"/>',
    remuneration: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 100 7M7 11h6M7 13.5h6"/>',
    communication: '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    reclamations: '<path d="M12 3a9 9 0 110 18 9 9 0 010-18z"/><path d="M12 7v6M12 16.5h.01"/>',
    rgpd: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/>',
    signature: '<path d="M3 17c3-1 4-6 6-6s0 6 2 6 3-4 5-4 2 3 5 3"/><path d="M3 21h18"/>',
    dossier: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 13l2 2 4-4"/>',
    badge: '<path d="M12 3l2.5 2 3.2-.3.6 3.1 2.7 1.8-1.3 2.9 1.3 2.9-2.7 1.8-.6 3.1-3.2-.3L12 21l-2.5-2-3.2.3-.6-3.1L3 14.4l1.3-2.9L3 8.6l2.7-1.8.6-3.1 3.2.3z"/><path d="M9 12l2 2 4-4"/>',
  };
  const ico = (k, cls = "der-ico") => `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[k] || P.intro}</svg></span>`;

  // Illustration de couverture (maison) : un dossier, un stylo qui signe, des courbes de patrimoine, un bouclier.
  const ILLUS = `<svg viewBox="0 0 1000 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stop-color="#f3f1f1"/><stop offset="1" stop-color="#d9d3d3"/></linearGradient>
      <linearGradient id="dr" x1="0" x2="1"><stop offset="0" stop-color="#660000"/><stop offset="1" stop-color="#9b2222"/></linearGradient></defs>
    <rect width="1000" height="330" fill="url(#dg)"/>
    <g opacity=".5" stroke="#bdb4b4" stroke-width="1">${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 90}" y1="0" x2="${i * 90 - 120}" y2="330"/>`).join("")}</g>
    <g class="apparait" style="animation-delay:.2s"><path d="M40 270 C150 250 210 190 300 200 S450 120 560 140 S760 60 960 40" fill="none" stroke="#c9bfbf" stroke-width="3"/>
      <path d="M40 300 C170 290 260 250 360 250 S520 210 640 215 S820 170 960 150" fill="none" stroke="#e0d8d8" stroke-width="3"/></g>
    <g class="flotte"><rect x="330" y="60" width="300" height="230" rx="10" fill="#fff" stroke="#d6cdcd" transform="rotate(-6 480 175)"/>
      <rect x="350" y="48" width="300" height="230" rx="10" fill="#fff" stroke="#cfc5c5" transform="rotate(3 500 163)"/>
      <g transform="rotate(3 500 163)"><rect x="378" y="78" width="92" height="12" rx="6" fill="#660000"/>
        ${[110, 132, 154, 176].map((y, i) => `<rect x="378" y="${y}" width="${[230, 200, 220, 150][i]}" height="7" rx="3.5" fill="#e4dcdc"/>`).join("")}
        <path class="trait" d="M392 236 c18 -26 30 -26 30 -6 s14 18 26 -6 s16 -12 22 6 s20 4 36 -10 s28 0 40 -4" fill="none" stroke="#660000" stroke-width="3.4" stroke-linecap="round"/>
        <line x1="380" y1="252" x2="600" y2="252" stroke="#d8cfcf" stroke-width="2"/></g></g>
    <g transform="translate(640 210) rotate(-38)"><rect x="0" y="-9" width="190" height="18" rx="9" fill="#2b2b2b"/><rect x="128" y="-9" width="18" height="18" fill="#bfbfbf"/>
      <path d="M0 -9 L-34 0 L0 9 Z" fill="#9a9a9a"/><path d="M-34 0 L-24 -3 L-24 3 Z" fill="#2b2b2b"/></g>
    <g transform="translate(-60 0)"><g class="flotte" style="animation-delay:-2s"><circle cx="820" cy="120" r="54" fill="url(#dr)"/>
      <path d="M820 92l22 8v16c0 13-9.5 23-22 26-12.5-3-22-13-22-26v-16z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
      <path d="M809 118l8 8 15-16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></g>
    <g transform="translate(70 0)"><g class="flotte" style="animation-delay:-4s"><rect x="110" y="70" width="150" height="104" rx="14" fill="#fff" stroke="#d6cdcd"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${132 + i * 30}" y="${150 - [30, 48, 40, 66][i]}" width="18" height="${[30, 48, 40, 66][i]}" rx="4" fill="${i === 3 ? "#660000" : "#d9c4c4"}"/>`).join("")}</g></g>
  </svg>`;

  // ---------------------------------------------------------------- rendu du document
  function blocContact() {
    const c = contact, v = (x, lib) => (x ? esc(x) : `<span class="vide">${lib}</span>`);
    return `<div class="der-coord" data-zone="contact">
      <div><div class="gras">${v([c.civilite, (c.nom || "").toUpperCase()].filter(Boolean).join(" "), "Nom du conseiller")}</div><div class="gras">${esc(c.cabinet)}</div><div>${esc(c.adresse)}</div><div>${esc((c.ville || "").toUpperCase())}</div></div>
      <div style="align-self:center">Téléphone : ${esc(c.telephone)}<br>Email : <b>${esc(c.email)}</b></div></div>`;
  }
  function blocIdentite() {
    const k = client, nomComplet = [k.civilite, (k.nom || "").toUpperCase(), k.prenom].filter(Boolean).join(" ");
    return `<div class="der-identite" data-zone="identite">
      <b>${k.nom || k.prenom ? esc(nomComplet) : '<span class="vide">Nom et prénom du client</span>'}</b>
      <span>${k.naissance ? "né(e) le " + esc(dateFr(k.naissance)) : '<span class="vide">Date de naissance</span>'}</span>
      <span>${k.telephone ? esc(k.telephone) : '<span class="vide">Téléphone</span>'}</span>
      <span>${k.email ? esc(k.email) : '<span class="vide">E-mail</span>'}</span></div>`;
  }
  const nomClientCouv = () => [client.civilite, client.prenom, (client.nom || "").toUpperCase()].filter(Boolean).join(" ");
  const interlocuteurCouv = () => [contact.civilite, contact.nom].filter(Boolean).join(" ");

  function garanties(b) {
    const cartes = b.lignes.map((l) => `<div class="der-garantie"><div class="act">${fmt(l[0])}</div>
      <div class="der-montant"><div class="v" data-montant="${esc(l[1])}">${esc(l[1])}</div><div class="l">Montant garanti<br>par sinistre</div></div>
      <div class="der-montant"><div class="v" data-montant="${esc(l[2])}">${esc(l[2])}</div><div class="l">Montant garanti<br>par année d'assurance</div></div></div>`).join("");
    const tab = `<table class="der-tab der-tab-garanties"><thead><tr><th>Activités assurées</th><th>Montants garantis<br>par sinistre</th><th>Montants garantis<br>par année d'assurance</th></tr></thead>
      <tbody>${b.lignes.map((l) => `<tr><td>${fmt(l[0])}</td><td>${esc(l[1])}</td><td>${esc(l[2])}</td></tr>`).join("")}</tbody></table>`;
    return `<div class="der-tableau-titre">${esc(b.titre)}</div><div class="der-garanties">${cartes}</div>${tab}`;
  }
  let nTab = 0;
  function partenaires(b) {
    const id = "pt" + (++nTab);
    // familles pour le filtre (regroupement d'affichage seulement : le texte du tableau ne change pas)
    const FAM = [["Immobilier", /immobili/i], ["Girardin", /girardin/i], ["Gestion", /gestion/i], ["Investissement", /investissement/i], ["Banque", /banque/i], ["Assureur", /assur/i], ["Autres", /./]];
    const famille = (l) => FAM.find(([, r]) => r.test(brut(l[1])))[0];
    const natures = FAM.map(([n]) => n).filter((n) => b.lignes.some((l) => famille(l) === n));
    const filtres = b.lignes.length > 8 ? `<span class="der-filtres" data-tab="${id}"><input type="search" placeholder="Rechercher…" aria-label="Rechercher un partenaire">
      ${natures.length > 1 && natures.length < 8 ? `<button type="button" data-n="" aria-pressed="true">Tous (${b.lignes.length})</button>` + natures.map((n) => `<button type="button" data-n="${esc(n)}" aria-pressed="false">${esc(n)}</button>`).join("") : ""}</span>` : "";
    return `<div class="der-tableau-titre"><span>${esc(b.titre)}</span>${filtres}</div>
      <div class="der-tab-defile"><table class="der-tab" id="${id}"><thead><tr><th>Nom</th><th>Nature</th><th>Type d'accord</th><th>Mode de rémunération</th></tr></thead>
      <tbody>${b.lignes.map((l) => `<tr data-nature="${esc(famille(l))}"><td class="n">${fmt(l[0])}</td><td>${fmt(l[1])}</td><td>${fmt(l[2])}</td><td>${fmt(l[3])}</td></tr>`).join("")}</tbody></table>
      <div class="der-tab-vide" hidden>Aucun partenaire ne correspond.</div></div>${b.note ? `<div class="der-note">${fmt(b.note)}</div>` : ""}`;
  }
  function bloc(b) {
    switch (b.t) {
      case "p": return `<p>${fmt(b.x)}</p>`;
      case "h": return `<div class="der-h ${b.style === "gris" ? "gris" : ""}">${fmt(b.x)}</div>`;
      case "h3": return `<div class="der-h3">${fmt(b.x)}</div>`;
      case "cle": return `<div class="der-cle">${ico("badge", "")}<span>${fmt(b.x)}</span></div>`;
      case "liste": return `<ul class="der-liste">${b.items.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul>`;
      case "centre": return `<div class="der-centre">${b.lignes.map((x) => `<p>${fmt(x)}</p>`).join("")}</div>`;
      case "garanties": return garanties(b);
      case "partenaires": return partenaires(b);
      case "contact": return blocContact();
      case "identite": return blocIdentite();
      case "documents": return `<div class="der-docs"><b>${esc(b.titre)}</b><ul class="der-liste">${b.items.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul></div>`;
      case "signature": return `<div class="der-signatures">${b.colonnes.map((c) => `<div class="col"><b>${esc(c)}</b>Fait à :<br>Date :<br>Signature :<div class="cadre"></div></div>`).join("")}</div>`;
      default: return "";
    }
  }
  // Une section abîmée n'empêche jamais l'affichage du reste (ni l'accès aux outils de l'administrateur).
  const section = (s) => {
    let corps;
    try { corps = s.blocs.map(bloc).join(""); } catch { corps = `<p class="der-casse">Cette section n'a pas pu s'afficher. L'administrateur doit réimporter le texte du DER ou revenir à la version précédente.</p>`; }
    return `<section class="der-section der-anim" id="s-${esc(s.id)}" data-page="${s.page === "nouvelle" ? "nouvelle" : ""}"><h2>${ico(s.icone)}${esc(s.titre)}</h2>${corps}</section>`;
  };

  function documentHtml() {
    nTab = 0;
    return `<article class="der" id="der-doc">
      <section class="der-couverture">
        <div class="der-couv-haut"><div class="der-interlocuteur"><div class="petit">Votre interlocuteur</div><b id="couv-inter">${esc(interlocuteurCouv())}</b><br><span id="couv-cab">${esc(contact.cabinet)}</span><br><br><span id="couv-mail">${esc(contact.email)}</span></div>
          <img class="der-logo" src="/logo-bsc.png" alt="BSC Patrimoine"></div>
        <div class="der-illus">${ILLUS}</div>
        <div><div class="der-titre-couv"><div class="sigle">DER</div><div class="long">Document d'Entrée en Relation</div></div>
          <div class="der-bandeau"><div class="annee">${new Date().getFullYear()}</div><div class="client ${nomClientCouv().length > 3 ? "" : "vide"}" id="couv-client">${nomClientCouv().length > 3 ? esc(nomClientCouv()) : "Nom du client"}</div></div></div>
      </section>
      <div class="der-corps"><div class="der-doc-titre der-anim">Document<span>d'entrée en relation</span></div>${C.sections.map(section).join("")}</div>
    </article>`;
  }

  // ---------------------------------------------------------------- panneau de préparation
  const champ = (zoneN, k, lib, type = "text", cls = "", extra = "") => `<label class="${cls}">${lib}<input type="${type}" data-zone="${zoneN}" data-k="${k}" autocomplete="off" data-lpignore="true" data-1p-ignore spellcheck="false" ${extra}></label>`;
  const civ = (zoneN, opts) => `<label>Civilité<select data-zone="${zoneN}" data-k="civilite">${opts.map((o) => `<option>${o}</option>`).join("")}</select></label>`;
  // Texte du DER trop ancien : prévenir l'administrateur (l'année de la couverture, elle, change toute seule).
  function alerteAge() {
    if (!C?.importe_le) return "";
    const d = new Date(C.importe_le), mois = (Date.now() - d) / (30.44 * 864e5);
    if (new Date().getFullYear() > d.getFullYear()) return `<p class="der-alerte">Nouvelle année : vérifiez le DER (partenaires, garanties, ORIAS, tarifs), puis importez la version ${new Date().getFullYear()}.</p>`;
    if (mois > 12) return `<p class="der-alerte">Texte importé il y a plus de 12 mois : pensez à le vérifier.</p>`;
    return "";
  }
  function panneau() {
    return `<aside class="der-panneau" aria-label="Préparer le DER">
      <details class="der-bloc" id="der-bloc-contact" open><summary><h2>${ico("contact", "")} Votre contact</h2><span class="der-resume" id="der-resume-contact"></span></summary><p class="aide">Le conseiller qui présente le DER.</p>
        <div class="der-champs">${civ("contact", ["Mme", "M.", ""])}${champ("contact", "nom", "Nom")}${champ("contact", "cabinet", "Cabinet", "text", "large")}
          ${champ("contact", "adresse", "Adresse", "text", "large")}${champ("contact", "ville", "Ville", "text", "large")}${champ("contact", "telephone", "Téléphone", "tel", "large")}${champ("contact", "email", "E-mail", "email", "large")}</div>
        <div class="der-ligne-boutons"><button type="button" class="puce" id="der-memoriser">💾 Garder sur mon compte</button><button type="button" class="puce" id="der-oublier" hidden>Oublier</button></div>
        <p class="doux petit" id="der-msg-contact" style="margin:6px 0 0" role="status"></p></details>
      <details class="der-bloc" open><summary><h2>${ico("identite", "")} Vos informations d'identité</h2></summary><p class="aide">Le client à qui vous remettez le DER.</p>
        <div class="der-champs">${civ("client", ["M.", "Mme"])}${champ("client", "nom", "Nom")}${champ("client", "prenom", "Prénom", "text", "large")}
          ${champ("client", "naissance", "Date de naissance", "date", "large")}${champ("client", "telephone", "Téléphone", "tel", "large")}${champ("client", "email", "E-mail", "email", "large")}</div>
        <div class="der-confidentiel"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>
          <span><b>Jamais enregistré, jamais envoyé.</b> Ces informations restent dans cette page et s'effacent quand vous la quittez, après 15 minutes sans activité ou avec « Nouveau client ».</span></div>
        <p class="der-alerte" id="der-alerte-email" hidden>Cet e-mail semble incomplet (exemple : prenom.nom@domaine.fr).</p></details>
      <div class="der-bloc der-actions">
        <button type="button" class="bouton" id="der-presenter">▶ Présenter au client</button>
        <button type="button" class="bouton bouton-discret" id="der-nouveau">↺ Nouveau client</button>
        <div class="der-minuteur" id="der-minuteur" aria-live="polite"></div></div>
      ${admin ? `<div class="der-bloc"><h2>⚙️ Texte du DER (administrateur)</h2>${alerteAge()}<p class="aide">${C ? `Version : ${esc(C.version || "")}${C.importe_le ? ` · importée le ${new Date(C.importe_le).toLocaleDateString("fr-FR")}` : ""}` : "Aucun texte importé."}</p>
        <div class="der-ligne-boutons" style="margin:0"><label class="puce" style="cursor:pointer">📥 Déposer une nouvelle version<input type="file" accept="application/json,.json" id="der-import" hidden></label><button type="button" class="puce" id="der-versions">🕘 Versions précédentes (${(historique || []).length})</button></div>
        <p class="doux petit" id="der-msg-admin" style="margin:6px 0 0" role="status"></p></div>` : ""}
    </aside>`;
  }

  // ---------------------------------------------------------------- mises à jour en direct
  function rafraichir(zoneN) {
    const doc = document.getElementById("der-doc"); if (!doc) return;
    const remplacer = (sel, html) => doc.querySelectorAll(sel).forEach((el) => { const t = document.createElement("div"); t.innerHTML = html; const n = t.firstElementChild; n.classList.add("der-maj"); el.replaceWith(n); });
    if (zoneN === "contact") {
      remplacer('[data-zone="contact"]', blocContact());
      document.getElementById("couv-inter").textContent = interlocuteurCouv();
      document.getElementById("couv-cab").textContent = contact.cabinet || "";
      document.getElementById("couv-mail").textContent = contact.email || "";
    } else {
      remplacer('[data-zone="identite"]', blocIdentite());
      const c = document.getElementById("couv-client"), n = nomClientCouv();
      c.textContent = n.length > 3 ? n : "Nom du client"; c.classList.toggle("vide", n.length <= 3);
    }
  }
  function remplirChamps() {
    document.querySelectorAll(".der-panneau [data-zone]").forEach((el) => { const src = el.dataset.zone === "contact" ? contact : client; el.value = src[el.dataset.k] ?? ""; });
  }

  // Effacement des informations du client (jamais rien d'enregistré : on vide la page).
  let copieAnnulation = null, minuteurAnnulation = 0;
  function effacerClient(message, annulable = false) {
    clearTimeout(minuteurAnnulation); copieAnnulation = annulable && clientRempli() ? { ...client } : null;
    Object.assign(client, { civilite: "M.", nom: "", prenom: "", naissance: "", telephone: "", email: "" });
        remplirChamps(); rafraichir("client"); verifierEmail();
    if (copieAnnulation) {
      toast(message, "Annuler", () => { Object.assign(client, copieAnnulation); copieAnnulation = null; remplirChamps(); rafraichir("client"); toast("Informations rétablies."); }, 5000);
      minuteurAnnulation = setTimeout(() => { copieAnnulation = null; }, 5000);   // passé 5 s, la copie disparaît
    } else if (message) toast(message);
  }
  function toast(m, action, faire, duree = 4200) {
    document.querySelector(".der-toast")?.remove();
    const t = document.createElement("div"); t.className = "der-toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span>${esc(m)}</span>${action ? `<button type="button">${esc(action)}</button>` : ""}`;
    if (action) t.querySelector("button").onclick = () => { t.remove(); faire(); };
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duree);
  }
  const clientRempli = () => ["nom", "prenom", "naissance", "telephone", "email"].some((k) => client[k]);

  // Minuteur d'inactivité : 15 minutes sans rien faire → effacement.
  let derniere = Date.now();
  const activite = () => { derniere = Date.now(); };
  ["pointerdown", "keydown", "scroll", "input", "touchstart"].forEach((e) => addEventListener(e, activite, { passive: true, capture: true }));
  let enPresentation = false;
  setInterval(() => {
    const m = document.getElementById("der-minuteur");
    if (!clientRempli() || enPresentation) { if (m) m.textContent = enPresentation && clientRempli() ? "Effacement automatique en pause pendant la présentation" : ""; derniere = Date.now(); document.getElementById("der-garder")?.remove(); return; }
    const reste = INACTIVITE - (Date.now() - derniere);
    if (reste <= 0) { document.getElementById("der-garder")?.remove(); effacerClient("Informations du client effacées (15 minutes sans activité)."); derniere = Date.now(); return; }
    if (reste <= 60000 && !document.getElementById("der-garder")) {
      const a = document.createElement("div"); a.id = "der-garder"; a.className = "der-toast der-toast-alerte"; a.setAttribute("role", "alert");
      a.innerHTML = `<span>Sans activité : les informations du client s'effacent dans 1 minute.</span><button type="button">Garder</button>`;
      a.querySelector("button").onclick = () => { derniere = Date.now(); a.remove(); };
      document.body.appendChild(a);
    }
    if (reste > 60000) document.getElementById("der-garder")?.remove();
    if (m) m.textContent = `Effacement automatique dans ${Math.ceil(reste / 60000)} min sans activité`;
  }, 5000);
  // Page quittée ou remise depuis l'historique : rien ne doit réapparaître.
  addEventListener("pagehide", () => { Object.keys(client).forEach((k) => (client[k] = "")); document.querySelectorAll('[data-zone="client"]').forEach((el) => (el.value = "")); });
  addEventListener("pageshow", (e) => { if (e.persisted) effacerClient(); });

  // ---------------------------------------------------------------- animations
  function animer() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); compter(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("#der-doc .der-anim").forEach((el) => io.observe(el));
    // sommaire : section en cours surlignée
    const liens = [...document.querySelectorAll(".der-sommaire a")];
    const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) liens.forEach((a) => a.classList.toggle("actif", a.hash === "#" + e.target.id)); }), { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("#der-doc .der-section").forEach((s) => io2.observe(s));
  }
  // Montants garantis : comptage animé jusqu'à la vraie valeur (affichée telle quelle à la fin).
  function compter(racine) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    racine.querySelectorAll("[data-montant]").forEach((el) => {
      const cible = Number(el.dataset.montant.replace(/\D/g, "")); if (!cible) return;
      const t0 = performance.now(), d = 1200;
      const pas = (t) => { const k = Math.min(1, (t - t0) / d), v = Math.round(cible * (1 - Math.pow(1 - k, 3)));
        el.textContent = k < 1 ? v.toLocaleString("fr-FR").replace(/ /g, " ") + "€" : el.dataset.montant; if (k < 1) requestAnimationFrame(pas); };
      requestAnimationFrame(pas);
    });
  }
  // Tableaux des partenaires : recherche et filtre par nature.
  function filtres(racine) {
    racine.querySelectorAll(".der-filtres").forEach((f) => {
      const tab = racine.querySelector("#" + f.dataset.tab) || document.getElementById(f.dataset.tab);
      let nature = "";
      const appliquer = () => {
        const q = (f.querySelector("input").value || "").toLowerCase(); let n = 0;
        tab.querySelectorAll("tbody tr").forEach((tr) => { const ok = (!q || tr.textContent.toLowerCase().includes(q)) && (!nature || tr.dataset.nature === nature); tr.hidden = !ok; if (ok) n++; });
        tab.parentElement.querySelector(".der-tab-vide").hidden = n > 0;
      };
      f.querySelector("input").addEventListener("input", appliquer);
      f.querySelectorAll("button").forEach((b) => b.onclick = () => { nature = b.dataset.n; f.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); appliquer(); });
    });
  }
  const reinitFiltres = () => document.querySelectorAll("#der-doc .der-filtres").forEach((f) => { f.querySelector("input").value = ""; f.querySelector("button")?.click(); f.querySelector("input").dispatchEvent(new Event("input")); });

  // ---------------------------------------------------------------- présentation au client (plein écran, section par section)
  function presenter() {
    reinitFiltres();
    const etapes = [{ id: "couv", titre: "Couverture" }, ...C.sections.filter((s) => s.id !== "dossier")];
    const p = document.createElement("div");
    p.className = "der-presentation"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.setAttribute("aria-label", "Présentation du DER");
    p.innerHTML = `<div class="der-pres-haut"><img src="/logo-bsc.png" alt="BSC Patrimoine"><span class="titre">DOCUMENT D'ENTRÉE EN RELATION</span><button type="button" class="der-pres-fermer">✕ Quitter</button></div>
      <div class="der-pres-scene"></div>
      <div class="der-pres-bas"><button type="button" class="fl" data-d="-1" aria-label="Section précédente">‹</button><div class="der-points">${etapes.map((e, i) => `<button type="button" data-i="${i}" aria-label="${esc(e.titre)}"></button>`).join("")}</div>
        <span class="der-pres-etape"></span><button type="button" class="fl" data-d="1" aria-label="Section suivante">›</button></div>`;
    p.insertAdjacentHTML("beforeend", '<div class="sr" aria-live="polite" id="der-pres-annonce"></div>');
    document.body.appendChild(p);
    enPresentation = true;
    const retour = document.activeElement;
    const scene = p.querySelector(".der-pres-scene");
    let i = 0;
    const montrer = (n, sens = 1) => {
      i = Math.max(0, Math.min(etapes.length - 1, n));
      const e = etapes[i];
      const src = e.id === "couv" ? document.querySelector("#der-doc .der-couverture") : document.getElementById("s-" + e.id);
      const clone = src.cloneNode(true); clone.removeAttribute("id"); clone.classList.add("visible");
      clone.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
      clone.querySelectorAll(".der-filtres").forEach((x) => x.remove());
      scene.innerHTML = `<div class="der-pres-carte der ${sens < 0 ? "retour" : ""}"></div>`;
      scene.firstElementChild.appendChild(clone); scene.scrollTop = 0;
      compter(clone);
      p.querySelectorAll(".der-points button").forEach((b, k) => b.setAttribute("aria-current", k === i));
      p.querySelector(".der-pres-etape").textContent = `${i + 1} / ${etapes.length}`;
      p.querySelector("#der-pres-annonce").textContent = `Section ${i + 1} sur ${etapes.length} : ${e.titre}`;
      p.querySelector('[data-d="-1"]').disabled = i === 0; p.querySelector('[data-d="1"]').disabled = i === etapes.length - 1;
    };
    const fermer = () => { removeEventListener("keydown", touches); p.remove(); enPresentation = false; derniere = Date.now(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); retour?.focus?.(); };
    const touches = (ev) => {
      if (ev.key === "Tab") {   // le clavier reste dans la présentation
        const f = [...p.querySelectorAll("button:not(:disabled), a[href]")].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const k = f.indexOf(document.activeElement);
        if (ev.shiftKey && k <= 0) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && k === f.length - 1) { ev.preventDefault(); f[0].focus(); }
        return;
      }
      if (ev.key === " " && document.activeElement?.tagName === "BUTTON") return; if (ev.key === "ArrowRight" || ev.key === "PageDown" || ev.key === " ") { ev.preventDefault(); montrer(i + 1); } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); montrer(i - 1, -1); } else if (ev.key === "Escape") fermer(); };
    addEventListener("keydown", touches);
    p.querySelectorAll(".fl").forEach((b) => b.onclick = () => montrer(i + Number(b.dataset.d), Number(b.dataset.d)));
    p.querySelectorAll(".der-points button").forEach((b) => b.onclick = () => montrer(Number(b.dataset.i), Number(b.dataset.i) < i ? -1 : 1));
    p.querySelector(".der-pres-fermer").onclick = fermer;
    document.documentElement.requestFullscreen?.().catch(() => {});
    montrer(0);
    p.querySelector('[data-d="1"]').focus();
  }

  // ---------------------------------------------------------------- saisie
  function mettreEnForme(k, v) {
    v = String(v || "").replace(/\s+/g, " ").trim();
    if (k === "telephone") {
      const c = v.replace(/[^\d+]/g, "");
      if (/^0\d{9}$/.test(c)) return c.replace(/(\d{2})(?=\d)/g, "$1 ");
      if (/^\+33\d{9}$/.test(c)) return "+33 " + c.slice(3, 4) + " " + c.slice(4).replace(/(\d{2})(?=\d)/g, "$1 ");
      return v;
    }
    if (k === "prenom") return v.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
    if (k === "nom" || k === "ville") return v.toUpperCase();
    if (k === "email") return v.toLowerCase();
    return v;
  }
  function verifierEmail() {
    const a = document.getElementById("der-alerte-email"); if (!a) return;
    a.hidden = !client.email || /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(client.email);
  }
  function resumeContact() {
    const r = document.getElementById("der-resume-contact"); if (r) r.textContent = [contact.civilite, contact.nom].filter(Boolean).join(" ");
  }

  // ---------------------------------------------------------------- démarrage
  async function demarrer() {
    moi = await chargerEntete("/der");
    let d;
    try { d = await appelApi("/api/der"); } catch (e) { zone.innerHTML = `<p class="message ko">${esc(e.message)}</p>`; return; }
    C = d.contenu; admin = d.admin; historique = d.historique || [];
    const defaut = C?.contact_defaut || {};
    // « Votre contact » : les coordonnées gardées par le conseiller, sinon son nom (et l'adresse du cabinet)
    contact = d.contact ? { ...d.contact } : { ...defaut, civilite: d.conseiller ? "" : defaut.civilite, nom: d.conseiller || defaut.nom || "", telephone: defaut.telephone || "" };
    if (!C) {
      zone.innerHTML = `<div class="der-page"><div class="carte bloc"><h2 style="margin-top:0">Le texte du DER n'est pas encore chargé</h2>
        <p class="doux">${admin ? "Importez le fichier du DER (JSON) fourni : il est rangé dans la base du site, jamais dans le code." : "L'administrateur doit d'abord importer le texte du DER."}</p></div>${admin ? panneau() : ""}</div>`;
      brancherAdmin(); return;
    }
    let docHtml;
    try { docHtml = `<nav class="der-sommaire" aria-label="Sommaire du DER">${C.sections.map((s) => `<a href="#s-${esc(s.id)}">${esc(s.titre)}</a>`).join("")}</nav>${documentHtml()}`; }
    catch { docHtml = `<div class="carte bloc"><h2 style="margin-top:0">Le texte du DER est abîmé</h2><p class="doux">${admin ? "Revenez à la version précédente ou réimportez le fichier du DER (outils administrateur)." : "Prévenez l'administrateur du site."}</p></div>`; }
    zone.innerHTML = `<div class="der-page">${panneau()}<div>${docHtml}</div></div>`;
    brancherAdmin();
    if (!document.getElementById("der-doc")) return;
    remplirChamps();
    document.getElementById("der-oublier").hidden = !d.contact;
    document.querySelectorAll(".der-panneau [data-zone]").forEach((el) => {
      const maj = () => { (el.dataset.zone === "contact" ? contact : client)[el.dataset.k] = el.value.slice(0, 120); rafraichir(el.dataset.zone); resumeContact(); };
      el.addEventListener("input", maj);
      el.addEventListener("change", maj);
      el.addEventListener("blur", () => {   // mise en forme à la sortie du champ
        const v = mettreEnForme(el.dataset.k, el.value);
        if (v !== el.value) { el.value = v; maj(); }
        if (el.dataset.zone === "client" && el.dataset.k === "email") verifierEmail();
      });
    });
    resumeContact();
    if (matchMedia("(max-width: 1100px)").matches && d.contact) document.getElementById("der-bloc-contact").open = false;
    document.getElementById("der-memoriser").onclick = async () => {
      const m = document.getElementById("der-msg-contact");
      try { await appelApi("/api/der/contact", "POST", { contact }); m.textContent = "✓ Coordonnées gardées sur votre compte."; document.getElementById("der-oublier").hidden = false; } catch (e) { m.textContent = e.message; }
    };
    document.getElementById("der-oublier").onclick = async () => {
      const m = document.getElementById("der-msg-contact");
      try { await appelApi("/api/der/contact", "POST", { oublier: true }); m.textContent = "Coordonnées retirées de votre compte."; document.getElementById("der-oublier").hidden = true; } catch (e) { m.textContent = e.message; }
    };
    document.getElementById("der-presenter").onclick = presenter;
    document.getElementById("der-nouveau").onclick = () => effacerClient("Prêt pour un nouveau client : informations effacées.", true);
    filtres(document); animer();
  }
  function brancherAdmin() {
    const recharger = () => { toast("✓ DER mis à jour. Rechargement…"); setTimeout(() => location.reload(), 900); };
    const imp = document.getElementById("der-import");
    if (imp) imp.onchange = async () => { const f = imp.files[0]; imp.value = ""; if (f) await DerAdmin.importer(f, C, recharger); };
    const ve = document.getElementById("der-versions"); if (ve) ve.onclick = () => DerAdmin.historique(historique, recharger);
  }
  demarrer();
})();
