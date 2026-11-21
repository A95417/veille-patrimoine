// Création Post › Vidéo : modèle et réglages → scénario proposé par l'IA (modifiable) → fabrication par le robot
// (suivi en direct avec temps restant) → lecture, téléchargement, miniature, sous-titres, texte de publication. Galerie.
(() => {
  const $v = (id) => document.getElementById(id);
  // Menu « Sujet » : fiches Apprendre (par thème), actualités, échéances, chiffres, simulation, sujet libre.
  const THEMES = { epargne: "Épargne", immo: "Immobilier", marches: "Marchés", fisc: "Fiscalité", transmission: "Transmission", regl: "Réglementation", economie: "Économie", crypto: "Crypto" };
  // Façons de raconter, par famille : [clé, libellé, description, exemple].
  const FAMILLES = [
    ["Comprendre", [
      ["expliquer", "Expliquer simplement", "L'enjeu, comment ça marche, ce qu'il faut retenir.", "« Le PER en 45 secondes »"],
      ["decryptage", "Décryptage en profondeur", "On rentre dans le détail : règles, conditions, exceptions, exemples. Idéal en 1 min 30 ou 2 min.", "« Sortir de son PER : tout ce qu'il faut savoir »"],
      ["mode_emploi", "Mode d'emploi étape par étape", "La démarche dans l'ordre : quoi faire, quand, quoi vérifier.", "« Faire une donation : les 4 étapes »"],
      ["questions", "Questions-réponses", "3 à 5 questions que le public se pose, chacune avec sa réponse claire.", "« Assurance-vie : vos 4 questions »"]]],
    ["Capter l'attention", [
      ["mythe", "Mythe ou réalité ?", "Une ou plusieurs idées reçues, puis la réalité.", "« L'assurance-vie est bloquée 8 ans ? Faux. »"],
      ["saviez", "Le saviez-vous ?", "Des faits peu connus mais exacts, révélés comme une surprise.", "« 3 choses que peu de gens savent sur le PEA »"],
      ["chiffre", "Le chiffre clé", "Toute la vidéo autour d'un chiffre de la source.", "« 100 000 € : le chiffre à connaître »"],
      ["chiffres_cles", "Les chiffres à connaître", "3 à 5 chiffres de la source, un par scène, expliqués simplement.", "« IFI : les 4 chiffres à retenir »"]]],
    ["Raconter", [
      ["deux_profils", "Histoire de deux profils", "Deux personnages, deux choix, deux résultats.", "« Léa commence à 25 ans, Tom attend »"],
      ["cas_pratique", "Cas pratique fictif", "Un personnage suivi du début à la fin : sa situation, ce qu'il découvre.", "« Michel prépare sa transmission »"],
      ["erreur", "Erreur fréquente à éviter", "Une erreur courante, ce qu'elle coûte, puis le bon réflexe.", "« L'erreur à ne pas faire avec son PER »"]]],
    ["Agir", [
      ["reflexes", "3 réflexes à avoir", "Trois réflexes concrets et prudents.", "« 3 réflexes avant d'investir en SCPI »"],
      ["bon_moment", "Le bon moment pour agir", "Quand agir : dates, délais, moments de vie (uniquement d'après la source).", "« Déclaration de revenus : le calendrier »"],
      ["comparer", "Comparer deux solutions", "Points communs et différences, sans recommander l'une ou l'autre.", "« PER ou assurance-vie : ce qui change »"]]],
  ];
  const ANGLES_LIB = Object.fromEntries(FAMILLES.flatMap(([, l]) => l.map(([k, n]) => [k, n])));
  const DUREES = [[30, "30 s"], [45, "45 s"], [60, "1 min"], [90, "1 min 30"], [120, "2 min"]];
  const dureeLib = (d) => (DUREES.find(([x]) => x === d) || [0, d + " s"])[1];
  const PLATEFORMES = { tiktok: ["TikTok", "9:16"], reels: ["Instagram Reels", "9:16"], insta: ["Instagram publication", "4:5"], fb_reels: ["Facebook Reels", "9:16"], facebook: ["Facebook publication", "4:5"], linkedin: ["LinkedIn", "4:5"] };
  const RYTHMES = { dynamique: ["Dynamique", "enchaînements rapides"], pose: ["Posé", "plus de respiration, une idée par scène"] };
  const MODES_FIN = { complete: ["Carte du cabinet complète", "question, offre et coordonnées"], courte: ["Fin courte", "logo et coordonnées, environ 2 s"], sans: ["Sans appel commercial", "logo et mentions obligatoires seulement"] };
  const ANGLE_DEFAUT = { fiche: "expliquer", actu: "expliquer", echeance: "reflexes", chiffre: "chiffre", simulation: "deux_profils", libre: "expliquer" };
  const NOMS_SOURCES = { fiche: "Fiche Apprendre", actu: "Actualité", echeance: "Échéance fiscale", chiffre: "Chiffre de la semaine", simulation: "Commencer tôt ou attendre", libre: "Sujet libre",
    deux_profils: "Deux profils", chiffre_semaine: "Chiffre de la semaine", mythe: "Mythe ou réalité" };
  const sansAccent = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const LES_FICHES = () => (typeof FICHES !== "undefined" ? FICHES : []);
  // Contenu vérifié d'une fiche, envoyé à l'IA comme source (ses chiffres sont alors autorisés).
  // La fiche est écrite pour des conseillers : les rubriques sont renommées pour une vidéo grand public (l'IA reformule en « vous »).
  // Le point précis choisi passe en tête (il n'est jamais coupé).
  function partiesFiche(f) {
    const P = [];
    (f.essentiel || []).forEach((e) => P.push([e.titre, `${e.titre} : ${e.texte}`]));
    if ((f.chiffres || []).length) P.push(["Les chiffres clés", "Chiffres clés :\n" + f.chiffres.map((c) => `- ${c.valeur} ${c.libelle}`).join("\n")]);
    if ((f.schema || []).length) P.push(["Comment ça marche, étape par étape", "Étapes :\n" + f.schema.map((e, i) => `${i + 1}. ${e.titre} : ${e.texte}`).join("\n")]);
    (f.fiscalite || []).forEach((t) => P.push([`Fiscalité : ${t.titre}`, `Fiscalité — ${t.titre} (${(t.colonnes || []).join(" | ")}) :\n` + (t.lignes || []).map((l) => "- " + l.join(" | ")).join("\n")]));
    if ((f.pourQui || []).length || (f.pasPourQui || []).length) P.push(["Pour qui ?", `Profils pour qui c'est adapté (à dire au public en « vous ») :\n${(f.pourQui || []).map((x) => "- " + x).join("\n")}\nMoins adapté quand :\n${(f.pasPourQui || []).map((x) => "- " + x).join("\n")}`]);
    if ((f.pieges || []).length) P.push(["Les points de vigilance", "Points de vigilance (erreurs fréquentes) :\n" + f.pieges.map((x) => "- " + x).join("\n")]);
    if ((f.vraiFaux || []).length) P.push(["Les idées reçues", "Idées reçues et réalité :\n" + f.vraiFaux.map((v) => `- « ${v.texte} » : ${v.vrai ? "exact" : "faux"}. ${v.explication || ""}`).join("\n")]);
    if (f.cas?.enonce) P.push(["Un exemple concret", `Exemple (personnage fictif) : ${f.cas.enonce} ${f.cas.question || ""} ${f.cas.reponse || ""}`]);
    return P;
  }
  function texteFiche(f, focus) {
    const P = partiesFiche(f), un = P.find(([t]) => t === focus);
    const l = [f.titre + (f.sousTitre ? " — " + f.sousTitre : ""), f.enUnePhrase || "", ...(un ? [un[1]] : []), ...P.filter((x) => x !== un).map(([, t]) => t)];
    return l.join("\n").slice(0, 8000);
  }
  const NOMS_TYPES = { accroche: "Accroche", personnage: "Personnage", marche: "Marchés", calendrier: "Le temps passe", comparaison: "Comparaison chiffrée", egalite: "Même effort", grand_mot: "Mot géant", bocaux: "Chaque situation est unique", chiffre: "Chiffre clé", liste: "Liste", mythe: "Idée reçue", sablier: "Sablier", frise: "Frise (étapes)", tableau: "Tableau", recap: "Récapitulatif", chapitre: "Nouvelle partie", fin: "Carte de fin" };
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
    frise: [["titre", "Titre"]], tableau: [["titre", "Titre"]], recap: [["titre", "Titre"]], chapitre: [["titre", "Titre de la partie"], ["sous_titre", "Sous-titre"]],
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
  const R = { sel: null, onglet: "idees", titreIdee: null, angle: "expliquer", angleManuel: false, angleIA: false, cherche: "", duree: 45, format: "9:16", plateforme: "tiktok", rythme: "dynamique", finMode: "complete", focus: "", voix: "Sadachbia", sim: { mensuel: 100, taux: 4, age1: 25, age2: 35, age_fin: 65 } };
  let reglages = null, sources = null, courante = null, suivi = null, chrono = null, audio = null;

  const mots = (sc) => (sc || []).reduce((n, s) => n + String(s.texte || "").split(/\s+/).filter((m) => /[\p{L}\d]/u.test(m)).length, 0);
  const dureeEst = (sc) => (window.VideoApercu ? VideoApercu.dureeEstimee(sc || []) : Math.round(mots(sc) / 2.68 + 3.6));
  const fabrication = (sc) => 75 + dureeEst(sc) * 30 / 22 + 50;   // démarrage du robot + images + son/montage/envoi (secondes)
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`; };
  const nbFr = (n) => Math.round(n).toLocaleString("fr-FR");
  function simuler(s) {
    const m = +s.mensuel || 100, i = (+s.taux || 0) / 100 / 12, fv = (mo) => (i ? m * ((1 + i) ** mo - 1) / i : m * mo);
    const a = fv(12 * (s.age_fin - s.age1)), b = fv(12 * (s.age_fin - s.age2));
    return { a, b, ecart: a - b, va: m * 12 * (s.age_fin - s.age1), vb: m * 12 * (s.age_fin - s.age2) };
  }

  // ---------------------------------------------------------------- squelette : un parcours en 3 étapes
  const ANGLES_DESC = Object.fromEntries(FAMILLES.flatMap(([, l]) => l.map(([k, , d, ex]) => [k, `${d} <span class="vv-exemple">Exemple : ${ex}</span>`])));
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
            <div id="vv-libre" class="vv-libre" hidden>
              <div class="vv-libre-tete"><label class="bloc-lib" for="vv-libre-texte">Votre sujet ou votre texte</label><button type="button" class="bouton bouton-discret" id="vv-coller" hidden>📋 Coller</button></div>
              <textarea id="vv-libre-texte" rows="6" maxlength="5000" placeholder="Un sujet en une phrase (« pourquoi épargner chaque mois plutôt qu'attendre le bon moment »)&#10;ou un texte complet : collez ici un article en accès libre, une note, un communiqué…"></textarea>
              <div class="vv-libre-etat" id="vv-libre-etat" aria-live="polite"></div>
              <div class="vv-libre-media" id="vv-libre-media" hidden><label for="vv-media">Média ou source (facultatif, cité dans la vidéo)</label><input id="vv-media" maxlength="60" placeholder="Ex. : Les Echos, AMF, ma note interne"></div>
              <p class="alerte-donnees">Jamais de donnée client (nom, téléphone, e-mail…) : le texte est envoyé à l'IA (Gemini). Pour un article payant, seulement la partie en accès libre.</p>
            </div>
          </div>
        </div>

        <div class="vv-etape" id="vv-e2">
          <h3 class="vv-etape-tete"><span class="n" aria-hidden="true">2</span>Comment la raconter ?</h3>
          <div class="vv-etape-corps">
            <div class="vv-familles">${FAMILLES.map(([fam, l]) => `<div class="vv-famille"><span class="vv-famille-nom">${fam}</span><div class="vv-angles" role="group" aria-label="${fam}">${l.map(([k, n]) => `<button type="button" class="puce" data-angle="${k}">${n}</button>`).join("")}</div></div>`).join("")}</div>
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
                  <div><span class="simu-lib">Durée</span><div class="puces">${DUREES.map(([d, l]) => `<button type="button" class="puce" data-duree="${d}">${l}</button>`).join("")}</div></div>
                  <div><span class="simu-lib">Plateforme</span><div class="puces">${Object.entries(PLATEFORMES).map(([k, [n, f]]) => `<button type="button" class="puce" data-plateforme="${k}" title="Format ${f}">${n} <span class="doux">${f}</span></button>`).join("")}</div></div>
                  <div><span class="simu-lib">Rythme</span><div class="vs-cartes">${Object.entries(RYTHMES).map(([k, [n, d]]) => `<button type="button" class="vs-carte" data-rythme="${k}"><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
                  <div><span class="simu-lib">Fin de la vidéo</span><div class="vs-cartes">${Object.entries(MODES_FIN).map(([k, [n, d]]) => `<button type="button" class="vs-carte" data-finmode="${k}"><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
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
    document.querySelectorAll("[data-plateforme]").forEach((b) => b.onclick = () => { R.plateforme = b.dataset.plateforme; R.format = PLATEFORMES[R.plateforme][1]; majReglages(); });
    document.querySelectorAll("[data-rythme]").forEach((b) => b.onclick = () => { R.rythme = b.dataset.rythme; majReglages(); });
    document.querySelectorAll("[data-finmode]").forEach((b) => b.onclick = () => { R.finMode = b.dataset.finmode; majReglages(); });
    $v("vv-precision").oninput = majEtat;
    $v("vv-libre-texte").oninput = majEtat;
    if (navigator.clipboard?.readText) {
      $v("vv-coller").hidden = false;
      $v("vv-coller").onclick = async () => { try { const t = await navigator.clipboard.readText(); if (t) { $v("vv-libre-texte").value = t.slice(0, 5000); majEtat(); } } catch { notifier("Collage impossible : utilisez « Coller » dans la zone de texte.", true); } };
    }
    $v("vv-proposer").onclick = proposer;
  }

  function majReglages() {
    document.querySelectorAll("[data-duree]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.duree === R.duree));
    document.querySelectorAll("[data-plateforme]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.plateforme === R.plateforme));
    document.querySelectorAll("[data-rythme]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.rythme === R.rythme));
    document.querySelectorAll("[data-finmode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.finmode === R.finMode));
    $v("vv-resume-reglages").innerHTML = `<b>${dureeLib(R.duree)}</b> · ${PLATEFORMES[R.plateforme][0]} (${R.format}) · rythme ${RYTHMES[R.rythme][0].toLowerCase()} · ${MODES_FIN[R.finMode][0].toLowerCase()} · voix ${R.voix}`;
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

  // Sujet libre : sujet court ou texte complet (même règle que le serveur : plus de 280 caractères ou 3 phrases = texte).
  const estTexte = (t) => { const x = String(t || "").trim(); return x.length >= 280 || (x.match(/[.!?…](\s|$)/g) || []).length >= 3; };
  function majLibre() {
    const z = $v("vv-libre"); if (!z) return;
    const actif = (R.sel || "") === "libre"; z.hidden = !actif; if (!actif) return;
    const t = $v("vv-libre-texte").value.trim(), texte = estTexte(t), n = t.length;
    $v("vv-libre-media").hidden = !texte;
    $v("vv-libre-etat").innerHTML = !t ? "" : texte
      ? `<span class="vv-libre-type texte">📋 Texte collé · ${n.toLocaleString("fr-FR")} / 5 000 caractères</span> L'IA va le reformuler en scénario oral ; ses chiffres sont autorisés, rien ne sera ajouté.`
      : `<span class="vv-libre-type">✏️ Sujet court</span> Sans texte source, l'IA ne citera aucun chiffre. Collez un texte complet pour qu'elle s'appuie dessus.`;
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
        <button type="button" class="vv-idee" data-sujet="libre"><strong>✏️ Mon sujet ou mon texte</strong><span class="petit doux">Écrivez un sujet, ou collez un texte complet (article en accès libre, note) : l'IA le reformule en scénario.</span></button>
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
    if (type === "libre") return { ico: "✏️", titre: "Mon sujet ou mon texte", source: "Écrivez un sujet ou collez un texte ci-dessous." };
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
    if (type === "libre") setTimeout(() => $v("vv-libre-texte").focus(), 50);
  }

  function afficherChoisi() {
    const d = decrireSujet(), z = $v("vv-choisi");
    if (!d) { z.hidden = true; $v("vv-choix-sujet").hidden = false; afficherPanneau(); return; }
    z.hidden = false; $v("vv-choix-sujet").hidden = true;
    z.innerHTML = `<span class="vv-choisi-ico" aria-hidden="true">${d.ico}</span><div><strong>${echapper(d.titre)}</strong><span>${echapper(d.source)}</span></div><button type="button" class="bouton bouton-discret" id="vv-changer">Changer</button>`;
    // Fiche : toute la fiche, ou un point précis pour aller dans le détail
    const [type, ref] = (R.sel || "").split(/:(.*)/s), f = type === "fiche" && LES_FICHES().find((x) => x.id === ref);
    if (f) {
      const parties = partiesFiche(f).map(([t]) => t);
      if (!parties.includes(R.focus)) R.focus = "";
      z.insertAdjacentHTML("beforeend", `<label class="vv-focus"><span>Point précis</span><select id="vv-focus"><option value="">Toute la fiche</option>${parties.map((t) => `<option ${t === R.focus ? "selected" : ""}>${echapper(t)}</option>`).join("")}</select><small class="doux">La vidéo s'adresse au public (« vous ») : rien de scolaire.</small></label>`);
      $v("vv-focus").onchange = (e) => { R.focus = e.target.value; if (R.focus && !R.angleManuel) { R.angle = "decryptage"; majAngle(); } };
    } else R.focus = "";
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
    $v("vv-precision-note").textContent = "(facultatif)";
    $v("vv-precision").placeholder = "Ex. : pour les jeunes actifs, ton rassurant…";
    majLibre();
    const manque = !choisi ? "Choisissez d'abord un sujet (étape 1)." : libre && !$v("vv-libre-texte").value.trim() ? "Écrivez votre sujet ou collez votre texte (étape 1)." : "";
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
    $v("vv-msg").innerHTML = `<div class="attente"><span class="rond"></span>L'IA écrit le scénario, puis le relit en « rédacteur en chef » : 20 secondes à 1 minute…</div>`;
    try {
      const [type, ref] = R.sel.split(/:(.*)/s);
      const corps = { source: type, ref: ref || "", angle: R.angle, precision: $v("vv-precision").value, duree: R.duree, format: R.format, plateforme: R.plateforme, rythme: R.rythme, fin_mode: R.finMode, voix: R.voix, simulation: R.sim };
      if (type === "fiche") { const f = LES_FICHES().find((x) => x.id === ref); if (f) corps.fiche = { id: f.id, titre: f.titre, verifie: f.verifie, focus: R.focus || "", contenu: texteFiche(f, R.focus) }; }
      if (type === "libre") { corps.libre = $v("vv-libre-texte").value.trim(); corps.media = $v("vv-media").value.trim(); }
      const r = await appelApi("/api/video/scenario", "POST", corps);
      $v("vv-msg").innerHTML = "";
      ouvrir(r.video); chargerGalerie();
    } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    b.dataset.occupe = ""; majEtat();
  }

  function ouvrir(v) {
    courante = v; lect?.arreter();
    const z = $v("vv-travail"); z.hidden = false;
    arreterSuivi();
    if (v.statut === "brouillon" || v.statut === "erreur" || v.statut === "annule") afficherScenario(v);
    else if (EN_COURS.includes(v.statut)) afficherSuivi(v);
    else afficherResultat(v);
    z.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------------------------------------------------------------- scénario : storyboard visuel, aperçu animé, réglages
  const FINS_LIB = { cercles: "Cercles", clair: "Clair", horizon: "Horizon", courbe: "Courbe", maison: "Maison", bandes: "Dynamique" };
  const FINS_DESC = { cercles: "classique, tous sujets", clair: "sobre, fiscalité", horizon: "retraite, transmission", courbe: "épargne, placements", maison: "immobilier", bandes: "actualité, entreprise" };
  const AMB = { dynamique: ["Dynamique", "rythmée, TikTok et Reels"], calme: ["Calme", "douce, sujet sérieux"], inspirante: ["Inspirante", "lumineuse, projet de vie"] };
  const SOUS = { mot: ["Mot à mot", "le mot lu s'allume"], sobre: ["Sobre", "phrase blanche, sans fond"], clair: ["Encadré clair", "fond blanc, texte bordeaux"] };
  const CLASSIQUE = "Et si on prenait le temps d'en parler ?", OFFRE = "Premier échange offert · sans engagement";
  let S = null, lect = null, tVign = 0, tApercu = 0;
  const A = () => window.VideoApercu;

  function nomParle() {
    const nom = String(reglages?.coordonnees?.cabinet || "BSC Patrimoine").slice(0, 30);
    return nom === nom.toUpperCase() ? nom.split(" ").map((m, i) => (i === 0 && m.length <= 4 ? m : m.charAt(0) + m.slice(1).toLowerCase())).join(" ") : nom;
  }
  function questionPropre(q) {
    let t = String(q || "").replace(/\s+/g, " ").trim();
    if (!t || /\d/.test(t) || t.length > 60) return CLASSIQUE;
    if (!/[?.!]$/.test(t)) t += " ?";
    return t;
  }
  // Carte de fin telle que le serveur la reconstruira (texte lu compris : il compte dans la durée).
  function finLocale() {
    const q = questionPropre(S.fin.question), cl = q === CLASSIQUE, mode = MODES_FIN[S.fin.mode] ? S.fin.mode : "complete";
    const texte = mode === "complete" ? `${q}${cl ? "" : " Prenons le temps d'en parler."} ${nomParle()}. Premier échange offert, sans engagement.` : `${nomParle()}.`;
    return { type: "fin", texte, p: { question: q, offre: OFFRE, style: S.fin.style || "cercles", mode, rythme: S.fin.rythme === "pose" ? "pose" : "dynamique" } };
  }
  function configApercu() {
    const c = reglages?.coordonnees || {};
    return { cabinet: c.cabinet, activite: c.activite, mail: c.mail, telephone: c.telephone, mentions: [...(S.v.mentions || []), ...(c.fictives ? ["Coordonnées fictives (provisoires)."] : [])] };
  }
  function videoApercu() {
    return { scenes: A().avecChiffres([...S.scenes, finLocale()], S.v.donnees?.simulation), format: S.format, graine: S.v.graine || 1, sous_titres: S.reglages.sous_titres, config: configApercu() };
  }
  const dureeTotale = () => A().dureeEstimee([...S.scenes, finLocale()]);
  const secondes = (s) => `≈ ${Math.max(1, Math.round(A().dureeScene(s)))} s`;

  function etatDepuis(v) {
    const sb = v.storyboard || [], f = sb.find((x) => x.type === "fin");
    return { v, scenes: sb.filter((x) => x.type !== "fin").map((x) => ({ ...x, p: { ...(x.p || {}) } })),
      fin: { question: f?.p?.question || CLASSIQUE, style: f?.p?.style || "cercles", mode: f?.p?.mode || "complete", rythme: f?.p?.rythme || "dynamique" }, finIA: v.donnees?.fin_proposee || null,
      reglages: { ...(v.reglages || { ambiance: "dynamique", sous_titres: "mot", deux_formats: false }) }, format: v.format || "9:16", voix: v.voix || "Sadachbia",
      duree: DUREES.some(([x]) => x === +v.duree_cible) ? +v.duree_cible : 45, ouverte: null };
  }

  function sceneHtml(s, i, n) {
    const champs = (CHAMPS[s.type] || []).filter(([k]) => s.p?.[k] !== undefined || ["bandeau", "gros_texte", "texte", "valeur", "mythe", "realite", "titre", "gros"].includes(k));
    const choix = CHOIX[s.type] || [];
    return `<li class="vs-scene" data-i="${i}">
      <button type="button" class="vs-vign ${S.format === "4:5" ? "f45" : ""}" data-voir="${i}" aria-label="Voir la scène ${i + 1} dans l'aperçu"><span data-vign="${i}"></span><em>▶</em></button>
      <div class="vs-corps">
        <div class="vs-tete-scene"><span class="vs-num">${i + 1}</span><b>${NOMS_TYPES[s.type] || s.type}</b><span class="vs-sec" data-sec="${i}">${secondes(s)}</span>
          <span class="vs-actions">
            <button type="button" class="vs-mini" data-refaire="${i}" title="Réécrire cette scène avec l'IA">↻ Refaire</button>
            <button type="button" class="vs-ico" data-monter="${i}" aria-label="Monter la scène ${i + 1}" ${i === 0 ? "disabled" : ""}>↑</button>
            <button type="button" class="vs-ico" data-descendre="${i}" aria-label="Descendre la scène ${i + 1}" ${i >= n - 1 ? "disabled" : ""}>↓</button>
            <button type="button" class="vs-ico" data-retirer="${i}" aria-label="Retirer la scène ${i + 1}">✕</button>
          </span></div>
        <label class="sr" for="vs-t${i}">Texte lu, scène ${i + 1}</label>
        <textarea id="vs-t${i}" data-texte="${i}" rows="2" maxlength="600">${echapper(s.texte)}</textarea>
        <div class="vs-refaire" data-panneau="${i}" hidden>
          <input data-consigne="${i}" maxlength="200" placeholder="Facultatif : « plus court », « avec Michel », « plus percutant »…" aria-label="Demande pour réécrire la scène ${i + 1}">
          <button type="button" class="bouton" data-go="${i}">Réécrire</button>
        </div>
        ${choix.length || champs.length ? `<details class="vs-plus"${S.ouverte === i ? " open" : ""} data-plus="${i}"><summary>Personnages, décor et textes à l'écran</summary>
          ${choix.length ? `<div class="vv-choix">${choix.map(([k, l]) => {
            const dec = k === "decor", liste = dec ? [["", "Automatique (selon la scène)"], ...LIEUX] : PERSOS;
            const val = s.p?.[k] ?? (dec ? "" : k === "personnage_droite" ? "tom_age" : k === "personnage_gauche" ? "lea" : "tom");
            return `<label class="vv-choix-un">${dec ? "" : `<img src="/video-persos/${val}.png" alt="" width="44" height="44">`}<span>${l}<select data-champ="${k}" data-si="${i}">${liste.map(([id, nom]) => `<option value="${id}" ${id === val ? "selected" : ""}>${echapper(nom)}</option>`).join("")}</select></span></label>`;
          }).join("")}</div>` : ""}
          ${champs.length ? `<div class="vv-champs">${champs.map(([k, l]) => `<label><span>${l}</span><input data-champ="${k}" data-si="${i}" value="${echapper(s.p?.[k] ?? "")}" maxlength="60"></label>`).join("")}</div>` : ""}
        </details>` : ""}
      </div></li>`;
  }
  function finHtml(i) {
    const f = finLocale(), sugg = [...new Set([S.finIA, CLASSIQUE].filter(Boolean))];
    return `<li class="vs-scene vs-scene-fin" data-fin="1">
      <button type="button" class="vs-vign ${S.format === "4:5" ? "f45" : ""}" data-voir="${i}" aria-label="Voir la carte de fin dans l'aperçu"><span data-vign="${i}"></span><em>▶</em></button>
      <div class="vs-corps">
        <div class="vs-tete-scene"><span class="vs-num">${i + 1}</span><b>Carte de fin</b><span class="vs-sec" data-sec="fin">${secondes(f)}</span></div>
        <span class="vs-lib">Type de fin</span>
        <div class="vs-cartes" role="group" aria-label="Type de fin">${Object.entries(MODES_FIN).map(([k, [n, d]]) => `<button type="button" class="vs-carte" data-mode="${k}" aria-pressed="${k === S.fin.mode}"><b>${n}</b><small>${d}</small></button>`).join("")}</div>
        <div ${S.fin.mode === "complete" ? "" : "hidden"}><label class="vs-lib" for="vs-question">Phrase d'appel <span class="doux">(affichée et lue)</span></label>
        <input id="vs-question" maxlength="60" value="${echapper(S.fin.question)}" autocomplete="off">
        <div class="vs-sugg">${sugg.map((q) => `<button type="button" class="puce" data-q="${echapper(q)}" aria-pressed="${q === S.fin.question}">${q === CLASSIQUE ? "Classique : " : "✨ "}${echapper(q)}</button>`).join("")}</div>
        <span class="vs-lib">Mise en scène</span>
        <div class="vs-styles" role="group" aria-label="Mise en scène de la carte de fin">${Object.keys(FINS_LIB).map((k) => `<button type="button" class="vs-style s-${k}" data-style="${k}" aria-pressed="${k === S.fin.style}"><i aria-hidden="true"></i><b>${FINS_LIB[k]}</b><small>${FINS_DESC[k]}</small></button>`).join("")}</div>
        </div>
        <p class="doux petit vs-note">${S.fin.mode === "sans" ? "Seulement votre logo et les mentions obligatoires (risque de perte en capital, sources, exemple fictif)." : S.fin.mode === "courte" ? "Votre logo, vos coordonnées et les mentions obligatoires, sans phrase d'appel ni offre." : `Toujours présents : votre logo, « ${OFFRE} », les coordonnées et les mentions obligatoires.`}</p>
      </div></li>`;
  }
  // Zone de texte à la hauteur de son contenu (tout le texte lu reste visible, même sur téléphone).
  function hauteur(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + 2 + "px"; }
  function rendreScenes() {
    const n = S.scenes.length;
    $v("vs-scenes").innerHTML = S.scenes.map((s, i) => sceneHtml(s, i, n)).join("") + finHtml(n);
    document.querySelectorAll("[data-texte]").forEach(hauteur);
    majDuree(); planifierApercu(true);
  }

  function majDuree() {
    const est = dureeTotale(), d = S.duree, ok = Math.abs(est - d) <= d * .1, max = d * 1.3;
    const pc = (x) => Math.max(0, Math.min(100, x / max * 100)).toFixed(1);
    $v("vs-duree").innerHTML = `<div class="vs-duree-l">
        <span class="vs-duree-chiffre ${ok ? "ok" : "ko"}">≈ ${est} s</span>
        <span class="vs-duree-txt">${ok ? "✓ Bonne durée" : est < d ? `Trop court pour ${dureeLib(d)}` : `Trop long pour ${dureeLib(d)}`}<small>estimée sur le texte lu · objectif</small></span>
        <span class="puces vs-objectif" role="group" aria-label="Durée visée">${DUREES.map(([x, l]) => `<button type="button" class="puce" data-obj="${x}" aria-pressed="${x === d}">${l}</button>`).join("")}</span>
      </div>
      <div class="vs-jauge" aria-hidden="true"><span class="vs-zone" style="left:${pc(d * .9)}%;width:${(+pc(d * 1.1) - +pc(d * .9)).toFixed(1)}%"></span><span class="vs-rempli ${ok ? "ok" : "ko"}" style="width:${pc(est)}%"></span></div>
      ${ok ? "" : `<div class="vs-ajuster"><button type="button" class="bouton" id="vs-ajuster">✨ ${est < d ? "Allonger" : "Raccourcir"} à ${dureeLib(d)} avec l'IA</button><span class="doux petit">ou modifiez le texte des scènes vous-même.</span></div>`}`;
    $v("vs-duree").querySelectorAll("[data-obj]").forEach((b) => b.onclick = () => { S.duree = +b.dataset.obj; majDuree(); });
    const aj = $v("vs-ajuster"); if (aj) aj.onclick = ajuster;
    $v("vs-lancer-duree").textContent = `${est} s`;
  }

  // Aperçu et vignettes, recalculés peu après chaque modification.
  function planifierApercu(vignettesAussi) {
    clearTimeout(tApercu);
    tApercu = setTimeout(() => { if (lect && S) lect.charger(videoApercu()).catch(apercuIndispo); }, 350);
    if (vignettesAussi) { clearTimeout(tVign); tVign = setTimeout(majVignettes, 500); }
  }
  async function majVignettes() {
    if (!S) return;
    try { const l = await A().vignettes(videoApercu()); l.forEach((svg, i) => { const z = document.querySelector(`[data-vign="${i}"]`); if (z) z.innerHTML = svg; }); }
    catch { document.querySelectorAll(".vs-vign").forEach((b) => b.classList.add("vide")); }
  }
  function apercuIndispo() { const z = $v("vs-lecteur"); if (z) z.innerHTML = `<p class="doux petit">Aperçu indisponible sur cet appareil. La vidéo sera fabriquée normalement.</p>`; }
  function surTemps(t, cal) {
    const r = $v("vs-pos"); if (!r || !cal) return;
    r.max = cal.duree_totale.toFixed(2); r.value = t.toFixed(2);
    $v("vs-temps").textContent = `${Math.floor(t)} s / ${Math.round(cal.duree_totale)} s`;
    $v("vs-lire").textContent = lect.etat.lecture ? "❚❚" : "▶"; $v("vs-lire").setAttribute("aria-label", lect.etat.lecture ? "Pause" : "Lire l'aperçu");
    const i = cal.scenes.findIndex((s) => t >= s.debut && t < s.fin);
    document.querySelectorAll(".vs-scene").forEach((li, k) => li.classList.toggle("vs-active", k === i && lect.etat.lecture));
  }

  async function sauver() {
    const r = await appelApi(`/api/video/${S.v.id}/storyboard`, "POST", { scenes: S.scenes, texte_post: $v("vv-post").value, fin: S.fin, reglages: S.reglages, format: S.format, voix: S.voix, duree: S.duree });
    courante = r.video; S.v = r.video; return r.video;
  }
  function recharger(v, garderOuverte = true) {
    const ouv = S?.ouverte, post = $v("vv-post")?.value;
    courante = v; S = etatDepuis(v); if (garderOuverte) S.ouverte = ouv;
    if (post != null && v.texte_post) $v("vv-post").value = v.texte_post;
    majVerif(); rendreScenes();
  }
  function occupe(b, oui, txt) { if (!b) return; if (oui) { b.dataset.lib = b.textContent; b.textContent = txt; b.disabled = true; } else { b.textContent = b.dataset.lib || b.textContent; b.disabled = false; } }
  async function ajuster() {
    const b = $v("vs-ajuster"); occupe(b, true, "L'IA ajuste la longueur, 10 à 40 s…");
    try {
      await sauver();
      const r = await appelApi(`/api/video/${S.v.id}/ajuster`, "POST", { duree: S.duree });
      recharger(r.video); notifier(`Scénario ajusté : ≈ ${r.apres} s (avant ≈ ${r.avant} s).`);
    } catch (e) { notifier(e.message, true); occupe(b, false); }
  }
  async function refaire(i) {
    const b = document.querySelector(`[data-go="${i}"]`); occupe(b, true, "Réécriture…");
    try {
      await sauver();
      const r = await appelApi(`/api/video/${S.v.id}/scene`, "POST", { i, consigne: document.querySelector(`[data-consigne="${i}"]`)?.value || "" });
      recharger(r.video); notifier(`Scène ${i + 1} réécrite.`);
      document.querySelector(`.vs-scene[data-i="${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) { notifier(e.message, true); occupe(b, false); }
  }
  function majVerif() {
    const verif = S.v.a_verifier || [], relu = S.v.donnees?.relecture;
    $v("vs-verif").innerHTML = verif.length ? (() => { const li = (x) => `<li>Scène ${x.scene} : <strong>${echapper(String(x.chiffre).replace(".", ","))}</strong> dans « ${echapper(x.texte)} »</li>`;
      return `<div class="conformite"><strong>${verif.length} chiffre${verif.length > 1 ? "s" : ""} à vérifier</strong> (ni calculés par le site, ni tirés de ses données officielles) :<ul>${verif.slice(0, 3).map(li).join("")}</ul>${verif.length > 3 ? `<details><summary>Voir les ${verif.length - 3} autres</summary><ul>${verif.slice(3).map(li).join("")}</ul></details>` : ""}Corrigez-les ou retirez-les si vous n'avez pas de source officielle.</div>`; })() : `<p class="vv-ok">✓ Tous les chiffres viennent du calcul du site ou de ses données officielles.</p>`;
    if (relu) $v("vs-verif").insertAdjacentHTML("afterbegin", `<details class="vv-relu"><summary>✓ Relu par le rédacteur en chef${relu.length ? ` · ${relu.length} amélioration${relu.length > 1 ? "s" : ""}` : " · rien à corriger"}</summary>${relu.length ? `<ul>${relu.map((x) => `<li>${echapper(x)}</li>`).join("")}</ul>` : ""}</details>`);
  }
  function reglagesHtml() {
    const R2 = S.reglages, autre = S.format === "4:5" ? "9:16 (TikTok, Reels)" : "4:5 (LinkedIn, Instagram, Facebook)";
    return `<div class="vs-reg"><span class="vs-lib">Musique</span><div class="vs-cartes">${Object.entries(AMB).map(([k, [n, d]]) => `<button type="button" class="vs-carte" data-amb="${k}" aria-pressed="${k === R2.ambiance}"><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
      <div class="vs-reg"><span class="vs-lib">Sous-titres</span><div class="vs-cartes">${Object.entries(SOUS).map(([k, [n, d]]) => `<button type="button" class="vs-carte vs-st-${k}" data-st="${k}" aria-pressed="${k === R2.sous_titres}"><span class="vs-st-ex" aria-hidden="true"><i>Votre</i> épargne</span><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
      <div class="vs-reg"><span class="vs-lib">Rythme</span><div class="vs-cartes">${Object.entries(RYTHMES).map(([k, [n, d]]) => `<button type="button" class="vs-carte" data-ry="${k}" aria-pressed="${k === S.fin.rythme}"><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
      <div class="vs-reg"><span class="vs-lib">Format</span><div class="puces">${[["9:16", "9:16 · TikTok, Reels, Facebook Reels"], ["4:5", "4:5 · LinkedIn, Instagram, Facebook"]].map(([k, l]) => `<button type="button" class="puce" data-fmt="${k}" aria-pressed="${k === S.format}">${l}</button>`).join("")}</div>
        <label class="vs-case"><input type="checkbox" id="vs-deux" ${R2.deux_formats ? "checked" : ""}><span>Fabriquer aussi en ${autre} <span class="doux">· même voix, sans quota en plus, fabrication un peu plus longue</span></span></label></div>
      <div class="vs-reg"><span class="vs-lib">Voix</span><select id="vs-voix" class="vs-select">${(reglages?.voix || [S.voix]).map((n) => `<option value="${n}" ${n === S.voix ? "selected" : ""}>${n}${VOIX_INFO[n] ? " · " + VOIX_INFO[n][1] : ""}</option>`).join("")}</select></div>`;
  }
  function brancherReglages() {
    const z = $v("vs-reglages");
    z.querySelectorAll("[data-amb]").forEach((b) => b.onclick = () => { S.reglages.ambiance = b.dataset.amb; z.innerHTML = reglagesHtml(); brancherReglages(); });
    z.querySelectorAll("[data-st]").forEach((b) => b.onclick = () => { S.reglages.sous_titres = b.dataset.st; z.innerHTML = reglagesHtml(); brancherReglages(); planifierApercu(); });
    z.querySelectorAll("[data-fmt]").forEach((b) => b.onclick = () => { S.format = b.dataset.fmt; z.innerHTML = reglagesHtml(); brancherReglages(); rendreScenes(); });
    z.querySelectorAll("[data-ry]").forEach((b) => b.onclick = () => { S.fin.rythme = b.dataset.ry; z.innerHTML = reglagesHtml(); brancherReglages(); rendreScenes(); });
    $v("vs-deux").onchange = (e) => { S.reglages.deux_formats = e.target.checked; };
    $v("vs-voix").onchange = (e) => { S.voix = e.target.value; };
  }

  function afficherScenario(v) {
    const z = $v("vv-travail");
    S = etatDepuis(v);
    z.innerHTML = `
      <div class="recap"><span><strong>Scénario :</strong> ${echapper(v.sujet || "")}</span><button type="button" class="lien-bouton" id="vv-fermer">Fermer</button></div>
      ${v.statut === "erreur" ? `<p class="message ko">La dernière fabrication a échoué : ${echapper(v.erreur || "")}</p>` : ""}
      <div class="vs-titre"><h2>Votre scénario</h2><p class="doux">Relisez, ajustez, regardez l'aperçu. Rien n'est fabriqué avant votre validation.</p></div>
      <div class="vs-duree" id="vs-duree"></div>
      <div id="vs-verif"></div>
      <div class="vs-grille">
        <aside class="vs-cote">
          <div class="vs-lecteur-bloc">
            <div class="vs-lecteur ${S.format === "4:5" ? "f45" : ""}" id="vs-lecteur"><div class="vs-ecran" id="vs-ecran"></div></div>
            <div class="vs-commandes"><button type="button" class="vs-lire" id="vs-lire" aria-label="Lire l'aperçu">▶</button><input type="range" id="vs-pos" min="0" max="1" step="0.05" value="0" aria-label="Position dans l'aperçu"><span id="vs-temps" class="petit doux">0 s</span></div>
            <p class="doux petit vs-note">Aperçu sans voix ni musique, au rythme estimé. La vidéo finale suit la vraie voix.</p>
          </div>
        </aside>
        <div class="vs-principal">
          <ol class="vs-scenes" id="vs-scenes"></ol>
          <details class="vs-bloc" id="vs-reglages-bloc"><summary><span><b>Réglages de fabrication</b><small id="vs-reg-resume"></small></span><span class="vv-modifier">Modifier</span></summary><div id="vs-reglages"></div></details>
          <label class="bloc-lib" for="vv-post">Texte de publication (à coller sous la vidéo)</label>
          <textarea id="vv-post" rows="5" maxlength="1500">${echapper(v.texte_post || "")}</textarea>
        </div>
      </div>
      <div class="actions vs-barre-actions">
        <button type="button" class="bouton gros-bouton" id="vv-lancer">🎬 Générer la vidéo · <span id="vs-lancer-duree"></span></button>
        <button type="button" class="bouton bouton-discret" id="vv-sauver">Enregistrer le brouillon</button>
        <button type="button" class="bouton bouton-discret" id="vv-graine" title="Change les décors, l'heure du jour, les objets et les tenues, sans toucher au texte">🎲 Autre mise en scène</button>
        <button type="button" class="bouton bouton-discret" id="vv-reproposer">↻ Un autre scénario</button>
      </div>
      <p class="doux petit" id="vs-info-lancer"></p>
      <div id="vv-msg2"></div>`;
    $v("vv-fermer").onclick = () => { lect?.arreter(); $v("vv-travail").hidden = true; courante = null; S = null; };
    majVerif();
    const reg = $v("vs-reglages"); reg.innerHTML = reglagesHtml(); brancherReglages();
    const resumeReg = () => { $v("vs-reg-resume").textContent = `Musique ${AMB[S.reglages.ambiance][0].toLowerCase()} · sous-titres ${SOUS[S.reglages.sous_titres][0].toLowerCase()} · ${S.format}${S.reglages.deux_formats ? " + " + (S.format === "4:5" ? "9:16" : "4:5") : ""} · voix ${S.voix}`; };
    resumeReg(); reg.addEventListener("click", () => setTimeout(resumeReg)); reg.addEventListener("change", () => setTimeout(resumeReg));
    // lecteur d'aperçu
    lect = A()?.lecteur ? A().lecteur($v("vs-ecran"), surTemps) : null;
    if (!lect) apercuIndispo();
    $v("vs-lire").onclick = () => { if (!lect) return; if (lect.etat.lecture) lect.arreter(); else lect.lire(); };
    $v("vs-pos").oninput = (e) => { lect?.arreter(); lect?.aller(+e.target.value); };
    rendreScenes();
    const liste = $v("vs-scenes");
    liste.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.texte != null) { const i = +t.dataset.texte; S.scenes[i].texte = t.value; hauteur(t); const sec = document.querySelector(`[data-sec="${i}"]`); if (sec) sec.textContent = secondes(S.scenes[i]); majDuree(); planifierApercu(true); }
      else if (t.dataset.champ && t.tagName === "INPUT") { S.scenes[+t.dataset.si].p[t.dataset.champ] = t.value; planifierApercu(true); }
      else if (t.id === "vs-question") { S.fin.question = t.value; const sec = document.querySelector('[data-sec="fin"]'); if (sec) sec.textContent = secondes(finLocale()); document.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.q === t.value)); majDuree(); planifierApercu(true); }
    });
    liste.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.champ && t.tagName === "SELECT") {
        const sc = S.scenes[+t.dataset.si]; if (t.value === "") delete sc.p[t.dataset.champ]; else sc.p[t.dataset.champ] = t.value;
        const img = t.closest(".vv-choix-un")?.querySelector("img"); if (img) img.src = `/video-persos/${t.value}.png`;
        planifierApercu(true);
      }
    });
    liste.addEventListener("toggle", (e) => { const d = e.target.closest?.("[data-plus]"); if (d) S.ouverte = d.open ? +d.dataset.plus : (S.ouverte === +d.dataset.plus ? null : S.ouverte); }, true);
    liste.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const d = b.dataset, l = S.scenes;
      if (d.voir != null) { const i = +d.voir, cal = lect?.calage; if (lect && cal) { lect.lire(cal.scenes[i].debut, cal.scenes[i].fin); $v("vs-lecteur").scrollIntoView({ behavior: "smooth", block: "nearest" }); } return; }
      if (d.refaire != null) { const p = document.querySelector(`[data-panneau="${d.refaire}"]`); p.hidden = !p.hidden; if (!p.hidden) p.querySelector("input").focus(); return; }
      if (d.go != null) return refaire(+d.go);
      if (d.q != null) { S.fin.question = d.q; $v("vs-question").value = d.q; document.querySelectorAll("[data-q]").forEach((x) => x.setAttribute("aria-pressed", x === b)); majDuree(); planifierApercu(true); return; }
      if (d.mode) { S.fin.mode = d.mode; rendreScenes(); return; }
      if (d.style) { S.fin.style = d.style; document.querySelectorAll("[data-style]").forEach((x) => x.setAttribute("aria-pressed", x === b)); planifierApercu(true); setTimeout(() => { const cal = lect?.calage; if (cal) lect.lire(cal.scenes[cal.scenes.length - 1].debut); }, 450); return; }
      if (d.monter != null) { const i = +d.monter; [l[i - 1], l[i]] = [l[i], l[i - 1]]; }
      else if (d.descendre != null) { const i = +d.descendre; [l[i + 1], l[i]] = [l[i], l[i + 1]]; }
      else if (d.retirer != null) { if (l.length <= 2) return notifier("Gardez au moins deux scènes.", true); l.splice(+d.retirer, 1); }
      else return;
      rendreScenes();
    };
    liste.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.dataset.consigne != null) { e.preventDefault(); refaire(+e.target.dataset.consigne); } });
    $v("vs-info-lancer").textContent = `Fabrication ≈ ${Math.ceil(fabrication([...S.scenes, finLocale()]) / 60)} min sur un robot gratuit (GitHub) : vous pouvez fermer la page, la vidéo arrivera dans « Mes vidéos ».${reglages ? ` ${reglages.lancees_aujourdhui}/${reglages.limite_personne} aujourd'hui${reglages.restant_equipe <= 4 ? ` · plus que ${reglages.restant_equipe} pour toute l'équipe` : ""}.` : ""}`;
    $v("vv-sauver").onclick = async () => { try { recharger(await sauver()); notifier("Brouillon enregistré."); } catch (e) { notifier(e.message, true); } };
    $v("vv-graine").onclick = async () => { try { await sauver(); const r = await appelApi(`/api/video/${v.id}/storyboard`, "POST", { nouvelle_graine: true }); recharger(r.video); notifier("Nouvelle mise en scène : décors, lumière, objets et tenues changent (voir l'aperçu)."); } catch (e) { notifier(e.message, true); } };
    $v("vv-reproposer").onclick = () => { lect?.arreter(); $v("vv-travail").hidden = true; document.getElementById("vv-nouvelle").scrollIntoView({ behavior: "smooth" }); proposer(); };
    $v("vv-lancer").onclick = async () => {
      const b = $v("vv-lancer"); b.disabled = true;
      try {
        const nv = await sauver();
        const est = dureeTotale();
        if (!b.dataset.confirme && ((nv.a_verifier || []).length || Math.abs(est - S.duree) > S.duree * .1)) {
          b.dataset.confirme = "1"; b.disabled = false;
          b.textContent = (nv.a_verifier || []).length ? "Des chiffres restent à vérifier : générer quand même ?" : `Durée ≈ ${est} s au lieu de ${S.duree} s : générer quand même ?`;
          majVerif(); return;
        }
        lect?.arreter();
        await appelApi(`/api/video/${v.id}/lancer`, "POST", {});
        reglages = await appelApi("/api/video/reglages").catch(() => reglages);
        const r = await appelApi(`/api/video/${v.id}`); S = null; ouvrir(r.video); chargerGalerie();
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
          ${v.donnees?.jumelle_de ? `<p class="petit doux">Second format fabriqué avec la même voix.</p>` : ""}
          <p class="doux">${v.duree ? Math.round(v.duree) + " s" : ""}${v.duree_cible ? ` (objectif ${v.duree_cible} s)` : ""} · ${v.format} · ${v.taille ? (v.taille / 1e6).toFixed(1).replace(".", ",") + " Mo" : ""}${v.duree_fabrication ? ` · fabriquée en ${mmss(v.duree_fabrication)}` : ""}</p>
          ${(v.alertes || []).length ? `<div class="conformite"><strong>Le contrôle automatique demande une vérification :</strong><ul>${v.alertes.map((a) => `<li>${echapper(a)}</li>`).join("")}</ul>Regardez la vidéo avant de la publier.</div>` : `<p class="vv-ok">✓ Contrôle automatique réussi (son, textes, durée).</p>`}
          <div class="actions">
            <button type="button" class="bouton" id="vv-telecharger">⬇ Télécharger la vidéo (MP4)</button>
            <button type="button" class="bouton bouton-discret" id="vv-partager" hidden>Partager</button>
            ${v.a_miniature ? `<a class="bouton bouton-discret" href="/api/video/${v.id}/miniature" download="miniature.jpg">Miniature</a>` : ""}
            <a class="bouton bouton-discret" href="/api/video/${v.id}/srt">Sous-titres .srt</a>
          </div>
          <label class="bloc-lib" for="vv-post2">Texte de publication</label>
          <textarea id="vv-post2" rows="5">${echapper(v.texte_post || "")}</textarea>
          <div class="actions"><button type="button" class="bouton bouton-discret" id="vv-copier">Copier le texte</button><button type="button" class="bouton bouton-discret" id="vv-vers-post">✍️ Transformer en post LinkedIn</button><button type="button" class="bouton bouton-discret" id="vv-dupliquer">↻ Refaire une variante</button></div>
          <p class="doux petit">Rappel : relisez la vidéo avant publication. Les chiffres « exemple fictif » ne sont pas garantis.</p>
        </div>
      </div>`;
    $v("vv-fermer").onclick = () => { $v("vv-travail").hidden = true; courante = null; };
    $v("vv-copier").onclick = () => copier($v("vv-post2").value);
    $v("vv-vers-post").onclick = () => {
      const src = v.donnees?.source;
      if (typeof window.versPostLinkedIn === "function") window.versPostLinkedIn({ theme: String(src?.titre || v.sujet || "").slice(0, 300), fiche_id: src?.type === "fiche" ? src.id : null, sujet_id: src?.type === "actu" ? src.id : null });
      else { copier($v("vv-post2").value); notifier("Texte copié : ouvrez l'onglet Post LinkedIn."); }
    };
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

  // Depuis un post LinkedIn : « En faire une vidéo » (même sujet présélectionné).
  window.videoDepuisPost = ({ sel, precision, media }) => {
    if (typeof window.choisirVue === "function") window.choisirVue("video"); else window.demarrerVideo();
    if (!$v("vv-nouvelle")) return;
    choisirSujet(sel);
    if (media) $v("vv-media").value = media;
    if (precision) { if (sel === "libre") $v("vv-libre-texte").value = precision; else $v("vv-precision").value = precision; majEtat(); }
    scrollTo({ top: 0, behavior: "smooth" });
  };
  window.demarrerVideo = async () => {
    if ($v("vv-nouvelle")) { chargerGalerie(); return; }
    // ?video_fiche=ID (bouton « Faire une vidéo » d'une fiche Apprendre) : la fiche est présélectionnée.
    const q = new URLSearchParams(location.search).get("video_fiche");
    monter(); majReglages(); majAngle();
    if (q && LES_FICHES().some((f) => f.id === q)) { R.onglet = "fiches"; choisirSujet(`fiche:${q}`); } else afficherChoisi();
    majEtat();
    appelApi("/api/video/idees").then((s) => { sources = s; }).catch(() => { sources = { idees: [], actus: [], echeances: [], chiffres: [] }; })
      .then(() => { if (R.sel) afficherChoisi(); else afficherPanneau(); });
    try { reglages = await appelApi("/api/video/reglages"); window.VideoApercu?.regler?.(reglages.debit); majReglages(); afficherCoordonnees(); } catch (e) { $v("vv-msg").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    chargerGalerie();
  };
})();
