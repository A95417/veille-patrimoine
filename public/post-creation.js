// Création Post › Post LinkedIn (version 6) : un seul écran.
// À gauche : 1. le sujet (idées, actualités, fiches, lien ou texte collé, thème), 2. le format (classique, carrousel PDF,
// sondage, mythe ou réalité, chiffre clé, série de 3) et le style, 3. le post (accroches, texte, conclusion, hashtags,
// éditeur propre au format, image). À droite : l'aperçu fidèle de LinkedIn (téléphone ou ordinateur, coupure « voir plus »)
// et la vérification avant publication. Onglet « Mes posts » : planning (brouillon, prêt, publié, date prévue) et idées de la semaine.
(() => {
  const $ = (id) => document.getElementById(id);
  const FORMATS = {
    classique: ["📝", "Post classique", "Texte et image aux couleurs du cabinet"],
    carrousel: ["📑", "Carrousel PDF", "5 à 8 diapositives à faire défiler"],
    sondage: ["📊", "Sondage", "Une question, 4 réponses, votre réseau vote"],
    mythe: ["💡", "Mythe ou réalité", "Une idée reçue, puis la réalité"],
    chiffre: ["🔢", "Chiffre clé", "Un chiffre de la source, en grand"],
    serie: ["🔁", "Série de 3 posts", "Un thème en 3 épisodes"],
  };
  const APPROCHES = { "": "Automatique", decryptage: "🔎 Décryptage", pedagogie: "🎓 Pédagogie", conseils: "✅ Points d'attention", opinion: "💬 Point de vue", idee_recue: "💡 Idée reçue", question: "❓ Question au réseau" };
  const TONS = { sobre: "Sobre", chaleureux: "Chaleureux", expert: "Expert" };
  const LONGUEURS = { court: "Très court", moyen: "Court", long: "Développé" };
  const EMOJIS = { aucun: "Sans émoji", quelques: "Quelques émojis" };
  const STATUTS = { brouillon: "Brouillon", pret: "Prêt", publie: "Publié" };
  const SOURCES = [["idees", "💡 Idées"], ["actus", "📰 Actualités"], ["fiches", "🎓 Fiches"], ["lien", "🔗 Lien ou texte"], ["theme", "✏️ Mon thème"]];
  const NOMS_MODELES = { chiffre: "Chiffre clé", points: "3 points", etapes: "Étapes", comparaison: "Avant / après", question: "Question", mythe: "Mythe / réalité" };
  const COUPE = { mobile: 140, bureau: 210 };
  const CLE_EN_COURS = "linkedin_en_cours_v6";

  const E = { donnees: null, moi: null, onglet: "idees", source: null, format: "classique", ton: "sobre", longueur: "court", emojis: "aucun", approche: "", consigne: "",
    r: null, texte: "", accroche: 0, cta: 0, tagsOff: [], partie: 0, textes: [], diapos: [], sondage: null, visuel: null, postId: null, serieId: null,
    apercu: "mobile", page: 0, nbActus: 12 };
  let MES_POSTS = [], filtre = "", signature = { nom: "", cabinet: "" }, images = [], imageUrl = "", minuteur = 0;
  const dateCourte = (d) => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); } catch { return ""; } };
  const jourIso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60e3).toISOString().slice(0, 10);
  const texteFiche = (f) => [f.enUnePhrase, ...(f.chiffres || []).map((c) => c.valeur + " : " + c.libelle), ...(f.essentiel || []).map((e) => e.titre + " : " + e.texte), (f.pieges || []).length ? "À éviter : " + f.pieges.join(" ; ") : ""].filter(Boolean).join("\n");

  // ---------------------------------------------------------------- squelette
  function monter() {
    $("vue-post").innerHTML = `
      <div class="lp-vues" role="tablist" aria-label="Post LinkedIn">
        <button type="button" role="tab" data-vue="creer" aria-selected="true">✍️ Créer un post</button>
        <button type="button" role="tab" data-vue="planning" aria-selected="false">🗓 Mes posts <span class="lp-nb" id="lp-nb"></span></button>
      </div>
      <div id="lp-creer">
        <div id="zone-reprise"></div>
        <div class="lp-grille">
          <div class="lp-gauche">
            <section class="carte lp-bloc" id="lp-b1">
              <h2 class="lp-titre"><span class="lp-n">1</span>De quoi parle le post ?</h2>
              <div id="lp-choisi" hidden></div>
              <div id="lp-choix">
                <div class="vv-onglets" role="tablist" aria-label="Type de sujet">${SOURCES.map(([k, l]) => `<button type="button" role="tab" data-src="${k}" aria-selected="${k === E.onglet}">${l}</button>`).join("")}</div>
                <div id="lp-sources"><div class="attente"><span class="rond"></span>Recherche des sujets du moment…</div></div>
              </div>
            </section>
            <section class="carte lp-bloc" id="lp-b2">
              <h2 class="lp-titre"><span class="lp-n">2</span>Quel format ?</h2>
              <div class="lp-formats" role="group" aria-label="Format">${Object.entries(FORMATS).map(([k, [ico, n, d]]) => `<button type="button" class="lp-format" data-format="${k}" aria-pressed="${k === E.format}"><span class="lp-format-ico" aria-hidden="true">${ico}</span><b>${n}</b><small>${d}</small></button>`).join("")}</div>
              <div class="lp-reglages">
                <div><span class="vs-lib">Ton</span><div class="puces">${Object.entries(TONS).map(([k, l]) => `<button type="button" class="puce" data-ton="${k}">${l}</button>`).join("")}</div></div>
                <div id="lp-longueur-bloc"><span class="vs-lib">Longueur</span><div class="puces">${Object.entries(LONGUEURS).map(([k, l]) => `<button type="button" class="puce" data-longueur="${k}">${l}</button>`).join("")}</div></div>
                <div><span class="vs-lib">Émojis</span><div class="puces">${Object.entries(EMOJIS).map(([k, l]) => `<button type="button" class="puce" data-emojis="${k}">${l}</button>`).join("")}</div></div>
              </div>
              <details class="lp-plus"><summary>Plus d'options : angle, précision, mon style</summary>
                <span class="vs-lib">Angle</span><div class="puces" id="lp-approches">${Object.entries(APPROCHES).map(([k, l]) => `<button type="button" class="puce" data-approche="${k}">${l}</button>`).join("")}</div>
                <label class="vs-lib" for="lp-consigne">Précision pour l'IA</label>
                <input id="lp-consigne" maxlength="200" placeholder="Ex. : s'adresser aux chefs d'entreprise">
                <p class="alerte-donnees">N'indiquez jamais de nom ni d'information sur un client.</p>
                <details class="lp-voix" id="bloc-voix"><summary>✍️ Écrire dans mon style (Ma voix)</summary>
                  <p class="doux petit">Collez 2 ou 3 de vos posts LinkedIn : l'IA imitera votre ton et votre rythme, sans reprendre leur contenu.</p>
                  <textarea id="voix-exemples" rows="5" maxlength="4000" placeholder="Vos posts, séparés par une ligne vide"></textarea>
                  <label class="lp-case"><input type="checkbox" id="voix-actif"><span>Utiliser mon style</span></label>
                  <button type="button" class="bouton bouton-discret" id="btn-voix">Enregistrer</button></details>
              </details>
              <div class="lp-go"><button type="button" class="bouton gros-bouton" id="lp-rediger" disabled>✨ Rédiger le post</button><span class="doux petit" id="lp-go-info">Choisissez d'abord un sujet.</span></div>
            </section>
            <section class="carte lp-bloc" id="lp-b3" hidden>
              <div id="lp-attente" class="attente" hidden><span class="rond"></span><span id="lp-attente-txt">Rédaction en cours, 10 à 30 secondes…</span></div>
              <div id="lp-erreur" hidden></div>
              <div id="lp-resultat" hidden>
                <h2 class="lp-titre"><span class="lp-n">3</span>Votre post <span class="lp-format-tag" id="lp-format-tag"></span></h2>
                <div class="lp-parties" id="lp-parties" hidden></div>
                <div id="lp-bloc-accroches"><span class="vs-lib">L'accroche · ce qu'on lit avant « voir plus »</span><div class="lp-accroches" id="lp-accroches"></div></div>
                <label class="vs-lib" for="lp-texte">Le texte (modifiable)</label>
                <textarea id="lp-texte" class="lp-texte" spellcheck="true"></textarea>
                <div id="lp-bloc-ctas"><span class="vs-lib">La conclusion</span><div class="puces lp-ctas" id="lp-ctas"></div></div>
                <div id="lp-bloc-tags"><span class="vs-lib">Les hashtags · touchez pour retirer ou remettre</span><div class="puces" id="lp-tags"></div></div>
                <div id="lp-format-zone"></div>
                <section class="lp-image" id="lp-image" hidden>
                  <div class="lp-image-tete"><span class="vs-lib">L'image du post</span><div class="puces" id="lp-modeles"></div></div>
                  <div class="lp-image-grille">
                    <div id="lp-image-zone" class="lp-image-zone"></div>
                    <div>
                      <details class="lp-plus"><summary>Modifier les textes de l'image</summary>
                        <label class="vs-lib" for="v-titre">Titre</label><input id="v-titre" maxlength="80">
                        <label class="vs-lib" for="v-points">Points (un par ligne)</label><textarea id="v-points" rows="4"></textarea>
                        <label class="vs-lib" for="v-conclusion">Message final</label><input id="v-conclusion" maxlength="90">
                        <p class="alerte-donnees">Tout chiffre ajouté à la main doit être vérifié.</p></details>
                      <details class="lp-plus" id="bloc-signature"><summary>Signature : <span id="signature-resume"></span></summary>
                        <label class="vs-lib" for="sig-nom">Nom du conseiller</label><input id="sig-nom" maxlength="60" placeholder="Prénom Nom">
                        <label class="vs-lib" for="sig-cabinet">Cabinet</label><input id="sig-cabinet" maxlength="60" placeholder="Nom du cabinet">
                        <label class="lp-case" id="bloc-pour-tous" hidden><input type="checkbox" id="sig-pour-tous"><span>Utiliser ce cabinet pour toute l'équipe</span></label>
                        <button type="button" class="bouton bouton-discret" id="btn-signature">Enregistrer ma signature</button></details>
                      <div class="alt-texte" id="alt-texte"></div>
                    </div>
                  </div>
                </section>
                <div id="lp-verif"></div>
                <div class="lp-actions">
                  <button type="button" class="bouton gros-bouton" id="lp-publier">Publier sur LinkedIn</button>
                  <button type="button" class="bouton bouton-discret" id="lp-copier">Copier le texte</button>
                  <button type="button" class="bouton bouton-discret" id="lp-planifier">🗓 Enregistrer · planifier</button>
                  <button type="button" class="bouton bouton-discret" id="lp-video">🎬 En faire une vidéo</button>
                </div>
                <div class="lp-planif" id="lp-planif" hidden></div>
                <div class="publie-barre" id="publie-barre" hidden><span id="publie-texte">Publié ?</span><button type="button" class="bouton" id="btn-marquer">✓ Oui, marquer comme publié</button></div>
                <div class="lp-autres">
                  <button type="button" class="lien-bouton" id="lp-autre">↻ Une autre version</button>
                  <button type="button" class="lien-bouton" id="lp-nouveau">Nouveau post</button>
                </div>
              </div>
            </section>
          </div>
          <button type="button" class="lp-voir-apercu" id="lp-voir-apercu" hidden>👀 Voir l'aperçu LinkedIn</button>
          <aside class="lp-droite" id="lp-droite">
            <div class="lp-apercu-tete"><span class="vs-lib">Aperçu LinkedIn</span>
              <div class="lp-bascule" role="group" aria-label="Appareil"><button type="button" data-ap="mobile" aria-pressed="true">📱 Téléphone</button><button type="button" data-ap="bureau" aria-pressed="false">💻 Ordinateur</button></div></div>
            <div class="lp-apercu mobile" id="lp-apercu"></div>
            <div class="lp-compteurs" id="lp-compteurs"></div>
            <div class="lp-controle" id="lp-controle"></div>
          </aside>
        </div>
      </div>
      <div id="lp-planning" hidden></div>`;
  }

  // ---------------------------------------------------------------- 1. le sujet
  function afficherSources() {
    document.querySelectorAll("[data-src]").forEach((b) => b.setAttribute("aria-selected", b.dataset.src === E.onglet));
    const z = $("lp-sources"), d = E.donnees;
    if (!d && ["idees", "actus"].includes(E.onglet)) { z.innerHTML = `<div class="attente"><span class="rond"></span>Recherche des sujets du moment…</div>`; return; }
    if (E.onglet === "idees") {
      const jour = new Date().toLocaleDateString("en-CA"), graine = [...jour].reduce((a, c) => a + c.charCodeAt(0), 0);
      const fichesJour = [0, 1, 2].map((k) => FICHES[(graine + k * 5) % FICHES.length]);
      const publies = new Set(MES_POSTS.filter((p) => p.statut === "publie" && p.sujet_id).map((p) => p.sujet_id));
      z.innerHTML = `${d.idees.length ? `<div class="lp-idees">${d.idees.map((i, k) => `<button type="button" class="lp-idee" data-idee="${k}">
          <span class="vv-tag">${i.simple ? "📰 À la une" : "💡 Idée de l'IA"}</span>${publies.has(i.sujet_id) ? '<span class="statut publie">✓ Déjà publié</span>' : ""}
          <strong>${echapper(i.titre)}</strong><span class="petit doux">${echapper(i.pourquoi || "")}</span></button>`).join("")}</div>` : `<p class="doux">Pas d'idée tirée de l'actualité pour le moment.</p>`}
        <span class="vs-lib lp-sous">🎓 Toujours d'actualité</span>
        <div class="vv-liste lp-courte">${fichesJour.map((f) => `<button type="button" class="vv-ligne" data-fiche="${f.id}"><strong>${echapper(f.titre)} : l'essentiel</strong><span>${echapper(f.sousTitre || "")}</span></button>`).join("")}</div>`;
    } else if (E.onglet === "actus") {
      z.innerHTML = d.sujets.length ? `<div class="vv-liste">${d.sujets.slice(0, E.nbActus).map((s) => `<button type="button" class="vv-ligne" data-actu="${s.id}"><strong>${echapper(s.titre)}</strong><span>${dateCourte(s.derniere_pub)}${s.sources ? " · " + echapper(s.sources.split(",").slice(0, 2).join(", ")) : ""}</span></button>`).join("")}</div>
        ${d.sujets.length > E.nbActus ? `<p class="lp-centre"><button type="button" class="bouton bouton-discret" id="lp-plus-actus">Plus d'actualités</button></p>` : ""}` : `<p class="doux">Pas d'actualité importante sur les 4 derniers jours.</p>`;
      const pl = $("lp-plus-actus"); if (pl) pl.onclick = () => { E.nbActus += 12; afficherSources(); };
    } else if (E.onglet === "fiches") {
      z.innerHTML = `<input type="search" class="vv-cherche" id="lp-cherche" placeholder="🔍 Rechercher une fiche : PER, donation, SCPI…" aria-label="Rechercher une fiche" autocomplete="off">
        <div class="vv-liste" id="lp-fiches"></div>`;
      const lister = () => {
        const q = String($("lp-cherche").value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/).filter(Boolean);
        const l = FICHES.filter((f) => q.every((m) => `${f.titre} ${f.sousTitre || ""} ${f.recherche || ""}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(m)));
        $("lp-fiches").innerHTML = l.length ? l.map((f) => `<button type="button" class="vv-ligne" data-fiche="${f.id}"><strong>${echapper(f.titre)}</strong><span>${echapper(f.sousTitre || "")}</span></button>`).join("") : `<p class="doux petit">Aucune fiche ne correspond.</p>`;
      };
      $("lp-cherche").oninput = lister; lister();
    } else if (E.onglet === "lien") {
      z.innerHTML = `<label class="vs-lib" for="lp-lien">Lien d'un article</label>
        <div class="lp-ligne"><input id="lp-lien" type="url" inputmode="url" placeholder="https://…" autocomplete="off"><button type="button" class="bouton" id="lp-lien-ok">Utiliser</button></div>
        <p class="doux petit">Si l'article est déjà dans la veille du site, son résumé sert de source. Le site ne lit jamais une page extérieure : sinon, collez vous-même le texte en accès libre ci-dessous.</p>
        <label class="vs-lib" for="lp-colle">Ou collez un texte (extrait d'article, note, communiqué)</label>
        <textarea id="lp-colle" rows="6" maxlength="5000" placeholder="Collez ici la partie en accès libre de l'article, ou votre note…"></textarea>
        <div class="lp-ligne"><input id="lp-media" maxlength="60" placeholder="Média (facultatif), ex. Les Echos"><button type="button" class="bouton" id="lp-colle-ok">Utiliser ce texte</button></div>
        <p class="alerte-donnees">Jamais de texte contenant des informations sur un client : il est envoyé à l'IA (Gemini).</p>`;
      $("lp-lien-ok").onclick = async () => {
        const b = $("lp-lien-ok"); b.disabled = true;
        try {
          const r = await appelApi("/api/linkedin/lien", "POST", { lien: $("lp-lien").value });
          if (r.trouve) choisir({ type: "sujet", sujet_id: r.sujet_id, libelle: r.titre, detail: `Article de ${r.media}, déjà dans la veille du site` });
          else { notifier("Cet article n'est pas dans la veille du site : collez son texte en accès libre ci-dessous.", true); $("lp-colle").focus(); }
        } catch (e) { notifier(e.message, true); }
        b.disabled = false;
      };
      $("lp-colle-ok").onclick = () => {
        const t = $("lp-colle").value.trim();
        if (t.length < 80) { notifier("Collez au moins quelques phrases (80 caractères).", true); return; }
        const media = $("lp-media").value.trim();
        choisir({ type: "texte", texte: t, media, libelle: t.split(/[.\n]/)[0].slice(0, 90) + "…", detail: `Texte collé${media ? " · " + media : ""} (${t.length} caractères)` });
      };
    } else {
      z.innerHTML = `<label class="vs-lib" for="lp-theme">Votre thème</label>
        <textarea id="lp-theme" rows="3" maxlength="300" placeholder="Ex. : pourquoi revoir sa clause bénéficiaire après un mariage"></textarea>
        <p class="alerte-donnees">Sans source, l'IA reste générale et n'écrit aucun chiffre. N'indiquez aucune donnée client.</p>
        <p><button type="button" class="bouton" id="lp-theme-ok">Utiliser ce thème</button></p>`;
      $("lp-theme-ok").onclick = () => { const t = $("lp-theme").value.trim(); if (!t) { notifier("Écrivez d'abord votre thème.", true); return; } choisir({ type: "libre", theme: t, libelle: t, detail: "Thème libre : l'IA n'écrira aucun chiffre" }); };
    }
    z.querySelectorAll("[data-idee]").forEach((b) => b.onclick = () => {
      const i = E.donnees.idees[+b.dataset.idee];
      choisir({ type: "sujet", sujet_id: i.sujet_id, libelle: i.sujet?.titre || i.titre, detail: "Actualité du site" + (i.sujet?.sources ? " · " + i.sujet.sources.split(",").slice(0, 2).join(", ") : "") }, i.simple ? null : i.approche);
    });
    z.querySelectorAll("[data-actu]").forEach((b) => b.onclick = () => { const s = E.donnees.sujets.find((x) => x.id === b.dataset.actu); choisir({ type: "sujet", sujet_id: s.id, libelle: s.titre, detail: "Actualité du site" + (s.sources ? " · " + s.sources.split(",").slice(0, 2).join(", ") : "") }); });
    z.querySelectorAll("[data-fiche]").forEach((b) => b.onclick = () => choisirFiche(b.dataset.fiche));
  }
  function choisirFiche(id) { const f = FICHES.find((x) => x.id === id); if (f) choisir({ type: "fiche", fiche_id: f.id, libelle: f.titre, detail: `Fiche Apprendre vérifiée${f.verifie ? " le " + f.verifie : ""} : ses chiffres sont autorisés` }, "pedagogie"); }
  function choisir(src, approche) {
    E.source = src;
    if (approche !== undefined && approche && !$("lp-b2").dataset.angleManuel) E.approche = approche;
    afficherChoisi(); majGo(); sauver();
    $("lp-b2").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function afficherChoisi() {
    const s = E.source, z = $("lp-choisi");
    if (!s) { z.hidden = true; $("lp-choix").hidden = false; afficherSources(); return; }
    const ico = { sujet: "📰", fiche: "🎓", texte: "📋", libre: "✏️" }[s.type];
    z.hidden = false; $("lp-choix").hidden = true;
    z.innerHTML = `<div class="vv-choisi"><span class="vv-choisi-ico" aria-hidden="true">${ico}</span><div><strong>${echapper(s.libelle)}</strong><span>${echapper(s.detail || "")}</span></div><button type="button" class="bouton bouton-discret" id="lp-changer">Changer</button></div>`;
    $("lp-changer").onclick = () => { z.hidden = true; $("lp-choix").hidden = false; afficherSources(); };
    $("lp-b1").classList.add("fait");
  }

  // ---------------------------------------------------------------- 2. le format et le style
  function majReglages() {
    document.querySelectorAll("[data-format]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.format === E.format));
    document.querySelectorAll("[data-ton]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.ton === E.ton));
    document.querySelectorAll("[data-longueur]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.longueur === E.longueur));
    document.querySelectorAll("[data-emojis]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.emojis === E.emojis));
    document.querySelectorAll("[data-approche]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.approche === E.approche));
    $("lp-longueur-bloc").hidden = ["serie", "sondage", "carrousel"].includes(E.format);
    majGo();
  }
  function majGo() {
    const b = $("lp-rediger"), ok = !!E.source;
    b.disabled = !ok;
    b.textContent = `✨ Rédiger ${E.format === "serie" ? "la série de 3 posts" : E.format === "carrousel" ? "le carrousel" : E.format === "sondage" ? "le sondage" : "le post"}`;
    $("lp-go-info").textContent = ok ? `${FORMATS[E.format][1]} · ${TONS[E.ton].toLowerCase()}${["serie", "sondage", "carrousel"].includes(E.format) ? "" : " · " + LONGUEURS[E.longueur].toLowerCase()} · ${EMOJIS[E.emojis].toLowerCase()}` : "Choisissez d'abord un sujet.";
  }

  async function rediger() {
    if (!E.source) return;
    const s = E.source, corps = { format: E.format, ton: E.ton, longueur: E.longueur, emojis: E.emojis, approche: E.approche || undefined, consigne: $("lp-consigne").value.trim(), ma_voix: $("voix-actif").checked };
    if (s.type === "sujet") corps.sujet_id = s.sujet_id;
    else if (s.type === "fiche") { const f = FICHES.find((x) => x.id === s.fiche_id); corps.fiche = { titre: f.titre, contenu: texteFiche(f) }; }
    else if (s.type === "texte") { corps.texte_source = s.texte; corps.texte_media = s.media; }
    else corps.theme = s.theme;
    $("lp-b3").hidden = false; $("lp-attente").hidden = false; $("lp-resultat").hidden = true; $("lp-erreur").hidden = true;
    $("lp-attente-txt").textContent = E.format === "serie" ? "L'IA écrit les 3 posts de la série, 20 à 40 secondes…" : E.format === "carrousel" ? "L'IA écrit le post et les diapositives, 20 à 40 secondes…" : "Rédaction en cours, 10 à 30 secondes…";
    $("lp-b3").scrollIntoView({ behavior: "smooth", block: "start" });
    $("lp-rediger").disabled = true;
    try {
      const r = await appelApi("/api/linkedin/rediger", "POST", corps);
      Object.assign(E, { r, accroche: 0, cta: r.format === "sondage" ? -1 : 0, tagsOff: [], partie: 0, postId: null, serieId: null, visuel: r.visuel || null, page: 0,
        diapos: (r.diapos || []).map((x) => ({ ...x })), sondage: r.sondage ? { question: r.sondage.question, options: [...r.sondage.options, "", "", "", ""].slice(0, 4) } : null });
      E.textes = r.format === "serie" ? (r.serie || []).map((_, i) => construire(i)) : [construire()];
      E.texte = E.textes[0] || "";
      afficherResultat();
      if (r.restants <= 5) notifier(`Encore ${r.restants} rédaction${r.restants > 1 ? "s" : ""} possible${r.restants > 1 ? "s" : ""} aujourd'hui.`);
    } catch (e) {
      $("lp-erreur").hidden = false;
      $("lp-erreur").innerHTML = `<p class="message ko">${echapper(e.message)}</p><p><button type="button" class="bouton" id="lp-reessayer">Réessayer</button></p>`;
      $("lp-reessayer").onclick = rediger;
    }
    $("lp-attente").hidden = true; majGo();
  }

  // Typographie française : espace insécable entre un nombre et « % » ou « € » (jamais coupés en fin de ligne).
  const typo = (t) => String(t).replace(/(\d)[ \u00a0]?(%|€)/g, "$1\u202f$2");
  // Texte complet : accroche, corps, conclusion, source, hashtags (pour une partie de série : sa propre accroche).
  function construire(partie) { return typo(construireBrut(partie)); }
  function construireBrut(partie) {
    const r = E.r, serie = r.format === "serie";
    const tags = r.hashtags.filter((h) => !E.tagsOff.includes(h)).join(" ");
    if (serie) {
      const p = r.serie[partie] || {}, paras = String(p.corps || "").trim().split(/\n\s*\n/);
      const n = r.serie.length;
      return [`${p.accroche}${/\(\d\/\d\)|\d\/\d/.test(p.accroche) ? "" : ` (${partie + 1}/${n})`}`, ...paras, r.lien?.nom && !/source\s*:/i.test(p.corps) && r.type_source !== "fiche" ? `Source : ${r.lien.nom}` : "", tags].filter(Boolean).join("\n\n");
    }
    const paras = String(r.corps || "").trim().split(/\n\s*\n/);
    const source = /^source\s*:/i.test(paras[paras.length - 1] || "") ? paras.pop() : "";
    return [r.accroches[E.accroche] || "", ...paras, r.appels_action[E.cta] || "", source, tags].filter(Boolean).join("\n\n");
  }
  // Remplace un morceau du texte sans écraser les modifications faites à la main.
  function appliquer(ancien, nouveau, repli) {
    ancien = ancien && typo(ancien); nouveau = nouveau && typo(nouveau);
    let t = E.texte;
    if (ancien && t.includes(ancien)) t = nouveau ? t.replace(ancien, nouveau) : t.replace(ancien, "").replace(/\n{3,}/g, "\n\n").trim();
    else if (nouveau) t = repli(t, nouveau);
    E.texte = t; E.textes[E.partie] = t; $("lp-texte").value = t; majTexte();
  }
  function hauteur() { const t = $("lp-texte"); t.style.height = "auto"; t.style.height = Math.max(220, t.scrollHeight + 2) + "px"; }
  function majTexte() { hauteur(); afficherApercu(); afficherControle(); sauver(); $("lp-voir-apercu").hidden = !E.r; }

  // ---------------------------------------------------------------- 3. le résultat
  function afficherResultat() {
    const r = E.r, serie = r.format === "serie";
    $("lp-resultat").hidden = false; $("publie-barre").hidden = true; $("lp-planif").hidden = true;
    $("lp-format-tag").textContent = FORMATS[r.format][0] + " " + FORMATS[r.format][1];
    // série : onglets des 3 posts
    $("lp-parties").hidden = !serie;
    if (serie) {
      $("lp-parties").innerHTML = E.textes.map((_, i) => `<button type="button" data-partie="${i}" aria-pressed="${i === E.partie}">Post ${i + 1}/${E.textes.length}</button>`).join("");
      $("lp-parties").querySelectorAll("[data-partie]").forEach((b) => b.onclick = () => { E.partie = +b.dataset.partie; E.texte = E.textes[E.partie]; afficherResultat(); });
    }
    $("lp-bloc-accroches").hidden = serie || !r.accroches.length;
    $("lp-accroches").innerHTML = r.accroches.map((a, k) => `<button type="button" class="lp-accroche" data-a="${k}" aria-pressed="${k === E.accroche}"><span class="lp-accroche-n">${k + 1}</span>${echapper(a)}</button>`).join("");
    $("lp-accroches").querySelectorAll("[data-a]").forEach((b) => b.onclick = () => {
      const k = +b.dataset.a; if (k === E.accroche) return;
      appliquer(r.accroches[E.accroche], r.accroches[k], (t, n) => n + "\n\n" + t); E.accroche = k;
      $("lp-accroches").querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    });
    $("lp-bloc-ctas").hidden = serie || !r.appels_action.length;
    $("lp-ctas").innerHTML = [...r.appels_action.map((c, k) => `<button type="button" class="puce" data-cta="${k}" aria-pressed="${k === E.cta}">${echapper(c)}</button>`), `<button type="button" class="puce" data-cta="-1" aria-pressed="${E.cta === -1}">Sans conclusion</button>`].join("");
    $("lp-ctas").querySelectorAll("[data-cta]").forEach((b) => b.onclick = () => {
      const k = +b.dataset.cta; if (k === E.cta) return;
      appliquer(r.appels_action[E.cta], r.appels_action[k] || "", (t, n) => { const l = t.split("\n\n"); const i = /^#/.test(l[l.length - 1]) ? l.length - 1 : l.length; l.splice(i, 0, n); return l.join("\n\n"); });
      E.cta = k; $("lp-ctas").querySelectorAll("[data-cta]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    });
    $("lp-tags").innerHTML = r.hashtags.map((h) => `<button type="button" class="puce" data-h="${echapper(h)}" aria-pressed="${!E.tagsOff.includes(h)}">${echapper(h)}</button>`).join("");
    $("lp-tags").querySelectorAll("[data-h]").forEach((b) => b.onclick = () => {
      const h = b.dataset.h, retire = !E.tagsOff.includes(h);
      const enlever = (t) => t.replace(new RegExp("(^|\\s)" + h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=\\s|$)"), "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      const ajouter = (t) => { const l = t.split("\n"); const der = l.length - 1; if (/^#/.test(l[der].trim())) l[der] = l[der].trim() + " " + h; else l.push("", h); return l.join("\n"); };
      if (retire) E.tagsOff.push(h); else E.tagsOff = E.tagsOff.filter((x) => x !== h);
      E.textes = E.textes.map((t) => (retire ? enlever(t) : ajouter(t))); E.texte = E.textes[E.partie];
      $("lp-texte").value = E.texte; b.setAttribute("aria-pressed", !retire); majTexte();
    });
    $("lp-texte").value = E.texte;
    afficherZoneFormat();
    $("lp-image").hidden = !E.visuel || r.format === "carrousel" || (serie && E.partie > 0);
    if (!$("lp-image").hidden) { remplirTextesVisuel(); dessinerImage(); } else { images = []; imageUrl = ""; }
    $("lp-verif").innerHTML = (r.a_verifier?.length ? `<div class="avertissement"><strong>À vérifier avant de publier (signalé par l'IA) :</strong><ul>${r.a_verifier.map((x) => `<li>${echapper(x)}</li>`).join("")}</ul></div>` : "")
      + (r.lien?.url ? `<p class="doux petit">Article source : <a href="${echapper(r.lien.url)}" target="_blank" rel="noopener noreferrer">${echapper(r.lien.nom)} ↗</a></p>` : "");
    majTexte();
  }

  // Éditeurs propres au format : diapositives du carrousel, sondage.
  function afficherZoneFormat() {
    const z = $("lp-format-zone"), f = E.r.format;
    if (f === "carrousel") {
      z.innerHTML = `<div class="lp-diapos-tete"><span class="vs-lib">Les diapositives (${E.diapos.length})</span><span class="lp-diapos-act"><button type="button" class="bouton bouton-discret" id="lp-pdf">⬇ Télécharger le PDF</button></span></div>
        <div class="lp-diapos-vue" id="lp-diapos-vue"><div class="attente"><span class="rond"></span>Création des diapositives…</div></div>
        <details class="lp-plus"><summary>Modifier le texte des diapositives</summary>
        <ol class="lp-diapos">${E.diapos.map((d, i) => `<li><div class="lp-diapo-tete"><b>${i === 0 ? "Couverture" : i === E.diapos.length - 1 ? "Fin" : "Diapositive " + (i + 1)}</b>
          <span><button type="button" class="vs-ico" data-dmonter="${i}" ${i === 0 ? "disabled" : ""} aria-label="Monter">↑</button><button type="button" class="vs-ico" data-ddesc="${i}" ${i === E.diapos.length - 1 ? "disabled" : ""} aria-label="Descendre">↓</button><button type="button" class="vs-ico" data-dsuppr="${i}" aria-label="Retirer">✕</button></span></div>
          <input data-dt="${i}" maxlength="70" value="${echapper(d.titre)}" aria-label="Titre de la diapositive ${i + 1}">
          <textarea data-dx="${i}" rows="2" maxlength="200" aria-label="Texte de la diapositive ${i + 1}">${echapper(d.texte)}</textarea></li>`).join("")}</ol>
        ${E.diapos.length < 10 ? `<button type="button" class="bouton bouton-discret" id="lp-dajout">+ Ajouter une diapositive</button>` : ""}</details>
        <p class="doux petit">Dans LinkedIn : « Commencer un post » → « Ajouter un document » → choisissez le PDF et donnez-lui un titre.</p>`;
      z.oninput = (e) => { const t = e.target; if (t.dataset.dt) E.diapos[+t.dataset.dt].titre = t.value; else if (t.dataset.dx) E.diapos[+t.dataset.dx].texte = t.value; else return; clearTimeout(minuteur); minuteur = setTimeout(() => { dessinerDiaposVue(); sauver(); }, 400); };
      z.onclick = (e) => {
        const b = e.target.closest("button"); if (!b) return;
        const d = b.dataset, l = E.diapos;
        if (b.id === "lp-pdf") return telechargerMedia();
        if (b.id === "lp-dajout") l.splice(Math.max(1, l.length - 1), 0, { titre: "Nouvelle idée", texte: "" });
        else if (d.dmonter) { const i = +d.dmonter; [l[i - 1], l[i]] = [l[i], l[i - 1]]; }
        else if (d.ddesc) { const i = +d.ddesc; [l[i + 1], l[i]] = [l[i], l[i + 1]]; }
        else if (d.dsuppr) { if (l.length <= 3) return notifier("Gardez au moins 3 diapositives.", true); l.splice(+d.dsuppr, 1); }
        else return;
        const ouvert = z.querySelector("details")?.open; afficherZoneFormat(); if (ouvert) z.querySelector("details").open = true;
      };
      dessinerDiaposVue();
    } else if (f === "sondage" && E.sondage) {
      const s = E.sondage;
      z.innerHTML = `<div class="lp-sondage"><span class="vs-lib">Le sondage</span>
        <label class="lp-champ"><span>Question <small id="lp-sq-n">${s.question.length}/140</small></span><input id="lp-sq" maxlength="140" value="${echapper(s.question)}"></label>
        ${s.options.map((o, i) => `<label class="lp-champ"><span>Réponse ${i + 1}${i > 1 ? " (facultative)" : ""} <small data-son="${i}">${o.length}/30</small></span><input data-so="${i}" maxlength="30" value="${echapper(o)}"></label>`).join("")}
        <button type="button" class="bouton bouton-discret" id="lp-copier-sondage">Copier la question et les réponses</button>
        <p class="doux petit">Dans LinkedIn : « Commencer un post » → « Plus » (+) → « Créer un sondage ». Collez la question et les réponses, puis le texte du post au-dessus. Durée conseillée : 1 semaine.</p></div>`;
      z.oninput = (e) => {
        const t = e.target;
        if (t.id === "lp-sq") { s.question = t.value; $("lp-sq-n").textContent = `${t.value.length}/140`; }
        else if (t.dataset.so) { s.options[+t.dataset.so] = t.value; z.querySelector(`[data-son="${t.dataset.so}"]`).textContent = `${t.value.length}/30`; }
        afficherApercu(); sauver();
      };
      z.onclick = (e) => { if (e.target.id === "lp-copier-sondage") copier(`${s.question}\n${s.options.filter(Boolean).map((o, i) => `${i + 1}. ${o}`).join("\n")}`); };
    } else { z.innerHTML = ""; z.oninput = z.onclick = null; }
  }

  // ---------------------------------------------------------------- image et carrousel (aux couleurs du cabinet)
  const sig = () => ({ nom: signature.nom || E.moi?.nom || "", cabinet: signature.cabinet });
  function modelesPossibles(v) {
    return Object.keys(NOMS_MODELES).filter((m) => m === "question" || (m === "chiffre" && v.chiffre) || ((m === "points" || m === "etapes") && v.points.length >= 2) || (m === "comparaison" && v.gauche.length && v.droite.length) || (m === "mythe" && v.mythe && v.realite));
  }
  async function dessinerImage() {
    const v = E.visuel; if (!v) return;
    $("lp-modeles").innerHTML = modelesPossibles(v).map((m) => `<button type="button" class="puce" data-modele="${m}" aria-pressed="${m === v.modele}">${NOMS_MODELES[m]}</button>`).join("");
    $("lp-modeles").querySelectorAll("[data-modele]").forEach((b) => b.onclick = () => { v.modele = b.dataset.modele; sauver(); dessinerImage(); });
    $("signature-resume").textContent = [signature.nom, signature.cabinet].filter(Boolean).join(" · ") || "à compléter";
    try {
      images = [await dessinerVisuel({ ...v, source: E.r?.lien?.nom || "" }, sig())];
      imageUrl = images[0].toDataURL("image/jpeg", .85);
      $("lp-image-zone").innerHTML = `<img alt="Image du post" src="${imageUrl}"><button type="button" class="bouton bouton-discret" id="lp-png">⬇ Télécharger l'image</button>`;
      $("lp-png").onclick = telechargerMedia;
      $("alt-texte").innerHTML = `<strong>Texte alternatif</strong> (accessibilité)<p>${echapper(texteAlternatif(v))}</p><button type="button" class="lien-bouton" id="btn-alt">Copier le texte alternatif</button>`;
      $("btn-alt").onclick = () => copier(texteAlternatif(v));
    } catch (e) { $("lp-image-zone").innerHTML = `<p class="message ko">Image impossible à créer : ${echapper(e.message)}</p>`; }
    afficherApercu();
  }
  async function dessinerDiaposVue() {
    const v = { surtitre: E.visuel?.surtitre || "Patrimoine", source: E.r?.lien?.nom || "" };
    try {
      images = await dessinerDiapos(v, E.diapos.filter((d) => d.titre.trim()), sig());
      imageUrl = images[0]?.toDataURL("image/jpeg", .85) || "";
      $("lp-diapos-vue").innerHTML = images.map((c, i) => `<img alt="Diapositive ${i + 1}" src="${c.toDataURL("image/jpeg", .8)}">`).join("");
    } catch (e) { $("lp-diapos-vue").innerHTML = `<p class="message ko">Diapositives impossibles à créer : ${echapper(e.message)}</p>`; }
    afficherApercu();
  }
  function remplirTextesVisuel() { const v = E.visuel; if (!v) return; $("v-titre").value = v.titre || ""; $("v-points").value = (v.points || []).join("\n"); $("v-conclusion").value = v.conclusion || ""; }
  async function fichierMedia() {
    if (!images.length) return null;
    if (E.r.format === "carrousel") return new File([await carrouselPdf(images)], "carrousel-linkedin.pdf", { type: "application/pdf" });
    return new File([await versBlob(images[0])], "post-linkedin.png", { type: "image/png" });
  }
  async function telechargerMedia() { const f = await fichierMedia(); if (f) telechargerBlob(f, f.name); }
  const peutPartager = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] })); } catch { return false; } };

  // ---------------------------------------------------------------- aperçu fidèle de LinkedIn
  function coupe(t, max) {
    // LinkedIn coupe après environ 3 lignes : la limite de caractères, ou la 3e ligne si le texte va à la ligne avant.
    const l = t.split("\n"); let cumul = 0, n = 0;
    for (let i = 0; i < l.length && n < 3; i++) { cumul += l[i].length + 1; n += Math.max(1, Math.ceil(l[i].length / (max / 3))); }
    return Math.min(t.length, max, Math.max(0, cumul - 1));
  }
  function afficherApercu(ouvert) {
    const z = $("lp-apercu"), t = E.texte;
    z.className = "lp-apercu " + E.apercu;
    if (!E.r) {
      z.innerHTML = `<div class="lp-ap-vide"><span aria-hidden="true">👀</span><p>L'aperçu de votre post apparaîtra ici, tel qu'il s'affichera sur LinkedIn.</p></div>`;
      $("lp-compteurs").innerHTML = ""; return;
    }
    const nom = E.moi?.nom || signature.nom || "Vous", ini = nom.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
    const c = coupe(t, COUPE[E.apercu]), debut = t.slice(0, c), suite = t.slice(c);
    const f = E.r.format;
    let media = "";
    if (f === "carrousel" && images.length) {
      const i = Math.min(E.page, images.length - 1);
      media = `<div class="lp-ap-doc"><div class="lp-ap-doc-titre">${echapper((E.diapos[0]?.titre || "Document").slice(0, 60))} · ${images.length} pages</div>
        <div class="lp-ap-doc-img"><img alt="" src="${images[i].toDataURL("image/jpeg", .7)}"><button type="button" class="lp-ap-fl g" data-page="-1" aria-label="Page précédente" ${i === 0 ? "hidden" : ""}>‹</button><button type="button" class="lp-ap-fl d" data-page="1" aria-label="Page suivante" ${i >= images.length - 1 ? "hidden" : ""}>›</button><span class="lp-ap-pg">${i + 1} / ${images.length}</span></div></div>`;
    } else if (f === "sondage" && E.sondage) {
      const s = E.sondage;
      media = `<div class="lp-ap-sondage"><small>L'auteur peut voir comment vous votez.</small><b>${echapper(s.question)}</b>${s.options.filter(Boolean).map((o) => `<span class="lp-ap-opt">${echapper(o)}</span>`).join("")}<small>0 vote · 1 semaine restante</small></div>`;
    } else if (imageUrl && !(f === "serie" && E.partie > 0)) media = `<img class="lp-ap-img" alt="" src="${imageUrl}">`;
    z.innerHTML = `<div class="lp-ap-tete"><span class="lp-ap-avatar">${echapper(ini)}</span><span class="lp-ap-qui"><b>${echapper(nom)}</b><small>Conseiller en gestion de patrimoine</small><small>1 h · 🌐</small></span><span class="lp-ap-suivre">+ Suivre</span></div>
      <div class="lp-ap-texte">${echapper(debut)}${suite ? (ouvert ? echapper(suite) : `<button type="button" class="lp-ap-plus" id="lp-voir-plus">…voir plus</button>`) : ""}</div>
      ${media}
      <div class="lp-ap-stats"><span>👍💡 12</span><span>3 commentaires</span></div>
      <div class="lp-ap-barre"><span>👍 J'aime</span><span>💬 Commenter</span><span>🔁 Republier</span><span>✈️ Envoyer</span></div>`;
    const vp = $("lp-voir-plus"); if (vp) vp.onclick = () => afficherApercu(true);
    z.querySelectorAll("[data-page]").forEach((b) => b.onclick = () => { E.page = Math.max(0, Math.min(images.length - 1, E.page + +b.dataset.page)); afficherApercu(ouvert); });
    const n = t.length, ac = (E.texte.split("\n")[0] || "").length;
    $("lp-compteurs").innerHTML = `<span class="${c >= ac ? "ok" : "ko"}">Avant « voir plus » : <b>${c}</b> car. ${c >= ac ? "· l'accroche entière est visible" : "· l'accroche est coupée : raccourcissez-la"}</span>
      <span class="${n > 3000 ? "ko" : ""}">Total : <b>${n.toLocaleString("fr-FR")}</b> / 3 000 caractères</span>`;
  }

  // ---------------------------------------------------------------- vérification avant publication
  const RISQUES = [
    [/\bgaranti(e|s|es)?\b/i, "« garanti » : seulement si la garantie est réelle (laquelle, par qui)"],
    [/sans (aucun )?risques?|z[ée]ro risque/i, "« sans risque » : tout placement comporte des risques"],
    [/(rendement|gain|performance|plus-value)s? (assur|garanti|certain|s[ûu]r)/i, "promesse de rendement ou de gain"],
    [/placement s[ûu]r|à coup s[ûu]r|100 ?% s[ûu]r/i, "« sûr » : laisse croire à une absence de risque"],
    [/meilleur placement|placement id[ée]al|imbattable/i, "superlatif commercial"],
    [/z[ée]ro imp[ôo]t|(plus|aucun) d'imp[ôo]ts?|d[ée]fiscalis\w* (totale|garantie)/i, "promesse fiscale absolue (plafonds, conditions)"],
    [/sans (aucuns? )?frais/i, "« sans frais » : des frais existent presque toujours"],
  ];
  // Sujets où un risque de perte en capital existe (pas le Livret A ni le LEP, garantis par l'État).
  const PLACEMENT = /placement|investi|bourse|\bactions?\b|scpi|assurance[- ]vie|\bper\b|etf|crypto|unités? de compte|\bfonds\b|march[ée]s? financ|obligation|private equity|immobilier locatif/i;
  const CONSEIL = /je vous (conseille|recommande)|vous devez (investir|placer|acheter|souscrire)|\bachetez\b|\binvestissez (dans|sur|en)\b|souscrivez (à|au|un)|n'h[ée]sitez pas à (acheter|investir|souscrire)/i;
  const CLIENT = /[\w.+-]+@[\w-]+\.[\w.]+|(?:\+33|0)[1-9](?:[ .]?\d{2}){4}|\b(M\.|Mme|Monsieur|Madame) [A-ZÉ][a-zé]+|\bmon client\b|\bma cliente\b/;
  function nombresInconnus() {
    const r = E.r, permis = new Set(r.nombres_source || []);
    const tout = [E.texte, ...(r.format === "carrousel" ? E.diapos.flatMap((d) => [d.titre, d.texte]) : []), ...(E.sondage ? [E.sondage.question, ...E.sondage.options] : [])].join("\n").replace(/#\S+/g, "");
    const vus = new Set();
    for (const m of tout.matchAll(/\d[\d\s  ]*(?:[.,]\d+)?(\s?(%|€|ans?\b|mois\b))?/g)) {
      const brut = m[0].replace(/(\s?(%|€|ans?|mois))$/, ""), n = brut.replace(/[\s  ]/g, "").replace(",", ".");
      if (!n) continue;
      if (!m[1] && /^\d$/.test(n)) continue;   // « 3 réflexes », « 1/3 »
      if (/^20[2-3]\d$/.test(n) && r.type_source !== "theme") continue;   // années
      if (!permis.has(n) && !permis.has(n.replace(/\.0+$/, ""))) vus.add(brut.trim());
    }
    return [...vus];
  }
  function afficherControle() {
    if (!E.r) { $("lp-controle").innerHTML = ""; return; }
    const t = [E.texte, ...(E.r.format === "carrousel" ? E.diapos.flatMap((d) => [d.titre, d.texte]) : []), ...(E.sondage ? [E.sondage.question, ...E.sondage.options] : []), E.visuel ? [E.visuel.titre, E.visuel.conclusion, ...(E.visuel.points || [])].join(" ") : ""].join("\n");
    const risques = RISQUES.filter(([re]) => re.test(t)).map(([, m]) => m);
    const inconnus = nombresInconnus(), placement = PLACEMENT.test(t), aRisque = /risque/i.test(t);
    const ts = E.r.type_source, source = ts === "fiche" || ts === "theme" || (ts === "texte" && !E.r.lien) || /source\s*:/i.test(t);
    const lignes = [
      [!inconnus.length, "Chiffres tirés de la source", inconnus.length ? `À vérifier : ${inconnus.slice(0, 6).join(", ")}${ts === "theme" ? " (thème sans source : aucun chiffre ne devrait apparaître)" : ""}` : ts === "theme" ? "aucun chiffre (thème libre)" : "tous présents dans la source"],
      [!risques.length, "Aucune promesse ni formulation trompeuse", risques.join(" ; ")],
      [!placement || aRisque, "Mention du risque", placement ? (aRisque ? "présente" : "le post parle de placement : ajoutez « Investir comporte un risque de perte en capital. »") : "non nécessaire pour ce sujet"],
      [!CONSEIL.test(t), "Pas de conseil personnalisé", CONSEIL.test(t) ? "formulation qui ressemble à une recommandation individuelle" : "information générale"],
      [source, "Source citée", ts === "fiche" ? "fiche vérifiée du site" : ts === "theme" ? "thème général" : source ? "présente" : "ajoutez « Source : » et le média"],
      [!CLIENT.test(t), "Aucune donnée client", CLIENT.test(t) ? "e-mail, téléphone ou nom de personne détecté" : "rien détecté"],
      [E.texte.length <= 3000, "Longueur acceptée par LinkedIn", `${E.texte.length} / 3 000`],
    ];
    const ok = lignes.filter((l) => l[0]).length;
    $("lp-controle").innerHTML = `<div class="lp-ctrl-tete"><span class="vs-lib">Avant de publier</span><b class="${ok === lignes.length ? "ok" : "ko"}">${ok}/${lignes.length}</b></div>
      <ul class="lp-ctrl">${lignes.map(([b, titre, detail]) => `<li class="${b ? "ok" : "ko"}"><span aria-hidden="true">${b ? "✅" : "⚠️"}</span><div><b>${titre}</b>${detail ? `<small>${echapper(detail)}</small>` : ""}</div></li>`).join("")}</ul>
      ${placement && !aRisque ? `<button type="button" class="lien-bouton" id="lp-ajout-risque">+ Ajouter la mention du risque</button>` : ""}`;
    const b = $("lp-ajout-risque");
    if (b) b.onclick = () => { appliquer("", "Investir comporte un risque de perte en capital.", (x, n) => { const l = x.split("\n\n"); const i = /^#/.test(l[l.length - 1]) ? l.length - 1 : l.length; l.splice(i, 0, n); return l.join("\n\n"); }); };
  }

  // ---------------------------------------------------------------- enregistrer, planifier, publier
  function afficherPlanif() {
    const z = $("lp-planif"), serie = E.r.format === "serie", demain = new Date(Date.now() + 86400e3);
    z.hidden = false;
    z.innerHTML = `<span class="vs-lib">${serie ? "Enregistrer les 3 posts de la série" : "Enregistrer dans Mes posts"}</span>
      <div class="lp-planif-ligne">
        <div class="puces" role="group" aria-label="Statut"><button type="button" class="puce" data-pst="brouillon" aria-pressed="true">Brouillon</button><button type="button" class="puce" data-pst="pret" aria-pressed="false">Prêt à publier</button></div>
        <label class="lp-date"><span>${serie ? "1er post le" : "Publication prévue le"}</span><input type="date" id="lp-date" value="${jourIso(demain)}"></label>
        ${serie ? `<label class="lp-date"><span>Puis tous les</span><select id="lp-ecart"><option value="2">2 jours</option><option value="3">3 jours</option><option value="7">7 jours</option></select></label>` : ""}
        <button type="button" class="bouton" id="lp-enregistrer">Enregistrer</button>
      </div>`;
    let statut = "brouillon";
    z.querySelectorAll("[data-pst]").forEach((b) => b.onclick = () => { statut = b.dataset.pst; z.querySelectorAll("[data-pst]").forEach((x) => x.setAttribute("aria-pressed", x === b)); });
    $("lp-enregistrer").onclick = async () => {
      try { await enregistrer(statut, $("lp-date").value || null, serie ? +$("lp-ecart").value : 0); z.hidden = true; notifier(serie ? "Les 3 posts sont dans Mes posts." : "Enregistré dans Mes posts."); }
      catch (e) { notifier(e.message, true); }
    };
  }
  // Un post de série prévu un samedi ou un dimanche passe au lundi (LinkedIn est surtout lu en semaine).
  const jourOuvre = (d) => { while (d.getDay() === 0 || d.getDay() === 6) d = new Date(d.getTime() + 86400e3); return jourIso(d); };
  async function enregistrer(statut, date, ecart = 0) {
    const r = E.r, base = { sujet: E.source?.libelle || "", sujet_id: E.source?.sujet_id || null, format: r.format };
    let posts;
    if (r.format === "serie") {
      E.serieId = E.serieId || "s" + Date.now().toString(36);
      E.idsSerie = E.idsSerie || E.textes.map(() => crypto.randomUUID());
      posts = E.textes.map((texte, i) => ({ ...base, id: E.idsSerie[i], texte, statut, serie: E.serieId, partie: i + 1, visuel: i === 0 ? E.visuel : null,
        date_prevue: date ? jourOuvre(new Date(new Date(date + "T12:00").getTime() + i * ecart * 86400e3)) : null }));
    } else {
      E.postId = E.postId || crypto.randomUUID();
      posts = [{ ...base, id: E.postId, texte: E.texte, statut, date_prevue: date, visuel: E.visuel, extra: r.format === "carrousel" ? { diapos: E.diapos } : r.format === "sondage" ? { sondage: E.sondage } : null }];
    }
    MES_POSTS = (await appelApi("/api/linkedin/posts", "POST", { posts })).posts;
    majNb(); sauver();
  }
  async function publier() {
    copier(E.texte);
    const f = await fichierMedia().catch(() => null);
    if (peutPartager() && f) {
      try { await navigator.share({ files: [f], text: E.texte }); } catch {}
      $("publie-texte").textContent = "Texte copié : collez-le dans LinkedIn si besoin. C'est publié ?";
    } else {
      window.open("https://www.linkedin.com/feed/", "_blank", "noopener");
      if (f) telechargerBlob(f, f.name);
      $("publie-texte").textContent = E.r.format === "sondage" ? "Texte copié : dans LinkedIn, « Commencer un post », collez le texte puis créez le sondage (question et réponses ci-dessus). C'est publié ?"
        : `Texte copié${f ? (E.r.format === "carrousel" ? " et PDF téléchargé (« Ajouter un document »)" : " et image téléchargée") : ""} : dans LinkedIn, « Commencer un post », collez le texte${f ? ", ajoutez le fichier" : ""}. C'est publié ?`;
    }
    $("publie-barre").hidden = false;
  }

  // ---------------------------------------------------------------- planning « Mes posts »
  const majNb = () => { const n = MES_POSTS.filter((p) => p.statut !== "publie").length; $("lp-nb").textContent = n ? String(n) : ""; };
  const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const ROTATION = ["classique", "carrousel", "mythe", "sondage", "chiffre"];
  function ideesSemaine() {
    // Une idée par jour ouvré à venir (5 jours), en alternant actualités du moment et fiches, et en variant les formats.
    const r = [], d = new Date(); let k = 0;
    const idees = E.donnees?.idees || [], graine = [...new Date().toLocaleDateString("en-CA")].reduce((a, c) => a + c.charCodeAt(0), 0);
    while (r.length < 5) {
      d.setDate(d.getDate() + (r.length || k ? 1 : 0)); k++;
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const i = r.length, idee = i % 2 === 0 ? idees[i / 2] : null, f = FICHES[(graine + i * 7) % FICHES.length];
      r.push({ jour: `${JOURS[d.getDay()]} ${d.getDate()}`, date: jourIso(d), format: ROTATION[i % ROTATION.length],
        ...(idee ? { type: "sujet", titre: idee.titre, src: { type: "sujet", sujet_id: idee.sujet_id, libelle: idee.sujet?.titre || idee.titre, detail: "Actualité du site" } }
          : { type: "fiche", titre: f.titre, src: { type: "fiche", fiche_id: f.id, libelle: f.titre, detail: "Fiche Apprendre vérifiée" } }) });
    }
    return r;
  }
  function afficherPlanning() {
    const z = $("lp-planning"), auj = jourIso(new Date());
    const l = MES_POSTS.filter((p) => !filtre || p.statut === filtre);
    const prevus = l.filter((p) => p.date_prevue).sort((a, b) => a.date_prevue.localeCompare(b.date_prevue)), sansDate = l.filter((p) => !p.date_prevue);
    const ligne = (p) => `<li class="lp-post s-${p.statut}${p.date_prevue && p.date_prevue < auj && p.statut !== "publie" ? " retard" : ""}">
      <div class="lp-post-txt"><span class="lp-post-meta"><span class="statut ${p.statut}">${STATUTS[p.statut] || "Brouillon"}</span>${FORMATS[p.format] ? `<span>${FORMATS[p.format][0]} ${FORMATS[p.format][1]}</span>` : ""}${p.partie ? `<span>Série ${p.partie}/3</span>` : ""}</span>
        <strong>${echapper(p.texte.split("\n")[0].slice(0, 110))}</strong><small class="doux">${p.sujet ? echapper(p.sujet.slice(0, 70)) + " · " : ""}modifié le ${dateCourte(p.maj_le)}</small></div>
      <div class="lp-post-act">
        <input type="date" value="${p.date_prevue || ""}" data-pdate="${p.id}" aria-label="Date prévue">
        <select data-pstat="${p.id}" aria-label="Statut">${Object.entries(STATUTS).map(([k, n]) => `<option value="${k}" ${k === p.statut ? "selected" : ""}>${n}</option>`).join("")}</select>
        <button type="button" class="bouton bouton-discret" data-pouvrir="${p.id}">Ouvrir</button>
        <button type="button" class="bouton bouton-discret" data-pcopier="${p.id}">Copier</button>
        <button type="button" class="vs-ico" data-psuppr="${p.id}" aria-label="Supprimer">✕</button></div></li>`;
    const groupes = {};
    prevus.forEach((p) => { const d = new Date(p.date_prevue + "T12:00"); const cle = p.date_prevue < auj ? "En retard" : `${JOURS[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString("fr-FR", { month: "long" })}`; (groupes[cle] ??= []).push(p); });
    z.innerHTML = `<div class="lp-plan-grille">
      <section class="carte">
        <div class="lp-plan-tete"><h2>Mon planning</h2><div class="puces" role="group" aria-label="Filtrer">${[["", "Tous"], ["brouillon", "Brouillons"], ["pret", "Prêts"], ["publie", "Publiés"]].map(([k, n]) => `<button type="button" class="puce" data-filtre="${k}" aria-pressed="${k === filtre}">${n}</button>`).join("")}</div></div>
        ${!l.length ? `<p class="doux">${MES_POSTS.length ? "Aucun post dans cette catégorie." : "Aucun post pour l'instant. Rédigez un post puis « Enregistrer · planifier »."}</p>` : ""}
        ${Object.entries(groupes).map(([g, ps]) => `<h3 class="lp-plan-jour${g === "En retard" ? " ko" : ""}">${g}</h3><ul class="lp-posts">${ps.map(ligne).join("")}</ul>`).join("")}
        ${sansDate.length ? `<h3 class="lp-plan-jour">Sans date</h3><ul class="lp-posts">${sansDate.map(ligne).join("")}</ul>` : ""}
        <p class="doux petit">Enregistrés sur votre compte : retrouvez-les sur tous vos appareils.</p>
      </section>
      <section class="carte lp-semaine">
        <h2>💡 Idées pour la semaine</h2>
        <p class="doux petit">Une idée par jour ouvré, tirée de l'actualité du site et des fiches vérifiées, avec un format différent chaque jour.</p>
        ${E.donnees ? `<ol class="lp-jours">${ideesSemaine().map((x, i) => `<li><span class="lp-jour">${x.jour}</span><div><strong>${echapper(x.titre)}</strong><small>${x.type === "sujet" ? "📰 Actualité" : "🎓 Fiche"} · ${FORMATS[x.format][0]} ${FORMATS[x.format][1]}</small></div><button type="button" class="bouton bouton-discret" data-isem="${i}">Rédiger</button></li>`).join("")}</ol>` : `<div class="attente"><span class="rond"></span>Chargement…</div>`}
      </section></div>`;
    z.querySelectorAll("[data-filtre]").forEach((b) => b.onclick = () => { filtre = b.dataset.filtre; afficherPlanning(); });
    const maj = async (corps) => { try { MES_POSTS = (await appelApi("/api/linkedin/posts", "POST", corps)).posts; majNb(); afficherPlanning(); } catch (e) { notifier(e.message, true); } };
    z.querySelectorAll("[data-pdate]").forEach((i) => i.onchange = () => maj({ id: i.dataset.pdate, date_prevue: i.value || null }));
    z.querySelectorAll("[data-pstat]").forEach((s) => s.onchange = () => maj({ id: s.dataset.pstat, statut: s.value }));
    z.querySelectorAll("[data-pcopier]").forEach((b) => b.onclick = () => copier(MES_POSTS.find((p) => p.id === b.dataset.pcopier).texte));
    z.querySelectorAll("[data-psuppr]").forEach((b) => b.onclick = () => {
      if (b.dataset.confirme !== "1") { b.dataset.confirme = "1"; b.textContent = "Supprimer ?"; setTimeout(() => { b.dataset.confirme = ""; b.textContent = "✕"; }, 4000); return; }
      maj({ supprimer: b.dataset.psuppr });
    });
    z.querySelectorAll("[data-pouvrir]").forEach((b) => b.onclick = () => ouvrirPost(MES_POSTS.find((p) => p.id === b.dataset.pouvrir)));
    z.querySelectorAll("[data-isem]").forEach((b) => b.onclick = () => {
      const x = ideesSemaine()[+b.dataset.isem];
      vue("creer"); E.format = x.format; majReglages(); choisir(x.src, x.type === "fiche" ? "pedagogie" : null);
      E.datePrevue = x.date; scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // Rouvre un post enregistré (texte modifiable, aperçu, vérification).
  function ouvrirPost(p) {
    vue("creer");
    const nombres = [...new Set((p.texte.match(/\d[\d\s  ]*(?:[.,]\d+)?/g) || []).map((n) => n.replace(/[\s  ]/g, "").replace(",", ".")))];
    E.r = { format: p.format || "classique", accroches: [], appels_action: [], hashtags: [], corps: p.texte, lien: null, a_verifier: [], nombres_source: nombres, type_source: "enregistre",
      serie: p.format === "serie" ? [{}] : null };
    E.texte = p.texte; E.textes = [p.texte]; E.partie = 0; E.visuel = p.visuel || null; E.postId = p.id; E.page = 0;
    E.diapos = p.extra?.diapos || []; E.sondage = p.extra?.sondage || null;
    E.source = E.source || { type: "libre", theme: p.sujet || "", libelle: p.sujet || "Post enregistré", detail: "Post enregistré" };
    $("lp-b3").hidden = false; $("lp-attente").hidden = true; $("lp-erreur").hidden = true;
    afficherResultat();
    ["lp-bloc-accroches", "lp-bloc-ctas", "lp-bloc-tags", "lp-autre"].forEach((id) => { $(id).hidden = true; });
    $("lp-b3").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------------------------------------------------------------- vues, sauvegarde locale, démarrage
  function vue(v) {
    document.querySelectorAll("[data-vue]").forEach((b) => b.setAttribute("aria-selected", b.dataset.vue === v));
    $("lp-creer").hidden = v !== "creer"; $("lp-planning").hidden = v !== "planning";
    if (v === "planning") afficherPlanning();
  }
  function sauver() {
    const { donnees, moi, ...a } = E;
    try { localStorage.setItem(CLE_EN_COURS, JSON.stringify({ ...a, le: Date.now() })); } catch {}
  }
  function lireEnCours() { try { return JSON.parse(localStorage.getItem(CLE_EN_COURS) || "null"); } catch { return null; } }
  function nouveau() {
    try { localStorage.removeItem(CLE_EN_COURS); } catch {}
    Object.assign(E, { source: null, r: null, texte: "", textes: [], postId: null, serieId: null, idsSerie: null, visuel: null, diapos: [], sondage: null, partie: 0 });
    images = []; imageUrl = "";
    $("lp-b3").hidden = true; $("lp-b1").classList.remove("fait"); afficherChoisi(); majGo(); afficherApercu(); afficherControle();
    scrollTo({ top: 0, behavior: "smooth" });
  }

  window.demarrerPost = async () => {
    monter(); majReglages(); afficherApercu();
    document.querySelectorAll("[data-vue]").forEach((b) => b.onclick = () => vue(b.dataset.vue));
    document.querySelectorAll("[data-src]").forEach((b) => b.onclick = () => { E.onglet = b.dataset.src; afficherSources(); });
    document.querySelectorAll("[data-format]").forEach((b) => b.onclick = () => { E.format = b.dataset.format; majReglages(); sauver(); });
    document.querySelectorAll("[data-ton]").forEach((b) => b.onclick = () => { E.ton = b.dataset.ton; majReglages(); sauver(); });
    document.querySelectorAll("[data-longueur]").forEach((b) => b.onclick = () => { E.longueur = b.dataset.longueur; majReglages(); sauver(); });
    document.querySelectorAll("[data-emojis]").forEach((b) => b.onclick = () => { E.emojis = b.dataset.emojis; majReglages(); sauver(); });
    document.querySelectorAll("[data-approche]").forEach((b) => b.onclick = () => { E.approche = b.dataset.approche; $("lp-b2").dataset.angleManuel = E.approche ? "1" : ""; majReglages(); sauver(); });
    document.querySelectorAll("[data-ap]").forEach((b) => b.onclick = () => { E.apercu = b.dataset.ap; document.querySelectorAll("[data-ap]").forEach((x) => x.setAttribute("aria-pressed", x === b)); afficherApercu(); });
    $("lp-rediger").onclick = rediger;
    $("lp-voir-apercu").onclick = () => $("lp-droite").scrollIntoView({ behavior: "smooth", block: "start" });
    $("lp-texte").oninput = (e) => { E.texte = e.target.value; E.textes[E.partie] = E.texte; majTexte(); };
    $("lp-copier").onclick = () => copier(E.texte);
    $("lp-publier").onclick = publier;
    $("lp-planifier").onclick = () => { const z = $("lp-planif"); if (!z.hidden) { z.hidden = true; return; } afficherPlanif(); if (E.datePrevue) $("lp-date").value = E.datePrevue; };
    $("btn-marquer").onclick = async () => { try { await enregistrer("publie", jourIso(new Date())); $("publie-barre").hidden = true; notifier("Ajouté à Mes posts, comme publié."); } catch (e) { notifier(e.message, true); } };
    $("lp-video").onclick = () => {
      const s = E.source || {}, cible = s.type === "sujet" ? { sel: `actu:${s.sujet_id}` } : s.type === "fiche" ? { sel: `fiche:${s.fiche_id}` } : { sel: "libre", precision: (s.theme || s.libelle || E.texte.split("\n")[0]).slice(0, 300) };
      if (typeof window.videoDepuisPost === "function") window.videoDepuisPost(cible);
    };
    let confirmer = false;
    $("lp-autre").onclick = () => {
      if (!confirmer) { confirmer = true; $("lp-autre").textContent = "Le texte actuel sera remplacé : confirmer ?"; setTimeout(() => { confirmer = false; $("lp-autre").textContent = "↻ Une autre version"; }, 5000); return; }
      confirmer = false; $("lp-autre").textContent = "↻ Une autre version"; rediger();
    };
    $("lp-nouveau").onclick = nouveau;
    // image : textes, signature
    const majTextes = () => {
      if (!E.visuel) return;
      E.visuel.titre = $("v-titre").value.trim(); E.visuel.conclusion = $("v-conclusion").value.trim();
      E.visuel.points = $("v-points").value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 4);
      clearTimeout(minuteur); minuteur = setTimeout(() => { sauver(); dessinerImage(); afficherControle(); }, 400);
    };
    ["v-titre", "v-points", "v-conclusion"].forEach((id) => $(id).oninput = majTextes);
    $("btn-signature").onclick = async () => {
      try { signature = await appelApi("/api/linkedin/signature", "POST", { nom: $("sig-nom").value, cabinet: $("sig-cabinet").value, pour_tous: $("sig-pour-tous").checked }); notifier("Signature enregistrée."); $("bloc-signature").open = false; if (E.r?.format === "carrousel") dessinerDiaposVue(); else dessinerImage(); }
      catch (e) { notifier(e.message, true); }
    };
    appelApi("/api/linkedin/signature").then((s) => { signature = s; $("sig-nom").value = s.nom || ""; $("sig-cabinet").value = s.cabinet || ""; $("bloc-pour-tous").hidden = !s.admin; }).catch(() => {});
    appelApi("/api/linkedin/voix").then((v) => { $("voix-exemples").value = v.exemples || ""; $("voix-actif").checked = !!(v.actif && v.exemples); }).catch(() => {});
    $("btn-voix").onclick = async () => { try { const v = await appelApi("/api/linkedin/voix", "POST", { exemples: $("voix-exemples").value, actif: $("voix-actif").checked }); $("voix-actif").checked = !!(v.actif && v.exemples); notifier("Votre style est enregistré."); } catch (e) { notifier(e.message, true); } };
    appelApi("/api/moi").then((m) => { E.moi = m; afficherApercu(); }).catch(() => {});
    appelApi("/api/linkedin/posts").then((r) => { MES_POSTS = r.posts; majNb(); }).catch(() => {});

    const enCours = lireEnCours(), q = new URLSearchParams(location.search);
    afficherSources();
    try { E.donnees = await appelApi("/api/linkedin/sujets"); }
    catch (e) { E.donnees = { idees: [], sujets: [] }; $("lp-sources").innerHTML = `<p class="message ko">${echapper(e.message)}</p>`; }
    if (!E.source) afficherSources();
    // Ouverture depuis une actualité, le brief ou une fiche : ?sujet=… ou ?fiche=…
    if (q.get("sujet")) {
      const id = q.get("sujet");
      let titre = E.donnees.sujets.find((s) => s.id === id)?.titre;
      if (!titre) titre = await appelApi("/api/sujet?id=" + encodeURIComponent(id)).then((s) => s.titre_fr || s.titre).catch(() => null);
      if (titre) choisir({ type: "sujet", sujet_id: id, libelle: titre, detail: "Actualité du site" }, q.get("approche") || null);
      history.replaceState(null, "", "/linkedin");
    } else if (q.get("fiche")) { choisirFiche(q.get("fiche")); history.replaceState(null, "", "/linkedin"); }
    else if (enCours && enCours.r && Date.now() - enCours.le < 7 * 86400e3) {
      $("zone-reprise").innerHTML = `<div class="reprise"><span>Vous aviez un post en cours${enCours.source ? " : <strong>" + echapper(String(enCours.source.libelle || "").slice(0, 80)) + "</strong>" : ""}.</span>
        <span class="lp-ligne"><button type="button" class="bouton" id="btn-reprendre">Reprendre</button><button type="button" class="bouton bouton-discret" id="btn-ignorer">Commencer un nouveau</button></span></div>`;
      $("btn-reprendre").onclick = () => {
        $("zone-reprise").innerHTML = "";
        Object.assign(E, { ...enCours, donnees: E.donnees, moi: E.moi });
        afficherChoisi(); majReglages(); $("lp-b3").hidden = false; afficherResultat();
      };
      $("btn-ignorer").onclick = () => { $("zone-reprise").innerHTML = ""; try { localStorage.removeItem(CLE_EN_COURS); } catch {} };
    }
  };
  // Depuis une vidéo terminée : « Transformer en post LinkedIn » (même sujet).
  window.versPostLinkedIn = ({ theme, sujet_id, fiche_id }) => {
    if (typeof window.choisirVue === "function") window.choisirVue("post");
    vue("creer");
    if (sujet_id) choisir({ type: "sujet", sujet_id, libelle: theme, detail: "Actualité du site (depuis la vidéo)" });
    else if (fiche_id) choisirFiche(fiche_id);
    else choisir({ type: "libre", theme, libelle: theme, detail: "Sujet de la vidéo" });
    scrollTo({ top: 0, behavior: "smooth" });
  };
})();
