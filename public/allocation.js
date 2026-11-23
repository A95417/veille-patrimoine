// version 1.0 — rubrique Allocation : assureurs › contrats › portefeuilles › fonds, et « Pourquoi ce choix ».
const $ = (id) => document.getElementById(id);
const PROFILS = { prudent: ["Prudent", "#2f8f5b"], equilibre: ["Équilibré", "#3a7bd5"], dynamique: ["Dynamique", "#d08a1c"], offensif: ["Offensif", "#c0392b"] };
const TYPES = { av: "Assurance-vie", per: "PER" };
const COULEURS = ["#3a49d6", "#2f8f5b", "#d08a1c", "#c0392b", "#7b4fd0", "#1f9bb0", "#b3457c", "#6b7a2e", "#8a5a3c", "#5d6577"];
const SVG = {
  chevron: '<svg class="al-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  poubelle: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  crayon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  haut: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  copier: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/></svg>',
};

let D = { assureurs: [], contrats: [], portefeuilles: [], lignes: [], commentaires: {} };
const sel = { a: null, c: null, p: null, f: null };   // assureur, contrat, portefeuille, fonds (ISIN)
const ouverts = new Set();
let brouillon = null, modifie = false, edition = false, recherche = "", ongletDroite = "pourquoi";

// ---------------------------------------------------------------- Outils
function isinValide(isin) {
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) return false;
  const ch = isin.split("").map((c) => (/[0-9]/.test(c) ? c : String(c.charCodeAt(0) - 55))).join("");
  let s = 0;
  for (let i = 0; i < ch.length; i++) { let n = Number(ch[ch.length - 1 - i]); if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; }
  return s % 10 === 0;
}
// Recherche par ISIN dans la base GECO de l'AMF (même adresse que celle produite par son formulaire).
const lienAmf = (isin) => `https://geco.amf-france.org/Bio/res_part.aspx?NomProd=&NumAgr=&CodeISIN=${"+".repeat(120)}${isin}${"+".repeat(63)}&NomSoc=&selectNRJ=0&ClassProd=0&TypeProd=`;
const sansAccent = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const nb = (x) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const date = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
const initiales = (n) => String(n || "?").split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
const assureur = (id) => D.assureurs.find((x) => x.id === id);
const contrat = (id) => D.contrats.find((x) => x.id === id);
const portefeuille = (id) => D.portefeuilles.find((x) => x.id === id);
const contratsDe = (aid) => D.contrats.filter((c) => c.assureur_id === aid);
const portefeuillesDe = (cid) => D.portefeuilles.filter((p) => p.contrat_id === cid);
const lignesDe = (pid) => D.lignes.filter((l) => l.portefeuille_id === pid);
const typeBadge = (t) => `<span class="al-type ${t}">${t === "per" ? "PER" : "AV"}</span>`;
const versBrouillon = (l) => ({ nom: l.nom, isin: l.isin || "", part: l.part ?? "", sfdr: l.sfdr ?? "", risque: l.risque ?? "" });
const SFDR = { 6: "Art. 6", 8: "Art. 8", 9: "Art. 9" };
const COUL_RISQUE = ["#2f8f5b", "#5fa24a", "#9db53a", "#d8b528", "#e08a2a", "#d6582b", "#b9302a"];
const pastilleSfdr = (v) => v ? `<span class="al-sfdr s${v}">${SFDR[v]}</span>` : "";
const pastilleRisque = (v) => v ? `<span class="al-risque-p" style="background:${COUL_RISQUE[v - 1]}">${v}/7</span>` : "";
function risqueMoyen(lignes) {
  let poids = 0, somme = 0, total = 0;
  for (const l of lignes) { const w = Number(String(l.part).replace(",", ".")) || 0; total += w; if (l.risque && w > 0) { poids += w; somme += w * l.risque; } }
  return poids ? { valeur: somme / poids, couvert: total ? poids / total : 0 } : null;
}
const profilNom = (profil) => PROFILS[profil]?.[0] || profil || "Sans profil";
const point = (profil) => `<span class="al-point" style="${PROFILS[profil] ? `background:${PROFILS[profil][1]}` : profil ? "background:var(--doux)" : ""}" title="${echapper(profilNom(profil))}"></span>`;
// Logo de l'assureur : image déposée, sinon icône de son site, sinon initiales.
const initialesLogo = (a) => `<span class="al-logo al-logo-txt" aria-hidden="true">${echapper(initiales(a.nom))}</span>`;
const logo = (a, grand) => a.logo ? `<img class="al-logo${grand ? " grand" : ""}" src="${a.logo}" alt="" data-nom="${echapper(a.nom)}">`
  : a.site ? `<img class="al-logo${grand ? " grand" : ""}" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(a.site)}&sz=64" alt="" data-nom="${echapper(a.nom)}" referrerpolicy="no-referrer">`
  : initialesLogo(a).replace("al-logo al-logo-txt", `al-logo al-logo-txt${grand ? " grand" : ""}`);
addEventListener("error", (e) => { const i = e.target; if (i instanceof HTMLImageElement && i.classList.contains("al-logo")) i.outerHTML = initialesLogo({ nom: i.dataset.nom }).replace("al-logo al-logo-txt", "al-logo al-logo-txt" + (i.classList.contains("grand") ? " grand" : "")); }, true);
function barre(lignes) {
  const tot = lignes.reduce((s, l) => s + (Number(l.part) || 0), 0);
  return `<div class="al-barre" role="img" aria-label="Répartition">${lignes.map((l, i) => Number(l.part) > 0 ? `<span style="width:${l.part}%;background:${COULEURS[i % COULEURS.length]}" title="${echapper(l.nom)} : ${nb(l.part)} %"></span>` : "").join("")}${tot < 100 ? `<span style="width:${100 - tot}%"></span>` : ""}</div>`;
}

// ---------------------------------------------------------------- Données
async function charger() {
  D = await appelApi("/api/allocation");
  $("chiffres").innerHTML = `<span><b>${D.assureurs.length}</b>assureur${D.assureurs.length > 1 ? "s" : ""}</span><span><b>${D.contrats.length}</b>contrat${D.contrats.length > 1 ? "s" : ""}</span><span><b>${D.portefeuilles.length}</b>portefeuille${D.portefeuilles.length > 1 ? "s" : ""}</span><span><b>${new Set(D.lignes.map((l) => l.isin || l.nom)).size}</b>fonds</span>`;
}
function synchroniserUrl() {
  const q = new URLSearchParams();
  if (sel.p) q.set("p", sel.p); else if (sel.c) q.set("c", sel.c); else if (sel.a) q.set("a", sel.a);
  if (sel.f) q.set("f", sel.f);
  history.replaceState(null, "", "/allocation" + (q.toString() ? "?" + q : ""));
}
async function choisir(type, id, sansConfirmer) {
  if (modifie && !sansConfirmer && !(await confirmer("Modifications non enregistrées", "Les fonds de ce portefeuille ont été modifiés. Quitter sans enregistrer ?", "Quitter sans enregistrer"))) return;
  modifie = false; edition = false; brouillon = null;
  sel.a = sel.c = sel.p = null;
  if (type === "p") { const p = portefeuille(id); if (p) { sel.p = id; sel.c = p.contrat_id; sel.a = contrat(p.contrat_id)?.assureur_id; } }
  if (type === "c") { const c = contrat(id); if (c) { sel.c = id; sel.a = c.assureur_id; } }
  if (type === "a" && assureur(id)) sel.a = id;
  if (sel.a) ouverts.add("a" + sel.a);
  if (sel.c) ouverts.add("c" + sel.c);
  if (type === "p") ongletDroite = sel.f && lignesDe(sel.p).some((l) => l.isin === sel.f) ? ongletDroite : "pourquoi";
  if (sel.p) brouillon = lignesDe(sel.p).map(versBrouillon);
  synchroniserUrl(); rendre();
}
function rendre() { rendreArbre(); rendreCentre(); rendreDroite(); }

// ---------------------------------------------------------------- Colonne de gauche : l'arborescence
function rendreArbre() {
  const q = sansAccent(recherche).trim();
  const correspond = (t) => !q || sansAccent(t).includes(q);
  const pfOk = (p) => correspond(p.nom) || lignesDe(p.id).some((l) => correspond(l.nom) || correspond(l.isin));
  const ctOk = (c) => correspond(c.nom) || correspond(TYPES[c.type]) || portefeuillesDe(c.id).some(pfOk);
  const asOk = (a) => correspond(a.nom) || contratsDe(a.id).some(ctOk);
  const liste = D.assureurs.filter(asOk);
  if (!D.assureurs.length) {
    $("arbre").innerHTML = `<li class="al-vide-arbre">Aucun assureur pour l'instant. Commencez par ajouter un assureur partenaire, puis ses contrats.</li>`;
    return;
  }
  if (!liste.length) { $("arbre").innerHTML = `<li class="al-vide-arbre">Aucun résultat pour « ${echapper(recherche)} ».</li>`; return; }
  $("arbre").innerHTML = liste.map((a) => {
    const ouvert = q || ouverts.has("a" + a.id), cts = contratsDe(a.id).filter((c) => !q || correspond(a.nom) || ctOk(c));
    return `<li class="al-assureur ${ouvert ? "al-ouvert" : ""}" role="treeitem" aria-expanded="${!!ouvert}">
      <button type="button" class="al-noeud" data-a="${a.id}" aria-current="${sel.a === a.id && !sel.c}">${SVG.chevron}${logo(a)}<span class="al-nom">${echapper(a.nom)}</span><small>${contratsDe(a.id).length}</small></button>
      ${ouvert ? `<ul role="group">${cts.map((c) => {
        const co = q || ouverts.has("c" + c.id), pfs = portefeuillesDe(c.id).filter((p) => !q || correspond(c.nom) || correspond(a.nom) || pfOk(p));
        return `<li class="${co ? "al-ouvert" : ""}" role="treeitem" aria-expanded="${!!co}">
          <button type="button" class="al-noeud" data-c="${c.id}" aria-current="${sel.c === c.id && !sel.p}">${SVG.chevron}${typeBadge(c.type)}<span class="al-nom">${echapper(c.nom)}</span><small>${portefeuillesDe(c.id).length}</small></button>
          ${co ? `<ul role="group">${pfs.map((p) => `<li role="treeitem"><button type="button" class="al-noeud" data-p="${p.id}" aria-current="${sel.p === p.id}">${point(p.profil)}<span class="al-nom">${echapper(p.nom)}</span><small>${lignesDe(p.id).length}</small></button></li>`).join("")}
            <li><button type="button" class="al-ajout" data-ajout-p="${c.id}">+ Portefeuille</button></li></ul>` : ""}</li>`;
      }).join("")}<li><button type="button" class="al-ajout" data-ajout-c="${a.id}">+ Contrat</button></li></ul>` : ""}</li>`;
  }).join("");
  $("arbre").querySelectorAll("[data-a]").forEach((b) => b.onclick = () => { const k = "a" + b.dataset.a; if (sel.a === +b.dataset.a && !sel.c && ouverts.has(k)) ouverts.delete(k); else ouverts.add(k); choisir("a", +b.dataset.a); });
  $("arbre").querySelectorAll("[data-c]").forEach((b) => b.onclick = () => { const k = "c" + b.dataset.c; if (sel.c === +b.dataset.c && !sel.p && ouverts.has(k)) ouverts.delete(k); else ouverts.add(k); choisir("c", +b.dataset.c); });
  $("arbre").querySelectorAll("[data-p]").forEach((b) => b.onclick = () => choisir("p", +b.dataset.p));
  $("arbre").querySelectorAll("[data-ajout-c]").forEach((b) => b.onclick = () => ajouterContrat(+b.dataset.ajoutC));
  $("arbre").querySelectorAll("[data-ajout-p]").forEach((b) => b.onclick = () => ajouterPortefeuille(+b.dataset.ajoutP));
}

// ---------------------------------------------------------------- Colonne centrale
function fil() {
  const a = assureur(sel.a), c = contrat(sel.c);
  const morceaux = [];
  if (a) morceaux.push(`<button type="button" data-aller-a="${a.id}">${logo(a)} ${echapper(a.nom)}</button>`);
  if (c && sel.p) morceaux.push(`<button type="button" data-aller-c="${c.id}">${echapper(c.nom)}</button>`);
  return morceaux.length ? `<nav class="al-fil" aria-label="Fil d'Ariane">${morceaux.join("<span>›</span>")}</nav>` : "";
}
function brancherFil(z) {
  z.querySelectorAll("[data-aller-a]").forEach((b) => b.onclick = () => choisir("a", +b.dataset.allerA));
  z.querySelectorAll("[data-aller-c]").forEach((b) => b.onclick = () => choisir("c", +b.dataset.allerC));
}
const meta = (x) => x.maj_le ? `<div class="al-meta">Modifié par ${echapper(x.maj_par || "?")} le ${date(x.maj_le)}</div>` : "";

function rendreCentre() {
  const z = $("centre");
  if (sel.p) return rendrePortefeuille(z);
  if (sel.c) {
    const c = contrat(sel.c), pfs = portefeuillesDe(c.id);
    z.innerHTML = fil() + `<div class="al-entete"><div><h2>${echapper(c.nom)}</h2><div class="al-meta">${TYPES[c.type]} · ${pfs.length} portefeuille${pfs.length > 1 ? "s" : ""}</div>${meta(c)}</div>
      <div class="al-actions"><button type="button" class="bouton bouton-discret" id="renommer">${SVG.crayon} Modifier</button><button type="button" class="bouton bouton-discret" id="supprimer">${SVG.poubelle} Supprimer</button></div></div>
      <div class="al-section"><h3>Portefeuilles proposés dans ce contrat</h3>
      ${pfs.length ? `<div class="al-cartes">${pfs.map((p) => { const l = lignesDe(p.id), tot = l.reduce((s, x) => s + (x.part || 0), 0);
        return `<button type="button" class="al-carte" data-p="${p.id}"><b>${point(p.profil)} ${echapper(p.nom)}</b><small>${echapper(profilNom(p.profil))} · ${l.length} fonds${tot ? ` · ${nb(tot)} %` : ""}</small>${l.length ? barre(l) : ""}${D.commentaires["p:" + p.id] ? `<small>💬 ${D.commentaires["p:" + p.id]} commentaire${D.commentaires["p:" + p.id] > 1 ? "s" : ""}</small>` : ""}</button>`; }).join("")}</div>`
        : `<p class="al-astuce">Aucun portefeuille dans ce contrat. Créez le premier, par exemple « Prudent » ou « Équilibré », puis ajoutez ses fonds.</p>`}
      <p class="al-actions" style="margin-top:14px"><button type="button" class="bouton" id="ajout">+ Ajouter un portefeuille</button><button type="button" class="bouton bouton-discret" id="importer">📄 Créer depuis un document</button></p></div>`;
    brancherFil(z);
    z.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => choisir("p", +b.dataset.p));
    $("ajout").onclick = () => ajouterPortefeuille(c.id);
    $("importer").onclick = async () => {
      const r = await ouvrirImport({ creer: true });
      if (!r) return;
      try {
        const n = await appelApi("/api/allocation/portefeuille", "POST", { nom: r.nom, profil: "", contrat_id: c.id });
        await appelApi(`/api/allocation/portefeuille/${n.id}/lignes`, "PUT", { lignes: r.fonds });
        await charger(); choisir("p", n.id, true); notifier("Portefeuille créé à partir du document.");
      } catch (e) { notifier(e.message, true); }
    };
    $("renommer").onclick = () => modifier("contrat", c);
    $("supprimer").onclick = () => supprimer("contrat", c, `le contrat « ${c.nom} » et ses ${pfs.length} portefeuille(s)`);
    return;
  }
  if (sel.a) {
    const a = assureur(sel.a), cts = contratsDe(a.id);
    z.innerHTML = `<div class="al-entete"><div class="al-titre-logo">${logo(a, true)}<div><h2>${echapper(a.nom)}</h2><div class="al-meta">${a.site ? `<a href="https://${echapper(a.site)}" target="_blank" rel="noopener noreferrer">${echapper(a.site)} ↗</a> · ` : ""}${cts.length} contrat${cts.length > 1 ? "s" : ""}</div>${meta(a)}</div></div>
      <div class="al-actions"><button type="button" class="bouton bouton-discret" id="renommer">${SVG.crayon} Modifier</button><button type="button" class="bouton bouton-discret" id="supprimer">${SVG.poubelle} Supprimer</button></div></div>
      <div class="al-section"><h3>Contrats</h3>
      ${cts.length ? `<div class="al-cartes">${cts.map((c) => `<button type="button" class="al-carte" data-c="${c.id}"><b>${typeBadge(c.type)} ${echapper(c.nom)}</b><small>${TYPES[c.type]} · ${portefeuillesDe(c.id).length} portefeuille${portefeuillesDe(c.id).length > 1 ? "s" : ""}</small></button>`).join("")}</div>`
        : `<p class="al-astuce">Aucun contrat pour cet assureur. Ajoutez ses contrats d'assurance-vie et de PER.</p>`}
      <p style="margin-top:14px"><button type="button" class="bouton" id="ajout">+ Ajouter un contrat</button></p></div>`;
    z.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => choisir("c", +b.dataset.c));
    $("ajout").onclick = () => ajouterContrat(a.id);
    $("renommer").onclick = () => modifier("assureur", a);
    $("supprimer").onclick = () => supprimer("assureur", a, `l'assureur « ${a.nom} », ses ${cts.length} contrat(s) et tous leurs portefeuilles`);
    return;
  }
  z.innerHTML = D.assureurs.length ? `<div class="al-accueil"><h2>Choisissez un assureur ou un contrat</h2><p>Sélectionnez un élément dans la colonne de gauche pour voir ses portefeuilles, leurs fonds et les raisons des choix du cabinet.</p></div>`
    : `<div class="al-accueil"><h2>Organisez les allocations du cabinet</h2><p>Ajoutez d'abord un assureur partenaire, puis ses contrats (assurance-vie, PER). Dans chaque contrat, créez les portefeuilles que vous recommandez et listez leurs fonds avec leur code ISIN.</p><p><button type="button" class="bouton" id="ajout">+ Ajouter un assureur</button></p></div>`;
  if ($("ajout")) $("ajout").onclick = ajouterAssureur;
}

const pc = (l) => Number(String(l.part).replace(",", ".")) || 0;
const estFondsEuros = (l) => !l.isin && /fonds\s*(en\s*)?euros?/i.test(l.nom || "");
const isinNonConfirme = (isin) => !!isin && !isinValide(isin);
const pastilleRouge = `<span class="al-alerte-isin" title="Code ISIN non confirmé : à vérifier" aria-label="Code ISIN non confirmé : à vérifier"></span>`;
function jauge(n) {
  return n ? `<span class="al-jauge" title="Risque ${n} sur 7" aria-label="Risque ${n} sur 7">${[1, 2, 3, 4, 5, 6, 7].map((k) => `<i style="${k <= n ? `background:${COUL_RISQUE[n - 1]}` : ""}"></i>`).join("")}<b style="color:${COUL_RISQUE[n - 1]}">${n}</b></span>` : `<span class="al-vide">—</span>`;
}
function synthese(lignes) {
  const total = lignes.reduce((s, l) => s + pc(l), 0), rm = risqueMoyen(lignes);
  const parSfdr = { 6: 0, 8: 0, 9: 0, n: 0 }, parRisque = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const l of lignes) { const w = pc(l); parSfdr[l.sfdr || "n"] += w; parRisque[Number(l.risque) || 0] += w; }
  const durable = parSfdr[8] + parSfdr[9];
  const seg = (w, coul, lib) => w > 0 ? `<span style="width:${w / Math.max(total, 1) * 100}%;background:${coul}" title="${lib} : ${nb(w)} %"></span>` : "";
  const leg = (w, coul, lib) => w > 0 ? `<span><i style="background:${coul}"></i>${lib} <b>${nb(Math.round(w * 100) / 100)} %</b></span>` : "";
  return `<div class="al-synthese">
    <div class="al-kpis">
      <div class="al-kpi ${Math.abs(total - 100) < .01 ? "ok" : total > 100 ? "ko" : ""}"><span>Poids total</span><b>${nb(total)} %${Math.abs(total - 100) < .01 ? " ✓" : ""}</b><small>${Math.abs(total - 100) < .01 ? "Portefeuille complet" : total > 100 ? "Dépasse 100 %" : `Reste ${nb(Math.round((100 - total) * 100) / 100)} %`}</small></div>
      <div class="al-kpi"><span>Risque moyen pondéré</span><b ${rm ? `style="color:${COUL_RISQUE[Math.round(rm.valeur) - 1]}"` : ""}>${rm ? nb(Math.round(rm.valeur * 10) / 10) + " / 7" : "—"}</b><small>${rm ? (rm.couvert < .999 ? `Sur ${nb(Math.round(rm.couvert * 1000) / 10)} % renseignés` : "Repère indicatif") : "Risques à renseigner"}</small></div>
      <div class="al-kpi"><span>Part durable</span><b>${total ? nb(Math.round(durable / total * 1000) / 10) + " %" : "—"}</b><small>Articles 8 et 9 (SFDR)</small></div>
      <div class="al-kpi"><span>Nombre de fonds</span><b>${lignes.length}</b><small>${lignes.filter((l) => isinNonConfirme(l.isin)).length ? `${lignes.filter((l) => isinNonConfirme(l.isin)).length} ISIN à vérifier` : "Lignes du portefeuille"}</small></div>
    </div>
    ${total > 0 ? `<div class="al-repart"><div class="al-repart-titre">Classement SFDR</div><div class="al-barre">${seg(parSfdr[9], "#1f6b3a", "Article 9")}${seg(parSfdr[8], "#5fb37a", "Article 8")}${seg(parSfdr[6], "#9aa3b5", "Article 6")}${seg(parSfdr.n, "var(--bord-fort)", "Non renseigné")}</div>
      <div class="al-legende">${leg(parSfdr[9], "#1f6b3a", "Article 9")}${leg(parSfdr[8], "#5fb37a", "Article 8")}${leg(parSfdr[6], "#9aa3b5", "Article 6")}${leg(parSfdr.n, "var(--bord-fort)", "Non renseigné")}</div></div>
    <div class="al-repart"><div class="al-repart-titre">Niveau de risque (SRI)</div><div class="al-barre">${[1, 2, 3, 4, 5, 6, 7].map((n) => seg(parRisque[n], COUL_RISQUE[n - 1], `Risque ${n}`)).join("")}${seg(parRisque[0], "var(--bord-fort)", "Non renseigné")}</div>
      <div class="al-legende">${[1, 2, 3, 4, 5, 6, 7].map((n) => leg(parRisque[n], COUL_RISQUE[n - 1], `${n}/7`)).join("")}${leg(parRisque[0], "var(--bord-fort)", "Non renseigné")}</div></div>` : ""}
  </div>`;
}

function rendrePortefeuille(z) {
  const p = portefeuille(sel.p), c = contrat(p.contrat_id);
  const max = Math.max(1, ...brouillon.map(pc));
  const ligneLecture = (l, i) => `<tr data-ligne="${i}" class="al-lect ${sel.f && l.isin === sel.f ? "al-actif" : ""}" ${l.isin ? `tabindex="0"` : ""}>
      <td class="al-c-num"><i style="background:${COULEURS[i % COULEURS.length]}"></i>${i + 1}</td>
      <td class="al-c-fonds"><div class="al-f-nom">${echapper(l.nom || "Sans nom")}</div>
        <div class="al-f-isin">${estFondsEuros(l) ? `<span class="al-euros">Fonds en euros</span>` : l.isin ? `${echapper(l.isin)}${isinNonConfirme(l.isin) ? pastilleRouge : ""}` : `<span class="al-vide">Sans code ISIN</span>`}</div></td>
      <td class="al-c-sfdr">${l.sfdr ? pastilleSfdr(l.sfdr) : `<span class="al-vide">—</span>`}</td>
      <td class="al-c-risque">${jauge(Number(l.risque))}</td>
      <td class="al-c-poids">${pc(l) ? `<b>${nb(pc(l))} %</b><span class="al-mini"><i style="width:${pc(l) / max * 100}%;background:${COULEURS[i % COULEURS.length]}"></i></span>` : `<span class="al-vide">—</span>`}</td></tr>`;
  const ligneEdition = (l, i) => `<tr data-ligne="${i}" class="al-edit">
      <td class="al-c-num"><i style="background:${COULEURS[i % COULEURS.length]}"></i>${i + 1}</td>
      <td class="al-c-fonds"><input data-champ="nom" value="${echapper(l.nom)}" placeholder="Nom du fonds" aria-label="Nom du fonds, ligne ${i + 1}">
        <span class="al-isin-saisie"><input data-champ="isin" value="${echapper(l.isin)}" placeholder="${estFondsEuros(l) ? "Pas d'ISIN (fonds en euros)" : "Code ISIN"}" maxlength="20" aria-label="Code ISIN, ligne ${i + 1}">${isinNonConfirme(l.isin) ? pastilleRouge : ""}</span></td>
      <td class="al-c-sfdr"><select data-champ="sfdr" class="s${l.sfdr || 0}" aria-label="Classement SFDR, ligne ${i + 1}"><option value="">—</option>${[6, 8, 9].map((a) => `<option value="${a}" ${String(l.sfdr) === String(a) ? "selected" : ""}>Art. ${a}</option>`).join("")}</select></td>
      <td class="al-c-risque"><span class="al-echelle" role="group" aria-label="Risque de 1 à 7, ligne ${i + 1}">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button type="button" data-risque="${n}" aria-pressed="${Number(l.risque) === n}" style="--c:${COUL_RISQUE[n - 1]}" title="Risque ${n} sur 7">${n}</button>`).join("")}</span></td>
      <td class="al-c-poids"><span class="al-poids-saisie"><input data-champ="part" value="${echapper(String(l.part).replace(".", ","))}" placeholder="—" inputmode="decimal" aria-label="Poids en %, ligne ${i + 1}"><span>%</span></span></td>
      <td class="al-c-bt">${i ? `<button type="button" class="al-icone" data-monter="${i}" title="Monter" aria-label="Monter la ligne">${SVG.haut}</button>` : `<span class="al-icone"></span>`}<button type="button" class="al-icone danger" data-retirer="${i}" title="Retirer" aria-label="Retirer la ligne">${SVG.poubelle}</button></td></tr>`;
  const nbAlerte = brouillon.filter((l) => isinNonConfirme(l.isin)).length;
  z.innerHTML = fil() + `<div class="al-entete"><div><h2>${point(p.profil)} ${echapper(p.nom)}</h2><div class="al-meta">${typeBadge(c.type)} ${echapper(c.nom)}</div>${meta(p)}</div>
      <div class="al-actions"><button type="button" class="bouton bouton-discret" id="renommer">${SVG.crayon} Renommer</button><button type="button" class="bouton bouton-discret" id="supprimer">${SVG.poubelle} Supprimer</button></div></div>
    <div class="al-profils" role="group" aria-label="Profil">${Object.entries(PROFILS).map(([k, [l]]) => `<button type="button" class="puce" data-profil="${k}" aria-pressed="${p.profil === k}">${l}</button>`).join("")}<button type="button" class="puce" id="profil-libre" aria-pressed="${!!p.profil && !PROFILS[p.profil]}">✏️ ${p.profil && !PROFILS[p.profil] ? echapper(p.profil) : "Autre…"}</button></div>
    <div class="al-section">
      <div class="al-barre-outils"><h3>Fonds du portefeuille <small>${brouillon.length} fonds</small></h3>
        <span class="al-actions">${edition ? `<button type="button" class="bouton bouton-discret" id="ajout-ligne">+ Ajouter un fonds</button>` : brouillon.length ? `<button type="button" class="bouton bouton-discret" id="editer">${SVG.crayon} Modifier les fonds</button>` : ""}<button type="button" class="bouton bouton-discret" id="importer">📄 Importer un document</button></span></div>
      ${brouillon.length ? `<div class="al-tf-cadre"><table class="al-tf ${edition ? "edition" : ""}"><thead><tr><th class="al-c-num">#</th><th>Fonds</th><th class="al-c-sfdr">SFDR</th><th class="al-c-risque">Risque</th><th class="al-c-poids">Poids</th>${edition ? `<th class="al-c-bt"></th>` : ""}</tr></thead>
        <tbody>${brouillon.map(edition ? ligneEdition : ligneLecture).join("")}</tbody></table></div>
        ${nbAlerte ? `<p class="al-note-isin">${pastilleRouge} ${nbAlerte} code${nbAlerte > 1 ? "s" : ""} ISIN non confirmé${nbAlerte > 1 ? "s" : ""} (clé de contrôle incorrecte) : à vérifier sur le document du fonds.</p>` : ""}`
        : `<div class="al-vide-tableau"><p>Aucun fonds pour l'instant.</p><p class="al-astuce">Importez le document de l'assureur, ou ajoutez les fonds un par un avec leur code ISIN, leur classement SFDR, leur risque (1 à 7) et leur poids.</p>${edition ? "" : `<button type="button" class="bouton" id="premier">+ Ajouter un fonds</button>`}</div>`}
      ${edition ? `<div class="al-enregistrer" role="status"><span>${modifie ? "Modifications non enregistrées" : "Mode édition"}</span><button type="button" class="bouton bouton-discret" id="annuler">Annuler</button><button type="button" class="bouton" id="enregistrer">Enregistrer</button></div>` : ""}
      ${brouillon.length ? synthese(brouillon) : ""}
    </div>`;
  brancherFil(z);
  $("renommer").onclick = () => modifier("portefeuille", p);
  $("supprimer").onclick = () => supprimer("portefeuille", p, `le portefeuille « ${p.nom} » et ses commentaires`);
  z.querySelectorAll("[data-profil]").forEach((b) => b.onclick = async () => {
    const profil = p.profil === b.dataset.profil ? "" : b.dataset.profil;
    try { await appelApi(`/api/allocation/portefeuille/${p.id}`, "PUT", { nom: p.nom, profil }); p.profil = profil || null; rendreArbre(); rendreCentre(); } catch (e) { notifier(e.message, true); }
  });
  $("profil-libre").onclick = async () => {
    const libre = p.profil && !PROFILS[p.profil] ? p.profil : "";
    const v = await dialogue("Profil personnalisé", `<label>Profil<input type="text" name="profil" value="${echapper(libre)}" placeholder="Ex. : Retraite 2035, Revenus réguliers…" maxlength="40" autocomplete="off"></label><p>Laissez vide pour retirer le profil.</p>`, "Enregistrer");
    if (!v) return;
    try { await appelApi(`/api/allocation/portefeuille/${p.id}`, "PUT", { nom: p.nom, profil: v.profil.trim() }); p.profil = v.profil.trim() || null; rendreArbre(); rendreCentre(); } catch (e) { notifier(e.message, true); }
  };
  const choisirFonds = (isin) => { if (!/^[A-Z0-9]{12}$/.test(isin || "")) return; sel.f = isin; ongletDroite = "fonds"; synchroniserUrl(); rendreDroite(); z.querySelectorAll("[data-ligne]").forEach((tr) => tr.classList.toggle("al-actif", brouillon[+tr.dataset.ligne].isin === isin)); };
  z.querySelectorAll("tr.al-lect").forEach((tr) => { const go = () => choisirFonds(brouillon[+tr.dataset.ligne].isin); tr.onclick = go; tr.onkeydown = (e) => { if (e.key === "Enter") go(); }; });
  z.querySelectorAll("[data-ligne] input[data-champ]").forEach((inp) => {
    inp.oninput = () => {
      const i = +inp.closest("tr").dataset.ligne, champ = inp.dataset.champ;
      brouillon[i][champ] = champ === "isin" ? inp.value.toUpperCase().replace(/\s/g, "") : inp.value;
      if (champ === "isin") inp.value = brouillon[i].isin;
      if (!modifie) { modifie = true; z.querySelector(".al-enregistrer span").textContent = "Modifications non enregistrées"; }
    };
    inp.onchange = () => rendreCentreEnGardantFocus(null);   // pastilles, synthèse et totaux mis à jour en quittant la case
    inp.onfocus = () => choisirFonds(brouillon[+inp.closest("tr").dataset.ligne].isin);
  });
  z.querySelectorAll('select[data-champ="sfdr"]').forEach((s_) => s_.onchange = () => { brouillon[+s_.closest("tr").dataset.ligne].sfdr = s_.value; modifie = true; rendreCentreEnGardantFocus(null); });
  z.querySelectorAll("[data-risque]").forEach((b) => b.onclick = () => { const l = brouillon[+b.closest("tr").dataset.ligne], n = +b.dataset.risque; l.risque = Number(l.risque) === n ? "" : n; modifie = true; rendreCentreEnGardantFocus(null); });
  z.querySelectorAll("[data-retirer]").forEach((b) => b.onclick = () => { brouillon.splice(+b.dataset.retirer, 1); modifie = true; rendreCentre(); });
  z.querySelectorAll("[data-monter]").forEach((b) => b.onclick = () => { const i = +b.dataset.monter; [brouillon[i - 1], brouillon[i]] = [brouillon[i], brouillon[i - 1]]; modifie = true; rendreCentre(); });
  const ajouter = () => { edition = true; brouillon.push({ nom: "", isin: "", part: "", sfdr: "", risque: "" }); modifie = true; rendreCentre(); const t = z.querySelectorAll('[data-champ="nom"]'); t[t.length - 1]?.focus(); };
  if ($("ajout-ligne")) $("ajout-ligne").onclick = ajouter;
  if ($("premier")) $("premier").onclick = ajouter;
  if ($("editer")) $("editer").onclick = () => { edition = true; rendreCentre(); };
  $("importer").onclick = async () => {
    const r = await ouvrirImport({ existants: brouillon.map((l) => l.isin).filter(Boolean) });
    if (!r) return;
    const nouveaux = r.fonds.map((x) => ({ nom: x.nom, isin: x.isin, part: x.part ?? "", sfdr: x.sfdr ?? "", risque: x.risque ?? "" }));
    brouillon = r.remplacer ? nouveaux : [...brouillon.filter((l) => l.nom.trim() || l.isin), ...nouveaux.filter((x) => !x.isin || !brouillon.some((l) => l.isin === x.isin))];
    edition = true; modifie = true; rendreCentre(); notifier(`${nouveaux.length} fonds ajouté${nouveaux.length > 1 ? "s" : ""} : vérifiez puis enregistrez.`);
  };
  if ($("annuler")) $("annuler").onclick = () => { brouillon = lignesDe(p.id).map(versBrouillon); modifie = false; edition = false; rendreCentre(); };
  if ($("enregistrer")) $("enregistrer").onclick = enregistrerLignes;
}
// Ré-affiche le centre (barre « Enregistrer », totaux) sans perdre la saisie en cours.
function rendreCentreEnGardantFocus(inp) {
  const pos = inp ? [inp.closest("tr").dataset.ligne, inp.dataset.champ, inp.selectionStart] : null;
  const y = scrollY; rendreCentre(); scrollTo(0, y);
  if (pos) { const e = $("centre").querySelector(`[data-ligne="${pos[0]}"] [data-champ="${pos[1]}"]`); if (e) { e.focus(); try { e.setSelectionRange(pos[2], pos[2]); } catch {} } }
}
function majTotal() {
  const total = brouillon.reduce((s, l) => s + (Number(String(l.part).replace(",", ".")) || 0), 0), t = $("centre").querySelector(".al-total");
  if (t) { t.className = "al-total " + (Math.abs(total - 100) < .01 ? "ok" : total > 100 ? "ko" : ""); t.innerHTML = `Poids total : <b>${nb(total)} %</b>${Math.abs(total - 100) < .01 ? " ✓" : total > 100 ? " (dépasse 100 %)" : total ? ` (reste ${nb(100 - total)} %)` : ""}`; }
}
async function enregistrerLignes() {
  const lignes = brouillon.filter((l) => l.nom.trim() || l.isin.trim() || String(l.part).trim() || l.sfdr || l.risque);
  try {
    await appelApi(`/api/allocation/portefeuille/${sel.p}/lignes`, "PUT", { lignes: lignes.map((l) => ({ nom: l.nom, isin: l.isin, part: String(l.part).trim() === "" ? null : String(l.part).replace(",", "."), sfdr: l.sfdr || null, risque: l.risque || null })) });
    modifie = false; edition = false; await charger(); notifier("Portefeuille enregistré.");
    brouillon = lignesDe(sel.p).map(versBrouillon); rendre();
  } catch (e) { notifier(e.message, true); }
}

// ---------------------------------------------------------------- Colonne de droite : « Pourquoi ce choix » et le fonds
function htmlFonds() {
  const usages = D.lignes.filter((l) => l.isin === sel.f), nom = usages[0]?.nom || brouillon?.find((l) => l.isin === sel.f)?.nom || "Fonds";
  return `<div class="al-zone"><div class="al-titre-panneau"><span>Fonds sélectionné</span><button type="button" class="al-icone" id="fermer-f" aria-label="Fermer">✕</button></div>
      <h3 class="al-fonds-nom">${echapper(nom)}</h3>${(() => { const ref = usages.find((l) => l.sfdr || l.risque) || brouillon?.find((l) => l.isin === sel.f); return ref && (ref.sfdr || ref.risque) ? `<div class="al-puces-fonds">${pastilleSfdr(ref.sfdr)}${pastilleRisque(ref.risque)}</div>` : ""; })()}<div class="al-isin-ligne">${sel.f}<button type="button" class="al-icone" id="copier-isin" title="Copier l'ISIN" aria-label="Copier l'ISIN">${SVG.copier}</button></div></div>
    <div class="al-zone"><div class="al-titre-panneau">Utilisé dans ${usages.length} portefeuille${usages.length > 1 ? "s" : ""}</div>
      ${usages.length ? `<ul class="al-utilise">${usages.map((l) => { const p = portefeuille(l.portefeuille_id), c = contrat(p.contrat_id), a = assureur(c.assureur_id);
        return `<li><button type="button" data-p="${p.id}"><span>${echapper(a.nom)} › ${echapper(c.nom)} › <b>${echapper(p.nom)}</b></span><small style="white-space:nowrap">${l.part != null ? nb(l.part) + " %" : ""}</small></button></li>`; }).join("")}</ul>` : `<p class="al-astuce">Pas encore enregistré dans un portefeuille.</p>`}</div>
    <div class="al-zone"><div class="al-titre-panneau">Fiches et performances</div>
      <div class="al-liens">
        <a class="al-lien" href="${lienAmf(sel.f)}" target="_blank" rel="noopener noreferrer"><b>Base officielle de l'AMF (GECO)</b><span>Documents réglementaires et valeurs liquidatives, si le fonds y est enregistré</span></a>
        <button type="button" class="al-lien" data-ext="https://www.quantalys.com/Recherche"><b>Quantalys</b><span>Performances, volatilité, notation : l'ISIN est copié, collez-le dans la recherche</span></button>
        <button type="button" class="al-lien" data-ext="https://global.morningstar.com/fr/fonds"><b>Morningstar</b><span>Performances et notation : l'ISIN est copié, collez-le dans la recherche</span></button>
      </div><p class="al-astuce" style="margin:8px 0 0;font-size:.78rem">Sites externes gratuits ; le site ne recopie aucune performance.</p></div>
    <div class="al-zone"><div class="al-titre-panneau">Notre avis sur ce fonds</div><div id="com-f"></div></div>`;
}
function brancherFonds(z) {
  $("fermer-f").onclick = () => { sel.f = null; ongletDroite = "pourquoi"; synchroniserUrl(); rendreDroite(); $("centre").querySelectorAll(".al-actif").forEach((x) => x.classList.remove("al-actif")); };
  $("copier-isin").onclick = () => copier(sel.f);
  z.querySelectorAll("[data-ext]").forEach((b) => b.onclick = async () => { try { await navigator.clipboard.writeText(sel.f); notifier(`ISIN ${sel.f} copié : collez-le dans la recherche.`); } catch {} window.open(b.dataset.ext, "_blank", "noopener"); });
  z.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => choisir("p", +b.dataset.p));
  commentaires("f:" + sel.f, $("com-f"), "Pourquoi ce fonds : gestion, frais, régularité, rôle dans le portefeuille…");
}
function htmlTop() {
  const compte = new Map();
  for (const l of D.lignes) if (l.isin) { const x = compte.get(l.isin) || { nom: l.nom, n: 0 }; x.n++; compte.set(l.isin, x); }
  const top = [...compte.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12);
  return `<div class="al-zone"><p class="al-astuce" style="margin:0">Cliquez sur un fonds pour voir où il est utilisé, ses fiches et l'avis des conseillers.</p></div>
    ${top.length ? `<div class="al-zone"><div class="al-titre-panneau">Fonds les plus utilisés au cabinet</div><ul class="al-top">${top.map(([isin, x]) => `<li><button type="button" data-f="${isin}"><span>${echapper(x.nom)}</span><span class="doux petit">${x.n}×</span><small>${isin}</small></button></li>`).join("")}</ul></div>` : ""}`;
}
function rendreDroite() {
  const z = $("droite");
  const brancherTop = () => z.querySelectorAll("[data-f]").forEach((b) => b.onclick = () => { sel.f = b.dataset.f; ongletDroite = "fonds"; synchroniserUrl(); rendreDroite(); });
  if (sel.p) {
    const n = D.commentaires["p:" + sel.p] || 0;
    z.innerHTML = `<div class="al-onglets" role="tablist">
        <button type="button" role="tab" aria-selected="${ongletDroite === "pourquoi"}" data-onglet="pourquoi">💬 Pourquoi ce choix${n ? ` <span class="al-badge">${n}</span>` : ""}</button>
        <button type="button" role="tab" aria-selected="${ongletDroite === "fonds"}" data-onglet="fonds">📈 Fonds</button></div>
      <div class="al-defile" role="tabpanel">${ongletDroite === "pourquoi"
        ? `<div class="al-zone"><p class="al-astuce" style="margin:0 0 10px">Les raisons de ce portefeuille, visibles par tous les conseillers.</p><div id="com-p"></div></div>`
        : sel.f ? htmlFonds() : htmlTop()}</div>`;
    z.querySelectorAll("[data-onglet]").forEach((b) => b.onclick = () => { ongletDroite = b.dataset.onglet; rendreDroite(); });
    if (ongletDroite === "pourquoi") commentaires("p:" + sel.p, $("com-p"), "Expliquez le choix de ce portefeuille : objectif, horizon, contexte de marché, points de vigilance…");
    else if (sel.f) brancherFonds(z); else brancherTop();
    return;
  }
  if (sel.f) { z.innerHTML = `<div class="al-defile">${htmlFonds()}</div>`; brancherFonds(z); return; }
  z.innerHTML = `<div class="al-zone" style="padding-bottom:0"><div class="al-titre-panneau">Détail d'un fonds</div></div><div class="al-defile">${htmlTop()}</div>`;
  brancherTop();
}

// ---------------------------------------------------------------- Commentaires « Pourquoi ce choix »
async function commentaires(cible, el, aide) {
  el.innerHTML = `<p class="al-astuce">Chargement…</p>`;
  let liste = [];
  try { liste = (await appelApi("/api/allocation/commentaires?cible=" + encodeURIComponent(cible))).commentaires; } catch (e) { el.innerHTML = `<p class="al-astuce">${echapper(e.message)}</p>`; return; }
  el.innerHTML = `<div class="al-fil-com">${liste.length ? liste.map((c) => `<article class="al-com" data-com="${c.id}"><header><span class="al-avatar">${initiales(c.auteur_nom)}</span><span class="al-qui"><b>${echapper(c.auteur_nom)}</b><span>${date(c.cree_le)}${c.maj_le !== c.cree_le ? " · modifié" : ""}</span></span>
      ${c.a_moi ? `<button type="button" class="al-icone" data-modif="${c.id}" title="Modifier" aria-label="Modifier">${SVG.crayon}</button><button type="button" class="al-icone danger" data-suppr="${c.id}" title="Supprimer" aria-label="Supprimer">${SVG.poubelle}</button>` : ""}</header><p>${echapper(c.texte)}</p></article>`).join("")
      : `<p class="al-astuce" style="margin:0">Aucune explication pour l'instant.</p>`}</div>
    <div class="al-ecrire"><textarea placeholder="${echapper(aide)}" aria-label="Votre explication" maxlength="3000"></textarea><div><button type="button" class="bouton">Publier</button></div></div>`;
  const ta = el.querySelector("textarea");
  el.querySelector(".al-ecrire .bouton").onclick = async () => {
    if (!ta.value.trim()) { ta.focus(); return; }
    try { await appelApi("/api/allocation/commentaires", "POST", { cible, texte: ta.value }); D.commentaires[cible] = (D.commentaires[cible] || 0) + 1; if (cible.startsWith("p:")) rendreDroite(); else commentaires(cible, el, aide); } catch (e) { notifier(e.message, true); }
  };
  el.querySelectorAll("[data-suppr]").forEach((b) => b.onclick = async () => {
    if (!(await confirmer("Supprimer ce commentaire ?", "Il ne sera plus visible par les autres conseillers.", "Supprimer"))) return;
    try { await appelApi("/api/allocation/commentaires/" + b.dataset.suppr, "DELETE"); D.commentaires[cible]--; if (cible.startsWith("p:")) rendreDroite(); else commentaires(cible, el, aide); } catch (e) { notifier(e.message, true); }
  });
  el.querySelectorAll("[data-modif]").forEach((b) => b.onclick = () => {
    const art = b.closest("article"), c = liste.find((x) => x.id === +b.dataset.modif);
    art.querySelector("p").outerHTML = `<div class="al-ecrire"><textarea maxlength="3000">${echapper(c.texte)}</textarea><div><button type="button" class="bouton bouton-discret" data-ann>Annuler</button><button type="button" class="bouton" data-ok>Enregistrer</button></div></div>`;
    art.querySelector("[data-ann]").onclick = () => commentaires(cible, el, aide);
    art.querySelector("[data-ok]").onclick = async () => {
      try { await appelApi("/api/allocation/commentaires/" + c.id, "PUT", { texte: art.querySelector("textarea").value }); commentaires(cible, el, aide); } catch (e) { notifier(e.message, true); }
    };
  });
}

// ---------------------------------------------------------------- Boîtes de dialogue
function dialogue(titre, contenu, valider, danger) {
  return new Promise((ok) => {
    const d = $("dialogue"), f = $("dialogue-form");
    f.innerHTML = `<h2>${titre}</h2>${contenu}<div class="al-boutons"><button type="button" class="bouton bouton-discret" value="non">Annuler</button><button type="submit" class="bouton ${danger ? "danger" : ""}" value="oui">${valider}</button></div>`;
    let choix = null;
    f.querySelector('[value="non"]').onclick = () => d.close();
    f.onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); f.querySelectorAll("[aria-pressed]").forEach((b) => { if (b.getAttribute("aria-pressed") === "true") v[b.dataset.g] = b.dataset.v; }); choix = v; d.close(); };
    f.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => f.querySelectorAll(`[data-g="${b.dataset.g}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b)));
    d.onclose = () => ok(choix);
    d.showModal();
    f.querySelector("input")?.focus();
  });
}
const champNom = (lib, val, ex) => `<label>${lib}<input type="text" name="nom" value="${echapper(val || "")}" placeholder="${ex}" required maxlength="120" autocomplete="off"></label>`;
const puces = (g, lib, options, defaut) => `<label>${lib}<span class="al-profils" style="margin:0">${options.map(([v, l]) => `<button type="button" class="puce" data-g="${g}" data-v="${v}" aria-pressed="${v === defaut}">${l}</button>`).join("")}</span></label>`;
const confirmer = async (titre, texte, bouton) => !!(await dialogue(titre, `<p>${texte}</p>`, bouton, true));

// Champs du logo : site internet (icône récupérée automatiquement) ou image déposée.
const champsLogo = (a = {}) => `<label>Site internet de l'assureur (facultatif)<input type="text" name="site" value="${echapper(a.site || "")}" placeholder="Ex. : assureur.fr" maxlength="200" autocomplete="off"></label>
  <p style="margin-top:-6px;font-size:.8rem">Son logo (l'icône du site) s'affichera automatiquement.</p>
  <label>Ou déposez le logo (PNG, JPG)<input type="file" name="logo" accept="image/png,image/jpeg,image/webp"></label>
  ${a.logo ? `<label class="al-coche"><input type="checkbox" name="sans_logo" style="width:auto"> Retirer le logo déposé</label>` : ""}`;
// Réduit l'image à 128 px au plus (le site n'enregistre qu'une petite vignette).
async function vignette(fichier) {
  if (!fichier || !fichier.size) return undefined;
  if (fichier.size > 5 * 1024 * 1024) throw new Error("Image trop lourde (5 Mo au plus).");
  const img = await createImageBitmap(fichier), k = Math.min(1, 128 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
}
async function corpsAssureur(v, a = {}) {
  const corps = { nom: v.nom, site: v.site || "" };
  const image = await vignette(v.logo);
  if (image) corps.logo = image; else if (v.sans_logo) corps.logo = "";
  return corps;
}
async function ajouterAssureur() {
  const v = await dialogue("Nouvel assureur", champNom("Nom de l'assureur", "", "Ex. : nom de la compagnie") + champsLogo(), "Ajouter");
  if (!v) return;
  try { const r = await appelApi("/api/allocation/assureur", "POST", await corpsAssureur(v)); await charger(); choisir("a", r.id, true); } catch (e) { notifier(e.message, true); }
}
async function ajouterContrat(aid) {
  const v = await dialogue("Nouveau contrat", champNom("Nom du contrat", "", "Ex. : nom commercial du contrat") + puces("type", "Type de contrat", [["av", "Assurance-vie"], ["per", "PER"]], "av"), "Ajouter");
  if (!v) return;
  try { const r = await appelApi("/api/allocation/contrat", "POST", { nom: v.nom, type: v.type || "av", assureur_id: aid }); await charger(); choisir("c", r.id, true); } catch (e) { notifier(e.message, true); }
}
async function ajouterPortefeuille(cid) {
  const v = await dialogue("Nouveau portefeuille", champNom("Nom du portefeuille", "", "Ex. : Équilibré 2026") + puces("profil", "Profil (facultatif)", Object.entries(PROFILS).map(([k, [l]]) => [k, l]), ""), "Créer");
  if (!v) return;
  try { const r = await appelApi("/api/allocation/portefeuille", "POST", { nom: v.nom, profil: v.profil || "", contrat_id: cid }); await charger(); choisir("p", r.id, true); } catch (e) { notifier(e.message, true); }
}
async function modifier(type, x) {
  const extra = type === "contrat" ? puces("type", "Type de contrat", [["av", "Assurance-vie"], ["per", "PER"]], x.type) : "";
  const v = await dialogue(type === "contrat" ? "Modifier le contrat" : type === "assureur" ? "Modifier l'assureur" : "Renommer", champNom("Nom", x.nom, "") + extra + (type === "assureur" ? champsLogo(x) : ""), "Enregistrer");
  if (!v) return;
  let corps = { nom: v.nom };
  if (type === "assureur") try { corps = await corpsAssureur(v, x); } catch (e) { notifier(e.message, true); return; }
  if (type === "contrat") corps.type = v.type || x.type;
  if (type === "portefeuille") corps.profil = x.profil || "";
  try { await appelApi(`/api/allocation/${type}/${x.id}`, "PUT", corps); await charger(); rendre(); } catch (e) { notifier(e.message, true); }
}
async function supprimer(type, x, quoi) {
  if (!(await confirmer("Supprimer définitivement ?", `Vous allez supprimer ${echapper(quoi)}. Cette action est visible par tous les conseillers et ne peut pas être annulée.`, "Supprimer"))) return;
  try {
    await appelApi(`/api/allocation/${type}/${x.id}`, "DELETE"); modifie = false; await charger();
    if (type === "portefeuille") choisir("c", x.contrat_id, true); else if (type === "contrat") choisir("a", x.assureur_id, true); else choisir(null, null, true);
    notifier("Supprimé.");
  } catch (e) { notifier(e.message, true); }
}

// ---------------------------------------------------------------- Démarrage
addEventListener("beforeunload", (e) => { if (modifie) { e.preventDefault(); e.returnValue = ""; } });
chargerEntete("/allocation").then(async () => {
  $("ajout-assureur").onclick = ajouterAssureur;
  $("cherche").oninput = () => { recherche = $("cherche").value; rendreArbre(); };
  try { await charger(); } catch (e) { $("centre").innerHTML = `<p class="al-astuce">${echapper(e.message)}</p>`; return; }
  const q = new URLSearchParams(location.search);
  sel.f = /^[A-Z0-9]{12}$/.test(q.get("f") || "") ? q.get("f") : null;
  if (q.get("p")) choisir("p", +q.get("p"), true); else if (q.get("c")) choisir("c", +q.get("c"), true); else if (q.get("a")) choisir("a", +q.get("a"), true); else rendre();
});
