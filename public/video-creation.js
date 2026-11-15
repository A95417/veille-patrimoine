// Création Post › Vidéo : modèle et réglages → scénario proposé par l'IA (modifiable) → fabrication par le robot
// (suivi en direct avec temps restant) → lecture, téléchargement, miniature, sous-titres, texte de publication. Galerie.
(() => {
  const $v = (id) => document.getElementById(id);
  const MODELES = [
    { id: "deux_profils", ico: "👥", titre: "Deux profils, deux résultats", desc: "Une simulation chiffrée par le site : commencer tôt ou attendre." },
    { id: "chiffre_semaine", ico: "📈", titre: "Le chiffre de la semaine", desc: "Un taux ou l'inflation (BCE), tiré de la page Marchés." },
    { id: "echeance", ico: "📅", titre: "Échéance fiscale à ne pas rater", desc: "Depuis le calendrier officiel impots.gouv." },
    { id: "mythe", ico: "💭", titre: "Mythe ou réalité ?", desc: "Corriger une idée reçue sur l'épargne." },
    { id: "libre", ico: "✏️", titre: "Sujet libre", desc: "Votre thème, sans chiffre inventé." },
  ];
  const NOMS_TYPES = { accroche: "Accroche", personnage: "Personnage", marche: "Marchés", calendrier: "Le temps passe", comparaison: "Comparaison chiffrée", egalite: "Même effort", grand_mot: "Mot géant", bocaux: "Chaque situation est unique", chiffre: "Chiffre clé", liste: "Liste", mythe: "Idée reçue", sablier: "Sablier", fin: "Carte de fin" };
  // Paramètres affichés à l'écran modifiables, par gabarit (les autres restent tels que proposés).
  const CHAMPS = {
    accroche: [["bandeau", "Bandeau"], ["gros_texte", "Gros texte"], ["petit_texte", "Petite mention"]],
    personnage: [["nom", "Nom"], ["sous_nom", "Sous le nom"], ["notification_titre", "Notification"], ["notification_texte", "Détail de la notification"], ["bulle", "Bulle de pensée"]],
    marche: [["tampon1", "Tampon 1"], ["tampon2", "Tampon 2"]],
    calendrier: [["libelle", "Libellé"], ["montant", "Montant affiché"]],
    comparaison: [["bandeau", "Bandeau"], ["gauche_nom", "Profil de gauche"], ["droite_nom", "Profil de droite"]],
    egalite: [["gauche", "Gauche"], ["droite", "Droite"], ["question", "Question"]],
    grand_mot: [["texte", "Mot géant"], ["legende", "Légende"]],
    bocaux: [["titre", "Titre"], ["puce", "Puce"], ["courbe", "Courbe"]],
    chiffre: [["bandeau", "Bandeau"], ["valeur", "Valeur"], ["libelle", "Libellé"], ["source", "Source"]],
    liste: [["titre", "Titre"]],
    mythe: [["mythe", "Idée reçue"], ["realite", "Réalité"]],
    sablier: [["haut", "Texte du haut"], ["gros", "Gros message"]],
  };
  const PERSOS = [["lea", "Léa, 25 ans"], ["tom", "Tom, 25 ans"], ["tom_age", "Tom, 35 ans"], ["ines", "Inès, 22 ans, étudiante"], ["hugo", "Hugo, 23 ans"], ["sarah", "Sarah, 40 ans, cheffe d'entreprise"], ["isaac", "Isaac, 38 ans, entrepreneur"], ["michel", "Michel, 66 ans, retraité"], ["francoise", "Françoise, 63 ans"], ["conseil", "Le conseiller"]];
  const LIEUX = [["appartement", "Appartement"], ["salon", "Salon familial"], ["cuisine", "Cuisine"], ["chambre_soir", "Chambre, le soir"], ["bureau", "Bureau"], ["coworking", "Coworking"], ["banque", "Agence bancaire"], ["rue", "Rue en ville"], ["parc", "Parc"], ["cafe", "Terrasse de café"], ["mer", "Bord de mer"], ["maison_vente", "Maison « À vendre »"]];
  // Champs de personnage et de décor proposés selon le gabarit.
  const CHOIX = {
    accroche: [["personnage", "Personnage"], ["decor", "Décor"]], personnage: [["personnage", "Personnage"], ["decor", "Décor"]], marche: [["personnage", "Personnage"]],
    calendrier: [["personnage", "Personnage"], ["decor", "Décor"]], egalite: [["personnage_gauche", "Personnage de gauche"], ["personnage_droite", "Personnage de droite"], ["decor", "Décor"]],
    comparaison: [["personnage_gauche", "Personnage de gauche"], ["personnage_droite", "Personnage de droite"]],
  };
  const VOIX_INFO = {
    Sadachbia: ["Dynamiques", "vivante, conseillée"], Puck: ["Dynamiques", "enjouée"], Zephyr: ["Dynamiques", "vive"], Laomedeia: ["Dynamiques", "entraînante"], Fenrir: ["Dynamiques", "énergique"], Leda: ["Dynamiques", "jeune"],
    Achird: ["Posées", "amicale"], Kore: ["Posées", "assurée"], Charon: ["Posées", "informative"], Sulafat: ["Posées", "chaleureuse"], Orus: ["Posées", "ferme"], Gacrux: ["Posées", "mature"],
  };
  const EXTRAITS = new Set(["sadachbia", "fenrir", "kore", "charon", "zephyr", "laomedeia", "leda", "achird"]);
  const LIB_STATUT = { brouillon: "Brouillon", file: "En file d'attente", attente: "Démarrage", en_cours: "En fabrication", pret: "Prête", a_verifier: "Prête · à vérifier", erreur: "Échec", annule: "Annulée" };
  const EN_COURS = ["file", "attente", "en_cours"];
  const R = { modele: "deux_profils", duree: 45, format: "9:16", voix: "Sadachbia", sim: { mensuel: 100, taux: 4, age1: 25, age2: 35, age_fin: 65 } };
  let reglages = null, courante = null, suivi = null, chrono = null, audio = null;

  const mots = (sc) => (sc || []).reduce((n, s) => n + String(s.texte || "").split(/\s+/).filter((m) => /[\p{L}\d]/u.test(m)).length, 0);
  const dureeEst = (sc) => Math.round(mots(sc) / 2.85 + 4);
  const fabrication = (sc) => 75 + dureeEst(sc) * 30 / 22 + 50;   // démarrage du robot + images + son/montage/envoi (secondes)
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`; };
  const nbFr = (n) => Math.round(n).toLocaleString("fr-FR");
  function simuler(s) {
    const m = +s.mensuel || 100, i = (+s.taux || 0) / 100 / 12, fv = (mo) => (i ? m * ((1 + i) ** mo - 1) / i : m * mo);
    const a = fv(12 * (s.age_fin - s.age1)), b = fv(12 * (s.age_fin - s.age2));
    return { a, b, ecart: a - b, va: m * 12 * (s.age_fin - s.age1), vb: m * 12 * (s.age_fin - s.age2) };
  }

  // ---------------------------------------------------------------- squelette
  function monter() {
    $v("vue-video").innerHTML = `
      <section class="carte" id="vv-nouvelle">
        <h2>Créer une vidéo courte</h2>
        <p class="doux">Format TikTok, Reels ou LinkedIn : personnages animés, voix off, sous-titres, musique. L'IA propose un scénario que vous relisez avant toute fabrication.</p>
        <div class="vv-modeles" id="vv-modeles"></div>
        <div id="vv-sim" class="vv-sim"></div>
        <label class="bloc-lib" for="vv-sujet" style="margin-top:14px">Sujet ou angle <span class="doux">(facultatif pour les modèles chiffrés)</span></label>
        <textarea id="vv-sujet" rows="2" maxlength="300" placeholder="Ex. : pourquoi épargner chaque mois plutôt qu'attendre le bon moment"></textarea>
        <p class="alerte-donnees">N'indiquez jamais de nom ni d'information sur un client : le texte est envoyé à l'IA (Gemini).</p>
        <div class="reglages" style="margin-top:12px">
          <div><span class="simu-lib">Durée</span><div class="puces" id="vv-duree">${[30, 45, 60].map((d) => `<button type="button" class="puce" data-duree="${d}">${d} s</button>`).join("")}</div></div>
          <div><span class="simu-lib">Format</span><div class="puces" id="vv-format"><button type="button" class="puce" data-format-v="9:16">9:16 · TikTok, Reels</button><button type="button" class="puce" data-format-v="4:5">4:5 · LinkedIn</button></div></div>
        </div>
        <span class="simu-lib">Voix</span><div class="puces" id="vv-voix"></div>
        <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="bouton gros-bouton" id="vv-proposer">✨ Proposer un scénario</button><span class="doux petit" id="vv-quota"></span></div>
        <div id="vv-msg"></div>
      </section>
      <section class="carte" id="vv-travail" hidden></section>
      <section class="carte" id="vv-galerie-bloc">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">Mes vidéos</h2><span class="doux petit">Les 10 dernières vidéos terminées sont conservées.</span></div>
        <div class="vv-galerie" id="vv-galerie"><div class="attente"><span class="rond"></span>Chargement…</div></div>
      </section>
      <details class="carte precision" id="vv-coord"><summary>⚙️ Coordonnées du cabinet (carte de fin)</summary><div id="vv-coord-corps"></div></details>`;
    $v("vv-modeles").innerHTML = MODELES.map((m) => `<button type="button" class="choix-carte" data-modele="${m.id}"><strong>${m.ico} ${m.titre}</strong><span class="petit">${m.desc}</span></button>`).join("");
    document.querySelectorAll("[data-modele]").forEach((b) => b.onclick = () => { R.modele = b.dataset.modele; majReglages(); });
    document.querySelectorAll("[data-duree]").forEach((b) => b.onclick = () => { R.duree = +b.dataset.duree; majReglages(); });
    document.querySelectorAll("[data-format-v]").forEach((b) => b.onclick = () => { R.format = b.dataset.formatV; majReglages(); });
    $v("vv-proposer").onclick = proposer;
  }

  function majReglages() {
    document.querySelectorAll("[data-modele]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.modele === R.modele));
    document.querySelectorAll("[data-duree]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.duree === R.duree));
    document.querySelectorAll("[data-format-v]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.formatV === R.format));
    const voix = reglages?.voix || ["Sadachbia"];
    $v("vv-voix").innerHTML = ["Dynamiques", "Posées"].map((gr) => `<div class="vv-voix-groupe"><span class="petit doux">${gr}</span><div class="puces">${voix.filter((n) => (VOIX_INFO[n]?.[0] || "Posées") === gr).map((n) => `<span class="vv-voix"><button type="button" class="puce" data-voix="${n}" aria-pressed="${n === R.voix}">${n} <small>· ${VOIX_INFO[n]?.[1] || ""}</small></button>${EXTRAITS.has(n.toLowerCase()) ? `<button type="button" class="vv-ecoute" data-ecoute="${n}" aria-label="Écouter la voix ${n}" title="Écouter">▶</button>` : `<span class="vv-bientot" title="Extrait disponible prochainement">bientôt</span>`}</span>`).join("")}</div></div>`).join("");
    document.querySelectorAll("[data-voix]").forEach((b) => b.onclick = () => { R.voix = b.dataset.voix; majReglages(); });
    document.querySelectorAll("[data-ecoute]").forEach((b) => b.onclick = () => {
      if (audio) { audio.pause(); }
      audio = new Audio(`/voix/${b.dataset.ecoute.toLowerCase()}.m4a`); audio.play().catch(() => notifier("Lecture impossible sur cet appareil.", true));
    });
    const sim = $v("vv-sim");
    if (R.modele === "deux_profils") {
      const s = R.sim, r = simuler(s);
      sim.hidden = false;
      sim.innerHTML = `<div class="vv-sim-grille">
        ${[["mensuel", "Épargne par mois (€)", 10, 5000, 10], ["taux", "Rendement fictif (%/an)", 0, 10, .5], ["age1", "Profil 1 commence à", 16, 80, 1], ["age2", "Profil 2 commence à", 17, 85, 1], ["age_fin", "Jusqu'à l'âge de", 20, 90, 1]]
          .map(([k, l, mi, ma, pas]) => `<label><span>${l}</span><input type="number" inputmode="decimal" data-sim="${k}" value="${s[k]}" min="${mi}" max="${ma}" step="${pas}"></label>`).join("")}</div>
        <p class="vv-sim-res">Calculé par le site (versements en fin de mois, intérêts capitalisés chaque mois) : <strong>≈ ${nbFr(r.a)} €</strong> contre <strong>≈ ${nbFr(r.b)} €</strong>, soit <strong>${nbFr(r.ecart)} € d'écart</strong> pour ${nbFr(r.va - r.vb)} € de versements en plus. <span class="doux">Exemple fictif, rendement non garanti.</span></p>`;
      sim.querySelectorAll("[data-sim]").forEach((i) => i.onchange = () => {
        const v = parseFloat(String(i.value).replace(",", "."));
        if (Number.isFinite(v)) R.sim[i.dataset.sim] = Math.max(+i.min, Math.min(+i.max, v));
        if (R.sim.age2 <= R.sim.age1) R.sim.age2 = R.sim.age1 + 1;
        if (R.sim.age_fin <= R.sim.age2) R.sim.age_fin = R.sim.age2 + 1;
        majReglages();
      });
    } else { sim.hidden = true; sim.innerHTML = ""; }
    if (reglages) $v("vv-quota").textContent = `${reglages.lancees_aujourdhui}/${reglages.limite_jour} vidéos fabriquées aujourd'hui`;
  }

  // ---------------------------------------------------------------- scénario
  async function proposer() {
    const b = $v("vv-proposer");
    b.disabled = true; $v("vv-msg").innerHTML = `<div class="attente"><span class="rond"></span>L'IA écrit le scénario, 10 à 40 secondes…</div>`;
    try {
      const r = await appelApi("/api/video/scenario", "POST", { modele: R.modele, sujet: $v("vv-sujet").value, duree: R.duree, format: R.format, voix: R.voix, simulation: R.sim });
      $v("vv-msg").innerHTML = "";
      ouvrir(r.video); chargerGalerie();
    } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    b.disabled = false;
  }

  function lireScenes() {
    return [...document.querySelectorAll(".vv-scene[data-i]")].map((c) => {
      const s = JSON.parse(c.dataset.base);
      s.texte = c.querySelector("[data-texte]").value;
      c.querySelectorAll("[data-champ]").forEach((i) => { s.p = s.p || {}; if (i.value === "" && i.tagName === "SELECT") delete s.p[i.dataset.champ]; else s.p[i.dataset.champ] = i.value; });
      return s;
    });
  }
  function scenesHtml(sc) {
    return sc.map((s, i) => {
      if (s.type === "fin") return `<div class="vv-scene vv-fin"><div class="vv-scene-tete"><b>${i + 1}. Carte de fin</b><span class="doux petit">ajoutée automatiquement</span></div><p class="vv-lu">« ${echapper(s.texte)} »</p></div>`;
      const champs = (CHAMPS[s.type] || []).filter(([k]) => s.p?.[k] !== undefined || ["bandeau", "gros_texte", "texte", "valeur", "mythe", "realite", "titre", "gros"].includes(k));
      return `<div class="vv-scene" data-i="${i}" data-base="${echapper(JSON.stringify(s))}">
        <div class="vv-scene-tete"><b>${i + 1}. ${NOMS_TYPES[s.type] || s.type}</b><span class="vv-scene-actions">
          <button type="button" class="lien-bouton" data-monter="${i}" aria-label="Monter la scène" ${i === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="lien-bouton" data-descendre="${i}" aria-label="Descendre la scène" ${i >= sc.length - 2 ? "disabled" : ""}>↓</button>
          <button type="button" class="lien-bouton" data-retirer="${i}" aria-label="Retirer la scène">✕</button></span></div>
        <label class="petit doux" for="vv-t${i}">Texte lu par la voix</label><textarea id="vv-t${i}" data-texte rows="2" maxlength="400">${echapper(s.texte)}</textarea>
        ${(CHOIX[s.type] || []).length ? `<div class="vv-choix">${CHOIX[s.type].map(([k, l]) => {
          const decorChamp = k === "decor", liste = decorChamp ? [["", "Automatique (selon la mise en scène)"], ...LIEUX] : PERSOS;
          const val = s.p?.[k] ?? (decorChamp ? "" : k === "personnage_droite" ? "tom_age" : k === "personnage_gauche" ? "lea" : "tom");
          return `<label class="vv-choix-un">${decorChamp ? "" : `<img src="/video-persos/${val}.png" alt="" width="44" height="44" data-portrait="${k}">`}<span>${l}<select data-champ="${k}">${liste.map(([id, nom]) => `<option value="${id}" ${id === val ? "selected" : ""}>${echapper(nom)}</option>`).join("")}</select></span></label>`;
        }).join("")}</div>` : ""}
        ${champs.length ? `<div class="vv-champs">${champs.map(([k, l]) => `<label><span>${l}</span><input data-champ="${k}" value="${echapper(s.p?.[k] ?? "")}" maxlength="60"></label>`).join("")}</div>` : ""}
      </div>`;
    }).join("");
  }

  function ouvrir(v) {
    courante = v;
    const z = $v("vv-travail"); z.hidden = false;
    arreterSuivi();
    if (v.statut === "brouillon" || v.statut === "erreur" || v.statut === "annule") afficherScenario(v);
    else if (EN_COURS.includes(v.statut)) afficherSuivi(v);
    else afficherResultat(v);
    z.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function afficherScenario(v) {
    const sc = v.storyboard || [], z = $v("vv-travail");
    const verif = v.a_verifier || [];
    z.innerHTML = `
      <div class="recap"><span><strong>Scénario :</strong> ${echapper(v.sujet || "")}</span><button type="button" class="lien-bouton" id="vv-fermer">Fermer</button></div>
      ${v.statut === "erreur" ? `<p class="message ko">La dernière fabrication a échoué : ${echapper(v.erreur || "")}</p>` : ""}
      <h2>Relisez et ajustez le scénario</h2>
      <p class="doux">Le texte de chaque scène est lu par la voix et s'affiche en sous-titres. Rien n'est fabriqué avant votre validation.</p>
      ${verif.length ? `<div class="conformite"><strong>Chiffres à vérifier</strong> (ni calculés par le site, ni tirés de ses données officielles) :<ul>${verif.map((x) => `<li>Scène ${x.scene} : <strong>${echapper(String(x.chiffre).replace(".", ","))}</strong> dans « ${echapper(x.texte)} »</li>`).join("")}</ul>Corrigez-les ou retirez-les si vous n'avez pas de source officielle.</div>` : `<p class="vv-ok">✓ Tous les chiffres viennent du calcul du site ou de ses données officielles.</p>`}
      <div class="vv-infos"><span>Durée estimée <strong id="vv-duree-est">${dureeEst(sc)} s</strong></span><span>Format <strong>${v.format}</strong></span><span>Voix <strong>${echapper(v.voix)}</strong></span></div>
      <div id="vv-scenes">${scenesHtml(sc)}</div>
      <label class="bloc-lib" for="vv-post" style="margin-top:14px">Texte de publication (à coller sous la vidéo)</label>
      <textarea id="vv-post" rows="5" maxlength="1500">${echapper(v.texte_post || "")}</textarea>
      <div class="actions">
        <button type="button" class="bouton gros-bouton" id="vv-lancer">🎬 Générer la vidéo · ≈ ${Math.ceil(fabrication(sc) / 60)} min</button>
        <button type="button" class="bouton bouton-discret" id="vv-sauver">Enregistrer le brouillon</button>
        <button type="button" class="bouton bouton-discret" id="vv-graine" title="Change les décors, l'heure du jour, les objets et les tenues, sans toucher au texte">🎲 Autre mise en scène</button>
        <button type="button" class="bouton bouton-discret" id="vv-reproposer">↻ Un autre scénario</button>
      </div>
      <p class="doux petit">La fabrication tourne sur un robot gratuit (GitHub) : vous pouvez fermer la page, la vidéo arrivera dans « Mes vidéos ». ${reglages ? `${reglages.lancees_aujourdhui}/${reglages.limite_jour} aujourd'hui.` : ""}</p>
      <div id="vv-msg2"></div>`;
    $v("vv-fermer").onclick = () => { $v("vv-travail").hidden = true; courante = null; };
    const scenes = $v("vv-scenes");
    scenes.oninput = () => { $v("vv-duree-est").textContent = dureeEst(lireScenes()) + " s"; };
    scenes.onchange = (e) => { const sel = e.target.closest("select[data-champ]"); if (!sel) return; const img = sel.closest(".vv-choix-un")?.querySelector("img"); if (img) img.src = `/video-persos/${sel.value}.png`; };
    scenes.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const l = lireScenes(), fin = l.pop();
      if (b.dataset.monter) { const i = +b.dataset.monter; [l[i - 1], l[i]] = [l[i], l[i - 1]]; }
      else if (b.dataset.descendre) { const i = +b.dataset.descendre; [l[i + 1], l[i]] = [l[i], l[i + 1]]; }
      else if (b.dataset.retirer) { if (l.length <= 2) return notifier("Gardez au moins deux scènes.", true); l.splice(+b.dataset.retirer, 1); }
      else return;
      scenes.innerHTML = scenesHtml([...l, fin]); scenes.oninput();
    };
    const sauver = async () => {
      const r = await appelApi(`/api/video/${v.id}/storyboard`, "POST", { scenes: lireScenes(), texte_post: $v("vv-post").value });
      courante = r.video; return r.video;
    };
    $v("vv-sauver").onclick = async () => { try { const nv = await sauver(); afficherScenario(nv); notifier("Brouillon enregistré."); } catch (e) { notifier(e.message, true); } };
    $v("vv-graine").onclick = async () => { try { const r = await appelApi(`/api/video/${v.id}/storyboard`, "POST", { scenes: lireScenes(), texte_post: $v("vv-post").value, nouvelle_graine: true }); courante = r.video; notifier("Nouvelle mise en scène tirée : décors, lumière, objets et tenues changeront."); } catch (e) { notifier(e.message, true); } };
    $v("vv-reproposer").onclick = () => { $v("vv-travail").hidden = true; document.getElementById("vv-nouvelle").scrollIntoView({ behavior: "smooth" }); proposer(); };
    $v("vv-lancer").onclick = async () => {
      const b = $v("vv-lancer"); b.disabled = true;
      try {
        const nv = await sauver();
        if ((nv.a_verifier || []).length && !b.dataset.confirme) {
          b.dataset.confirme = "1"; b.disabled = false; b.textContent = "Des chiffres restent à vérifier : générer quand même ?";
          return;
        }
        await appelApi(`/api/video/${v.id}/lancer`, "POST", {});
        reglages = await appelApi("/api/video/reglages").catch(() => reglages);
        const r = await appelApi(`/api/video/${v.id}`); ouvrir(r.video); chargerGalerie();
      } catch (e) { $v("vv-msg2").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; b.disabled = false; }
    };
  }

  // ---------------------------------------------------------------- suivi en direct
  function resteEstime(v) {
    const t = Date.now(), sc = v.storyboard || [];
    if (v.statut === "file") return null;
    if (v.statut === "en_cours" && v.eta_s != null) return v.eta_s - (t - new Date(v.maj_le)) / 1000;
    const depart = v.demarre_le || v.lance_le;
    return fabrication(sc) - (t - new Date(depart)) / 1000 - (v.demarre_le ? 30 : 0);
  }
  function afficherSuivi(v) {
    const z = $v("vv-travail");
    z.innerHTML = `
      <div class="recap"><span><strong>Vidéo :</strong> ${echapper(v.sujet || "")}</span><button type="button" class="lien-bouton" id="vv-fermer">Fermer</button></div>
      <h2>Fabrication en cours</h2>
      <div class="vv-chrono"><span class="vv-chrono-temps" id="vv-chrono">…</span><span class="doux" id="vv-etape" aria-live="polite"></span></div>
      <div class="vv-barre" role="progressbar" aria-label="Avancement de la fabrication" aria-valuemin="0" aria-valuemax="100" id="vv-barre"><span id="vv-barre-rempli"></span></div>
      <ol class="vv-etapes">${["Démarrage du robot", "Voix off", "Nettoyage et calage de la voix", "Animation des scènes", "Musique et montage", "Contrôle qualité", "Envoi de la vidéo"].map((e) => `<li data-etape="${e}">${e}</li>`).join("")}</ol>
      <p class="doux petit">Vous pouvez fermer cette page : la vidéo continue d'être fabriquée et apparaîtra dans « Mes vidéos ».</p>
      <button type="button" class="bouton bouton-discret" id="vv-annuler">Annuler la fabrication</button>`;
    $v("vv-fermer").onclick = () => { arreterSuivi(); $v("vv-travail").hidden = true; courante = null; };
    $v("vv-annuler").onclick = async (e) => {
      const b = e.currentTarget;
      if (b.dataset.confirme !== "1") { b.dataset.confirme = "1"; b.textContent = "Confirmer l'annulation ?"; setTimeout(() => { b.dataset.confirme = ""; b.textContent = "Annuler la fabrication"; }, 4000); return; }
      try { await appelApi(`/api/video/${v.id}/annuler`, "POST", {}); const r = await appelApi(`/api/video/${v.id}`); ouvrir(r.video); chargerGalerie(); } catch (er) { notifier(er.message, true); }
    };
    majSuivi(v);
    suivi = setInterval(async () => {
      try {
        const r = await appelApi(`/api/video/${courante.id}`);
        courante = r.video;
        if (!EN_COURS.includes(r.video.statut)) { arreterSuivi(); ouvrir(r.video); chargerGalerie(); if (r.video.statut === "pret" || r.video.statut === "a_verifier") notifier("Votre vidéo est prête 🎬"); return; }
        majSuivi(r.video);
      } catch {}
    }, 4000);
    chrono = setInterval(() => majChrono(courante), 1000);
  }
  function majSuivi(v) {
    const p = Math.round((v.progression || 0) * 100);
    $v("vv-barre-rempli").style.width = Math.max(2, p) + "%"; $v("vv-barre").setAttribute("aria-valuenow", p);
    const etape = v.statut === "file" ? "En file d'attente : démarre dès que la vidéo en cours est terminée." : v.statut === "attente" ? "Démarrage du robot (GitHub)…" : (v.etape || "");
    $v("vv-etape").textContent = etape;
    const base = v.etape || "", CLES = [/Démarrage|Préparation/, /^Voix/, /Nettoyage/, /Animation/, /Musique/, /Contrôle/, /Envoi/];
    const ix = v.statut === "attente" ? 0 : Math.max(0, CLES.findIndex((r) => r.test(base)));
    document.querySelectorAll(".vv-etapes li").forEach((li, i) => { li.className = i < ix ? "fait" : i === ix && v.statut !== "file" ? "actif" : ""; });
    majChrono(v);
  }
  function majChrono(v) {
    if (!v || !$v("vv-chrono")) return;
    const r = resteEstime(v);
    $v("vv-chrono").textContent = r == null ? "En attente" : r > 5 ? `≈ ${mmss(r)} restantes` : "Presque terminé…";
  }
  function arreterSuivi() { clearInterval(suivi); clearInterval(chrono); suivi = chrono = null; }

  // ---------------------------------------------------------------- résultat
  function afficherResultat(v) {
    const z = $v("vv-travail"), src = `/api/video/${v.id}/fichier`;
    z.innerHTML = `
      <div class="recap"><span><strong>Vidéo :</strong> ${echapper(v.sujet || "")}</span><button type="button" class="lien-bouton" id="vv-fermer">Fermer</button></div>
      <div class="vv-resultat">
        <div class="vv-lecteur ${v.format === "4:5" ? "f45" : ""}"><video controls playsinline preload="metadata" src="${src}" ${v.a_miniature ? `poster="/api/video/${v.id}/miniature"` : ""}></video></div>
        <div>
          <h2>Votre vidéo est prête</h2>
          <p class="doux">${v.duree ? Math.round(v.duree) + " s" : ""} · ${v.format} · ${v.taille ? (v.taille / 1e6).toFixed(1).replace(".", ",") + " Mo" : ""}${v.duree_fabrication ? ` · fabriquée en ${mmss(v.duree_fabrication)}` : ""}</p>
          ${(v.alertes || []).length ? `<div class="conformite"><strong>Le contrôle automatique demande une vérification :</strong><ul>${v.alertes.map((a) => `<li>${echapper(a)}</li>`).join("")}</ul>Regardez la vidéo avant de la publier.</div>` : `<p class="vv-ok">✓ Contrôle automatique réussi (son, textes, durée).</p>`}
          <div class="actions">
            <button type="button" class="bouton" id="vv-telecharger">⬇ Télécharger la vidéo (MP4)</button>
            <button type="button" class="bouton bouton-discret" id="vv-partager" hidden>Partager</button>
            ${v.a_miniature ? `<a class="bouton bouton-discret" href="/api/video/${v.id}/miniature" download="miniature.jpg">Miniature</a>` : ""}
            <a class="bouton bouton-discret" href="/api/video/${v.id}/srt">Sous-titres .srt</a>
          </div>
          <label class="bloc-lib" for="vv-post2">Texte de publication</label>
          <textarea id="vv-post2" rows="5">${echapper(v.texte_post || "")}</textarea>
          <div class="actions"><button type="button" class="bouton bouton-discret" id="vv-copier">Copier le texte</button><button type="button" class="bouton bouton-discret" id="vv-dupliquer">↻ Refaire une variante</button></div>
          <p class="doux petit">Rappel : relisez la vidéo avant publication. Les chiffres « exemple fictif » ne sont pas garantis.</p>
        </div>
      </div>`;
    $v("vv-fermer").onclick = () => { $v("vv-travail").hidden = true; courante = null; };
    $v("vv-copier").onclick = () => copier($v("vv-post2").value);
    $v("vv-telecharger").onclick = async (e) => {
      const b = e.currentTarget, lib = b.textContent; b.disabled = true;
      try { const blob = await parPlages(src, v.taille, (k) => { b.textContent = `Téléchargement… ${Math.round(k * 100)} %`; }); telechargerBlob(blob, `video-bsc-${v.id.slice(0, 8)}.mp4`); }
      catch (er) { notifier("Téléchargement impossible : " + er.message, true); }
      b.disabled = false; b.textContent = lib;
    };
    $v("vv-dupliquer").onclick = async () => { try { const r = await appelApi(`/api/video/${v.id}/dupliquer`, "POST", {}); const n = await appelApi(`/api/video/${r.id}`); ouvrir(n.video); chargerGalerie(); } catch (e) { notifier(e.message, true); } };
    if (navigator.canShare && navigator.share) {
      const b = $v("vv-partager"); b.hidden = false;
      b.onclick = async () => {
        b.disabled = true; b.textContent = "Préparation…";
        try {
          const blob = await parPlages(src, v.taille);
          const f = new File([blob], "video-bsc.mp4", { type: "video/mp4" });
          if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: $v("vv-post2").value });
          else notifier("Le partage de vidéo n'est pas possible sur cet appareil : téléchargez-la.", true);
        } catch {}
        b.disabled = false; b.textContent = "Partager";
      };
    }
  }

  // Récupère la vidéo par tranches de 1 Mo (chaque demande reste légère pour le serveur gratuit).
  async function parPlages(src, total, progres) {
    const parts = [], T = 1 << 20;
    for (let a = 0; a < total; ) {
      const r = await fetch(src, { credentials: "same-origin", headers: { Range: `bytes=${a}-${Math.min(total, a + T) - 1}` } });
      if (r.status !== 206 && r.status !== 200) throw new Error("erreur " + r.status);
      const b = await r.arrayBuffer(); if (!b.byteLength) throw new Error("réponse vide");
      parts.push(b); a += b.byteLength; progres?.(a / total);
      if (r.status === 200) break;
    }
    return new Blob(parts, { type: "video/mp4" });
  }

  // ---------------------------------------------------------------- galerie
  async function chargerGalerie() {
    try {
      const { videos } = await appelApi("/api/video/liste");
      const g = $v("vv-galerie");
      if (!videos.length) { g.innerHTML = `<p class="doux">Aucune vidéo pour l'instant. Choisissez un modèle ci-dessus.</p>`; return; }
      g.innerHTML = videos.map((v) => `<div class="vv-carte">
        <button type="button" class="vv-vignette ${v.format === "4:5" ? "f45" : ""}" data-ouvrir="${v.id}" aria-label="Ouvrir : ${echapper(v.sujet || "vidéo")}">${v.a_miniature ? `<img src="/api/video/${v.id}/miniature" alt="" loading="lazy">` : `<span>🎬</span>`}<em class="vv-statut s-${v.statut}">${LIB_STATUT[v.statut] || v.statut}</em></button>
        <div class="vv-carte-texte"><strong>${echapper(v.sujet || "Sans titre")}</strong><span class="doux petit">${quand(v.cree_le)}${v.auteur ? " · " + echapper(v.auteur) : ""}${v.duree ? " · " + Math.round(v.duree) + " s" : ""}</span></div>
        <div class="vv-carte-actions"><button type="button" class="lien-bouton" data-ouvrir="${v.id}">Ouvrir</button>${EN_COURS.includes(v.statut) ? "" : `<button type="button" class="lien-bouton" data-suppr="${v.id}">Supprimer</button>`}</div>
      </div>`).join("");
      g.querySelectorAll("[data-ouvrir]").forEach((b) => b.onclick = async () => { try { const r = await appelApi(`/api/video/${b.dataset.ouvrir}`); ouvrir(r.video); } catch (e) { notifier(e.message, true); } });
      g.querySelectorAll("[data-suppr]").forEach((b) => b.onclick = async () => {
        if (b.dataset.confirme !== "1") { b.dataset.confirme = "1"; b.textContent = "Confirmer ?"; setTimeout(() => { b.dataset.confirme = ""; b.textContent = "Supprimer"; }, 4000); return; }
        try { await appelApi(`/api/video/${b.dataset.suppr}/supprimer`, "POST", {}); if (courante?.id === b.dataset.suppr) { $v("vv-travail").hidden = true; courante = null; } chargerGalerie(); } catch (e) { notifier(e.message, true); }
      });
      // une fabrication en cours et rien d'ouvert : on l'affiche (retour sur la page pendant la fabrication)
      const enCours = videos.find((v) => EN_COURS.includes(v.statut));
      if (enCours && !courante) { const r = await appelApi(`/api/video/${enCours.id}`); ouvrir(r.video); }
    } catch (e) { $v("vv-galerie").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
  }

  // ---------------------------------------------------------------- coordonnées du cabinet
  function afficherCoordonnees() {
    const c = reglages.coordonnees, z = $v("vv-coord-corps"), ro = !reglages.admin ? "disabled" : "";
    z.innerHTML = `${c.fictives ? `<p class="conformite" style="margin-top:10px">Coordonnées <strong>fictives</strong> pour l'instant (contact@example.com, 06 39 98 12 34 : numéro réservé à la fiction par l'Arcep). Remplacez-les par les vraies avant de publier.</p>` : ""}
      <div class="vv-champs" style="margin-top:10px">
        <label><span>Nom affiché</span><input id="vc-cabinet" value="${echapper(c.cabinet)}" maxlength="30" ${ro}></label>
        <label><span>Activité</span><input id="vc-activite" value="${echapper(c.activite)}" maxlength="44" ${ro}></label>
        <label><span>E-mail</span><input id="vc-mail" type="email" value="${echapper(c.fictives ? "" : c.mail)}" placeholder="${echapper(c.mail)}" maxlength="60" ${ro}></label>
        <label><span>Téléphone</span><input id="vc-tel" value="${echapper(c.fictives ? "" : c.telephone)}" placeholder="${echapper(c.telephone)}" maxlength="24" ${ro}></label>
      </div>
      ${reglages.admin ? `<div class="actions"><button type="button" class="bouton" id="vc-ok">Enregistrer pour toute l'équipe</button>${c.fictives ? "" : `<button type="button" class="bouton bouton-discret" id="vc-fictif">Revenir aux coordonnées fictives</button>`}</div>` : `<p class="doux petit">Seul l'administrateur peut modifier ces coordonnées.</p>`}`;
    if (!reglages.admin) return;
    $v("vc-ok").onclick = async () => {
      try { const r = await appelApi("/api/video/reglages", "POST", { cabinet: $v("vc-cabinet").value, activite: $v("vc-activite").value, mail: $v("vc-mail").value, telephone: $v("vc-tel").value }); reglages.coordonnees = r.coordonnees; afficherCoordonnees(); notifier("Coordonnées enregistrées : elles figureront sur les prochaines vidéos."); }
      catch (e) { notifier(e.message, true); }
    };
    const f = $v("vc-fictif"); if (f) f.onclick = async () => { const r = await appelApi("/api/video/reglages", "POST", { fictives: true }); reglages.coordonnees = r.coordonnees; afficherCoordonnees(); };
  }

  window.demarrerVideo = async () => {
    if ($v("vv-nouvelle")) { chargerGalerie(); return; }
    monter(); majReglages();
    try { reglages = await appelApi("/api/video/reglages"); majReglages(); afficherCoordonnees(); } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    chargerGalerie();
  };
})();
