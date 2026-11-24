// version 1.0 — éditeur libre des images LinkedIn (image du post et diapositives du carrousel).
// Chaque élément de l'image (textes, traits, encadrés, images collées) se sélectionne, se déplace, s'agrandit,
// se modifie ou se supprime. Le dessin final passe par rendrePage() (visuels-linkedin.js) : l'image téléchargée
// est exactement celle de l'éditeur. Les images collées restent sur l'appareil (jamais envoyées à l'IA ni au site).

const EditeurVisuel = (() => {
  const COULEURS = [["#FFFFFF", "Blanc"], ["rgba(255,255,255,.78)", "Blanc adouci"], ["#D8919C", "Rose poudré"], ["#F27C8A", "Corail"],
                    ["#6E0B1F", "Bordeaux"], ["#1E2230", "Nuit"], ["#5D6577", "Gris"]];
  const FONDS_BOITE = [["", "Aucun"], ["rgba(255,255,255,.07)", "Voile clair"], ["rgba(216,145,156,.16)", "Voile rose"], ["#FFFFFF", "Blanc"],
                       ["#D8919C", "Rose poudré"], ["#6E0B1F", "Bordeaux"], ["#1E2230", "Nuit"]];
  const AIMANT = 10;   // distance (en points de l'image) à partir de laquelle un élément se cale sur un repère
  let S = null, D = null;   // état de la session d'édition, éléments du dialogue
  const $e = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let ctxMesure = null;
  const mesure = () => (ctxMesure ||= document.createElement("canvas").getContext("2d"));

  // ------------------------------------------------------------------ dialogue (créé une seule fois)
  function creer() {
    const st = document.createElement("style");
    st.textContent = `
      .ev { width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: var(--fond); color: var(--texte); }
      .ev[open] { display: flex; flex-direction: column; }
      .ev::backdrop { background: rgba(10,12,20,.55); }
      .ev-tete { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--carte); border-bottom: 1px solid var(--bord); }
      .ev-tete b { font-size: 1.05rem; }
      .ev-tete .ev-aide { color: var(--doux); font-size: .84rem; flex: 1; }
      .ev-tete .ev-actions { display: flex; gap: 8px; margin-left: auto; }
      .ev-outils { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 16px; background: var(--carte); border-bottom: 1px solid var(--bord); }
      .ev-outils button, .ev-props button.ev-b { border: 1px solid var(--bord-fort); background: var(--carte); color: var(--texte); border-radius: 9px; padding: 6px 11px; font: inherit; font-size: .88rem; cursor: pointer; }
      .ev-outils button:hover, .ev-props button.ev-b:hover { border-color: var(--accent); color: var(--accent); }
      .ev-outils button:disabled { opacity: .4; cursor: default; color: var(--texte); border-color: var(--bord-fort); }
      .ev-outils select { border: 1px solid var(--bord-fort); border-radius: 9px; padding: 6px 8px; background: var(--carte); color: var(--texte); font: inherit; font-size: .88rem; }
      .ev-sep { width: 1px; height: 24px; background: var(--bord); margin: 0 4px; }
      .ev-corps { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 300px; }
      .ev-scene { position: relative; min-height: 0; display: grid; place-items: center; padding: 18px; overflow: hidden; }
      .ev-scene.survol { outline: 3px dashed var(--accent); outline-offset: -10px; }
      .ev-plan { position: relative; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
      .ev-plan canvas { display: block; width: 100%; height: 100%; }
      .ev-calque { position: absolute; inset: 0; touch-action: none; cursor: default; outline: none; }
      .ev-outils label.ev-ligne { flex-wrap: nowrap; white-space: nowrap; }
      .ev-cadre { position: absolute; border: 2px solid #4d8dff; box-shadow: 0 0 0 1px rgba(255,255,255,.6); pointer-events: none; }
      .ev-survol { position: absolute; border: 1px dashed rgba(77,141,255,.9); pointer-events: none; }
      .ev-poignee { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; background: #fff; border: 2px solid #4d8dff; border-radius: 4px; pointer-events: auto; }
      .ev-poignee[data-p="nw"], .ev-poignee[data-p="se"] { cursor: nwse-resize; } .ev-poignee[data-p="ne"], .ev-poignee[data-p="sw"] { cursor: nesw-resize; }
      .ev-poignee[data-p="e"], .ev-poignee[data-p="w"] { cursor: ew-resize; border-radius: 7px; } .ev-poignee[data-p="n"], .ev-poignee[data-p="s"] { cursor: ns-resize; border-radius: 7px; }
      .ev-guide { position: absolute; background: #ff3d8b; pointer-events: none; }
      .ev-saisie { position: absolute; margin: 0; padding: 0; border: 0; outline: 2px solid #4d8dff; background: rgba(0,0,0,.08); resize: none; overflow: hidden; white-space: pre-wrap; }
      .ev-props { border-left: 1px solid var(--bord); background: var(--carte); padding: 14px 16px; overflow-y: auto; display: grid; gap: 14px; align-content: start; }
      .ev-props h3 { margin: 0; font-size: 1rem; }
      .ev-props .ev-lib { font-size: .8rem; color: var(--doux); font-weight: 600; display: block; margin-bottom: 6px; }
      .ev-props textarea { width: 100%; min-height: 80px; border: 1px solid var(--bord-fort); border-radius: 10px; padding: 8px 10px; font: inherit; background: var(--carte); color: var(--texte); }
      .ev-ligne { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
      .ev-ligne input[type=range] { flex: 1; min-width: 100px; }
      .ev-ligne output { min-width: 42px; text-align: right; font-variant-numeric: tabular-nums; font-size: .88rem; }
      .ev-pastille { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--bord-fort); cursor: pointer; padding: 0; background-clip: padding-box; }
      .ev-pastille[aria-pressed="true"] { outline: 3px solid var(--accent); outline-offset: 2px; }
      .ev-pastille.vide { background: repeating-linear-gradient(45deg, #fff 0 4px, #e3e3e3 4px 8px); }
      .ev-b[aria-pressed="true"] { background: var(--accent-doux) !important; border-color: var(--accent) !important; color: var(--accent) !important; }
      .ev-danger { color: #b3261e !important; }
      .ev-calques { display: grid; gap: 4px; }
      .ev-calques button { text-align: left; border: 1px solid var(--bord); background: var(--carte); color: var(--texte); border-radius: 8px; padding: 6px 9px; font: inherit; font-size: .84rem; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .ev-calques button:hover { border-color: var(--accent); }
      .ev-droits { margin: 0; padding: 8px 16px; font-size: .8rem; color: var(--doux); background: var(--carte); border-top: 1px solid var(--bord); }
      @media (max-width: 860px) {
        .ev-corps { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }
        .ev-scene { padding: 10px; }
        .ev-props { border-left: 0; border-top: 1px solid var(--bord); max-height: 34dvh; padding: 10px 14px; }
        .ev-tete { padding: 8px 12px; } .ev-tete b { font-size: .95rem; line-height: 1.2; }
        .ev-outils { padding: 6px 12px; }
        .ev-droits { font-size: .72rem; padding: 5px 12px; } .ev-long { display: none; }
        .ev-props { max-height: 30dvh; }
        .ev-tete .ev-aide { display: none; }
        .ev-outils { overflow-x: auto; flex-wrap: nowrap; }
        .ev-outils button, .ev-outils select { flex: 0 0 auto; }
      }`;
    document.head.appendChild(st);
    const d = document.createElement("dialog");
    d.className = "ev"; d.id = "ev"; d.setAttribute("aria-label", "Modifier l'image");
    d.innerHTML = `
      <div class="ev-tete"><b id="ev-titre">Modifier l'image</b>
        <span class="ev-aide">Glissez pour déplacer · poignées pour agrandir · double-clic pour écrire · Suppr pour effacer · Ctrl+Z pour annuler</span>
        <div class="ev-actions"><button type="button" class="bouton bouton-discret" id="ev-fermer">Annuler</button><button type="button" class="bouton" id="ev-ok">Terminer</button></div></div>
      <div class="ev-outils" role="toolbar" aria-label="Outils">
        <button type="button" data-a="texte">＋ Texte</button><button type="button" data-a="image">＋ Image</button>
        <button type="button" data-a="boite">＋ Encadré</button><button type="button" data-a="ligne">＋ Trait</button>
        <span class="ev-sep"></span>
        <button type="button" data-a="annuler" title="Annuler (Ctrl+Z)" aria-label="Annuler">↶ Annuler</button>
        <button type="button" data-a="retablir" title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷ Rétablir</button>
        <span class="ev-sep"></span>
        <label class="ev-ligne">Fond <select id="ev-fond">${Object.entries(FONDS).map(([k, f]) => `<option value="${k}">${f.nom}</option>`).join("")}</select></label>
        <button type="button" data-a="modele">Revenir au modèle</button>
        <input type="file" id="ev-fichier" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
      </div>
      <div class="ev-corps">
        <div class="ev-scene" id="ev-scene"><div class="ev-plan" id="ev-plan"><canvas id="ev-canvas" aria-label="Aperçu de l'image"></canvas><div class="ev-calque" id="ev-calque" tabindex="-1"></div></div></div>
        <aside class="ev-props" id="ev-props" aria-label="Réglages de l'élément"></aside>
      </div>
      <p class="ev-droits"><span class="ev-long">Collez une image (Ctrl+V), glissez-la sur l'aperçu ou utilisez « ＋ Image ». </span>N'utilisez que des images dont vous avez les droits, sans logo d'une autre marque. Les images ajoutées restent sur cet appareil.</p>`;
    document.body.appendChild(d);
    D = { d, canvas: $e("ev-canvas"), calque: $e("ev-calque"), plan: $e("ev-plan"), scene: $e("ev-scene"), props: $e("ev-props"), fond: $e("ev-fond"), fichier: $e("ev-fichier") };
    // Échap désélectionne au lieu de fermer (évite de perdre les modifications).
    d.addEventListener("cancel", (e) => { e.preventDefault(); if (S?.saisie) finirSaisie(); else selectionner(null); });
    $e("ev-fermer").onclick = () => { if (!S) return; if (modifie() && !confirm("Abandonner les modifications de l'image ?")) return; fermer(); };
    $e("ev-ok").onclick = terminer;
    d.querySelector(".ev-outils").addEventListener("click", (e) => { const b = e.target.closest("[data-a]"); if (b) action(b.dataset.a); });
    D.fond.onchange = () => { S.page.fond = D.fond.value; rendre(); valider(); };
    D.fichier.onchange = () => { const f = D.fichier.files[0]; D.fichier.value = ""; if (f) ajouterImage(f); };
    D.calque.addEventListener("pointerdown", appui);
    D.calque.addEventListener("pointermove", (e) => { if (!S?.geste) survoler(e); });
    D.calque.addEventListener("dblclick", (e) => { const el = texteSous(e); if (el) commencerSaisie(el); });
    // Écoutés sur toute la page : le focus peut sortir du dialogue quand un bouton du panneau est redessiné.
    document.addEventListener("keydown", (e) => { if (S && D.d.open) clavier(e); });
    document.addEventListener("paste", (e) => { if (S && D.d.open) coller(e); });
    D.scene.addEventListener("dragover", (e) => { if ([...(e.dataTransfer?.items || [])].some((i) => i.kind === "file")) { e.preventDefault(); D.scene.classList.add("survol"); } });
    D.scene.addEventListener("dragleave", () => D.scene.classList.remove("survol"));
    D.scene.addEventListener("drop", (e) => { e.preventDefault(); D.scene.classList.remove("survol"); const f = [...(e.dataTransfer?.files || [])].find((x) => /^image\//.test(x.type)); if (f) ajouterImage(f); });
    new ResizeObserver(() => S && ajuster()).observe(D.scene);
  }

  // ------------------------------------------------------------------ ouverture, fermeture, historique
  async function ouvrir(opts) {
    if (!D) creer();
    S = { opts, page: copiePage(opts.page), sel: null, hist: [], futur: [], geste: null, saisie: null, echelle: 1, tape: 0 };
    S.initial = S.dernier = JSON.stringify(S.page);
    $e("ev-titre").textContent = opts.titre || "Modifier l'image";
    D.fond.value = S.page.fond || "bordeaux";
    D.d.showModal();
    await rendrePage(S.page, { canvas: D.canvas, brouillon: true });   // charge les polices et les images
    ajuster(); rendre(); afficherProps(); boutons();
  }
  const modifie = () => S && JSON.stringify(S.page) !== S.initial;
  function fermer() { if (S?.saisie) S.saisie.remove(); S = null; D.d.close(); }
  function terminer() {
    if (!S) return;
    if (S.saisie) finirSaisie();
    const page = S.page, opts = S.opts, change = modifie();
    fermer();
    if (change) opts.auTerminer?.(page);
  }
  // Enregistre l'état courant dans l'historique s'il a changé depuis la dernière validation.
  function valider() {
    const j = JSON.stringify(S.page);
    if (j === S.dernier) return;
    S.hist.push(S.dernier); if (S.hist.length > 80) S.hist.shift();
    S.futur = []; S.dernier = j; boutons();
  }
  function revenir(dans, vers) {
    if (!dans.length) return;
    vers.push(JSON.stringify(S.page)); S.page = JSON.parse(dans.pop()); S.dernier = JSON.stringify(S.page);
    if (S.sel && !elt(S.sel)) S.sel = null;
    D.fond.value = S.page.fond || "bordeaux"; rendre(); afficherProps(); boutons();
  }
  function boutons() {
    D.d.querySelector('[data-a="annuler"]').disabled = !S.hist.length;
    D.d.querySelector('[data-a="retablir"]').disabled = !S.futur.length;
  }

  // ------------------------------------------------------------------ dessin et calque de sélection
  function ajuster() {
    const r = D.scene.getBoundingClientRect(), pad = window.innerWidth <= 860 ? 20 : 36;
    const s = Math.max(.1, Math.min((r.width - pad) / S.page.l, (r.height - pad) / S.page.h));
    S.echelle = s; D.plan.style.width = S.page.l * s + "px"; D.plan.style.height = S.page.h * s + "px";
    calque();
  }
  function rendre() {
    const c = D.canvas, ctx = c.getContext("2d");
    if (c.width !== S.page.l) { c.width = S.page.l; c.height = S.page.h; }
    dessinerFond(ctx, S.page.fond, c.width, c.height);
    for (const el of S.page.elements) if (!el.masque && el.id !== S.saisie?.dataset.id) dessinerElement(ctx, el, { brouillon: true });
    calque();
  }
  const elt = (id) => S.page.elements.find((e) => e.id === id);
  function boiteDe(el) { return { x: el.x, y: el.y, w: el.w, h: hauteurElement(mesure(), el) }; }
  // Zone cliquable : un trait fin reçoit une marge pour être facile à attraper.
  function zoneDe(el) { const b = boiteDe(el), m = 14; return { x: b.x - (b.w < 2 * m ? m : 0), y: b.y - (b.h < 2 * m ? m : 0), w: Math.max(b.w, 2 * m), h: Math.max(b.h, 2 * m) }; }
  function calque(guides = []) {
    if (!S) return;
    const s = S.echelle, el = S.sel && elt(S.sel);
    let h = "";
    if (S.survol && S.survol !== S.sel && elt(S.survol)) { const b = zoneDe(elt(S.survol)); h += `<div class="ev-survol" style="left:${b.x * s}px;top:${b.y * s}px;width:${b.w * s}px;height:${b.h * s}px"></div>`; }
    if (el) {
      const b = zoneDe(el), p = poignees(el);
      h += `<div class="ev-cadre" style="left:${b.x * s - 1}px;top:${b.y * s - 1}px;width:${b.w * s + 2}px;height:${b.h * s + 2}px"></div>`;
      const pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
      for (const k of p) h += `<span class="ev-poignee" data-p="${k}" style="left:${(b.x + pos[k][0] * b.w) * s}px;top:${(b.y + pos[k][1] * b.h) * s}px"></span>`;
    }
    for (const g of guides) h += g.x != null ? `<div class="ev-guide" style="left:${g.x * s}px;top:0;width:1px;height:100%"></div>` : `<div class="ev-guide" style="top:${g.y * s}px;left:0;height:1px;width:100%"></div>`;
    if (h !== S.calqueHtml) { D.calque.innerHTML = h; S.calqueHtml = h; }   // inchangé : on garde les mêmes nœuds (double-clic fiable)
  }
  function poignees(el) {
    if (S.saisie) return [];
    if (el.type === "texte") return ["nw", "ne", "sw", "se", "e", "w"];
    if (el.type === "ligne") return el.w >= el.h ? ["w", "e"] : ["n", "s"];
    return ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  }
  function point(e) { const r = D.plan.getBoundingClientRect(); return { x: (e.clientX - r.left) / S.echelle, y: (e.clientY - r.top) / S.echelle }; }
  function toucher(e, type = null) {
    const p = point(e);
    for (let i = S.page.elements.length - 1; i >= 0; i--) {
      const el = S.page.elements[i]; if (el.masque || (type && el.type !== type)) continue;
      const b = zoneDe(el); if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return el;
    }
    return null;
  }
  // Texte à réécrire sous le pointeur : le texte sélectionné d'abord, sinon le plus en avant.
  function texteSous(e) {
    const p = point(e), a = S.sel && elt(S.sel);
    if (a?.type === "texte") { const z = zoneDe(a); if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) return a; }
    return toucher(e, "texte");
  }
  function survoler(e) { const el = toucher(e); const id = el?.id || null; if (id !== S.survol) { S.survol = id; calque(); } D.calque.style.cursor = el ? "move" : "default"; }
  function selectionner(id) { if (!S) return; S.sel = id; calque(); afficherProps(); }

  // ------------------------------------------------------------------ gestes : déplacer, redimensionner
  function appui(e) {
    if (!S || e.button > 0) return;
    if (S.saisie) finirSaisie();
    D.calque.focus({ preventScroll: true });
    const p = point(e), poignee = e.target.closest(".ev-poignee");
    if (poignee && S.sel) {
      const el = elt(S.sel);
      S.geste = { type: "taille", p: poignee.dataset.p, depart: p, el0: { ...el, h: boiteDe(el).h } };
    } else {
      // L'élément déjà sélectionné reste choisi si l'on clique dedans, même si un autre passe devant.
      const actuel = S.sel && elt(S.sel), z = actuel && zoneDe(actuel);
      const el = z && p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h ? actuel : toucher(e);
      if (!el) { selectionner(null); return; }
      // double appui au doigt = écrire
      const maint = Date.now();
      if (e.pointerType === "touch" && maint - S.tape < 350) { const t = texteSous(e); if (t) { S.tape = 0; commencerSaisie(t); return; } }
      S.tape = maint;
      if (S.sel !== el.id) selectionner(el.id);
      S.geste = { type: "deplacer", depart: p, el0: { ...el, h: boiteDe(el).h } };
    }
    D.calque.setPointerCapture(e.pointerId);
    const bouger = (ev) => geste(ev), lacher = () => {
      D.calque.removeEventListener("pointermove", bouger); D.calque.removeEventListener("pointerup", lacher); D.calque.removeEventListener("pointercancel", lacher);
      S.geste = null; calque(); valider(); afficherProps();
    };
    D.calque.addEventListener("pointermove", bouger); D.calque.addEventListener("pointerup", lacher); D.calque.addEventListener("pointercancel", lacher);
    e.preventDefault();
  }
  // Repères : bords et centre de l'image, marges, et bords/centres des autres éléments.
  function reperes(sauf) {
    const xs = [0, M, S.page.l / 2, S.page.l - M, S.page.l], ys = [0, M, S.page.h / 2, S.page.h - M, S.page.h];
    for (const o of S.page.elements) if (o.id !== sauf && !o.masque) { const b = boiteDe(o); xs.push(b.x, b.x + b.w / 2, b.x + b.w); ys.push(b.y, b.y + b.h / 2, b.y + b.h); }
    return { xs, ys };
  }
  function caler(valeurs, cibles) {   // meilleur décalage pour aligner l'une des valeurs sur un repère
    let best = null;
    for (const v of valeurs) for (const c of cibles) { const d = c - v; if (Math.abs(d) <= AIMANT && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, c }; }
    return best;
  }
  function geste(e) {
    const g = S.geste; if (!g) return;
    const el = elt(S.sel); if (!el) return;
    const p = point(e), dx = p.x - g.depart.x, dy = p.y - g.depart.y, o = g.el0, guides = [];
    if (g.type === "deplacer") {
      let x = o.x + dx, y = o.y + dy;
      if (!e.shiftKey) {
        const r = reperes(el.id), cx = caler([x, x + o.w / 2, x + o.w], r.xs), cy = caler([y, y + o.h / 2, y + o.h], r.ys);
        if (cx) { x += cx.d; guides.push({ x: cx.c }); }
        if (cy) { y += cy.d; guides.push({ y: cy.c }); }
      }
      el.x = Math.round(x); el.y = Math.round(y);
    } else {
      const k = g.p, gauche = k.includes("w"), haut = k.includes("n");
      if (el.type === "texte") {
        if (k === "e" || k === "w") {   // largeur seule : le texte passe à la ligne autrement
          const w = Math.max(40, o.w + (gauche ? -dx : dx));
          el.w = Math.round(w); if (gauche) el.x = Math.round(o.x + o.w - w);
        } else {   // coin : agrandit le texte proportionnellement
          const f = Math.max(.15, (o.w + (gauche ? -dx : dx)) / o.w);
          el.taille = Math.max(8, Math.round(o.taille * f * 10) / 10); el.w = Math.round(o.w * f);
          if (o.ecart) el.ecart = Math.round(o.ecart * f * 10) / 10;
          if (gauche) el.x = Math.round(o.x + o.w - el.w);
          if (haut) el.y = Math.round(o.y + o.h - hauteurElement(mesure(), el));
        }
      } else {
        let w = o.w, h = o.h;
        if (k.includes("e")) w = o.w + dx; if (gauche) w = o.w - dx;
        if (k.includes("s")) h = o.h + dy; if (haut) h = o.h - dy;
        if (el.type === "ligne") { if (o.w >= o.h) h = o.h; else w = o.w; }
        // image : les coins gardent les proportions (Maj pour déformer)
        if ((el.type === "image" || el.type === "disque") && k.length === 2 && !e.shiftKey) { const f = Math.max(w / o.w, h / o.h); w = o.w * f; h = o.h * f; }
        w = Math.max(el.type === "ligne" && o.w < o.h ? o.w : 12, w); h = Math.max(el.type === "ligne" && o.w >= o.h ? o.h : 12, h);
        el.w = Math.round(w); el.h = Math.round(h);
        if (gauche) el.x = Math.round(o.x + o.w - w); if (haut) el.y = Math.round(o.y + o.h - h);
      }
    }
    rendre(); calque(guides);
  }

  // ------------------------------------------------------------------ écrire directement sur l'image
  function commencerSaisie(el) {
    if (S.saisie) finirSaisie();
    selectionner(el.id);
    const s = S.echelle, t = document.createElement("textarea");
    t.className = "ev-saisie"; t.dataset.id = el.id; t.value = el.texte; t.setAttribute("aria-label", "Texte de l'élément");
    const police = (el.police || "").replace(/"/g, "'");
    Object.assign(t.style, { left: el.x * s + "px", top: el.y * s + "px", width: el.w * s + "px", font: `${el.poids || 400} ${el.taille * s}px ${police}`,
      lineHeight: el.taille * (el.interligne || 1.25) * s + "px", color: el.couleur || "#fff", textAlign: el.aligne || "left",
      textTransform: el.maj ? "uppercase" : "none", letterSpacing: (el.ecart || 0) * s + "px" });
    const hauteur = () => { t.style.height = "0px"; t.style.height = t.scrollHeight + "px"; };
    t.oninput = () => { el.texte = t.value; hauteur(); };
    t.onkeydown = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finirSaisie(); } };
    t.onblur = () => setTimeout(() => S?.saisie === t && finirSaisie(), 0);
    D.plan.appendChild(t); S.saisie = t; rendre(); hauteur(); t.focus(); t.select();
  }
  function finirSaisie() {
    const t = S.saisie; if (!t) return;
    const el = elt(t.dataset.id); S.saisie = null; t.remove();
    if (el) {
      if (!el.texte.trim()) S.page.elements = S.page.elements.filter((x) => x !== el);
      else if (el.role && /^(sig\.|source$|pagination$)/.test(el.role)) delete el.role;   // devient un texte libre
    }
    rendre(); valider(); afficherProps();
  }

  // ------------------------------------------------------------------ actions
  function couleurTexteParDefaut() { return ["blanc", "rose"].includes(S.page.fond) ? "#1E2230" : "#FFFFFF"; }
  function ajouter(el, { derriere = false } = {}) {
    el.id = nouvelId();
    if (derriere) S.page.elements.unshift(el); else S.page.elements.push(el);
    selectionner(el.id); rendre(); valider();
    return el;
  }
  function action(a) {
    if (!S) return;
    if (S.saisie) finirSaisie();
    const l = S.page.l, h = S.page.h;
    if (a === "texte") { const el = ajouter({ type: "texte", x: M, y: Math.round(h / 2 - 40), w: l - 2 * M, texte: "Votre texte", taille: 52, poids: 600, police: CHARTE.titre, couleur: couleurTexteParDefaut(), interligne: 1.2, aligne: "left" }); commencerSaisie(el); }
    else if (a === "image") D.fichier.click();
    else if (a === "boite") ajouter({ type: "boite", x: M, y: Math.round(h / 2 - 150), w: l - 2 * M, h: 300, r: 28, fond: "rgba(255,255,255,.07)", bord: "#D8919C", ep: 3 }, { derriere: true });
    else if (a === "ligne") ajouter({ type: "ligne", x: M, y: Math.round(h / 2), w: 300, h: 0, couleur: "#D8919C", ep: 6 });
    else if (a === "annuler") revenir(S.hist, S.futur);
    else if (a === "retablir") revenir(S.futur, S.hist);
    else if (a === "modele") {
      if (!S.opts.modele) return;
      if (!confirm("Revenir à la mise en page du modèle ? Vos déplacements, ajouts et suppressions seront effacés (Ctrl+Z pour revenir).")) return;
      Promise.resolve(S.opts.modele()).then((p) => { S.page = copiePage(p); S.sel = null; D.fond.value = S.page.fond || "bordeaux"; rendrePage(S.page, { canvas: D.canvas, brouillon: true }).then(() => { rendre(); afficherProps(); valider(); }); });
    }
  }
  function modifierSel(f, { valide = true } = {}) { const el = S.sel && elt(S.sel); if (!el) return; f(el); rendre(); if (valide) valider(); }
  function supprimer() { if (!S.sel) return; S.page.elements = S.page.elements.filter((e) => e.id !== S.sel); S.sel = null; rendre(); valider(); afficherProps(); }
  function dupliquer() { const el = S.sel && elt(S.sel); if (!el) return; const c = { ...el, x: el.x + 30, y: el.y + 30 }; delete c.role; delete c.lie; ajouter(c); }
  function plan(devant) {
    const i = S.page.elements.findIndex((e) => e.id === S.sel); if (i < 0) return;
    const [el] = S.page.elements.splice(i, 1); if (devant) S.page.elements.push(el); else S.page.elements.unshift(el);
    rendre(); valider();
  }
  function clavier(e) {
    if (!S) return;
    const tag = e.target.tagName, champ = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === "z" && !champ) { e.preventDefault(); action(e.shiftKey ? "retablir" : "annuler"); return; }
    if (ctrl && e.key.toLowerCase() === "y" && !champ) { e.preventDefault(); action("retablir"); return; }
    if (champ) return;
    if (ctrl && e.key.toLowerCase() === "d") { e.preventDefault(); dupliquer(); return; }
    if (!S.sel) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); supprimer(); return; }
    if (e.key === "Enter") { const el = elt(S.sel); if (el?.type === "texte") { e.preventDefault(); commencerSaisie(el); } return; }
    const pas = e.shiftKey ? 10 : 1, dep = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }[e.key];
    if (dep) { e.preventDefault(); modifierSel((el) => { el.x += dep[0]; el.y += dep[1]; }); }
  }
  // Coller : une image devient un élément image, un texte devient un bloc de texte.
  function coller(e) {
    if (!S) return;
    const tag = e.target.tagName; if (tag === "TEXTAREA" || tag === "INPUT") return;
    const items = [...(e.clipboardData?.items || [])], img = items.find((i) => i.kind === "file" && /^image\//.test(i.type));
    if (img) { e.preventDefault(); ajouterImage(img.getAsFile()); return; }
    const t = e.clipboardData?.getData("text/plain")?.trim();
    if (t) { e.preventDefault(); ajouter({ type: "texte", x: M, y: Math.round(S.page.h / 2 - 40), w: S.page.l - 2 * M, texte: t.slice(0, 600), taille: 44, poids: 400, police: CHARTE.texte, couleur: couleurTexteParDefaut(), interligne: 1.25, aligne: "left" }); }
  }
  // Image ajoutée : réduite (1200 px au plus), gardée sur l'appareil, posée au centre.
  function ajouterImage(f) {
    if (!f || !/^image\//.test(f.type)) return notif("Ce fichier n'est pas une image.", true);
    if (f.size > 15e6) return notif("Image trop lourde (15 Mo au plus).", true);
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new Image();
      img.onload = () => {
        const f2 = Math.min(1, 1200 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * f2)); c.height = Math.max(1, Math.round(img.height * f2));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        let url = f.type === "image/png" ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", .88);
        if (url.length > 1.4e6) url = c.toDataURL("image/jpeg", .82);
        const ref = "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        let garde = true; try { localStorage.setItem("lp-img:" + ref, url); } catch { garde = false; }
        const fin = new Image();
        fin.onload = () => {
          IMAGES_CHARGEES.set(ref, fin);
          const max = S.page.l - 2 * M, k = Math.min(1, max / c.width, (S.page.h * .5) / c.height), w = Math.round(c.width * k), h = Math.round(c.height * k);
          ajouter({ type: "image", ref, x: Math.round((S.page.l - w) / 2), y: Math.round((S.page.h - h) / 2), w, h, r: 0 });
          if (!garde) notif("Image ajoutée, mais la mémoire de cet appareil est pleine : elle ne sera pas gardée après fermeture de la page.", true);
        };
        fin.src = url;
      };
      img.onerror = () => notif("Cette image n'a pas pu être lue.", true);
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(f);
  }
  function notif(m, ko) { if (typeof notifier === "function") notifier(m, ko); else alert(m); }

  // ------------------------------------------------------------------ panneau de réglages
  const pastilles = (liste, actuelle, attr) => `<div class="ev-ligne">${liste.map(([c, n]) => `<button type="button" class="ev-pastille${c ? "" : " vide"}" ${attr}="${esc(c)}" title="${esc(n)}" aria-label="${esc(n)}" aria-pressed="${(actuelle || "") === c}" style="${c ? `background:${c}` : ""}"></button>`).join("")}</div>`;
  const curseur = (id, lib, min, max, val, pas = 1, unite = "") => `<div><label class="ev-lib" for="${id}">${lib}</label><div class="ev-ligne"><input type="range" id="${id}" min="${min}" max="${max}" step="${pas}" value="${val}"><output id="${id}-v">${val}${unite}</output></div></div>`;
  function nomElement(el) {
    if (el.type === "texte") return "Texte · " + String(el.texte).replace(/\s+/g, " ").slice(0, 34);
    return { ligne: "Trait", boite: "Encadré", disque: "Rond", croix: "Croix", image: "Image" }[el.type] || el.type;
  }
  function afficherProps() {
    if (!S) return;
    const el = S.sel && elt(S.sel), P = D.props;
    if (!el) {
      P.innerHTML = `<h3>Éléments de l'image</h3><p class="doux petit" style="margin:0">Cliquez sur un élément de l'image (ou ci-dessous) pour le modifier. Du premier plan à l'arrière-plan :</p>
        <div class="ev-calques">${[...S.page.elements].reverse().map((e) => `<button type="button" data-choisir="${e.id}">${esc(nomElement(e))}</button>`).join("")}</div>`;
      P.querySelectorAll("[data-choisir]").forEach((b) => b.onclick = () => selectionner(b.dataset.choisir));
      return;
    }
    let h = `<h3>${esc({ texte: "Texte", ligne: "Trait", boite: "Encadré", disque: "Rond", croix: "Croix", image: "Image" }[el.type])}</h3>`;
    if (el.type === "texte") {
      h += `<div><label class="ev-lib" for="ev-texte">Texte</label><textarea id="ev-texte">${esc(el.texte)}</textarea></div>
        <div><span class="ev-lib">Taille du texte</span><div class="ev-ligne"><button type="button" class="ev-b" data-t="-">A−</button><input type="range" id="ev-taille" min="10" max="300" value="${Math.round(el.taille)}" aria-label="Taille du texte"><output id="ev-taille-v">${Math.round(el.taille)}</output><button type="button" class="ev-b" data-t="+">A+</button></div></div>
        <div><span class="ev-lib">Style</span><div class="ev-ligne">
          <button type="button" class="ev-b" data-police="titre" aria-pressed="${el.police === CHARTE.titre}">Titre</button><button type="button" class="ev-b" data-police="texte" aria-pressed="${el.police !== CHARTE.titre}">Texte</button>
          <button type="button" class="ev-b" data-gras aria-pressed="${(el.poids || 400) >= 600}"><b>Gras</b></button>
          <button type="button" class="ev-b" data-maj aria-pressed="${!!el.maj}">E S P A C É</button></div></div>
        <div><span class="ev-lib">Alignement</span><div class="ev-ligne">${[["left", "Gauche"], ["center", "Centre"], ["right", "Droite"]].map(([k, n]) => `<button type="button" class="ev-b" data-aligne="${k}" aria-pressed="${(el.aligne || "left") === k}">${n}</button>`).join("")}</div></div>
        <div><span class="ev-lib">Couleur</span>${pastilles(COULEURS, el.couleur, "data-couleur")}</div>`;
    } else if (el.type === "boite") {
      h += `<div><span class="ev-lib">Fond</span>${pastilles(FONDS_BOITE, el.fond, "data-fondb")}</div>
        <div><span class="ev-lib">Bordure</span>${pastilles([["", "Aucune"], ...COULEURS], el.ep ? el.bord : "", "data-bord")}</div>
        ${curseur("ev-arrondi", "Coins arrondis", 0, 200, el.r || 0)}`;
    } else if (el.type === "image") {
      h += curseur("ev-arrondi", "Coins arrondis", 0, 300, el.r || 0) + `<p class="doux petit" style="margin:0">Coins : agrandir en gardant les proportions (Maj pour déformer).</p>`;
    } else if (el.type === "ligne") {
      h += `<div><span class="ev-lib">Couleur</span>${pastilles(COULEURS, el.couleur, "data-couleur")}</div>${curseur("ev-ep", "Épaisseur", 1, 30, el.ep || 2)}`;
    } else {
      h += `<div><span class="ev-lib">Couleur</span>${pastilles(COULEURS, el.couleur, "data-couleur")}</div>`;
    }
    h += curseur("ev-opacite", "Opacité", 10, 100, Math.round((el.opacite ?? 1) * 100), 5, " %");
    h += `<div><span class="ev-lib">Disposition</span><div class="ev-ligne"><button type="button" class="ev-b" data-plan="1">Au premier plan</button><button type="button" class="ev-b" data-plan="0">À l'arrière-plan</button>
      <button type="button" class="ev-b" data-dup>Dupliquer</button><button type="button" class="ev-b ev-danger" data-suppr>Supprimer</button></div></div>
      <button type="button" class="lien-bouton" data-aucun style="justify-self:start">← Tous les éléments</button>`;
    P.innerHTML = h;
    const q = (s) => P.querySelector(s);
    if (q("#ev-texte")) { q("#ev-texte").oninput = (e) => modifierSel((x) => { x.texte = e.target.value; }, { valide: false }); q("#ev-texte").onchange = () => { modifierSel((x) => { if (x.role && /^(sig\.|source$|pagination$)/.test(x.role)) delete x.role; }); }; }
    const taille = (v) => modifierSel((x) => { const f = v / x.taille; x.taille = v; x.w = Math.round(Math.max(40, x.w * f)); if (x.ecart) x.ecart = Math.round(x.ecart * f * 10) / 10; }, { valide: false });
    if (q("#ev-taille")) { q("#ev-taille").oninput = (e) => { taille(+e.target.value); q("#ev-taille-v").textContent = e.target.value; }; q("#ev-taille").onchange = valider; }
    P.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => { const x = elt(S.sel); const v = Math.max(8, Math.round(x.taille * (b.dataset.t === "+" ? 1.1 : 1 / 1.1))); taille(v); valider(); afficherProps(); });
    P.querySelectorAll("[data-police]").forEach((b) => b.onclick = () => { modifierSel((x) => { x.police = b.dataset.police === "titre" ? CHARTE.titre : CHARTE.texte; }); afficherProps(); });
    if (q("[data-gras]")) q("[data-gras]").onclick = () => { modifierSel((x) => { x.poids = (x.poids || 400) >= 600 ? 400 : (x.police === CHARTE.titre ? 600 : 700); }); afficherProps(); };
    if (q("[data-maj]")) q("[data-maj]").onclick = () => { modifierSel((x) => { x.maj = !x.maj; x.ecart = x.maj ? Math.max(2, Math.round(x.taille * .25)) : 0; }); afficherProps(); };
    P.querySelectorAll("[data-aligne]").forEach((b) => b.onclick = () => { modifierSel((x) => { x.aligne = b.dataset.aligne; }); afficherProps(); });
    P.querySelectorAll("[data-couleur]").forEach((b) => b.onclick = () => { modifierSel((x) => { x.couleur = b.dataset.couleur; }); afficherProps(); });
    P.querySelectorAll("[data-fondb]").forEach((b) => b.onclick = () => { modifierSel((x) => { x.fond = b.dataset.fondb || null; }); afficherProps(); });
    P.querySelectorAll("[data-bord]").forEach((b) => b.onclick = () => { modifierSel((x) => { if (b.dataset.bord) { x.bord = b.dataset.bord; x.ep = x.ep || 3; } else x.ep = 0; }); afficherProps(); });
    const lier = (id, f) => { const r = q("#" + id); if (!r) return; r.oninput = () => { modifierSel((x) => f(x, +r.value), { valide: false }); q("#" + id + "-v").textContent = r.value + (id === "ev-opacite" ? " %" : ""); }; r.onchange = valider; };
    lier("ev-arrondi", (x, v) => { x.r = v; }); lier("ev-ep", (x, v) => { x.ep = v; }); lier("ev-opacite", (x, v) => { x.opacite = v / 100; });
    P.querySelectorAll("[data-plan]").forEach((b) => b.onclick = () => plan(b.dataset.plan === "1"));
    q("[data-dup]").onclick = dupliquer; q("[data-suppr]").onclick = supprimer; q("[data-aucun]").onclick = () => selectionner(null);
  }

  return { ouvrir };
})();
