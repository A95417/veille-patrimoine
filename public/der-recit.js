// DER : présentation « récit » au client, en plein écran et en trois chapitres :
// 1. le cabinet (histoire, chiffres, directrice, métiers) ; 2. le conseiller ; 3. le DER, avec des cartes d'illustration.
// Les textes et photos sont fournis par le cabinet (éditeurs ci-dessous) et rangés dans la base du site.
// Les cartes d'illustration ne reprennent QUE des phrases du DER. Aucune donnée du client n'est envoyée.
(function () {
  let X = null;   // contexte fourni par der.js
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const photo = (id, defaut = "") => (id ? `/api/der/photo/${id}` : defaut);
  const vide = (t) => `<div class="rc-vide">À compléter : ${esc(t)}</div>`;

  // ---------------------------------------------------------------- écrans
  function ecrans() {
    const cab = X.cabinet() || {}, pro = X.profil() || {}, d = cab.directrice || {};
    const L = [];
    L.push({ ch: 0, titre: "Le cabinet", html: `<div class="rc-ouverture"><img class="rc-logo" src="${photo(cab.logo, "/der-logo.png")}" alt="BSC Patrimoine">
      ${cab.accroche ? `<p class="rc-accroche">${esc(cab.accroche)}</p>` : vide("une phrase d'accroche du cabinet")}</div>` });
    L.push({ ch: 0, titre: "Notre histoire", html: `<div class="rc-histoire"><div class="rc-depuis">${cab.annee ? `<span>Depuis</span>${esc(cab.annee)}` : vide("l'année de création")}</div>
      <div>${cab.histoire ? `<p class="rc-texte">${esc(cab.histoire).replace(/\n/g, "<br>")}</p>` : vide("l'histoire du cabinet")}
      ${(cab.etapes || []).length ? `<ol class="rc-frise">${cab.etapes.map((e) => `<li><b>${esc(e.annee)}</b><span>${esc(e.texte)}</span></li>`).join("")}</ol>` : vide("les grandes étapes (année et texte)")}</div></div>` });
    L.push({ ch: 0, titre: "En chiffres", html: (cab.chiffres || []).length ? `<div class="rc-chiffres">${cab.chiffres.map((c) => `<div><b>${esc(c.valeur)}</b><span>${esc(c.libelle)}</span></div>`).join("")}</div>` : vide("les chiffres clés du cabinet (valeur et libellé)") });
    L.push({ ch: 0, titre: "La direction", html: `<div class="rc-personne">${d.photo ? `<img src="${photo(d.photo)}" alt="">` : `<div class="rc-photo-vide">Photo</div>`}
      <div>${d.nom ? `<h3>${esc(d.nom)}</h3>` : vide("le nom de la directrice")}${d.role ? `<p class="rc-role">${esc(d.role)}</p>` : ""}${d.texte ? `<p class="rc-texte">${esc(d.texte)}</p>` : vide("sa présentation")}</div></div>` });
    L.push({ ch: 0, titre: "Nos métiers et nos valeurs", html: `<div class="rc-deux"><div><h3>Nos métiers</h3>${(cab.metiers || []).length ? `<ul class="rc-puces">${cab.metiers.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : vide("les métiers du cabinet")}</div>
      <div><h3>Nos valeurs</h3>${(cab.valeurs || []).length ? `<ul class="rc-puces">${cab.valeurs.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : vide("les valeurs du cabinet")}</div></div>` });
    L.push({ ch: 1, titre: "Votre conseiller", html: `<div class="rc-personne">${pro.photo ? `<img src="${photo(pro.photo)}" alt="">` : `<div class="rc-photo-vide">Photo</div>`}
      <div><h3>${esc(pro.nom || X.contact().nom || "")}</h3>${pro.titre ? `<p class="rc-role">${esc(pro.titre)}</p>` : vide("votre titre (ex. Conseiller en gestion de patrimoine)")}
      ${pro.parcours ? `<p class="rc-texte">${esc(pro.parcours).replace(/\n/g, "<br>")}</p>` : vide("votre parcours")}
      ${(pro.specialites || []).length ? `<div class="rc-chips">${pro.specialites.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : vide("vos spécialités")}</div></div>` });
    L.push({ ch: 2, titre: "Le Document d'Entrée en Relation", der: true });
    return L;
  }

  // ---------------------------------------------------------------- cartes d'illustration (phrases du DER uniquement)
  const sec = (id) => X.C().sections.find((s) => s.id === id);
  const ps = (id) => (sec(id)?.blocs || []).filter((b) => b.t === "p").map((b) => b.x);
  const items = (id) => (sec(id)?.blocs || []).filter((b) => b.t === "liste").flatMap((b) => b.items);
  const CARTES = {
    controle: { titre: "Qui contrôle le cabinet ?", corps() {
      const cles = [...new Set(X.C().sections.flatMap((s) => s.blocs.filter((b) => b.t === "cle").map((b) => b.x)))];
      const tut = ps("mediateurs");
      return `<div class="rc-cartes">${cles.map((c) => `<div class="rc-carte"><b>${X.fmt(c)}</b></div>`).join("")}${tut.map((t) => `<div class="rc-carte">${X.fmt(t)}</div>`).join("")}</div>`;
    } },
    remuneration: { titre: "Comment je suis rémunéré", corps() { return `<div class="rc-cartes">${ps("remuneration").map((t) => `<div class="rc-carte">${X.fmt(t)}</div>`).join("")}</div>`; } },
    garanties: { titre: "Mes garanties", corps() {
      const lignes = X.C().sections.flatMap((s) => s.blocs.filter((b) => b.t === "garanties").flatMap((b) => b.lignes));
      return `<div class="rc-garanties">${lignes.map((l) => `<div class="rc-carte"><span>${X.fmt(l[0])}</span><b>${esc(l[1])}</b><small>par sinistre</small><b>${esc(l[2])}</b><small>par année d'assurance</small></div>`).join("")}</div>`;
    } },
    desaccord: { titre: "En cas de désaccord", corps() {
      const p = ps("reclamations"), it = items("reclamations");
      const etapes = [["1", "Votre conseiller", p[0] ? [p[0]] : []], ["2", "Un médiateur", [p[1], ...it].filter(Boolean)], ["3", "Le tribunal", p[2] ? [p[2]] : []]];
      return `<ol class="rc-etapes">${etapes.map(([n, t, xs]) => `<li><span class="n">${n}</span><b>${t}</b>${xs.map((x) => `<p>${X.fmt(x)}</p>`).join("")}</li>`).join("")}</ol>`;
    } },
    donnees: { titre: "Vos données personnelles", corps() { return `<div class="rc-cartes">${ps("rgpd").map((t) => `<div class="rc-carte">${X.fmt(t)}</div>`).join("")}</div>`; } },
  };
  function ouvrirCarte(racine, cle) {
    const c = CARTES[cle]; if (!c) return;
    racine.querySelector(".rc-carte-ouverte")?.remove();
    const d = document.createElement("div"); d.className = "rc-carte-ouverte"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", c.titre);
    d.innerHTML = `<div class="rc-carte-boite"><div class="rc-carte-haut"><h3>${esc(c.titre)}</h3><button type="button" class="rc-fermer" aria-label="Fermer">✕</button></div>
      <div class="rc-carte-corps">${c.corps()}</div><p class="rc-source">Extrait du Document d'Entrée en Relation.</p></div>`;
    racine.appendChild(d);
    const fermer = () => d.remove();
    d.querySelector(".rc-fermer").onclick = fermer;
    d.addEventListener("click", (e) => { if (e.target === d) fermer(); });
    d.querySelector(".rc-fermer").focus();
  }

  // ---------------------------------------------------------------- la présentation
  function presenter() {
    const L = ecrans();
    const chapitres = ["Le cabinet", "Votre conseiller", "Le DER"];
    const r = document.createElement("div"); r.className = "rc"; r.setAttribute("role", "dialog"); r.setAttribute("aria-label", "Présentation au client");
    r.innerHTML = `<div class="rc-haut"><img src="${photo(X.cabinet()?.logo, "/der-logo.png")}" alt="BSC Patrimoine" class="rc-mini">
        <nav class="rc-chapitres">${chapitres.map((c, i) => `<button type="button" data-ch="${i}"><span>${i + 1}</span>${c}</button>`).join("")}</nav>
        <button type="button" class="rc-quitter">✕ Quitter</button></div>
      <div class="rc-scene" aria-live="polite"></div>
      <div class="rc-bas"><button type="button" class="rc-fl" data-d="-1" aria-label="Écran précédent">‹</button><span class="rc-pos"></span><button type="button" class="rc-fl" data-d="1" aria-label="Écran suivant">›</button></div>`;
    document.body.appendChild(r);
    X.setPresentation(true);
    const scene = r.querySelector(".rc-scene");
    let i = 0, derPret = null;
    const montrer = (n) => {
      i = Math.max(0, Math.min(L.length - 1, n));
      const e = L[i];
      r.querySelectorAll(".rc-chapitres button").forEach((b) => b.setAttribute("aria-current", Number(b.dataset.ch) === e.ch));
      r.querySelector(".rc-pos").textContent = `${e.titre} · ${i + 1} / ${L.length}`;
      r.querySelector('[data-d="-1"]').disabled = i === 0; r.querySelector('[data-d="1"]').disabled = i === L.length - 1;
      r.classList.toggle("rc-mode-der", !!e.der);
      if (e.der) {
        scene.innerHTML = `<div class="rc-der"><nav class="der-nav rc-der-nav" aria-label="Catégories du DER"><ol><li><button type="button" data-i="-1">Couverture</button></li>
            ${X.C().sections.map((s, k) => `<li><button type="button" data-i="${k}">${esc(s.titre)}</button></li>`).join("")}</ol></nav>
          <div class="der-vue rc-der-vue"><div class="dp-pile"></div></div>
          <aside class="rc-illus"><h4>Illustrer</h4>${Object.entries(CARTES).map(([k, c]) => `<button type="button" data-carte="${k}">${esc(c.titre)}</button>`).join("")}</aside></div>`;
        const pile = scene.querySelector(".dp-pile"), vue = scene.querySelector(".rc-der-vue");
        X.composer().forEach((f) => { f.removeAttribute("id"); f.querySelectorAll("[id]").forEach((x) => { x.dataset.cible = x.id; x.removeAttribute("id"); }); pile.appendChild(f); });
        pile.querySelector(".dp")?.setAttribute("data-cible", "s-couv");
        const zoom = () => { pile.style.zoom = Math.max(.3, Math.min(1.4, (vue.clientWidth - 28) / 827)); };
        zoom(); new ResizeObserver(zoom).observe(vue);
        const aller = (k) => {
          const id = k < 0 ? "s-couv" : "s-" + X.C().sections[k].id, el = pile.querySelector(`[data-cible="${id}"]`); if (!el) return;
          vue.scrollTo({ top: el.getBoundingClientRect().top - vue.getBoundingClientRect().top + vue.scrollTop - 20, behavior: "smooth" });
          scene.querySelectorAll(".rc-der-nav button").forEach((b) => b.setAttribute("aria-current", Number(b.dataset.i) === k));
        };
        scene.querySelectorAll(".rc-der-nav button").forEach((b) => b.onclick = () => aller(Number(b.dataset.i)));
        scene.querySelectorAll("[data-carte]").forEach((b) => b.onclick = () => ouvrirCarte(r, b.dataset.carte));
        derPret = aller; aller(-1);
      } else { derPret = null; scene.innerHTML = `<div class="rc-ecran"><h2>${esc(e.titre)}</h2>${e.html}</div>`; }
    };
    const fermer = () => { removeEventListener("keydown", touches); r.remove(); X.setPresentation(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
    const touches = (ev) => {
      if (ev.key === "Escape") { if (r.querySelector(".rc-carte-ouverte")) r.querySelector(".rc-carte-ouverte").remove(); else fermer(); return; }
      if (r.querySelector(".rc-carte-ouverte") || L[i].der) return;   // dans le DER, les flèches font défiler le document
      if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); montrer(i + 1); }
      if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); montrer(i - 1); }
    };
    addEventListener("keydown", touches);
    r.querySelectorAll(".rc-fl").forEach((b) => b.onclick = () => montrer(i + Number(b.dataset.d)));
    r.querySelectorAll(".rc-chapitres button").forEach((b) => b.onclick = () => montrer(L.findIndex((e) => e.ch === Number(b.dataset.ch))));
    r.querySelector(".rc-quitter").onclick = fermer;
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
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
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
  function dialogue(titre, corps, enregistrer) {
    const d = DerAdmin.boite(`<h2>${esc(titre)}</h2><form class="rc-form">${corps}</form><p class="doux petit rc-msg" role="status"></p>
      <div class="der-ligne-boutons"><button type="button" class="bouton bouton-discret" data-f>Fermer</button><button type="button" class="bouton" data-ok>Enregistrer</button></div>`, true);
    d.querySelector("[data-f]").onclick = () => d.close();
    d.querySelectorAll("[data-photo]").forEach((inp) => inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return; const m = d.querySelector(".rc-msg"); m.textContent = "Envoi de l'image…";
      try { const id = await envoyerPhoto(f, inp.dataset.photo === "logo" ? "logo" : inp.dataset.photo === "directrice" ? "directrice" : "profil");
        d.querySelector(`input[name="${inp.dataset.photo}"]`).value = id; const ap = d.querySelector(`[data-apercu="${inp.dataset.photo}"]`); ap.src = photo(id); ap.hidden = false;
        d.querySelector(`[data-retirer="${inp.dataset.photo}"]`).hidden = false; m.textContent = "✓ Image prête (pensez à enregistrer)."; }
      catch (e) { m.textContent = e.message; }
    });
    d.querySelectorAll("[data-retirer]").forEach((b) => b.onclick = () => { d.querySelector(`input[name="${b.dataset.retirer}"]`).value = ""; d.querySelector(`[data-apercu="${b.dataset.retirer}"]`).hidden = true; b.hidden = true; });
    d.querySelector("[data-ok]").onclick = async () => {
      const m = d.querySelector(".rc-msg"), v = Object.fromEntries(new FormData(d.querySelector("form")));
      try { await enregistrer(v); d.close(); X.toast("✓ Récit mis à jour."); X.majRecit(); } catch (e) { m.textContent = e.message; }
    };
  }
  const lignes = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
  function editerCabinet() {
    const c = X.cabinet() || {}, d = c.directrice || {};
    dialogue("Le cabinet (récit de présentation)", `
      ${champPhoto("Logo du cabinet", "logo", c.logo)}
      ${ligne("Phrase d'accroche", "accroche", c.accroche, "(affichée sous le logo)")}
      ${ligne("Année de création", "annee", c.annee)}
      ${zone("Histoire du cabinet", "histoire", c.histoire, 4)}
      ${zone("Grandes étapes", "etapes", (c.etapes || []).map((e) => `${e.annee} | ${e.texte}`).join("\n"), 4, "une par ligne : année | texte")}
      ${zone("Chiffres clés", "chiffres", (c.chiffres || []).map((e) => `${e.valeur} | ${e.libelle}`).join("\n"), 3, "un par ligne : valeur | libellé")}
      ${zone("Métiers", "metiers", (c.metiers || []).join("\n"), 3, "un par ligne")}
      ${zone("Valeurs", "valeurs", (c.valeurs || []).join("\n"), 3, "une par ligne")}
      <fieldset class="rc-groupe"><legend>La directrice</legend>${champPhoto("Photo (avec son accord)", "directrice", d.photo)}${ligne("Nom", "d_nom", d.nom)}${ligne("Rôle", "d_role", d.role)}${zone("Présentation", "d_texte", d.texte, 3)}</fieldset>`,
    async (v) => {
      const paire = (t) => lignes(t).map((l) => l.split("|").map((x) => x.trim()));
      const cabinet = { logo: v.logo, accroche: v.accroche, annee: v.annee, histoire: v.histoire,
        etapes: paire(v.etapes).map(([a, b]) => ({ annee: b === undefined ? "" : a, texte: b === undefined ? a : b })),
        chiffres: paire(v.chiffres).map(([a, b]) => ({ valeur: a, libelle: b || "" })), metiers: lignes(v.metiers), valeurs: lignes(v.valeurs),
        directrice: { photo: v.directrice, nom: v.d_nom, role: v.d_role, texte: v.d_texte } };
      const j = await appelApi("/api/der/cabinet", "POST", { cabinet }); X.setCabinet(j.cabinet);
    });
  }
  function editerProfil() {
    const p = X.profil() || {};
    dialogue("Mon profil (récit de présentation)", `
      ${champPhoto("Ma photo", "photo", p.photo)}
      ${ligne("Nom affiché", "nom", p.nom || X.contact().nom)}
      ${ligne("Titre", "titre", p.titre, "(ex. Conseiller en gestion de patrimoine)")}
      ${zone("Mon parcours", "parcours", p.parcours, 4)}
      ${zone("Mes spécialités", "specialites", (p.specialites || []).join("\n"), 3, "une par ligne")}`,
    async (v) => { const j = await appelApi("/api/der/profil", "POST", { profil: { ...v, specialites: lignes(v.specialites) } }); X.setProfil(j.profil); });
  }
  // État du récit (écrans remplis) pour le formulaire de préparation.
  function etat() {
    const c = X.cabinet() || {}, p = X.profil() || {}, d = c.directrice || {};
    const cab = [c.accroche, c.annee && c.histoire, (c.chiffres || []).length, d.nom && d.texte, (c.metiers || []).length].filter(Boolean).length;
    const pro = [p.titre, p.parcours, (p.specialites || []).length, p.photo].filter(Boolean).length;
    return { cab, cabTotal: 5, pro, proTotal: 4 };
  }

  window.DerRecit = { init: (ctx) => { X = ctx; }, presenter, editerCabinet, editerProfil, etat };
})();
