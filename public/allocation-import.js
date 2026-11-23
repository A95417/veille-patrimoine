// version 1.0 — Allocation : import d'un document (PDF lu sur l'ordinateur, ou lecture par l'IA sur demande).
// Lecture locale : pdf.js (licence Apache 2.0, /vendor/pdfjs). Rien n'est envoyé au serveur dans ce cas.
// Lecture par l'IA : seulement si l'utilisateur confirme que le document ne contient aucune donnée client.

const IMPORT = { fichier: null, fonds: [], source: "" };

async function lignesPdf(fichier) {
  const pdfjs = await import("/vendor/pdfjs/pdf.min.js");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
  const doc = await pdfjs.getDocument({ data: await fichier.arrayBuffer(), isEvalSupported: false }).promise;
  const lignes = [];
  for (let n = 1; n <= Math.min(doc.numPages, 40); n++) {
    const page = await doc.getPage(n), tc = await page.getTextContent();
    const groupes = new Map();
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5] / 3), x = it.transform[4];
      if (!groupes.has(y)) groupes.set(y, []);
      groupes.get(y).push({ x, t: it.str, w: it.width || 0 });
    }
    [...groupes.entries()].sort((a, b) => b[0] - a[0]).forEach(([, items]) => {
      items.sort((a, b) => a.x - b.x);
      let t = "", fin = null;
      for (const i of items) { if (fin !== null && i.x - fin > 12) t += "  |  "; else if (fin !== null) t += " "; t += i.t; fin = i.x + i.w; }
      lignes.push(t.replace(/\s+(?=\s)/g, "").trim());
    });
  }
  return lignes;
}

const RE_ISIN = /\b([A-Z]{2}[A-Z0-9]{9}[0-9])\b/g;
const RE_PART = /(\d{1,3}(?:[.,]\d{1,2})?)\s?%/;
function nettoyerNom(t) {
  return t.replace(/\b(?:article|art\.?|sfdr)\s*[689]\b/gi, " ").replace(/\b(?:sri|srri|risque)\s*:?\s*[1-7]\b/gi, " ").replace(/\b[1-7]\s*\/\s*7\b/g, " ").replace(RE_ISIN, " ").replace(/\d{1,3}(?:[.,]\d{1,2})?\s?%/g, " ").replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, " ")
    .replace(/(^|\s)[-+]?\d[\d\s.,]*(€|EUR)?(?=\s|$)/g, " ").replace(/\s*\|\s*/g, " ").replace(/[•·;:]+/g, " ")
    .replace(/\s{2,}/g, " ").replace(/^[\s\-–—,.]+|[\s\-–—,.]+$/g, "").slice(0, 160);
}
const assezLong = (t) => (t.match(/[A-Za-zÀ-ÿ]/g) || []).length >= 4;
// SFDR et risque (SRI) seulement s'ils figurent sur la ligne du fonds.
function sfdrDe(l) { const m = l.match(/\b(?:article|art\.?|sfdr)\s*([689])\b/i); return m ? Number(m[1]) : null; }
function risqueDe(l) { const m = l.match(/\b(?:sri|risque|srri)\s*:?\s*([1-7])\b/i) || l.match(/\b([1-7])\s*\/\s*7\b/); return m ? Number(m[1]) : null; }
function extraireFonds(lignes) {
  const vus = new Set(), fonds = [];
  lignes.forEach((l, i) => {
    for (const m of l.matchAll(RE_ISIN)) {
      const isin = m[1];
      // Clé de contrôle fausse : on garde la ligne (signalée) si le préfixe est un pays émetteur courant.
      if (vus.has(isin) || (!isinValide(isin) && !/^(FR|LU|IE|DE|BE|NL|GB|US|CH|IT|ES|AT|FI|SE|DK|NO|JE|GG|KY|PT)/.test(isin))) continue;
      vus.add(isin);
      let nom = nettoyerNom(l);
      if (!assezLong(nom)) nom = nettoyerNom(lignes[i - 1] || "") || nettoyerNom(lignes[i + 1] || "");
      const p = l.match(RE_PART), part = p && Number(p[1].replace(",", ".")) <= 100 ? Number(p[1].replace(",", ".")) : null;
      fonds.push({ nom: assezLong(nom) ? nom : "", isin, part, sfdr: sfdrDe(l), risque: risqueDe(l), isin_ok: isinValide(isin), garder: true });
    }
    if (/fonds\s+(en\s+)?euros?\b/i.test(l) && !/\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b/.test(l) && !fonds.some((f) => !f.isin)) {
      const p = l.match(RE_PART);
      fonds.push({ nom: nettoyerNom(l) || "Fonds en euros", isin: "", part: p ? Number(p[1].replace(",", ".")) : null, sfdr: sfdrDe(l), risque: risqueDe(l), isin_ok: true, garder: true });
    }
    RE_ISIN.lastIndex = 0;
  });
  return fonds;
}
const enBase64 = (f) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = ko; r.readAsDataURL(f); });

// Ouvre la fenêtre d'import. existants : ISIN déjà présents. Résout { fonds, remplacer, nom } ou null.
function ouvrirImport({ existants = [], creer = false } = {}) {
  IMPORT.fichier = null; IMPORT.fonds = []; IMPORT.source = "";
  return new Promise((fin) => {
    const d = document.getElementById("dialogue"), f = document.getElementById("dialogue-form");
    d.classList.add("al-large");
    f.onsubmit = (e) => e.preventDefault();
    let resultat = null;
    d.onclose = () => { d.classList.remove("al-large"); fin(resultat); };
    const etape = (html) => { f.innerHTML = html; };
    const accueil = (message) => {
      etape(`<h2>${creer ? "Créer un portefeuille depuis un document" : "Importer un document"}</h2>
        <p>PDF ou photo (JPG, PNG) d'un document d'assureur : liste des supports d'un contrat, allocation conseillée… Les fonds sont reconnus grâce à leur code ISIN ; vous relisez tout avant d'ajouter.</p>
        ${message ? `<p class="al-import-msg">${message}</p>` : ""}
        <label class="al-depot" id="depot"><input type="file" id="fichier" accept="application/pdf,image/jpeg,image/png" hidden>
          <span class="al-depot-ico">📄</span><b>Déposez le fichier ici</b><span>ou cliquez pour le choisir · 8 Mo au plus</span></label>
        <div class="al-boutons"><button type="button" class="bouton bouton-discret" id="imp-fermer">Fermer</button></div>`);
      document.getElementById("imp-fermer").onclick = () => d.close();
      const depot = document.getElementById("depot"), input = document.getElementById("fichier");
      input.onchange = () => input.files[0] && traiter(input.files[0]);
      depot.ondragover = (e) => { e.preventDefault(); depot.classList.add("survol"); };
      depot.ondragleave = () => depot.classList.remove("survol");
      depot.ondrop = (e) => { e.preventDefault(); depot.classList.remove("survol"); if (e.dataTransfer.files[0]) traiter(e.dataTransfer.files[0]); };
    };
    const attente = (t) => etape(`<h2>${t}</h2><div class="al-attente"><span class="al-roue"></span><p>${echapper(IMPORT.fichier?.name || "")}</p></div>`);
    async function traiter(fichier) {
      if (fichier.size > 8 * 1024 * 1024) return accueil("Fichier trop lourd : 8 Mo au plus.");
      const estPdf = fichier.type === "application/pdf" || /\.pdf$/i.test(fichier.name), estImage = /^image\/(jpeg|png)$/.test(fichier.type);
      if (!estPdf && !estImage) return accueil("Format non pris en charge : PDF, JPG ou PNG.");
      IMPORT.fichier = fichier;
      if (estImage) return revue("Une photo ne peut pas être lue directement sur l'ordinateur : utilisez la lecture par l'IA ci-dessous.");
      attente("Lecture du document…");
      try {
        const lignes = await lignesPdf(fichier);
        IMPORT.fonds = extraireFonds(lignes); IMPORT.source = "lecture sur l'ordinateur";
        revue(IMPORT.fonds.length ? "" : lignes.length ? "Aucun code ISIN valide trouvé dans le texte de ce PDF." : "Ce PDF ne contient pas de texte (document scanné ?).");
      } catch (e) { revue("Lecture impossible sur l'ordinateur : " + e.message); }
    }
    function revue(message) {
      const F = IMPORT.fonds, deja = (i) => i && existants.includes(i);
      const nbOk = F.filter((x) => x.garder).length;
      etape(`<h2>${F.length ? `${F.length} fonds trouvé${F.length > 1 ? "s" : ""}` : "Aucun fonds reconnu"}</h2>
        <p class="al-import-src">${echapper(IMPORT.fichier.name)}${IMPORT.source ? ` · ${IMPORT.source}` : ""}</p>
        ${message ? `<p class="al-import-msg">${message}</p>` : ""}
        ${F.length ? `<div class="al-import-table"><table class="al-table"><thead><tr><th></th><th>Fonds</th><th>Code ISIN</th><th>SFDR</th><th>Risque</th><th class="al-part" style="text-align:right">Poids</th></tr></thead><tbody>
          ${F.map((x, i) => `<tr data-i="${i}"><td style="width:28px"><input type="checkbox" data-k="garder" ${x.garder ? "checked" : ""} aria-label="Garder ce fonds" style="width:auto"></td>
            <td><input data-k="nom" value="${echapper(x.nom)}" placeholder="Nom du fonds à compléter">${deja(x.isin) ? `<small class="al-deja">déjà dans le portefeuille</small>` : ""}</td>
            <td class="al-isin"><span class="al-isin-saisie"><input data-k="isin" value="${echapper(x.isin)}" maxlength="20" placeholder="${/fonds\s*(en\s*)?euros?/i.test(x.nom) ? "Fonds en euros" : ""}">${x.isin && !isinValide(x.isin) ? `<span class="al-alerte-isin" title="Code ISIN non confirmé : à vérifier"></span>` : ""}</span></td>
            <td style="width:88px"><select data-k="sfdr"><option value="">—</option>${[0, 6, 8, 9].map((a) => `<option value="${a}" ${x.sfdr === a ? "selected" : ""}>${a ? "Art. " + a : "0"}</option>`).join("")}</select></td>
            <td style="width:70px"><select data-k="risque"><option value="">—</option>${[1, 2, 3, 4, 5, 6, 7].map((a) => `<option value="${a}" ${x.risque === a ? "selected" : ""}>${a}/7</option>`).join("")}</select></td>
            <td class="al-part"><input data-k="part" value="${x.part == null ? "" : String(x.part).replace(".", ",")}" placeholder="—"></td></tr>`).join("")}
        </tbody></table></div>` : ""}
        <details class="al-ia" ${F.length ? "" : "open"}><summary>🤖 Lire avec l'IA (Gemini) ${F.length ? "si la lecture est incomplète" : ""}</summary>
          <p>Le fichier est envoyé une fois à Google Gemini pour en extraire les fonds, puis il n'est pas conservé. À utiliser <b>uniquement pour un document d'assureur sans aucune donnée client</b>.</p>
          <label class="al-coche"><input type="checkbox" id="imp-ok" style="width:auto"> Je confirme que ce document ne contient aucune donnée client (nom, adresse, numéro de contrat, montants personnels).</label>
          <button type="button" class="bouton bouton-discret" id="imp-ia" disabled>Lire avec l'IA</button></details>
        ${creer && F.length ? `<label>Nom du portefeuille à créer<input type="text" id="imp-nom" maxlength="120" placeholder="Ex. : Équilibré 2026" value="${echapper(IMPORT.fichier.name.replace(/\.[a-z]+$/i, "").slice(0, 80))}"></label>` : ""}
        ${!creer && F.length ? `<div class="al-profils" style="margin:0"><button type="button" class="puce" data-g="mode" data-v="ajouter" aria-pressed="true">Ajouter aux fonds actuels</button><button type="button" class="puce" data-g="mode" data-v="remplacer" aria-pressed="false">Remplacer les fonds actuels</button></div>` : ""}
        <div class="al-boutons"><button type="button" class="bouton bouton-discret" id="imp-autre">Autre fichier</button>
          ${F.length ? `<button type="button" class="bouton" id="imp-valider">${creer ? "Créer le portefeuille" : `Ajouter ${nbOk} fonds`}</button>` : `<button type="button" class="bouton bouton-discret" id="imp-fermer">Fermer</button>`}</div>`);
      f.querySelectorAll("tr[data-i] input, tr[data-i] select").forEach((inp) => inp.oninput = inp.onchange = () => {
        const x = F[+inp.closest("tr").dataset.i], k = inp.dataset.k;
        if (k === "garder") x.garder = inp.checked;
        else if (k === "isin") { x.isin = inp.value.toUpperCase().replace(/\s/g, ""); inp.value = x.isin; const pt = inp.parentElement.querySelector(".al-alerte-isin"), faux = !!x.isin && !isinValide(x.isin); if (faux && !pt) inp.insertAdjacentHTML("afterend", `<span class="al-alerte-isin" title="Code ISIN non confirmé : à vérifier"></span>`); if (!faux && pt) pt.remove(); }
        else if (k === "sfdr" || k === "risque") x[k] = inp.value !== "" ? Number(inp.value) : null;
        else if (k === "part") x.part = inp.value.trim() === "" ? null : Number(inp.value.replace(",", "."));
        else x.nom = inp.value;
        const b = document.getElementById("imp-valider"); if (b && !creer) b.textContent = `Ajouter ${F.filter((y) => y.garder).length} fonds`;
      });
      f.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => f.querySelectorAll(`[data-g="${b.dataset.g}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b)));
      const ok = document.getElementById("imp-ok"), ia = document.getElementById("imp-ia");
      ok.onchange = () => { ia.disabled = !ok.checked; };
      ia.onclick = async () => {
        attente("Lecture par l'IA…");
        try {
          const r = await appelApi("/api/allocation/lire", "POST", { type: IMPORT.fichier.type || "application/pdf", donnees: await enBase64(IMPORT.fichier), sans_donnees_client: true });
          if (r.erreur) return revue(echapper(r.erreur));
          IMPORT.fonds = r.fonds.map((x) => ({ ...x, garder: !!x.nom })); IMPORT.source = "lecture par l'IA, à vérifier";
          revue(IMPORT.fonds.length ? (IMPORT.fonds.some((x) => !x.isin_ok) ? "Certains codes ISIN n'ont pas pu être confirmés (pastille rouge) : vous pouvez les ajouter quand même et les vérifier ensuite." : "") : "L'IA n'a trouvé aucun fonds dans ce document.");
        } catch (e) { revue(echapper(e.message)); }
      };
      document.getElementById("imp-autre").onclick = () => accueil();
      if (document.getElementById("imp-fermer")) document.getElementById("imp-fermer").onclick = () => d.close();
      const v = document.getElementById("imp-valider");
      if (v) v.onclick = () => {
        const garde = F.filter((x) => x.garder);
        const sansNom = garde.find((x) => !x.nom.trim());
        if (!garde.length) return revue("Cochez au moins un fonds.");
        if (sansNom) return revue("Complétez le nom de chaque fonds coché.");
        const nom = document.getElementById("imp-nom")?.value.trim();
        if (creer && !nom) return revue("Indiquez le nom du portefeuille à créer.");
        resultat = { fonds: garde.map((x) => ({ nom: x.nom.trim(), isin: x.isin, part: x.part, sfdr: x.sfdr ?? null, risque: x.risque ?? null })), remplacer: f.querySelector('[data-v="remplacer"]')?.getAttribute("aria-pressed") === "true", nom };
        d.close();
      };
    }
    accueil();
    d.showModal();
  });
}
