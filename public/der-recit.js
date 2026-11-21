// DER : présentation « récit » au client, en plein écran et en trois chapitres :
// 1. le cabinet (histoire, chiffres, direction, métiers) ; 2. le conseiller ; 3. le DER (zoom réglable).
// Les textes et photos sont fournis par le cabinet (éditeurs ci-dessous) et rangés dans la base du site.
// Aucune donnée du client n'est envoyée.
(function () {
  let X = null;   // contexte fourni par der.js
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const photo = (id, defaut = "") => (id ? `/api/der/photo/${id}` : defaut);
  const vide = (t) => `<div class="rc-vide">À compléter : ${esc(t)}</div>`;

  // ---------------------------------------------------------------- écrans
  // Chaque écran a une clé ; il peut être masqué, et il est sauté devant le client s'il est vide
  // (l'aperçu du conseiller, lui, montre les écrans à compléter).
  const ECRANS_CABINET = [["ouverture", "Logo et accroche"], ["histoire", "Notre histoire"], ["chiffres", "En chiffres"], ["direction", "La direction"], ["metiers", "Nos métiers et nos valeurs"], ["engagements", "Nos engagements"]];
  const libreHtml = (e) => `<div class="rc-libre">${e.photo ? `<img src="${photo(e.photo)}" alt="">` : ""}<div>${e.texte ? `<p class="rc-texte">${esc(e.texte).replace(/\n/g, "<br>")}</p>` : ""}</div></div>`;
  function ecrans(apercu) {
    const cab = X.cabinet() || {}, pro = X.profil() || {}, d = cab.directrice || {};
    const masqueC = new Set(cab.masques || []), masqueP = new Set(pro.masques || []);
    const L = [];
    const ajouter = (ch, cle, titre, rempli, html, masque) => { if (masque.has(cle)) return; if (!rempli && !apercu) return; L.push({ ch, titre, html }); };
    ajouter(0, "ouverture", "Le cabinet", true, `<div class="rc-ouverture"><img class="rc-logo" src="${photo(cab.logo, "/der-logo.png")}" alt="BSC Patrimoine">
      ${cab.accroche ? `<p class="rc-accroche">${esc(cab.accroche)}</p>` : vide("une phrase d'accroche du cabinet")}</div>`, masqueC);
    ajouter(0, "histoire", "Notre histoire", !!(cab.annee || cab.histoire || (cab.etapes || []).length), `<div class="rc-histoire"><div class="rc-depuis">${cab.annee ? `<span>Depuis</span>${esc(cab.annee)}` : vide("l'année de création")}</div>
      <div>${cab.histoire ? `<p class="rc-texte">${esc(cab.histoire).replace(/\n/g, "<br>")}</p>` : vide("l'histoire du cabinet")}
      ${(cab.etapes || []).length ? `<ol class="rc-frise">${cab.etapes.map((e) => `<li><b>${esc(e.annee)}</b><span>${esc(e.texte)}</span></li>`).join("")}</ol>` : vide("les grandes étapes (année et texte)")}</div></div>`, masqueC);
    ajouter(0, "chiffres", "En chiffres", !!(cab.chiffres || []).length, (cab.chiffres || []).length ? `<div class="rc-chiffres">${cab.chiffres.map((c) => `<div><b>${esc(c.valeur)}</b><span>${esc(c.libelle)}</span></div>`).join("")}</div>` : vide("les chiffres clés du cabinet (valeur et libellé)"), masqueC);
    ajouter(0, "direction", "La direction", !!(d.nom || d.photo), `<div class="rc-personne">${d.photo ? `<img src="${photo(d.photo)}" alt="">` : `<div class="rc-photo-vide">Photo</div>`}
      <div>${d.nom ? `<h3>${esc(d.nom)}</h3>` : vide("le nom de la directrice")}${d.role ? `<p class="rc-role">${esc(d.role)}</p>` : ""}${d.texte ? `<p class="rc-texte">${esc(d.texte).replace(/\n/g, "<br>")}</p>` : ""}</div></div>`, masqueC);
    ajouter(0, "metiers", "Nos métiers et nos valeurs", !!((cab.metiers || []).length || (cab.valeurs || []).length), `<div class="rc-deux"><div><h3>Nos métiers</h3>${(cab.metiers || []).length ? `<ul class="rc-puces">${cab.metiers.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : vide("les métiers du cabinet")}</div>
      <div><h3>Nos valeurs</h3>${(cab.valeurs || []).length ? `<ul class="rc-puces">${cab.valeurs.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : vide("les valeurs du cabinet")}</div></div>`, masqueC);
    ajouter(0, "engagements", "Nos engagements", !!(cab.engagements || []).length, (cab.engagements || []).length ? `<ul class="rc-puces rc-engagements">${cab.engagements.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : vide("les engagements et certifications du cabinet"), masqueC);
    (cab.libres || []).forEach((e) => L.push({ ch: 0, titre: e.titre || "Le cabinet", html: libreHtml(e) }));
    ajouter(1, "conseiller", "Votre conseiller", true, `<div class="rc-personne">${pro.photo ? `<img src="${photo(pro.photo)}" alt="">` : `<div class="rc-photo-vide">Photo</div>`}
      <div><h3>${esc(pro.nom || X.contact().nom || "")}</h3>${pro.titre ? `<p class="rc-role">${esc(pro.titre)}</p>` : apercu ? vide("votre titre (ex. Conseiller en gestion de patrimoine)") : ""}
      ${pro.parcours ? `<p class="rc-texte">${esc(pro.parcours).replace(/\n/g, "<br>")}</p>` : apercu ? vide("votre parcours") : ""}
      ${(pro.specialites || []).length ? `<div class="rc-chips">${pro.specialites.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : apercu ? vide("vos spécialités") : ""}</div></div>`, masqueP);
    (pro.libres || []).forEach((e) => L.push({ ch: 1, titre: e.titre || "Votre conseiller", html: libreHtml(e) }));
    L.push({ ch: 2, titre: "Le Document d'Entrée en Relation", der: true });
    return L;
  }

  // ---------------------------------------------------------------- la présentation
  function presenter(apercu = false) {
    const L = ecrans(apercu);
    const chapitres = ["Le cabinet", "Votre conseiller", "Le DER"];
    const r = document.createElement("div"); r.className = "rc"; r.setAttribute("role", "dialog"); r.setAttribute("aria-label", "Présentation au client");
    r.innerHTML = `<div class="rc-haut"><img src="${photo(X.cabinet()?.logo, "/der-logo.png")}" alt="BSC Patrimoine" class="rc-mini">
        <nav class="rc-chapitres">${chapitres.map((c, i) => `<button type="button" data-ch="${i}"><span>${i + 1}</span>${c}</button>`).join("")}</nav>
        <button type="button" class="rc-quitter">✕ Quitter</button></div>
      <div class="rc-scene" aria-live="polite"></div>
      <div class="rc-bas"><button type="button" class="rc-fl" data-d="-1" aria-label="Écran précédent">‹</button><span class="rc-pos"></span><button type="button" class="rc-fl" data-d="1" aria-label="Écran suivant">›</button>
        <span class="rc-zoom" hidden><button type="button" data-z="-1" aria-label="Réduire">−</button><button type="button" class="rc-zoom-val" data-z="0" title="Ajuster à la largeur">100 %</button><button type="button" data-z="1" aria-label="Agrandir">+</button></span></div>`;
    document.body.appendChild(r);
    X.setPresentation(true);
    const scene = r.querySelector(".rc-scene");
    let i = 0, derPret = null, facteur = 1, zoomDer = () => {};
    const montrer = (n) => {
      i = Math.max(0, Math.min(L.length - 1, n));
      const e = L[i];
      r.querySelectorAll(".rc-chapitres button").forEach((b) => b.setAttribute("aria-current", Number(b.dataset.ch) === e.ch));
      r.querySelector(".rc-pos").textContent = `${e.titre} · ${i + 1} / ${L.length}`;
      r.querySelector('[data-d="-1"]').disabled = i === 0; r.querySelector('[data-d="1"]').disabled = i === L.length - 1;
      r.classList.toggle("rc-mode-der", !!e.der);
      r.querySelector(".rc-zoom").hidden = !e.der;
      if (e.der) {
        scene.innerHTML = `<div class="rc-der"><nav class="der-nav rc-der-nav" aria-label="Catégories du DER"><ol><li><button type="button" data-i="-1">Couverture</button></li>
            ${X.C().sections.map((s, k) => `<li><button type="button" data-i="${k}">${esc(s.titre)}</button></li>`).join("")}</ol></nav>
          <div class="der-vue rc-der-vue"><div class="dp-pile"></div></div></div>`;
        const pile = scene.querySelector(".dp-pile"), vue = scene.querySelector(".rc-der-vue");
        X.composer().forEach((f) => { f.removeAttribute("id"); f.querySelectorAll("[id]").forEach((x) => { x.dataset.cible = x.id; x.removeAttribute("id"); }); pile.appendChild(f); });
        pile.querySelector(".dp")?.setAttribute("data-cible", "s-couv");
        zoomDer = () => { pile.style.zoom = Math.max(.25, Math.min(1.4, (vue.clientWidth - 28) / 827) * facteur); r.querySelector(".rc-zoom-val").textContent = Math.round(facteur * 100) + " %"; };
        zoomDer(); new ResizeObserver(() => zoomDer()).observe(vue);
        const aller = (k) => {
          const id = k < 0 ? "s-couv" : "s-" + X.C().sections[k].id, el = pile.querySelector(`[data-cible="${id}"]`); if (!el) return;
          vue.scrollTo({ top: el.getBoundingClientRect().top - vue.getBoundingClientRect().top + vue.scrollTop - 20, behavior: "smooth" });
          scene.querySelectorAll(".rc-der-nav button").forEach((b) => b.setAttribute("aria-current", Number(b.dataset.i) === k));
        };
        scene.querySelectorAll(".rc-der-nav button").forEach((b) => b.onclick = () => aller(Number(b.dataset.i)));
        derPret = aller; aller(-1);
      } else { derPret = null; scene.innerHTML = `<div class="rc-ecran"><h2>${esc(e.titre)}</h2>${e.html}</div>`; }
    };
    const fermer = () => { removeEventListener("keydown", touches); r.remove(); X.setPresentation(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
    const touches = (ev) => {
      if (ev.key === "Escape") { fermer(); return; }
      if (L[i].der) return;   // dans le DER, les flèches font défiler le document
      if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); montrer(i + 1); }
      if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); montrer(i - 1); }
    };
    addEventListener("keydown", touches);
    r.querySelectorAll(".rc-fl").forEach((b) => b.onclick = () => montrer(i + Number(b.dataset.d)));
    r.querySelectorAll(".rc-chapitres button").forEach((b) => { const k = L.findIndex((e) => e.ch === Number(b.dataset.ch)); if (k < 0) b.hidden = true; else b.onclick = () => montrer(k); });
    if (apercu) r.querySelector(".rc-haut").insertAdjacentHTML("beforeend", '<span class="rc-badge-apercu">Aperçu conseiller</span>');
    r.querySelector(".rc-quitter").onclick = fermer;
    r.querySelectorAll("[data-z]").forEach((b) => b.onclick = () => { const z = Number(b.dataset.z); facteur = z === 0 ? 1 : Math.max(.5, Math.min(3, facteur + z * .25)); zoomDer(); });
    document.addEventListener("fullscreenchange", function f() { if (!document.fullscreenElement && document.body.contains(r)) fermer(); if (!document.body.contains(r)) document.removeEventListener("fullscreenchange", f); });
    r.requestFullscreen?.().catch(() => {});
    montrer(0);
  }

  // ---------------------------------------------------------------- éditeurs (le cabinet, mon profil)
  // Photo réduite dans le navigateur avant l'envoi (900 px au plus).
  function reduire(fichier, png) {
    return new Promise((ok, ko) => {
      const img = new Image(); img.onload = () => {
        const k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext("2d"); if (!png) { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); } g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src); ok(c.toDataURL(png ? "image/png" : "image/jpeg", .86));
      };
      img.onerror = () => ko(new Error("Image illisible.")); img.src = URL.createObjectURL(fichier);
    });
  }
  async function envoyerPhoto(fichier, cible) {
    const image = await reduire(fichier, cible === "logo");
    const r = await fetch("/api/der/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, cible }), credentials: "same-origin" });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.erreur || "Envoi impossible."); return j.id;
  }
  const zone = (lib, nom, v, n, aide = "") => `<label class="rc-champ">${lib}${aide ? ` <span class="doux">${aide}</span>` : ""}<textarea name="${nom}" rows="${n}">${esc(v)}</textarea></label>`;
  const ligne = (lib, nom, v, aide = "") => `<label class="rc-champ">${lib}${aide ? ` <span class="doux">${aide}</span>` : ""}<input name="${nom}" value="${esc(v)}"></label>`;
  const champPhoto = (lib, nom, id) => `<div class="rc-champ rc-photo-champ">${lib}<div><img src="${photo(id)}" alt="" ${id ? "" : "hidden"} data-apercu="${nom}"><label class="puce" style="cursor:pointer">📷 Choisir une image<input type="file" accept="image/*" data-photo="${nom}" hidden></label>
    <button type="button" class="puce" data-retirer="${nom}" ${id ? "" : "hidden"}>Retirer</button></div><input type="hidden" name="${nom}" value="${esc(id)}"></div>`;
  function brancherPhotos(d) {
    d.querySelectorAll("[data-photo]").forEach((inp) => { if (inp.dataset.branche) return; inp.dataset.branche = "1"; inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return; const m = d.querySelector(".rc-msg"), nom = inp.dataset.photo; m.textContent = "Envoi de l'image…";
      try { const id = await envoyerPhoto(f, nom === "logo" ? "logo" : nom === "directrice" ? "directrice" : "profil");
        d.querySelector(`input[name="${nom}"]`).value = id; const ap = d.querySelector(`[data-apercu="${nom}"]`); ap.src = photo(id); ap.hidden = false;
        d.querySelector(`[data-retirer="${nom}"]`).hidden = false; m.textContent = "✓ Image prête (pensez à enregistrer)."; }
      catch (e) { m.textContent = e.message; }
    }; });
    d.querySelectorAll("[data-retirer]").forEach((b) => b.onclick = () => { d.querySelector(`input[name="${b.dataset.retirer}"]`).value = ""; d.querySelector(`[data-apercu="${b.dataset.retirer}"]`).hidden = true; b.hidden = true; });
  }
  function dialogue(titre, corps, enregistrer, apres) {
    const d = DerAdmin.boite(`<h2>${esc(titre)}</h2><form class="rc-form" onsubmit="return false">${corps}</form><p class="doux petit rc-msg" role="status"></p>
      <div class="der-ligne-boutons"><button type="button" class="bouton bouton-discret" data-f>Fermer</button><button type="button" class="bouton" data-ok>Enregistrer</button></div>`, true);
    d.querySelector("[data-f]").onclick = () => d.close();
    brancherPhotos(d); brancherLibres(d); apres?.(d);
    d.querySelector("[data-ok]").onclick = async () => {
      const m = d.querySelector(".rc-msg"), v = Object.fromEntries(new FormData(d.querySelector("form")));
      try { await enregistrer(v, d); d.close(); X.toast("✓ Récit mis à jour."); X.majRecit(); } catch (e) { m.textContent = e.message; }
    };
  }
  const lignes = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
  // Écrans affichés (cases à cocher) et écrans libres (titre, texte, image, ordre).
  const champMasques = (liste, masques) => `<fieldset class="rc-groupe"><legend>Écrans affichés</legend><div class="rc-coches">${liste.map(([k, t]) => `<label><input type="checkbox" data-montrer="${k}" ${(masques || []).includes(k) ? "" : "checked"}> ${esc(t)}</label>`).join("")}</div></fieldset>`;
  let nLibre = 0;
  const libreBloc = (e = {}) => { const n = "libre" + (++nLibre); return `<div class="rc-libre-ed" data-libre><div class="rc-libre-barre"><b>Écran libre</b><span><button type="button" class="puce" data-haut aria-label="Monter">↑</button><button type="button" class="puce" data-bas aria-label="Descendre">↓</button><button type="button" class="puce" data-suppr aria-label="Supprimer">✕</button></span></div>
    <input data-l="titre" placeholder="Titre de l'écran" value="${esc(e.titre || "")}"><textarea data-l="texte" rows="3" placeholder="Texte">${esc(e.texte || "")}</textarea>${champPhoto("Image (facultatif)", n, e.photo || "")}</div>`; };
  const champLibres = (liste) => `<fieldset class="rc-groupe"><legend>Écrans libres (dans l'ordre)</legend><div class="rc-libres">${(liste || []).map(libreBloc).join("")}</div><button type="button" class="puce" data-ajout-libre>+ Ajouter un écran</button></fieldset>`;
  function brancherLibres(d) {
    d.addEventListener("click", (e) => {
      const t = e.target, b = t.closest("[data-libre]");
      if (t.matches("[data-ajout-libre]")) { d.querySelector(".rc-libres").insertAdjacentHTML("beforeend", libreBloc()); brancherPhotos(d); }
      if (b && t.matches("[data-suppr]")) b.remove();
      if (b && t.matches("[data-haut]") && b.previousElementSibling) b.previousElementSibling.before(b);
      if (b && t.matches("[data-bas]") && b.nextElementSibling) b.nextElementSibling.after(b);
    });
  }
  const lireLibres = (d) => [...d.querySelectorAll("[data-libre]")].map((b) => ({ titre: b.querySelector('[data-l="titre"]').value, texte: b.querySelector('[data-l="texte"]').value, photo: b.querySelector('input[type="hidden"]').value })).filter((e) => e.titre.trim() || e.texte.trim());
  const lireMasques = (d) => [...d.querySelectorAll("[data-montrer]")].filter((c) => !c.checked).map((c) => c.dataset.montrer);

  // Propositions reprises du site du cabinet (bsc-patrimoine.fr, pages « Présentation » et « Votre expert patrimonial ») :
  // à relire et modifier avant d'enregistrer. Rien n'est inventé ; ce que le site ne donne pas reste vide.
  const SITE = {
    accroche: "Être d'abord et avant tout à votre écoute.",
    metiers: ["Family Office", "Audit patrimonial", "Services aux professionnels", "Assurance-vie", "Placements financiers", "Investissements immobiliers", "Transmission de patrimoine", "Fiscalité"],
    valeurs: ["Indépendance : aucun organisme ni produit imposé", "Transparence et confidentialité", "Analyse objective des marchés et solutions sur mesure", "Premier rendez-vous gratuit, au bureau ou en visioconférence"],
    engagements: ["Adhérent de la Chambre Nationale des Conseils en Gestion de Patrimoine (CNCGP), association agréée par l'AMF", "Inscrit à l'ORIAS sous le n° 17001883", "Membre de l'Association Française des Conseils en Gestion de Patrimoine Certifiés (CGPC)", "Conformité à la norme ISO 22222"],
    d_nom: "Bérengère SAINTE-CROIX", d_role: "Fondatrice et dirigeante du cabinet",
    d_texte: "Executive master en gestion du patrimoine privé et professionnel de Dauphine (mention très bien), conseillère en gestion de patrimoine certifiée depuis 2020. Anticipation et diversification sont des valeurs clés de son approche.",
  };
  function editerCabinet() {
    const c = X.cabinet() || {}, d = c.directrice || {};
    dialogue("Le cabinet (récit de présentation)", `
      <div class="rc-prerempli"><button type="button" class="puce" data-prerempli>🌐 Préremplir avec le site du cabinet</button><span class="doux petit">Les cases vides sont remplies avec les phrases du site bsc-patrimoine.fr ; relisez avant d'enregistrer.</span></div>
      ${champMasques(ECRANS_CABINET, c.masques)}
      ${champPhoto("Logo du cabinet", "logo", c.logo)}
      ${ligne("Phrase d'accroche", "accroche", c.accroche, "(affichée sous le logo)")}
      ${ligne("Année de création", "annee", c.annee)}
      ${zone("Histoire du cabinet", "histoire", c.histoire, 4)}
      ${zone("Grandes étapes", "etapes", (c.etapes || []).map((e) => `${e.annee} | ${e.texte}`).join("\n"), 4, "une par ligne : année | texte")}
      ${zone("Chiffres clés", "chiffres", (c.chiffres || []).map((e) => `${e.valeur} | ${e.libelle}`).join("\n"), 3, "un par ligne : valeur | libellé")}
      ${zone("Métiers", "metiers", (c.metiers || []).join("\n"), 4, "un par ligne")}
      ${zone("Valeurs", "valeurs", (c.valeurs || []).join("\n"), 3, "une par ligne")}
      ${zone("Engagements et certifications", "engagements", (c.engagements || []).join("\n"), 3, "un par ligne")}
      <fieldset class="rc-groupe"><legend>La direction</legend>${champPhoto("Photo (avec son accord)", "directrice", d.photo)}${ligne("Nom", "d_nom", d.nom)}${ligne("Rôle", "d_role", d.role)}${zone("Présentation (facultative)", "d_texte", d.texte, 3)}</fieldset>
      ${champLibres(c.libres)}`,
    async (v, dlg) => {
      const paire = (t) => lignes(t).map((l) => l.split("|").map((x) => x.trim()));
      const cabinet = { logo: v.logo, accroche: v.accroche, annee: v.annee, histoire: v.histoire,
        etapes: paire(v.etapes).map(([a, b]) => ({ annee: b === undefined ? "" : a, texte: b === undefined ? a : b })),
        chiffres: paire(v.chiffres).map(([a, b]) => ({ valeur: a, libelle: b || "" })), metiers: lignes(v.metiers), valeurs: lignes(v.valeurs), engagements: lignes(v.engagements),
        directrice: { photo: v.directrice, nom: v.d_nom, role: v.d_role, texte: v.d_texte }, libres: lireLibres(dlg), masques: lireMasques(dlg) };
      const j = await appelApi("/api/der/cabinet", "POST", { cabinet }); X.setCabinet(j.cabinet);
    }, (dlg) => {
      dlg.querySelector("[data-prerempli]").onclick = () => {
        const mettre = (nom, val) => { const el = dlg.querySelector(`[name="${nom}"]`); if (el && !el.value.trim()) el.value = Array.isArray(val) ? val.join("\n") : val; };
        Object.entries(SITE).forEach(([k, v]) => mettre(k, v));
        dlg.querySelector(".rc-msg").textContent = "✓ Cases vides préremplies avec le site du cabinet : relisez puis enregistrez.";
      };
    });
  }
  function editerProfil() {
    const p = X.profil() || {};
    dialogue("Mon profil (récit de présentation)", `
      ${champMasques([["conseiller", "Ma présentation (photo, parcours, spécialités)"]], p.masques)}
      ${champPhoto("Ma photo", "photo", p.photo)}
      ${ligne("Nom affiché", "nom", p.nom || X.contact().nom)}
      ${ligne("Titre", "titre", p.titre, "(ex. Conseiller en gestion de patrimoine)")}
      ${zone("Mon parcours", "parcours", p.parcours, 4)}
      ${zone("Mes spécialités", "specialites", (p.specialites || []).join("\n"), 3, "une par ligne")}
      ${champLibres(p.libres)}`,
    async (v, dlg) => { const j = await appelApi("/api/der/profil", "POST", { profil: { nom: v.nom, titre: v.titre, parcours: v.parcours, photo: v.photo, specialites: lignes(v.specialites), libres: lireLibres(dlg), masques: lireMasques(dlg) } }); X.setProfil(j.profil); });
  }
  // État du récit (écrans remplis) pour le formulaire de préparation.
  function etat() {
    const c = X.cabinet() || {}, p = X.profil() || {}, d = c.directrice || {};
    const cab = [c.accroche, c.annee || c.histoire || (c.etapes || []).length, (c.chiffres || []).length, d.nom || d.photo, (c.metiers || []).length || (c.valeurs || []).length, (c.engagements || []).length].filter(Boolean).length;
    const pro = [p.titre, p.parcours, (p.specialites || []).length, p.photo].filter(Boolean).length;
    return { cab, cabTotal: 6, pro, proTotal: 4 };
  }

  window.DerRecit = { init: (ctx) => { X = ctx; }, presenter, editerCabinet, editerProfil, etat };
})();
