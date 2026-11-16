// Apprendre › Vidéos : une vidéo de cours par fiche (fabriquée la nuit à partir de la fiche vérifiée).
// CoursVideos.vue(conteneur) : la liste par parcours ; CoursVideos.blocFiche(conteneur, fiche) : le bloc dans une fiche ;
// CoursVideos.ouvrir(id) : le lecteur avec ses chapitres. « Vu » est gardé dans ce navigateur.
(function () {
  const CLE_VUS = "cours_vus";
  const vus = () => { try { return JSON.parse(localStorage.getItem(CLE_VUS) || "{}"); } catch { return {}; } };
  const marquerVu = (id) => { try { const v = vus(); v[id] = Date.now(); localStorage.setItem(CLE_VUS, JSON.stringify(v)); } catch {} };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const duree = (s) => (s >= 60 ? `${Math.floor(s / 60)} min${s % 60 >= 10 ? " " + String(Math.round(s % 60)).padStart(2, "0") : ""}` : `${Math.round(s)} s`);
  let etat = null;
  // Date de vérification réelle (la version approfondie de la fiche peut la remplacer).
  const verifie = (f) => (typeof APPROFONDI !== "undefined" && APPROFONDI[f.id]?.verifie) || f.verifie;
  const approfondi = () => (typeof APPROFONDI !== "undefined" ? Promise.resolve() : new Promise((ok) => {
    const s = document.createElement("script"); s.src = "/fiches-approfondies.js"; s.onload = ok; s.onerror = ok; document.head.appendChild(s);
  }));
  const charger = async (force) => (etat && !force ? etat : (etat = await appelApi("/api/cours")));

  // Ordre de fabrication, le même que celui du robot : à refaire, puis priorités, puis les autres fiches.
  function file(e) {
    const ordre = [], ajouter = (id) => { if (FICHES.some((f) => f.id === id) && !ordre.includes(id)) ordre.push(id); };
    e.refaire.forEach(ajouter); e.priorite.forEach((id) => { if (!e.videos[id]) ajouter(id); });
    FICHES.forEach((f) => { const v = e.videos[f.id]; if (!v || v.verifie !== verifie(f)) ajouter(f.id); });
    return ordre;
  }

  const style = document.createElement("style");
  style.textContent = `
    .cv-grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
    .cv-carte { position: relative; width: 100%; display: flex; flex-direction: column; gap: 8px; background: none; border: 0; padding: 0; text-align: left; color: inherit; font: inherit; cursor: pointer; }
    .cv-carte[disabled] { cursor: default; }
    .cv-image { position: relative; aspect-ratio: 9 / 16; border-radius: 16px; overflow: hidden; background: var(--fond); border: 1px solid var(--bord); transition: transform .2s ease, box-shadow .2s ease; }
    .cv-carte:not([disabled]):hover .cv-image, .cv-carte:focus-visible .cv-image { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(20, 24, 60, .2); }
    .cv-image img, .cv-image .couverture { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .cv-image .couverture { filter: saturate(.55) brightness(.75); }
    .cv-lecture { position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 50%; background: rgba(255, 255, 255, .94); display: grid; place-items: center; box-shadow: 0 6px 18px rgba(0, 0, 0, .3); }
    .cv-lecture::after { content: ""; margin-left: 5px; border-left: 18px solid #1b1f3b; border-top: 11px solid transparent; border-bottom: 11px solid transparent; }
    .cv-pastille { position: absolute; padding: 4px 9px; border-radius: 999px; font-size: .74rem; font-weight: 700; background: rgba(255, 255, 255, .94); color: #1b1f3b; }
    .cv-pastille.haut { top: 10px; left: 10px; } .cv-pastille.bas { bottom: 10px; right: 10px; background: rgba(10, 12, 30, .78); color: #fff; }
    .cv-pastille.vu { background: var(--ok); color: #fff; }
    .cv-prepa { position: absolute; inset: auto 10px 12px; color: #fff; font-size: .82rem; line-height: 1.35; text-shadow: 0 1px 6px rgba(0, 0, 0, .6); }
    .cv-prepa b { display: block; font-size: .92rem; }
    .cv-titre { font-weight: 600; font-size: .95rem; line-height: 1.3; }
    .cv-admin { display: flex; gap: 6px; flex-wrap: wrap; }
    .cv-admin .puce { font-size: .76rem; padding: 3px 9px; }
    .cv-entete { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin: 0 0 18px; }
    .cv-entete p { margin: 0; max-width: 680px; }
    .cv-dialogue { width: min(1060px, calc(100vw - 24px)); max-height: calc(100vh - 24px); padding: 0; border: 0; border-radius: 22px; background: var(--carte); color: var(--texte); box-shadow: 0 30px 80px rgba(0, 0, 0, .45); }
    .cv-dialogue::backdrop { background: rgba(8, 10, 28, .72); }
    .cv-lecteur { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0; max-height: calc(100vh - 24px); }
    .cv-video { background: #000; display: grid; place-items: center; }
    .cv-video video { display: block; height: min(82vh, 760px); aspect-ratio: 9 / 16; max-width: 100%; background: #000; }
    .cv-cote { padding: 22px 22px 18px; overflow: auto; display: flex; flex-direction: column; gap: 14px; }
    .cv-cote h2 { margin: 0; font-size: 1.3rem; line-height: 1.25; }
    .cv-fermer { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--fond); color: var(--texte); font-size: 1.3rem; cursor: pointer; z-index: 2; }
    .cv-chapitres { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; counter-reset: ch; }
    .cv-chapitres button { width: 100%; display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--bord); background: var(--carte); color: inherit; font: inherit; text-align: left; cursor: pointer; }
    .cv-chapitres button:hover { border-color: var(--accent); }
    .cv-chapitres .n { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--fond); font-weight: 700; font-size: .85rem; }
    .cv-chapitres .t { color: var(--doux); font-size: .82rem; font-variant-numeric: tabular-nums; }
    .cv-chapitres button.actif { border-color: var(--accent); background: var(--accent-doux); }
    .cv-chapitres button.actif .n { background: var(--accent); color: #fff; }
    .cv-chapitres button.passe .n { background: var(--ok-doux); color: var(--ok); }
    .cv-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }
    .cv-bloc-fiche { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 16px; align-items: center; }
    .cv-bloc-fiche .cv-image { width: 96px; }
    .cv-bloc-fiche h2 { margin: 0 0 4px; font-size: 1.1rem; }
    .cv-bloc-fiche p { margin: 0 0 10px; }
    @media (max-width: 760px) {
      .cv-grille { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .cv-dialogue { width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; border-radius: 0; margin: 0; }
      .cv-lecteur { grid-template-columns: 1fr; max-height: 100dvh; overflow: auto; }
      .cv-video video { height: auto; width: 100%; max-height: 74dvh; }
      .cv-cote { padding: 16px; overflow: visible; }
    }`;
  document.head.appendChild(style);

  function carte(f, e, ordre) {
    const v = e.videos[f.id], vu = vus()[f.id], pos = ordre.indexOf(f.id);
    const prioritaire = e.priorite.includes(f.id);
    const admin = e.admin ? `<div class="cv-admin">${v ? "" : `<button type="button" class="puce" data-prio="${f.id}" aria-pressed="${prioritaire}">${prioritaire ? "★ Prioritaire" : "☆ En priorité"}</button>`}
      ${v ? `<button type="button" class="puce" data-refaire="${f.id}">${e.refaire.includes(f.id) ? "↻ Demandée" : "↻ Refaire"}</button>` : ""}
      ${e.erreurs[f.id] ? `<span class="doux petit" title="${echapper(e.erreurs[f.id].erreur)}">⚠️ dernier essai échoué</span>` : ""}</div>` : "";
    if (!v) return `<div><div class="cv-carte" aria-disabled="true"><div class="cv-image">${couvertureFiche(f)}<span class="cv-pastille haut">🎬 En préparation</span>
      <div class="cv-prepa"><b>${pos < 0 ? "Bientôt" : pos < 3 ? "Ce soir ou demain" : `Dans ${Math.ceil((pos + 1) / 3)} soirs environ`}</b>${pos >= 0 ? `n° ${pos + 1} dans la file` : ""}</div></div>
      <span class="cv-titre">${echapper(f.titre)}</span></div>${admin}</div>`;
    return `<div><button type="button" class="cv-carte" data-video="${f.id}" aria-label="Regarder le cours vidéo : ${echapper(f.titre)}">
      <div class="cv-image"><img src="/api/cours/${f.id}/miniature?v=${encodeURIComponent(v.version)}" alt="" loading="lazy"><span class="cv-lecture"></span>
        ${vu ? '<span class="cv-pastille haut vu">✓ Vu</span>' : '<span class="cv-pastille haut">Nouveau</span>'}<span class="cv-pastille bas">${mmss(v.duree)}</span></div>
      <span class="cv-titre">${echapper(f.titre)}</span>${v.verifie !== verifie(f) ? '<span class="doux petit">Nouvelle version en préparation</span>' : ""}</button>${admin}</div>`;
  }

  async function vue(conteneur, parcours) {
    conteneur.innerHTML = '<p class="doux">Chargement des vidéos…</p>';
    let e;
    try { [e] = await Promise.all([charger(true), approfondi()]); } catch (x) { conteneur.innerHTML = `<p class="message ko">${echapper(x.message)}</p>`; return; }
    const ordre = file(e), prets = FICHES.filter((f) => e.videos[f.id]).length, nVus = FICHES.filter((f) => e.videos[f.id] && vus()[f.id]).length;
    conteneur.innerHTML = `<div class="cv-entete"><p class="doux">Un cours vidéo par fiche : l'essentiel, le fonctionnement, les chiffres, les pièges, un quiz et le récapitulatif. Écrit uniquement à partir de la fiche vérifiée. ${prets < FICHES.length ? "Les vidéos arrivent au fil des soirs." : ""}</p>
      <span class="badge-prog ${nVus && nVus === prets ? "maitrise" : nVus ? "encours" : ""}">${nVus} / ${prets} vue${nVus > 1 ? "s" : ""} · ${prets} / ${FICHES.length} prête${prets > 1 ? "s" : ""}</span></div>` +
      parcours.map((p) => {
        const fiches = p.ids.map((id) => FICHES.find((f) => f.id === id)).filter(Boolean);
        return `<section class="parcours"><div class="titre-section"><div><h2 style="margin:0">${p.titre}</h2><span class="doux petit">${p.texte}</span></div></div>
          <div class="cv-grille">${fiches.map((f) => carte(f, e, ordre)).join("")}</div></section>`;
      }).join("");
    conteneur.querySelectorAll("[data-video]").forEach((b) => b.onclick = () => ouvrir(b.dataset.video, () => vue(conteneur, parcours)));
    conteneur.querySelectorAll("[data-prio]").forEach((b) => b.onclick = async () => {
      const id = b.dataset.prio, liste = e.priorite.includes(id) ? e.priorite.filter((x) => x !== id) : [...e.priorite, id];
      b.disabled = true;
      try { await appelApi("/api/cours/priorite", "POST", { ids: liste }); } catch (x) { alert(x.message); }
      vue(conteneur, parcours);
    });
    conteneur.querySelectorAll("[data-refaire]").forEach((b) => b.onclick = async () => {
      b.disabled = true;
      try { await appelApi(`/api/cours/${b.dataset.refaire}/refaire`, "POST", {}); b.textContent = "↻ Demandée"; } catch (x) { b.textContent = x.message; }
    });
  }

  // Lecteur : la vidéo à gauche, les chapitres à droite (en dessous sur téléphone).
  async function ouvrir(id, apresFermeture) {
    const f = FICHES.find((x) => x.id === id), e = await charger(), v = e.videos[id];
    if (!f || !v) return;
    const d = document.createElement("dialog");
    d.className = "cv-dialogue";
    const chap = v.chapitres || [];
    d.innerHTML = `<button type="button" class="cv-fermer" aria-label="Fermer">×</button><div class="cv-lecteur">
      <div class="cv-video"><video controls playsinline preload="metadata" poster="/api/cours/${id}/miniature?v=${encodeURIComponent(v.version)}" src="/api/cours/${id}/video?v=${encodeURIComponent(v.version)}"></video></div>
      <div class="cv-cote"><div><div class="surtitre">Cours vidéo · ${duree(v.duree)}</div><h2>${echapper(f.titre)}</h2></div>
        ${v.resume ? `<p class="doux" style="margin:0">${echapper(v.resume)}</p>` : ""}
        ${chap.length > 1 ? `<div><div class="cote-titre" style="font-weight:700;margin-bottom:8px">Chapitres</div><ol class="cv-chapitres">${chap.map((c, i) => `<li><button type="button" data-t="${c.t}"><span class="n">${i + 1}</span><span>${echapper(c.titre)}</span><span class="t">${mmss(c.t)}</span></button></li>`).join("")}</ol></div>` : ""}
        <div class="cv-actions"><a class="bouton" href="/fiche?id=${id}#jeux">🎯 Me tester sur la fiche</a><a class="bouton bouton-discret" href="/fiche?id=${id}">📄 Lire la fiche</a></div>
        <p class="doux petit" style="margin:0">Écrit à partir de la fiche vérifiée le ${echapper(v.verifie)}. Contenu pédagogique, ne constitue pas un conseil.</p></div></div>`;
    document.body.appendChild(d);
    const video = d.querySelector("video"), boutons = [...d.querySelectorAll("[data-t]")];
    boutons.forEach((b) => b.onclick = () => { video.currentTime = Number(b.dataset.t) + .05; video.play().catch(() => {}); });
    video.addEventListener("timeupdate", () => {
      const t = video.currentTime;
      let k = -1; boutons.forEach((b, i) => { if (t >= Number(b.dataset.t)) k = i; });
      boutons.forEach((b, i) => { b.classList.toggle("actif", i === k); b.classList.toggle("passe", i < k); });
      if (video.duration && t / video.duration > .9) marquerVu(id);
    });
    const fermer = () => { video.pause(); d.close(); d.remove(); const u = new URL(location.href); if (u.searchParams.has("video")) { u.searchParams.delete("video"); history.replaceState(null, "", u); } apresFermeture?.(); };
    d.querySelector(".cv-fermer").onclick = fermer;
    d.addEventListener("cancel", (ev) => { ev.preventDefault(); fermer(); });
    d.addEventListener("click", (ev) => { if (ev.target === d) fermer(); });
    d.showModal();
    video.play().catch(() => {});
  }

  // Bloc « La vidéo de cette fiche ».
  async function blocFiche(conteneur, f) {
    let e; try { e = await charger(); } catch { return; }
    const v = e.videos[f.id];
    if (!v) {
      const pos = file(e).indexOf(f.id);
      conteneur.innerHTML = `<section class="carte bloc"><div class="cv-bloc-fiche"><div class="cv-image" style="aspect-ratio:9/16">${couvertureFiche(f)}</div>
        <div><h2>🎬 La vidéo de cette fiche</h2><p class="doux">Le cours vidéo de cette fiche est en préparation${pos >= 0 ? ` (n° ${pos + 1} dans la file, environ ${pos < 3 ? "ce soir" : Math.ceil((pos + 1) / 3) + " soirs"})` : ""}.</p></div></div></section>`;
      return;
    }
    conteneur.innerHTML = `<section class="carte bloc"><div class="cv-bloc-fiche"><button type="button" class="cv-carte" data-video="${f.id}" aria-label="Regarder le cours vidéo"><div class="cv-image"><img src="/api/cours/${f.id}/miniature?v=${encodeURIComponent(v.version)}" alt=""><span class="cv-lecture" style="width:40px;height:40px;margin:-20px 0 0 -20px"></span></div></button>
      <div><h2>🎬 La vidéo de cette fiche</h2><p class="doux">${duree(v.duree)} pour comprendre l'essentiel : ${(v.chapitres || []).filter((c) => !/^(Introduction|À retenir)$/.test(c.titre)).length || "plusieurs"} chapitres illustrés, un quiz et le récapitulatif.${vus()[f.id] ? " ✓ Déjà vue." : ""}</p>
        <button type="button" class="bouton" data-video="${f.id}">▶ Regarder le cours</button></div></div></section>`;
    conteneur.querySelectorAll("[data-video]").forEach((b) => b.onclick = () => ouvrir(f.id, () => blocFiche(conteneur, f)));
  }

  window.CoursVideos = { vue, ouvrir, blocFiche };
})();
