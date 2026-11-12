// version 1.0 — simulateurs et graphiques des fiches « Apprendre ».
// Tous les montants viennent des fiches, vérifiées sur des sources officielles (voir chaque fiche).
// Ce sont des estimations pédagogiques : hors cas particuliers, à confirmer avant tout conseil.

const euros = (n) => Math.round(n).toLocaleString("fr-FR") + " €";
const pct = (n) => (Math.round(n * 1000) / 10).toLocaleString("fr-FR") + " %";

// Barème des droits en ligne directe (donations et successions, article 777 du CGI).
const BAREME_LIGNE_DIRECTE = [[8072, .05], [12109, .10], [15932, .15], [552324, .20], [902838, .30], [1805677, .40], [Infinity, .45]];
function baremeProgressif(base, tranches) {
  let impot = 0, bas = 0;
  for (const [haut, taux] of tranches) { if (base > bas) impot += (Math.min(base, haut) - bas) * taux; bas = haut; }
  return impot;
}

// ---------------------------------------------------------------- Petites briques d'interface
const ctl = {
  curseur: (nom, libelle, min, max, pas, val) => `<label>${libelle} : <strong data-v="${nom}"></strong></label>
    <input type="range" data-c="${nom}" min="${min}" max="${max}" step="${pas}" value="${val}" aria-label="${libelle.replace(/"/g, "")}">`,
  choix: (nom, libelle, options, defaut) => `<div class="simu-choix"><span class="simu-lib">${libelle}</span><div class="puces" role="group" aria-label="${libelle.replace(/"/g, "")}">
    ${options.map(([v, l]) => `<button type="button" class="puce" data-g="${nom}" data-val="${v}" aria-pressed="${String(v) === String(defaut)}">${l}</button>`).join("")}</div></div>`,
  resultat: () => `<div class="simu-resultat" data-r aria-live="polite"></div>`,
};
// Lit les valeurs, branche les écouteurs et appelle maj(v, racine) à chaque changement.
function brancher(racine, formats, maj) {
  const lire = () => {
    const v = {};
    racine.querySelectorAll("[data-c]").forEach((i) => { v[i.dataset.c] = Number(i.value); });
    racine.querySelectorAll('[data-g][aria-pressed="true"]').forEach((b) => { v[b.dataset.g] = isNaN(Number(b.dataset.val)) ? b.dataset.val : Number(b.dataset.val); });
    for (const [k, f] of Object.entries(formats)) { const el = racine.querySelector(`[data-v="${k}"]`); if (el) el.textContent = f(v[k], v); }
    const r = racine.querySelector("[data-r]");
    maj(v, r);
  };
  racine.querySelectorAll("[data-c]").forEach((i) => i.addEventListener("input", lire));
  racine.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
    racine.querySelectorAll(`[data-g="${b.dataset.g}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b));
    lire();
  }));
  lire();
}

// Graphique en barres horizontales (comparaisons).
function barres(items, max) {
  const m = max || Math.max(...items.map((i) => i.valeur), 1);
  return `<div class="g-barres">${items.map((i) => `<div class="g-ligne"><span class="g-lib">${i.libelle}</span>
    <span class="g-piste"><span class="g-barre" style="width:${Math.max(0, Math.min(100, i.valeur / m * 100))}%;background:${i.couleur || "var(--accent)"}"></span></span>
    <strong class="g-val">${i.texte ?? euros(i.valeur)}</strong></div>`).join("")}</div>`;
}
// Graphique en colonnes (barèmes) : items = [{ libelle, valeur (en %), actif }].
function colonnes(items, unite = " %") {
  const m = Math.max(...items.map((i) => i.valeur), 1);
  return `<div class="g-colonnes" style="--n:${items.length}">${items.map((i) => `<div class="g-col ${i.actif ? "actif" : ""}">
    <span class="g-col-val">${String(i.valeur).replace(".", ",")}${unite}</span><span class="g-col-barre" style="height:${8 + i.valeur / m * 92}%"></span>
    <span class="g-col-lib">${i.libelle}</span></div>`).join("")}</div>`;
}
// Petit camembert (deux parts) en SVG.
function camembert(part, c1, c2, l1, l2) {
  const a = part * 2 * Math.PI, x = 50 + 45 * Math.sin(a), y = 50 - 45 * Math.cos(a);
  const arc = part >= 1 ? `<circle cx="50" cy="50" r="45" fill="${c1}"/>` : part <= 0 ? "" :
    `<path d="M50 50L50 5A45 45 0 ${part > .5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}z" fill="${c1}"/>`;
  return `<div class="g-camembert"><svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="${c2}"/>${arc}</svg>
    <div class="g-legende"><span><i style="background:${c1}"></i>${l1}</span><span><i style="background:${c2}"></i>${l2}</span></div></div>`;
}
const note = (t) => `<span class="doux petit" style="display:block;margin-top:8px">${t}</span>`;

// ---------------------------------------------------------------- Les outils, fiche par fiche
const OUTILS_FICHES = {
  "assurance-vie": [
    {
      titre: "Simulateur : transmettre par assurance-vie ou par succession ?",
      intro: "Capital reçu par un enfant au décès. Compare l'assurance-vie (versements faits avant 70 ans) et la succession classique, si l'enfant n'a reçu aucune donation dans les 15 dernières années.",
      html: () => ctl.curseur("cap", "Capital transmis à cet enfant", 0, 2000000, 10000, 400000) + ctl.resultat(),
      init: (z) => brancher(z, { cap: euros }, (v, r) => {
        const t = Math.max(0, v.cap - 152500);
        const av = Math.min(t, 700000) * .20 + Math.max(0, t - 700000) * .3125;
        const suc = baremeProgressif(Math.max(0, v.cap - 100000), BAREME_LIGNE_DIRECTE);
        r.className = "simu-resultat neutre";
        r.innerHTML = barres([
          { libelle: "Assurance-vie", valeur: av, couleur: "var(--ok)" },
          { libelle: "Succession", valeur: suc, couleur: "var(--ko)" },
        ], Math.max(av, suc, 1)) + `<p style="margin:10px 0 0">Avec l'assurance-vie, l'enfant paie <strong>${euros(av)}</strong> au lieu de <strong>${euros(suc)}</strong> par la succession${suc > av ? `, soit <strong>${euros(suc - av)} d'économie</strong>` : ""}.</p>` +
          note("Assurance-vie : 152 500 € d'abattement par bénéficiaire, puis 20 % jusqu'à 700 000 € et 31,25 % au-delà. Succession : 100 000 € d'abattement par enfant, puis barème de 5 % à 45 %. Le conjoint et le partenaire de PACS sont exonérés dans les deux cas.");
      }),
    },
    {
      titre: "Simulateur : un retrait après 8 ans",
      intro: "Combien coûte le retrait des gains d'un contrat de plus de 8 ans (versements totaux jusqu'à 150 000 €) ?",
      html: () => ctl.curseur("g", "Part de gains dans le retrait", 0, 40000, 500, 8000) + ctl.choix("foyer", "Foyer", [[4600, "Personne seule"], [9200, "Couple"]], 4600) + ctl.resultat(),
      init: (z) => brancher(z, { g: euros }, (v, r) => {
        const ir = Math.max(0, v.g - v.foyer) * .075, ps = v.g * .172;
        r.className = "simu-resultat " + (ir === 0 ? "gain" : "neutre");
        r.innerHTML = `Impôt sur le revenu : <strong>${euros(ir)}</strong> (abattement de ${euros(v.foyer)}, puis 7,5 %).<br>Prélèvements sociaux (17,2 %) : <strong>${euros(ps)}</strong>.` +
          note("Sur le fonds en euros, les prélèvements sociaux sont déjà prélevés chaque année : ils ne sont pas dus une seconde fois. Au-delà de 150 000 € de versements, le taux est de 12,8 % pour la part correspondante.");
      }),
    },
  ],

  per: [
    {
      titre: "Simulateur : l'économie d'impôt d'un versement sur un PER",
      intro: "Pour un salarié : le versement est déduit du revenu imposable, dans la limite du plafond (10 % des revenus professionnels, entre 4 710 € et 37 680 € pour 2026).",
      html: () => ctl.curseur("rev", "Revenus professionnels nets imposables", 10000, 400000, 1000, 60000) + ctl.curseur("ver", "Versement sur le PER", 0, 40000, 500, 5000) +
        ctl.choix("tmi", "Tranche marginale d'imposition", [[0, "0 %"], [.11, "11 %"], [.30, "30 %"], [.41, "41 %"], [.45, "45 %"]], .30) +
        ctl.choix("age", "Âge du client", [["moins", "Moins de 70 ans"], ["plus", "70 ans ou plus"]], "moins") + ctl.resultat(),
      init: (z) => brancher(z, { rev: euros, ver: euros }, (v, r) => {
        const plafond = Math.min(37680, Math.max(4710, v.rev * .10));
        const deduit = v.age === "plus" ? 0 : Math.min(v.ver, plafond), eco = deduit * v.tmi;
        r.className = "simu-resultat " + (eco > 0 ? "gain" : "neutre");
        r.innerHTML = (v.age === "plus" ? "<strong>Pas de déduction</strong> : depuis le 1er janvier 2026, les versements faits à partir de 70 ans ne sont plus déductibles.<br>" : "") +
          `Plafond estimé : <strong>${euros(plafond)}</strong> · montant déduit : <strong>${euros(deduit)}</strong><br>` +
          barres([{ libelle: "Versement", valeur: v.ver, couleur: "var(--i3, var(--accent))" }, { libelle: "Économie d'impôt", valeur: eco, couleur: "var(--ok)" }, { libelle: "Effort réel", valeur: v.ver - eco, couleur: "var(--accent)" }], Math.max(v.ver, 1)) +
          note("Le plafond exact figure sur l'avis d'impôt (il tient compte des plafonds non utilisés et des versements de l'employeur). Les sommes déduites seront imposées à la sortie.");
      }),
    },
  ],

  pea: [
    {
      titre: "Simulateur : PEA ou compte-titres ?",
      intro: "Ce que coûtent les gains au moment du retrait, selon l'âge du PEA (règles 2026).",
      html: () => ctl.curseur("g", "Gains retirés", 0, 100000, 1000, 20000) + ctl.choix("age", "Âge du PEA", [["moins", "Moins de 5 ans"], ["plus", "5 ans ou plus"]], "plus") + ctl.resultat(),
      init: (z) => brancher(z, { g: euros }, (v, r) => {
        const pea = v.g * ((v.age === "plus" ? 0 : .128) + .186), cto = v.g * .314;
        r.className = "simu-resultat " + (v.age === "plus" ? "gain" : "neutre");
        r.innerHTML = barres([{ libelle: "PEA", valeur: pea, couleur: "var(--ok)" }, { libelle: "Compte-titres", valeur: cto, couleur: "var(--ko)" }], Math.max(cto, 1)) +
          `<p style="margin:10px 0 0">${v.age === "plus" ? `Après 5 ans, seuls les prélèvements sociaux (18,6 %) sont dus : <strong>${euros(cto - pea)} d'économie</strong> par rapport au compte-titres.` :
            "Avant 5 ans, le retrait coûte autant qu'un compte-titres (12,8 % + 18,6 %) et entraîne en principe la clôture du plan."}</p>` +
          note("Compte-titres : prélèvement forfaitaire unique de 31,4 % en 2026 (12,8 % + 18,6 %), sauf option pour le barème.");
      }),
    },
  ],

  scpi: [
    {
      titre: "Simulateur : ce qui reste des loyers de SCPI (micro-foncier)",
      intro: "Parts détenues en direct, immeubles en France, revenus fonciers bruts jusqu'à 15 000 € par an.",
      html: () => ctl.curseur("rev", "Revenus fonciers bruts par an", 0, 20000, 250, 6000) +
        ctl.choix("tmi", "Tranche marginale d'imposition", [[0, "0 %"], [.11, "11 %"], [.30, "30 %"], [.41, "41 %"], [.45, "45 %"]], .30) + ctl.resultat(),
      init: (z) => brancher(z, { rev: euros }, (v, r) => {
        if (v.rev > 15000) { r.className = "simu-resultat neutre"; r.innerHTML = "<strong>Au-delà de 15 000 €</strong>, le régime réel s'applique : l'impôt dépend des charges réellement déductibles. Pas d'estimation forfaitaire possible."; return; }
        const base = v.rev * .70, ir = base * v.tmi, ps = base * .172, net = v.rev - ir - ps;
        r.className = "simu-resultat neutre";
        r.innerHTML = barres([{ libelle: "Loyers bruts", valeur: v.rev, couleur: "var(--i3, var(--accent))" }, { libelle: "Impôt", valeur: ir, couleur: "var(--ko)" },
          { libelle: "Prélèv. sociaux", valeur: ps, couleur: "var(--accent)" }, { libelle: "Net en poche", valeur: net, couleur: "var(--ok)" }], Math.max(v.rev, 1)) +
          note("Micro-foncier : 30 % d'abattement forfaitaire, puis barème de l'impôt et 17,2 % de prélèvements sociaux sur les 70 % restants. Hors revenus financiers et immeubles à l'étranger.");
      }),
    },
    {
      titre: "Simulateur : l'effet des frais de souscription",
      intro: "Les frais d'entrée (souvent autour de 10 %, variables selon les SCPI) expliquent la durée de placement recommandée de 8 à 10 ans.",
      html: () => ctl.curseur("inv", "Somme investie", 5000, 500000, 5000, 50000) + ctl.curseur("frais", "Frais de souscription", 0, 15, .5, 10) + ctl.resultat(),
      init: (z) => brancher(z, { inv: euros, frais: (x) => String(x).replace(".", ",") + " %" }, (v, r) => {
        const f = v.inv * v.frais / 100;
        r.className = "simu-resultat neutre";
        r.innerHTML = camembert(1 - v.frais / 100, "var(--i3, var(--accent))", "var(--ko)", `Placé dans l'immobilier : ${euros(v.inv - f)}`, `Frais : ${euros(f)}`) +
          note("Les frais exacts figurent dans le document d'informations clés de chaque SCPI.");
      }),
    },
  ],

  "produits-structures": [
    {
      titre: "Simulateur : un autocall en action",
      intro: "Exemple fictif, pour comprendre le mécanisme : coupon de 6 % par année écoulée, constatation chaque année, remboursement anticipé si l'indice est au-dessus de son niveau de départ, durée maximale 8 ans, barrière de protection à −40 % à l'échéance.",
      html: () => ctl.curseur("an", "Année où l'on regarde l'indice", 1, 8, 1, 1) + ctl.curseur("perf", "Évolution de l'indice depuis le départ", -70, 40, 1, 5) + ctl.resultat(),
      init: (z) => brancher(z, { an: (x) => x, perf: (x) => (x > 0 ? "+" : "") + x + " %" }, (v, r) => {
        const { an, perf } = v; let cls, txt;
        if (perf >= 0) { cls = "gain"; txt = `<strong>Remboursement anticipé en année ${an}</strong> : le client récupère 100 % de son capital + ${6 * an} % de gains (${an} × 6 %). Le produit s'arrête.`; }
        else if (an < 8) { cls = "neutre"; txt = `<strong>Pas de remboursement cette année</strong> : l'indice est sous son niveau de départ. Pas de coupon, le produit continue jusqu'à la prochaine date (année ${an + 1}).`; }
        else if (perf >= -40) { cls = "neutre"; txt = `<strong>Échéance, barrière non franchie</strong> : l'indice a baissé de ${-perf} %, mais pas au-delà de −40 %. Le client récupère 100 % de son capital, sans gain.`; }
        else { cls = "perte"; txt = `<strong>Échéance, barrière franchie</strong> : l'indice a baissé de ${-perf} %. La protection disparaît : le client récupère ${100 + perf} % de son capital, soit une perte de ${-perf} %.`; }
        r.className = "simu-resultat " + cls; r.innerHTML = txt + note("Hors frais, fiscalité et risque de défaut de la banque émettrice.");
      }),
    },
  ],

  "regimes-matrimoniaux": [
    {
      titre: "Interactif : qui possède quoi ?",
      intro: "Paul et Julie. Choisissez leur régime et voyez à qui appartient chaque bien.",
      html: () => ctl.choix("reg", "Régime", [["legal", "Communauté légale"], ["separation", "Séparation de biens"], ["participation", "Participation aux acquêts"], ["universelle", "Communauté universelle"], ["pacs", "PACS (par défaut)"]], "legal") + ctl.resultat(),
      init: (z) => brancher(z, {}, (v, r) => {
        const P = ["p", "Paul"], J = ["j", "Julie"], C = ["c", "Commun (moitié chacun)"], I = ["i", "Indivision si achat à deux"];
        const T = {
          legal: [P, J, C, C], separation: [P, J, I, J], participation: [P, J, I, J],
          universelle: [C, ["c", "Commun (sauf clause contraire de la donation ou du testament)"], C, C], pacs: [P, J, I, J],
        }[v.reg];
        const biens = ["Appartement acheté par Paul avant l'union", "Héritage reçu par Julie pendant l'union", "Résidence achetée pendant l'union avec les salaires", "Épargne constituée sur les salaires de Julie"];
        const NOTES = {
          legal: "Régime légal : ce qui est acquis pendant le mariage (salaires compris) est commun ; ce qui existait avant, et ce qui est reçu par donation ou succession, reste propre.",
          separation: "Chacun reste propriétaire de ce qu'il achète ; un bien acheté à deux est en indivision, selon la part de chacun.",
          participation: "Pendant le mariage, cela fonctionne comme une séparation de biens. À la dissolution, l'enrichissement de chacun est partagé.",
          universelle: "Tout est commun, même ce qui existait avant le mariage. Avec une clause d'attribution intégrale, tout peut revenir au survivant.",
          pacs: "Par défaut, séparation des patrimoines. Attention : le partenaire n'est pas héritier, il faut un testament.",
        };
        r.className = "simu-resultat neutre";
        r.innerHTML = `<div class="qui-quoi">${biens.map((b, i) => `<div class="qq-ligne"><span>${b}</span><span class="qq-tag qq-${T[i][0]}">${T[i][1]}</span></div>`).join("")}</div>` + note(NOTES[v.reg]);
      }),
    },
  ],

  demembrement: [
    {
      titre: "Calculateur : que vaut l'usufruit ?",
      intro: "Barème fiscal de l'article 669 du CGI (usufruit viager).",
      html: () => ctl.curseur("age", "Âge de l'usufruitier", 18, 95, 1, 65) + ctl.curseur("val", "Valeur du bien en pleine propriété", 50000, 2000000, 10000, 400000) + ctl.resultat(),
      init: (z) => brancher(z, { age: (x) => x + " ans", val: euros }, (v, r) => {
        const us = v.age < 21 ? 90 : v.age >= 91 ? 10 : 90 - 10 * Math.floor((v.age - 11) / 10);
        r.className = "simu-resultat neutre";
        r.innerHTML = `<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin-bottom:10px"><span style="display:block;width:${us}%;background:var(--i3)"></span><span style="display:block;width:${100 - us}%;background:var(--i1)"></span></div>
          <strong>Usufruit : ${us} % = ${euros(v.val * us / 100)}</strong> · <strong>Nue-propriété : ${100 - us} % = ${euros(v.val * (100 - us) / 100)}</strong>` +
          note(`Donner la nue-propriété à cet âge : les droits portent sur ${euros(v.val * (100 - us) / 100)} au lieu de ${euros(v.val)}.`);
      }),
    },
    {
      titre: "Graphique : la valeur de l'usufruit baisse avec l'âge",
      intro: "Part de l'usufruit dans la valeur du bien, selon l'âge de l'usufruitier (article 669 du CGI).",
      html: () => colonnes([["< 21", 90], ["21-30", 80], ["31-40", 70], ["41-50", 60], ["51-60", 50], ["61-70", 40], ["71-80", 30], ["81-90", 20], ["91 +", 10]].map(([l, x]) => ({ libelle: l, valeur: x }))) +
        note("Plus l'usufruitier est âgé, plus la nue-propriété vaut cher : donner tôt la nue-propriété réduit la base taxable."),
      init: () => {},
    },
  ],

  donations: [
    {
      titre: "Simulateur : combien coûte une donation d'un parent à un enfant ?",
      intro: "Donation en pleine propriété, d'un parent à un enfant.",
      html: () => ctl.curseur("don", "Montant donné", 0, 1500000, 5000, 200000) + ctl.curseur("deja", "Abattement déjà utilisé dans les 15 dernières années", 0, 100000, 5000, 0) +
        ctl.choix("argent", "Don familial de sommes d'argent (+ 31 865 €)", [["non", "Non"], ["oui", "Oui"]], "non") + ctl.resultat(),
      init: (z) => brancher(z, { don: euros, deja: euros }, (v, r) => {
        const abt = (100000 - v.deja) + (v.argent === "oui" ? 31865 : 0);
        const base = Math.max(0, v.don - abt), droits = baremeProgressif(base, BAREME_LIGNE_DIRECTE);
        r.className = "simu-resultat " + (droits === 0 ? "gain" : "neutre");
        r.innerHTML = `Abattements : <strong>${euros(Math.min(abt, v.don))}</strong> · part taxable : <strong>${euros(base)}</strong><br><strong>Droits estimés : ${euros(droits)}</strong>${v.don ? ` (${pct(droits / v.don)} du montant donné)` : ""}` +
          barres([{ libelle: "Reçu net", valeur: v.don - droits, couleur: "var(--ok)" }, { libelle: "Droits", valeur: droits, couleur: "var(--ko)" }], Math.max(v.don, 1)) +
          note("Don familial de sommes d'argent : donateur de moins de 80 ans, bénéficiaire majeur. Estimation hors rappel fiscal des donations antérieures sur les tranches du barème.");
      }),
    },
    {
      titre: "Graphique : le barème en ligne directe",
      intro: "Taux appliqué à chaque tranche de la part taxable (après abattement).",
      html: () => colonnes([["≤ 8 072 €", 5], ["→ 12 109 €", 10], ["→ 15 932 €", 15], ["→ 552 324 €", 20], ["→ 902 838 €", 30], ["→ 1,8 M€", 40], ["au-delà", 45]].map(([l, x]) => ({ libelle: l, valeur: x }))) +
        note("La grande majorité des transmissions se situe dans la tranche à 20 %, qui va de 15 932 € à 552 324 €."),
      init: () => {},
    },
  ],

  succession: [
    {
      titre: "Simulateur : les droits de succession des enfants",
      intro: "Patrimoine transmis aux seuls enfants, à parts égales (sans conjoint survivant), sans donation dans les 15 dernières années.",
      html: () => ctl.curseur("pat", "Patrimoine net transmis", 0, 5000000, 25000, 800000) + ctl.choix("n", "Nombre d'enfants", [[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"]], 2) + ctl.resultat(),
      init: (z) => brancher(z, { pat: euros }, (v, r) => {
        const part = v.pat / v.n, droits = baremeProgressif(Math.max(0, part - 100000), BAREME_LIGNE_DIRECTE);
        const reserve = v.n === 1 ? .5 : v.n === 2 ? 2 / 3 : .75;
        r.className = "simu-resultat neutre";
        r.innerHTML = `Part de chaque enfant : <strong>${euros(part)}</strong> · droits par enfant : <strong>${euros(droits)}</strong><br>
          <strong>Total des droits : ${euros(droits * v.n)}</strong>${v.pat ? ` (${pct(droits * v.n / v.pat)} du patrimoine)` : ""}` +
          `<h4 style="margin:16px 0 6px;font-size:.95rem">Réserve héréditaire avec ${v.n} enfant${v.n > 1 ? "s" : ""}</h4>` +
          camembert(reserve, "var(--i3, var(--accent))", "var(--i1, #c7d2fe)", `Réserve des enfants : ${v.n === 1 ? "1/2" : v.n === 2 ? "2/3" : "3/4"}`, `Quotité disponible : ${v.n === 1 ? "1/2" : v.n === 2 ? "1/3" : "1/4"}`) +
          note("100 000 € d'abattement par enfant, puis barème de 5 % à 45 %. Le conjoint et le partenaire de PACS sont exonérés.");
      }),
    },
  ],

  ifi: [
    {
      titre: "Calculateur : combien d'IFI ?",
      intro: "Barème et décote publiés au BOFiP.",
      html: () => ctl.curseur("rp", "Résidence principale", 0, 5000000, 25000, 1000000) + ctl.curseur("au", "Autres biens immobiliers (locatif, SCPI…)", 0, 8000000, 25000, 600000) +
        ctl.curseur("de", "Dettes déductibles", 0, 3000000, 25000, 100000) + ctl.resultat(),
      init: (z) => brancher(z, { rp: euros, au: euros, de: euros }, (v, r) => {
        const net = Math.max(0, v.rp * .7 + v.au - v.de);
        let ifi = 0;
        if (net >= 1300000) {
          ifi = baremeProgressif(net, [[800000, 0], [1300000, .005], [2570000, .007], [5000000, .01], [10000000, .0125], [Infinity, .015]]);
          if (net < 1400000) ifi -= 17500 - 0.0125 * net;
        }
        r.className = "simu-resultat " + (ifi > 0 ? "perte" : "gain");
        r.innerHTML = `Patrimoine net taxable : <strong>${euros(net)}</strong> (résidence principale après 30 % d'abattement).<br>
          ${ifi > 0 ? `<strong>IFI estimé : ${euros(ifi)}</strong>${net < 1400000 ? " (après décote)" : ""}` : "<strong>Pas d'IFI</strong> : sous le seuil de 1,3 M€."}` +
          note("Estimation pédagogique : hors plafonnement, biens professionnels et conditions de déduction des dettes.");
      }),
    },
    {
      titre: "Graphique : le barème de l'IFI",
      intro: "Taux par tranche de patrimoine net taxable (l'IFI n'est dû qu'à partir de 1,3 M€).",
      html: () => colonnes([["≤ 800 k€", 0], ["→ 1,3 M€", .5], ["→ 2,57 M€", .7], ["→ 5 M€", 1], ["→ 10 M€", 1.25], ["au-delà", 1.5]].map(([l, x]) => ({ libelle: l, valeur: x }))) +
        note("Une fois le seuil de 1,3 M€ atteint, le calcul commence dès 800 000 € (tranche à 0,5 %) ; la décote adoucit l'entrée entre 1,3 et 1,4 M€."),
      init: () => {},
    },
  ],

  "girardin-industriel": [
    {
      titre: "Simulateur : dimensionner un Girardin industriel",
      intro: "La réduction ne doit pas dépasser l'impôt dû, et ne compte dans le plafond de 18 000 € que pour une fraction de son montant (BOFiP).",
      html: () => ctl.curseur("imp", "Impôt sur le revenu dû", 0, 80000, 500, 12000) + ctl.curseur("autres", "Autres niches déjà utilisées (emploi à domicile, PME…)", 0, 10000, 250, 0) +
        ctl.choix("reg", "Type d'opération", [[.44, "De plein droit (44 %)"], [.34, "Avec agrément (34 %)"]], .44) +
        ctl.curseur("taux", "Réduction proposée par le monteur, en % de l'apport", 105, 125, 1, 112) + ctl.resultat(),
      init: (z) => brancher(z, { imp: euros, autres: euros, taux: (x) => x + " %" }, (v, r) => {
        const place = Math.max(0, 18000 - v.autres), maxPlafond = place / v.reg;
        const red = Math.min(v.imp, maxPlafond), apport = red / (v.taux / 100), gain = red - apport;
        r.className = "simu-resultat " + (gain > 0 ? "gain" : "neutre");
        r.innerHTML = `Réduction maximale permise par le plafond : <strong>${euros(maxPlafond)}</strong> (${euros(place)} ÷ ${pct(v.reg)})<br>
          Réduction visée : <strong>${euros(red)}</strong> · apport : <strong>${euros(apport)}</strong> (non récupéré)` +
          barres([{ libelle: "Apport", valeur: apport, couleur: "var(--ko)" }, { libelle: "Réduction", valeur: red, couleur: "var(--i3, var(--accent))" }, { libelle: "Gain net", valeur: gain, couleur: "var(--ok)" }], Math.max(red, 1)) +
          note("Fraction retenue dans le plafond : 44 % ou 34 % selon l'opération (BOFiP, BOI-IR-LIQ-20-20-10-30). Le taux de réduction dépend de chaque montage : le monteur doit confirmer le calcul. Risque de reprise si l'exploitation sur 5 ans n'est pas respectée.");
      }),
    },
  ],

  "apport-cession": [
    {
      titre: "Simulateur : faut-il réinvestir ?",
      intro: "La holding revend les titres apportés. Règles issues de la loi de finances 2026 (BOFiP).",
      html: () => ctl.curseur("prix", "Prix de cession par la holding", 100000, 20000000, 100000, 2000000) + ctl.curseur("ans", "Délai entre l'apport et la cession", 0, 6, .5, 1.5) + ctl.resultat(),
      init: (z) => brancher(z, { prix: euros, ans: (x) => String(x).replace(".", ",") + " an" + (x > 1 ? "s" : "") }, (v, r) => {
        if (v.ans >= 3) { r.className = "simu-resultat gain"; r.innerHTML = "<strong>Pas d'obligation de réinvestir</strong> : la cession a lieu plus de 3 ans après l'apport, le report d'imposition est maintenu."; return; }
        const min = v.prix * .70;
        r.className = "simu-resultat neutre";
        r.innerHTML = `<strong>Cession dans les 3 ans</strong> : pour garder le report d'imposition, la holding doit réinvestir au moins <strong>${euros(min)}</strong> (70 %) dans des activités éligibles, dans les 3 ans de la cession.` +
          camembert(.7, "var(--i3, var(--accent))", "var(--i1, #c7d2fe)", `À réinvestir : ${euros(min)}`, `Libre : ${euros(v.prix - min)}`) +
          note("Avant la loi de finances 2026 : 60 % en 2 ans. Les réinvestissements directs doivent être conservés 5 ans. Montage à valider avec un avocat fiscaliste.");
      }),
    },
  ],

  "pacte-dutreil": [
    {
      titre: "Simulateur : l'effet du pacte Dutreil sur une donation",
      intro: "Un parent donne en pleine propriété des titres de son entreprise à ses enfants, à parts égales, sans donation dans les 15 dernières années.",
      html: () => ctl.curseur("val", "Valeur des titres donnés", 100000, 20000000, 100000, 3000000) + ctl.choix("n", "Nombre d'enfants", [[1, "1"], [2, "2"], [3, "3"], [4, "4"]], 2) +
        ctl.choix("age", "Âge du donateur", [["moins", "Moins de 70 ans"], ["plus", "70 ans ou plus"]], "moins") + ctl.resultat(),
      init: (z) => brancher(z, { val: euros }, (v, r) => {
        const part = v.val / v.n;
        const sans = baremeProgressif(Math.max(0, part - 100000), BAREME_LIGNE_DIRECTE) * v.n;
        let avec = baremeProgressif(Math.max(0, part * .25 - 100000), BAREME_LIGNE_DIRECTE) * v.n;
        if (v.age === "moins") avec *= .5;
        r.className = "simu-resultat gain";
        r.innerHTML = barres([{ libelle: "Sans pacte", valeur: sans, couleur: "var(--ko)" }, { libelle: "Avec pacte", valeur: avec, couleur: "var(--ok)" }], Math.max(sans, 1)) +
          `<p style="margin:10px 0 0">Économie de droits : <strong>${euros(sans - avec)}</strong>.</p>` +
          note("Pacte : 75 % de la valeur exonérée, puis abattement de 100 000 € par enfant et barème ; réduction de 50 % des droits si le donateur a moins de 70 ans. Engagements de conservation (2 ans collectif, 6 ans individuel) ; biens somptuaires exclus depuis 2026.");
      }),
    },
  ],
};
