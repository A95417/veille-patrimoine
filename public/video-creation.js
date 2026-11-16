// Création Post › Vidéo : modèle et réglages → scénario proposé par l'IA (modifiable) → fabrication par le robot
// (suivi en direct avec temps restant) → lecture, téléchargement, miniature, sous-titres, texte de publication. Galerie.
(() => {
  const $v = (id) => document.getElementById(id);
  // Menu « Sujet » : fiches Apprendre (par thème), actualités, échéances, chiffres, simulation, sujet libre.
  const THEMES = { epargne: "Épargne", immo: "Immobilier", marches: "Marchés", fisc: "Fiscalité", transmission: "Transmission", regl: "Réglementation", economie: "Économie", crypto: "Crypto" };
  const ANGLES_LIB = { expliquer: "Expliquer simplement", mythe: "Mythe ou réalité ?", reflexes: "3 réflexes à avoir", chiffre: "Le chiffre clé", deux_profils: "Histoire de deux profils", erreur: "Erreur fréquente à éviter" };
  const ANGLE_DEFAUT = { fiche: "expliquer", actu: "expliquer", echeance: "reflexes", chiffre: "chiffre", simulation: "deux_profils", libre: "expliquer" };
  const NOMS_SOURCES = { fiche: "Fiche Apprendre", actu: "Actualité", echeance: "Échéance fiscale", chiffre: "Chiffre de la semaine", simulation: "Commencer tôt ou attendre", libre: "Sujet libre",
    deux_profils: "Deux profils", chiffre_semaine: "Chiffre de la semaine", mythe: "Mythe ou réalité" };
  const sansAccent = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const LES_FICHES = () => (typeof FICHES !== "undefined" ? FICHES : []);
  // Contenu vérifié d'une fiche, envoyé à l'IA comme source (ses chiffres sont alors autorisés).
  function texteFiche(f) {
    const l = [f.titre + (f.sousTitre ? " — " + f.sousTitre : ""), f.enUnePhrase || ""];
    (f.chiffres || []).forEach((c) => l.push(`Chiffre : ${c.valeur} ${c.libelle}`));
    (f.essentiel || []).forEach((e) => l.push(`${e.titre} : ${e.texte}`));
    (f.pieges || []).forEach((p) => l.push("Piège : " + p));
    (f.vraiFaux || []).forEach((v) => l.push(`${v.vrai ? "Vrai" : "Faux"} : ${v.texte} ${v.explication || ""}`));
    return l.join("\n").slice(0, 5000);
  }
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
  const EXTRAITS = new Set(["sadachbia", "fenrir", "kore", "charon", "zephyr", "laomedeia", "leda", "achird", "puck", "sulafat", "orus", "gacrux"]);
  const LIB_STATUT = { brouillon: "Brouillon", file: "En file d'attente", attente: "Démarrage", en_cours: "En fabrication", pret: "Prête", a_verifier: "Prête · à vérifier", erreur: "Échec", annule: "Annulée" };
  const EN_COURS = ["file", "attente", "en_cours"];
  const R = { sel: null, onglet: "idees", titreIdee: null, angle: "expliquer", angleManuel: false, angleIA: false, cherche: "", duree: 45, format: "9:16", voix: "Sadachbia", sim: { mensuel: 100, taux: 4, age1: 25, age2: 35, age_fin: 65 } };
  let reglages = null, sources = null, courante = null, suivi = null, chrono = null, audio = null;

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

  // ---------------------------------------------------------------- squelette : un parcours en 3 étapes
  const ANGLES_DESC = {
    expliquer: "L'enjeu, comment ça marche, ce qu'il faut retenir.",
    mythe: "Une idée reçue, puis la réalité.",
    reflexes: "Trois réflexes concrets et prudents.",
    chiffre: "Toute la vidéo autour d'un chiffre de la source.",
    deux_profils: "Deux personnages, deux choix, deux résultats.",
    erreur: "Une erreur courante, ce qu'elle coûte, puis le bon réflexe.",
  };
  const ONGLETS_SUJET = [["idees", "💡 Idées du moment"], ["fiches", "🎓 Fiches Apprendre"], ["actus", "📰 Actualités"], ["chiffres", "📅 Échéances et chiffres"], ["autre", "✏️ Autre"]];

  function monter() {
    $v("vue-video").innerHTML = `
      <section class="carte vv-form" id="vv-nouvelle">
        <div class="vv-intro">
          <h2>Créer une vidéo courte</h2>
          <p class="doux">TikTok, Reels ou LinkedIn. L'IA écrit le scénario, vous le relisez avant la fabrication.</p>
        </div>

        <div class="vv-etape" id="vv-e1">
          <h3 class="vv-etape-tete"><span class="n" aria-hidden="true">1</span>De quoi parle la vidéo ?</h3>
          <div class="vv-etape-corps">
            <div class="vv-choisi" id="vv-choisi" hidden></div>
            <div id="vv-choix-sujet">
              <div class="vv-onglets" role="tablist" aria-label="Type de sujet">${ONGLETS_SUJET.map(([k, l]) => `<button type="button" role="tab" id="vv-tab-${k}" aria-controls="vv-panneau" data-tab="${k}">${l}</button>`).join("")}</div>
              <div class="vv-panneau" id="vv-panneau" role="tabpanel"></div>
            </div>
            <div id="vv-sim" class="vv-sim" hidden></div>
          </div>
        </div>

        <div class="vv-etape" id="vv-e2">
          <h3 class="vv-etape-tete"><span class="n" aria-hidden="true">2</span>Comment la raconter ?</h3>
          <div class="vv-etape-corps">
            <div class="vv-angles" role="group" aria-label="Angle de la vidéo">${Object.entries(ANGLES_LIB).map(([k, l]) => `<button type="button" class="puce" data-angle="${k}">${l}</button>`).join("")}</div>
            <p class="vv-angle-desc" id="vv-angle-desc"></p>
            <label class="bloc-lib" for="vv-precision">Précision <span class="doux" id="vv-precision-note">(facultatif)</span></label>
            <input id="vv-precision" maxlength="300" autocomplete="off" placeholder="Ex. : pour les jeunes actifs, ton rassurant…">
            <p class="alerte-donnees">Jamais de nom ni d'information sur un client : ce texte est envoyé à l'IA (Gemini).</p>
          </div>
        </div>

        <div class="vv-etape" id="vv-e3">
          <h3 class="vv-etape-tete"><span class="n" aria-hidden="true">3</span>Réglages</h3>
          <div class="vv-etape-corps">
            <details class="vv-reglages" id="vv-reglages">
              <summary><span id="vv-resume-reglages"></span><span class="vv-modifier">Modifier</span></summary>
              <div class="vv-reglages-corps">
                <div class="reglages">
                  <div><span class="simu-lib">Durée</span><div class="puces">${[30, 45, 60].map((d) => `<button type="button" class="puce" data-duree="${d}">${d} s</button>`).join("")}</div></div>
                  <div><span class="simu-lib">Format</span><div class="puces"><button type="button" class="puce" data-format-v="9:16">9:16 · TikTok, Reels</button><button type="button" class="puce" data-format-v="4:5">4:5 · LinkedIn</button></div></div>
                </div>
                <span class="simu-lib">Voix</span><div id="vv-voix"></div>
                <details class="vv-coord" id="vv-coord"><summary>Carte de fin : <span id="vv-coord-resume">coordonnées du cabinet</span></summary><div id="vv-coord-corps"></div></details>
              </div>
            </details>
          </div>
        </div>

        <div class="vv-action">
          <button type="button" class="bouton gros-bouton" id="vv-proposer">✨ Proposer un scénario</button>
          <span class="doux petit" id="vv-quota"></span>
        </div>
        <div id="vv-msg" aria-live="polite"></div>
      </section>
      <section class="carte" id="vv-travail" hidden></section>
      <section class="carte" id="vv-galerie-bloc">
        <div class="vv-galerie-tete"><h2>Mes vidéos</h2><span class="doux petit">Les 10 dernières vidéos terminées sont gardées.</span></div>
        <div class="vv-galerie" id="vv-galerie"><div class="attente"><span class="rond"></span>Chargement…</div></div>
      </section>`;
    document.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { R.onglet = b.dataset.tab; R.cherche = ""; afficherPanneau(); });
    // flèches gauche/droite entre les onglets (clavier)
    $v("vv-choix-sujet").querySelector(".vv-onglets").onkeydown = (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const l = ONGLETS_SUJET.map(([k]) => k), i = (l.indexOf(R.onglet) + (e.key === "ArrowRight" ? 1 : l.length - 1)) % l.length;
      R.onglet = l[i]; R.cherche = ""; afficherPanneau(); $v("vv-tab-" + l[i]).focus();
    };
    document.querySelectorAll("[data-angle]").forEach((b) => b.onclick = () => { R.angle = b.dataset.angle; R.angleManuel = true; majAngle(); });
    document.querySelectorAll("[data-duree]").forEach((b) => b.onclick = () => { R.duree = +b.dataset.duree; majReglages(); });
    document.querySelectorAll("[data-format-v]").forEach((b) => b.onclick = () => { R.format = b.dataset.formatV; majReglages(); });
    $v("vv-precision").oninput = majEtat;
    $v("vv-proposer").onclick = proposer;
  }

  function majReglages() {
    document.querySelectorAll("[data-duree]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.duree === R.duree));
    document.querySelectorAll("[data-format-v]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.formatV === R.format));
    $v("vv-resume-reglages").innerHTML = `<b>${R.duree} s</b> · ${R.format === "4:5" ? "4:5 LinkedIn" : "9:16 TikTok, Reels"} · voix ${R.voix}`;
    const voix = reglages?.voix || ["Sadachbia"];
    $v("vv-voix").innerHTML = ["Dynamiques", "Posées"].map((gr) => `<div class="vv-voix-groupe"><span class="petit doux">${gr}</span><div class="puces">${voix.filter((n) => (VOIX_INFO[n]?.[0] || "Posées") === gr).map((n) => `<span class="vv-voix"><button type="button" class="puce" data-voix="${n}" aria-pressed="${n === R.voix}">${n} <small>· ${VOIX_INFO[n]?.[1] || ""}</small></button>${EXTRAITS.has(n.toLowerCase()) ? `<button type="button" class="vv-ecoute" data-ecoute="${n}" aria-label="Écouter la voix ${n}" title="Écouter">▶</button>` : `<span class="vv-bientot" title="Extrait disponible prochainement">bientôt</span>`}</span>`).join("")}</div></div>`).join("");
    document.querySelectorAll("[data-voix]").forEach((b) => b.onclick = () => { R.voix = b.dataset.voix; majReglages(); });
    document.querySelectorAll("[data-ecoute]").forEach((b) => b.onclick = () => {
      if (audio) { audio.pause(); }
      audio = new Audio(`/voix/${b.dataset.ecoute.toLowerCase()}.m4a`); audio.play().catch(() => notifier("Lecture impossible sur cet appareil.", true));
    });
    majSimulation();
    majCompteurs();
  }

  // Réglages de la simulation « commencer tôt ou attendre » (seulement si ce sujet est choisi).
  function majSimulation() {
    const sim = $v("vv-sim");
    if (R.sel !== "simulation") { sim.hidden = true; sim.innerHTML = ""; return; }
    const s = R.sim, r = simuler(s);
    sim.hidden = false;
    sim.innerHTML = `<div class="vv-sim-grille">
      ${[["mensuel", "Épargne par mois (€)", 10, 5000, 10], ["taux", "Rendement fictif (%/an)", 0, 10, .5], ["age1", "Profil 1 commence à", 16, 80, 1], ["age2", "Profil 2 commence à", 17, 85, 1], ["age_fin", "Jusqu'à l'âge de", 20, 90, 1]]
        .map(([k, l, mi, ma, pas]) => `<label><span>${l}</span><input type="number" inputmode="decimal" data-sim="${k}" value="${s[k]}" min="${mi}" max="${ma}" step="${pas}"></label>`).join("")}</div>
      <p class="vv-sim-res"><strong>≈ ${nbFr(r.a)} €</strong> contre <strong>≈ ${nbFr(r.b)} €</strong> : <strong>${nbFr(r.ecart)} € d'écart</strong> pour ${nbFr(r.va - r.vb)} € versés en plus. <span class="doux">Calcul du site, exemple fictif, rendement non garanti.</span></p>`;
    sim.querySelectorAll("[data-sim]").forEach((i) => i.onchange = () => {
      const v = parseFloat(String(i.value).replace(",", "."));
      if (Number.isFinite(v)) R.sim[i.dataset.sim] = Math.max(+i.min, Math.min(+i.max, v));
      if (R.sim.age2 <= R.sim.age1) R.sim.age2 = R.sim.age1 + 1;
      if (R.sim.age_fin <= R.sim.age2) R.sim.age_fin = R.sim.age2 + 1;
      majSimulation();
    });
  }

  // Compteurs : limite personnelle et voix restantes pour toute l'équipe (quota gratuit partagé).
  function majCompteurs() {
    if (!reglages || $v("vv-quota").dataset.manque) return;
    const z = $v("vv-quota"), reste = reglages.restant_equipe, plein = reglages.lancees_aujourdhui >= reglages.limite_personne;
    z.innerHTML = `<span class="vv-compteur${plein ? " ko" : ""}">${reglages.lancees_aujourdhui}/${reglages.limite_personne} vidéos aujourd'hui</span>`
      + (reste <= 0 ? `<span class="vv-equipe ko">Quota de voix épuisé pour toute l'équipe : retour demain matin.</span>`
        : reste <= 4 ? `<span class="vv-equipe">Plus que ${reste} vidéo${reste > 1 ? "s" : ""} possible${reste > 1 ? "s" : ""} aujourd'hui pour toute l'équipe.</span>` : "");
  }

  // ---------------------------------------------------------------- étape 1 : le sujet
  function dateCourte(d) { try { const x = new Date(d); return Number.isNaN(+x) ? d : x.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); } catch { return d; } }
  const ligne = (v, titre, sous, extra = "") => `<button type="button" class="vv-ligne" data-sujet="${echapper(v)}" aria-pressed="${v === R.sel}"><strong>${echapper(titre)}</strong>${sous ? `<span>${echapper(sous)}</span>` : ""}${extra}</button>`;
  const vide = (t) => `<p class="doux petit vv-vide">${t}</p>`;
  const chargement = () => (sources ? "" : `<div class="attente petit"><span class="rond"></span>Chargement…</div>`);

  function afficherPanneau() {
    document.querySelectorAll("[data-tab]").forEach((b) => { const on = b.dataset.tab === R.onglet; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    $v("vv-panneau").setAttribute("aria-labelledby", "vv-tab-" + R.onglet);
    const z = $v("vv-panneau");
    let h = "";
    if (R.onglet === "idees") {
      const idees = sources?.idees || [];
      h = chargement() || (idees.length ? `<div class="vv-idees">${idees.map((i, k) => `<button type="button" class="vv-idee" data-idee="${k}"><strong>${echapper(i.titre)}</strong><span class="vv-tag">${ANGLES_LIB[i.angle] || ANGLES_LIB.expliquer}</span></button>`).join("")}</div>
        <p class="doux petit vv-note">${sources.simple ? "Les plus grosses actualités du moment (idées de l'IA indisponibles pour l'instant)." : "Proposées par l'IA à partir des grosses actualités du site, mises à jour toutes les 4 heures."}</p>`
        : vide("Pas d'actualité marquante pour l'instant : choisissez une fiche Apprendre ou un autre sujet."));
    } else if (R.onglet === "fiches") {
      const q = sansAccent(R.cherche).trim().split(/\s+/).filter(Boolean);
      const ok = (f) => q.every((m) => sansAccent(`${f.titre} ${f.sousTitre || ""} ${THEMES[f.theme] || ""} ${f.recherche || ""}`).includes(m));
      const groupes = Object.entries(THEMES).map(([t, nom]) => [nom, LES_FICHES().filter((f) => f.theme === t && ok(f))]).filter(([, l]) => l.length);
      h = `<input type="search" class="vv-cherche" id="vv-cherche" placeholder="🔍 Rechercher une fiche : PER, donation, SCPI…" aria-label="Rechercher une fiche" autocomplete="off" value="${echapper(R.cherche)}">
        <div class="vv-liste">${groupes.length ? groupes.map(([nom, l]) => `<div class="vv-groupe"><span class="vv-groupe-nom">${nom}</span>${l.map((f) => ligne(`fiche:${f.id}`, f.titre, f.sousTitre)).join("")}</div>`).join("") : vide("Aucune fiche ne correspond.")}</div>`;
    } else if (R.onglet === "actus") {
      const a = sources?.actus || [];
      h = chargement() || (a.length ? `<div class="vv-liste">${a.map((x) => ligne(`actu:${x.id}`, x.titre, [x.sources.join(", "), dateCourte(x.date)].filter(Boolean).join(" · "))).join("")}</div>` : vide("Aucune actualité importante ces derniers jours."));
    } else if (R.onglet === "chiffres") {
      const e = sources?.echeances || [], c = sources?.chiffres || [];
      h = chargement() || `<div class="vv-liste">
        <div class="vv-groupe"><span class="vv-groupe-nom">Échéances fiscales · impots.gouv.fr</span>${e.length ? e.map((x) => ligne(`echeance:${x.ref}`, x.titre, dateCourte(x.date))).join("") : vide("Calendrier pas encore disponible.")}</div>
        <div class="vv-groupe"><span class="vv-groupe-nom">Chiffres de la semaine · BCE</span>${c.length ? ligne("chiffre:", "Taux et inflation : vue d'ensemble", "Tous les derniers chiffres") + c.map((x) => ligne(`chiffre:${x.ref}`, x.libelle, `${String(x.valeur).replace(".", ",")} %${x.date ? " · " + x.date : ""}`)).join("") : vide("Chiffres pas encore disponibles.")}</div>
      </div>`;
    } else {
      h = `<div class="vv-idees">
        <button type="button" class="vv-idee" data-sujet="simulation"><strong>👥 Commencer tôt ou attendre</strong><span class="petit doux">Deux profils, une simulation chiffrée par le site (exemple fictif).</span></button>
        <button type="button" class="vv-idee" data-sujet="libre"><strong>✏️ Mon propre sujet</strong><span class="petit doux">Vous le décrivez à l'étape 2. L'IA ne citera aucun chiffre.</span></button>
      </div>`;
    }
    z.innerHTML = h;
    z.querySelectorAll("[data-sujet]").forEach((b) => b.onclick = () => choisirSujet(b.dataset.sujet));
    z.querySelectorAll("[data-idee]").forEach((b) => b.onclick = () => {
      const i = sources.idees[+b.dataset.idee];
      choisirSujet(`actu:${i.sujet_id}`, { angle: i.angle || "expliquer", ia: !sources.simple, titre: i.titre });
      // le titre de l'idée sert de précision (modifiable), seulement si le champ est vide
      if (!sources.simple && !$v("vv-precision").value) { $v("vv-precision").value = R.precisionAuto = i.titre; majEtat(); }
    });
    const c = $v("vv-cherche");
    if (c) c.oninput = () => { R.cherche = c.value; const pos = c.selectionStart; afficherPanneau(); const n = $v("vv-cherche"); n.focus(); n.setSelectionRange(pos, pos); };
  }

  // Titre et source du sujet choisi (bandeau « ✓ Sujet »).
  function decrireSujet() {
    const [type, ref] = (R.sel || "").split(/:(.*)/s);
    if (type === "fiche") { const f = LES_FICHES().find((x) => x.id === ref); return f && { ico: "🎓", titre: f.titre, source: `Fiche Apprendre vérifiée le ${f.verifie || "—"} : ses chiffres sont autorisés et elle sera citée.` }; }
    if (type === "actu") { const a = sources?.actus?.find((x) => x.id === ref); return { ico: "📰", titre: a?.titre || R.titreIdee || "Actualité du moment", source: `Résumé du site (parties gratuites des articles)${a?.sources?.length ? " · source citée : " + a.sources.join(", ") : ""}.` }; }
    if (type === "echeance") { const e = sources?.echeances?.find((x) => x.ref === ref); return { ico: "📅", titre: e ? `${e.titre} (${dateCourte(e.date)})` : "Échéance fiscale", source: "Calendrier officiel (impots.gouv.fr, service-public.gouv.fr)." }; }
    if (type === "chiffre") return { ico: "📈", titre: ref || "Taux et inflation : vue d'ensemble", source: "Derniers chiffres publiés par la BCE (page Marchés)." };
    if (type === "simulation") return { ico: "👥", titre: "Commencer tôt ou attendre", source: "Chiffres calculés par le site, présentés comme exemple fictif." };
    if (type === "libre") return { ico: "✏️", titre: "Mon propre sujet", source: "À décrire à l'étape 2. Sans source, l'IA ne citera aucun chiffre." };
    return null;
  }

  function choisirSujet(v, opts = {}) {
    R.sel = v; R.titreIdee = opts.titre || null;
    // une précision remplie automatiquement par une idée ne suit pas vers un autre sujet
    if (R.precisionAuto && $v("vv-precision").value === R.precisionAuto) $v("vv-precision").value = "";
    R.precisionAuto = null;
    const type = v.split(":")[0];
    if (opts.angle) { R.angle = opts.angle; R.angleIA = !!opts.ia; R.angleManuel = false; }
    else if (!R.angleManuel) { R.angle = ANGLE_DEFAUT[type] || "expliquer"; R.angleIA = false; }
    afficherChoisi(); majAngle(); majSimulation(); majEtat();
    if (type === "libre") setTimeout(() => $v("vv-precision").focus(), 50);
  }

  function afficherChoisi() {
    const d = decrireSujet(), z = $v("vv-choisi");
    if (!d) { z.hidden = true; $v("vv-choix-sujet").hidden = false; afficherPanneau(); return; }
    z.hidden = false; $v("vv-choix-sujet").hidden = true;
    z.innerHTML = `<span class="vv-choisi-ico" aria-hidden="true">${d.ico}</span><div><strong>${echapper(d.titre)}</strong><span>${echapper(d.source)}</span></div><button type="button" class="bouton bouton-discret" id="vv-changer">Changer</button>`;
    $v("vv-changer").onclick = () => { $v("vv-choix-sujet").hidden = false; z.hidden = true; afficherPanneau(); $v("vv-tab-" + R.onglet).focus(); };
  }

  // ---------------------------------------------------------------- étape 2 : l'angle
  function majAngle() {
    document.querySelectorAll("[data-angle]").forEach((b) => {
      const on = b.dataset.angle === R.angle;
      b.setAttribute("aria-pressed", on);
      b.classList.toggle("vv-conseille", !R.angleManuel && on);
    });
    $v("vv-angle-desc").innerHTML = `${ANGLES_DESC[R.angle] || ""}${!R.angleManuel ? ` <span class="vv-suggere">✨ ${R.angleIA ? "suggéré par l'IA" : "conseillé pour ce sujet"}</span>` : ""}`;
  }

  // Étapes 2 et 3 actives seulement une fois le sujet choisi ; bouton prêt quand tout est complet.
  function majEtat() {
    const choisi = !!R.sel, libre = (R.sel || "").startsWith("libre");
    ["vv-e2", "vv-e3"].forEach((id) => { $v(id).classList.toggle("vv-attente", !choisi); $v(id).querySelector(".vv-etape-corps").hidden = !choisi; });
    $v("vv-e1").classList.toggle("vv-faite", choisi);
    $v("vv-precision-note").textContent = libre ? "(obligatoire : décrivez votre sujet)" : "(facultatif)";
    $v("vv-precision").placeholder = libre ? "Ex. : pourquoi épargner chaque mois plutôt qu'attendre le bon moment" : "Ex. : pour les jeunes actifs, ton rassurant…";
    const manque = !choisi ? "Choisissez d'abord un sujet (étape 1)." : libre && !$v("vv-precision").value.trim() ? "Décrivez votre sujet dans « Précision »." : "";
    const b = $v("vv-proposer");
    b.disabled = !!manque || b.dataset.occupe === "1";
    b.title = manque;
    $v("vv-quota").dataset.manque = manque;
    if (manque) $v("vv-quota").innerHTML = `<span class="vv-equipe">${manque}</span>`; else majCompteurs();
  }

  // ---------------------------------------------------------------- scénario
  async function proposer() {
    const b = $v("vv-proposer");
    if (!R.sel) return;
    b.disabled = true; b.dataset.occupe = "1";
    $v("vv-msg").innerHTML = `<div class="attente"><span class="rond"></span>L'IA écrit le scénario, 10 à 40 secondes…</div>`;
    try {
      const [type, ref] = R.sel.split(/:(.*)/s);
      const corps = { source: type, ref: ref || "", angle: R.angle, precision: $v("vv-precision").value, duree: R.duree, format: R.format, voix: R.voix, simulation: R.sim };
      if (type === "fiche") { const f = LES_FICHES().find((x) => x.id === ref); if (f) corps.fiche = { id: f.id, titre: f.titre, verifie: f.verifie, contenu: texteFiche(f) }; }
      const r = await appelApi("/api/video/scenario", "POST", corps);
      $v("vv-msg").innerHTML = "";
      ouvrir(r.video); chargerGalerie();
    } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    b.dataset.occupe = ""; majEtat();
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
      <p class="doux petit">La fabrication tourne sur un robot gratuit (GitHub) : vous pouvez fermer la page, la vidéo arrivera dans « Mes vidéos ». ${reglages ? `${reglages.lancees_aujourdhui}/${reglages.limite_personne} aujourd'hui${reglages.restant_equipe <= 4 ? ` · plus que ${reglages.restant_equipe} pour toute l'équipe` : ""}.` : ""}</p>
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
      if (!videos.length) { g.innerHTML = `<p class="doux">Aucune vidéo pour l'instant. Choisissez un sujet ci-dessus.</p>`; return; }
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
    $v("vv-coord-resume").textContent = `${c.cabinet} · ${c.mail}${c.fictives ? " (fictives)" : ""}`;
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
    // ?video_fiche=ID (bouton « Faire une vidéo » d'une fiche Apprendre) : la fiche est présélectionnée.
    const q = new URLSearchParams(location.search).get("video_fiche");
    monter(); majReglages(); majAngle();
    if (q && LES_FICHES().some((f) => f.id === q)) { R.onglet = "fiches"; choisirSujet(`fiche:${q}`); } else afficherChoisi();
    majEtat();
    appelApi("/api/video/idees").then((s) => { sources = s; }).catch(() => { sources = { idees: [], actus: [], echeances: [], chiffres: [] }; })
      .then(() => { if (R.sel) afficherChoisi(); else afficherPanneau(); });
    try { reglages = await appelApi("/api/video/reglages"); majReglages(); afficherCoordonnees(); } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    chargerGalerie();
  };
})();
