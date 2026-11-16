// Aperçu d'une vidéo dans le navigateur, avant fabrication : le vrai moteur d'animation (copié dans /video-moteur/ à la mise
// en ligne) dessine chaque scène, sans voix, sur un rythme estimé à partir des syllabes (même méthode que le serveur).
// Sert aux vignettes du scénario et au lecteur « Aperçu ». Aucun appel à l'IA, aucun quota.
(function (racine) {
  const SYL_PAR_S = 4.45, TENUE = 3.6, PAUSE = .2;
  const UN = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  const DIZ = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante", 8: "quatre-vingt" };
  function lettres(n) {
    n = Math.floor(n);
    if (n < 17) return UN[n];
    if (n < 20) return "dix-" + UN[n - 10];
    if (n < 100) { const d = Math.floor(n / 10), u = n % 10; if (d === 7 || d === 9) return DIZ[d - 1] + "-" + lettres(10 + u); return DIZ[d] + (u === 0 ? "" : u === 1 && d !== 8 ? "-et-un" : "-" + UN[u]); }
    if (n < 1000) { const c = Math.floor(n / 100), r = n % 100; return (c === 1 ? "cent" : UN[c] + " cent") + (r ? " " + lettres(r) : ""); }
    if (n < 1e6) { const m = Math.floor(n / 1000), r = n % 1000; return (m === 1 ? "mille" : lettres(m) + " mille") + (r ? " " + lettres(r) : ""); }
    const m = Math.floor(n / 1e6), r = n % 1e6; return lettres(Math.min(m, 999)) + " millions" + (r ? " " + lettres(r) : "");
  }
  function syllabes(texte) {
    let t = String(texte || "").replace(/[  ]/g, "").replace(/(\d) (?=\d{3}\b)/g, "$1");
    t = t.replace(/\d+(?:[.,]\d+)?/g, (x) => " " + x.split(/[.,]/).map((p) => lettres(Number(p))).join(" virgule ") + " ");
    t = t.replace(/€/g, " euros ").replace(/%/g, " pour cent ").replace(/BSC|B-S-C/g, " bé esse cé ");
    return t.split(/\s+/).filter(Boolean).reduce((n, m) => n + Math.max(1, (m.toLowerCase().match(/[aeiouyàâéèêëîïôûùœ]+/g) || []).length), 0);
  }
  const dureeScene = (s) => syllabes(s.texte) / SYL_PAR_S;
  const dureeEstimee = (scenes) => Math.round(scenes.reduce((n, s) => n + dureeScene(s), 0) + TENUE);

  // Calage estimé : phrases et mots datés comme le ferait le calage sur la vraie voix.
  function calageEstime(scenes) {
    const phrases = [];
    scenes.forEach((sc, i) => {
      const t = String(sc.texte || "").replace(/\s+/g, " ").trim() || "…";
      const morceaux = t.match(/[^.?!…;]+[.?!…;]*/g) || [t];
      morceaux.map((m) => m.trim()).filter(Boolean).forEach((m) => {
        if (phrases.length && phrases[phrases.length - 1].scene === i && !/[A-Za-zÀ-ÿ0-9]/.test(m)) { phrases[phrases.length - 1].texte += " " + m; return; }
        phrases.push({ texte: m, scene: i });
      });
      if (!phrases.some((p) => p.scene === i)) phrases.push({ texte: "…", scene: i });
    });
    const debit = 1 / (SYL_PAR_S * 1.12);   // parole un peu plus rapide que la moyenne (les pauses font le reste)
    let x = .15;
    const mots = [];
    phrases.forEach((p, j) => {
      p.texte = p.texte.replace(/\s+([?!:;])/g, " $1").replace(/(\d)\s+(?=\d{3}\b)/g, "$1 ").replace(/(\d)\s+(€|%|ans\b)/g, "$1 $2");
      const ws = p.texte.split(" "), poids = ws.map((w) => syllabes(w) + .3), T = poids.reduce((a, b) => a + b, 0);
      const d = Math.max(.5, syllabes(p.texte) * debit);
      p.debut = x; let y = x;
      ws.forEach((w, k) => { const dw = d * poids[k] / T; mots.push({ mot: w, debut: +y.toFixed(3), fin: +(y + dw).toFixed(3), groupe: j }); y += dw; });
      p.fin = x + d; x = p.fin + PAUSE;
    });
    const sc = scenes.map((_, i) => { const ps = phrases.filter((p) => p.scene === i); return { P: ps.map((p) => p.debut), PF: ps.map((p) => p.fin) }; });
    sc.forEach((s, i) => { s.debut = i === 0 ? 0 : Math.max(sc[i - 1].P[sc[i - 1].P.length - 1] + .2, s.P[0] - .25); });
    const finVoix = phrases[phrases.length - 1].fin;
    sc.forEach((s, i) => { s.fin = i + 1 < sc.length ? sc[i + 1].debut : finVoix + TENUE; });
    return { scenes: sc, mots, phrases, duree_voix: finVoix, duree_totale: sc[sc.length - 1].fin };
  }

  // Valeurs calculées de la scène « comparaison » (jamais celles de l'IA), comme sur le serveur.
  function avecChiffres(scenes, sim) {
    return scenes.map((s) => {
      if (s.type !== "comparaison" || !sim) return s;
      return { ...s, p: { ...s.p, unite: "€", gauche: { nom: s.p?.gauche_nom || `Dès ${sim.age1} ans`, valeur: Math.round(sim.A.capital), verse: Math.round(sim.A.versements), personnage: s.p?.personnage_gauche || "lea" },
        droite: { nom: s.p?.droite_nom || `Dès ${sim.age2} ans`, valeur: Math.round(sim.B.capital), verse: Math.round(sim.B.versements), personnage: s.p?.personnage_droite || "tom_age" },
        note: `Exemple fictif : ${sim.mensuel} €/mois, ${String(sim.taux).replace(".", ",")} %/an, non garanti` } };
    });
  }

  // ---------------------------------------------------------------- moteur dans un cadre (même origine)
  // Un cadre invisible pour les vignettes ; le lecteur a son propre cadre visible, réduit à la taille de son conteneur.
  function creerCadre(parent) {
    const cadre = document.createElement("iframe");
    cadre.src = "/video-moteur/moteur";
    cadre.title = "Aperçu de la vidéo";
    cadre.tabIndex = -1;
    cadre.setAttribute("scrolling", "no");
    if (parent) { cadre.className = "va-cadre"; parent.appendChild(cadre); }
    else { cadre.setAttribute("aria-hidden", "true"); cadre.style.cssText = "position:fixed;left:-4000px;top:0;width:1080px;height:1920px;border:0;visibility:hidden"; document.body.appendChild(cadre); }
    const pret = new Promise((ok, ko) => {
      cadre.onload = async () => {
        const w = cadre.contentWindow;
        if (!w || typeof w.init !== "function") { ko(new Error("moteur d'aperçu indisponible")); return; }
        try { await w.document.fonts?.ready; await w.imagesPretes?.(); } catch {}
        ok(w);
      };
      setTimeout(() => ko(new Error("moteur d'aperçu trop lent")), 15000);
    });
    return { cadre, pret };
  }
  let cache = null;
  function moteur() {
    if (!cache) { cache = creerCadre(null); cache.pret.catch(() => { cache?.cadre.remove(); cache = null; }); }
    return cache.pret;
  }

  // Copie de l'image dessinée (vignette), avec des identifiants propres et le logo en adresse absolue.
  let n = 0;
  function copie(w, format) {
    const svg = w.document.getElementById("s"), k = "a" + (++n);
    const h = svg.innerHTML.replace(/\bid="([^"]+)"/g, `id="$1_${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_${k})`).replace(/href="#([^"]+)"/g, `href="#$1_${k}"`)
      .replace(/href="logo-bsc\.png"/g, 'href="/video-moteur/logo-bsc.png"');
    const vb = format === "4:5" ? "0 285 1080 1350" : "0 0 1080 1920";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${h}</svg>`;
  }
  function preparer(w, video) {
    const cal = calageEstime(video.scenes);
    w.init({ format: "9:16", scenes: video.scenes, graine: video.graine || 1, config: video.config || {}, sous_titres: video.sous_titres }, cal);
    return cal;
  }

  // Vignettes : une image par scène, au moment où elle est la plus « remplie ».
  async function vignettes(video) {
    const w = await moteur(), cal = preparer(w, video);
    return cal.scenes.map((s, i) => {
      const t = video.scenes[i].type === "fin" ? s.fin - .3 : Math.min(s.fin - .05, s.debut + (s.fin - s.debut) * .72);
      w.draw(t); return copie(w, video.format);
    });
  }

  // Lecteur : son propre cadre, réduit à la largeur du conteneur ; lecture continue, pause, saut à une scène.
  function lecteur(conteneur, surTemps) {
    const { cadre, pret } = creerCadre(conteneur);
    let video = null, cal = null, anim = 0, t = 0, fin = 0, depart = 0, origine = 0;
    const etat = { lecture: false };
    function ajuster() {
      const h = video?.format === "4:5" ? 1350 : 1920, k = conteneur.clientWidth / 1080;
      cadre.style.width = "1080px"; cadre.style.height = h + "px";
      cadre.style.transform = `scale(${k})`; conteneur.style.height = Math.round(h * k) + "px";
    }
    new ResizeObserver(ajuster).observe(conteneur);
    async function charger(v) {
      arreter(); video = v; ajuster();
      const w = await pret;
      cal = calageEstime(v.scenes);
      w.init({ format: v.format, scenes: v.scenes, graine: v.graine || 1, config: v.config || {}, sous_titres: v.sous_titres }, cal);
      dessiner(Math.min(t, cal.duree_totale - .05));
      return cal;
    }
    function dessiner(x) {
      if (!cal) return;
      t = Math.max(0, Math.min(x, cal.duree_totale - .02));
      cadre.contentWindow.draw(t);
      surTemps?.(t, cal);
    }
    function boucle(now) {
      if (!etat.lecture) return;
      const x = origine + (now - depart) / 1000;
      if (x >= fin) { dessiner(fin - .02); arreter(); return; }
      dessiner(x); anim = requestAnimationFrame(boucle);
    }
    function lire(de = t, jusqua = null) {
      if (!cal) return;
      if (de >= cal.duree_totale - .1) de = 0;
      origine = de; fin = jusqua ?? cal.duree_totale; depart = performance.now(); etat.lecture = true;
      cancelAnimationFrame(anim); anim = requestAnimationFrame(boucle); surTemps?.(de, cal);
    }
    function arreter() { etat.lecture = false; cancelAnimationFrame(anim); if (cal) surTemps?.(t, cal); }
    return { charger, lire, arreter, aller: dessiner, etat, get calage() { return cal; }, get temps() { return t; } };
  }

  racine.VideoApercu = { syllabes, dureeScene, dureeEstimee, calageEstime, avecChiffres, vignettes, lecteur, moteur };
})(typeof window !== "undefined" ? window : globalThis);
if (typeof module !== "undefined") module.exports = globalThis.VideoApercu;
