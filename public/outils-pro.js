// version 1.0 — simulateurs « poussés » de la Boîte à outils (lot 1 : fiscalité et immobilier).
// Règle de la maison : chaque chiffre vient d'une source officielle citée dans « Sur quoi se base ce calcul ».
// Une règle qui n'a pas pu être vérifiée n'entre pas dans le calcul : elle est signalée dans les limites.
// Dépend de outils-fiches.js (ctl, brancher, barres, euros, pct, baremeProgressif, BAREME_IR_2026).

// ---------------------------------------------------------------- Sources (vérifiées le 23 novembre 2026)
const SRC = {
  bareme: ["Service-public · Barème de l'impôt sur le revenu (vérifié le 12/11/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419"],
  aideMemoire: ["impots.gouv.fr · Brochure IR 2026, aide-mémoire (revenus 2025)", "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/aide_memoire.pdf"],
  cehr: ["Service-public · Contribution exceptionnelle sur les hauts revenus (vérifié le 15/04/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F31130"],
  cdhr: ["Service-public · Contribution différentielle sur les hauts revenus (2026)", "https://www.service-public.gouv.fr/particuliers/actualites/A18878"],
  notaire: ["impots.gouv.fr · Frais payés chez le notaire (modifié le 17/07/2026)", "https://www.impots.gouv.fr/particulier/questions/jachete-un-bien-immobilier-quaurai-je-payer-comme-frais-au-notaire"],
  dmtoBofip: ["BOFiP · BOI-ENR-DMTOI-10-20 (publié le 17/06/2026)", "https://bofip.impots.gouv.fr/doctrine/BOI-ENR-DMTOI-10-20"],
  dmtoTable: ["DGFiP · Taux des droits d'enregistrement par département (juin 2026)", "https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/dmto/dmto_2026-06.pdf"],
  tarifNotaire: ["Service-public · Nouveaux tarifs des professions du droit au 1er mars 2026", "https://www.service-public.gouv.fr/particuliers/actualites/A18834"],
  hcsf: ["economie.gouv.fr · Mesure du HCSF sur les crédits immobiliers", "https://www.economie.gouv.fr/hcsf/mesures/mesure-relative-loctroi-de-credits-immobiliers"],
  hcsfAN: ["Assemblée nationale · Réponse ministérielle sur la décision D-HCSF-2021-7 (JO du 09/01/2024)", "https://www.assemblee-nationale.fr/dyn/16/questions/QANR5L16QE13695.pdf"],
  hcsfAcpr: ["ACPR (Banque de France) · Le financement de l'habitat en 2025 (juillet 2026)", "https://acpr.banque-france.fr/system/files/2026-07/202607_AS183_Financement_habitat_2025.pdf"],
  ifi: ["impots.gouv.fr · Calcul de l'IFI (modifié le 08/04/2026)", "https://www.impots.gouv.fr/particulier/calcul-de-lifi"],
  placements: ["Service-public · Revenus d'épargne et de placement (vérifié le 15/04/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F34913/1_6?idFicheParent=F2613"],
  girardin: ["BOFiP · BOI-IR-LIQ-20-20-10-30 (plafonnement global, fractions retenues)", "https://bofip.impots.gouv.fr/export/pdf/15534"],
  plafonnement: ["impots.gouv.fr · Brochure IR, plafonnement des avantages fiscaux", "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2025/pdf_som/plafonnement.pdf"],
  fonciers: ["impots.gouv.fr · Brochure IR 2026, revenus fonciers", "https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/10-rev_fonciers_157a160.pdf"],
  locNue: ["Service-public · Revenus locatifs, location non meublée (vérifié le 15/04/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1991"],
  pvNotice: ["impots.gouv.fr · Notice 2048-IMM-NOT-SD (05-2026), cessions à compter du 21/02/2026", "https://www.impots.gouv.fr/sites/default/files/formulaires/2048-imm/2026/2048-imm_5458.pdf"],
  pvPage: ["impots.gouv.fr · Vais-je payer de la plus-value immobilière ? (modifié le 07/07/2026)", "https://www.impots.gouv.fr/particulier/questions/je-vends-mon-bien-immobilier-vais-je-payer-de-la-plus-value-immobiliere"],
  parts: ["BOFiP · BOI-ENR-DMTOM-40-10-20 (cessions de parts, publié le 24/04/2024)", "https://bofip.impots.gouv.fr/bofip/3262-PGP.html"],
};
const VERIFIE_PRO = "23 novembre 2026";

// ---------------------------------------------------------------- Petites briques
const fr2 = (n, d = 2) => Number(n).toLocaleString("fr-FR", { maximumFractionDigits: d });
const pc2 = (n) => fr2(n * 100, 3) + " %";
const groupe = (titre, contenu) => `<fieldset class="op-groupe"><legend>${titre}</legend>${contenu}</fieldset>`;
const phrase = (t) => `<p class="op-phrase">${t}</p>`;
// Détail du calcul : lignes [libellé, valeur, classe ("total", "sous", "moins")]
const detail = (lignes, titre = "Le détail du calcul") => `<details class="op-detail" open><summary>🔎 ${titre}</summary><table>${lignes.filter(Boolean).map(([l, v, c]) =>
  `<tr class="${c || ""}"><td>${l}</td><td>${v}</td></tr>`).join("")}</table></details>`;
const alerte = (t) => `<p class="op-alerte">⚠️ ${t}</p>`;
const tmiChoix = (defaut = .30) => ctl.choix("tmi", "Tranche marginale d'imposition", [[0, "0 %"], [.11, "11 %"], [.30, "30 %"], [.41, "41 %"], [.45, "45 %"]], defaut);

// ---------------------------------------------------------------- Moteur : impôt sur le revenu 2026 (revenus 2025)
const IR26 = {
  bareme: BAREME_IR_2026,                       // Service-public F1419
  demiPart: 1807, isole: 4262,                  // plafonnement du quotient familial (aide-mémoire)
  decote: { seul: 897, couple: 1483, taux: .4525 },
  recouvrement: 61,
  sal: { min: 509, max: 14555 }, pen: { min: 454, max: 4439 },
};
// Parts : 1 ou 2, + 0,5 pour chacun des 2 premiers enfants, + 1 à partir du 3e, + 0,5 parent isolé (case T).
function partsFoyer(couple, enfants, isole) {
  const base = couple ? 2 : 1, enf = enfants <= 2 ? enfants * .5 : 1 + (enfants - 2), t = !couple && isole && enfants > 0 ? .5 : 0;
  return { base, parts: base + enf + t, demi: (enf + t) * 2, isole: t > 0 };
}
function impotRevenu(rni, couple, enfants, isole) {
  const P = partsFoyer(couple, enfants, isole), b = IR26.bareme;
  const brutQF = baremeProgressif(rni / P.parts, b) * P.parts, brutBase = baremeProgressif(rni / P.base, b) * P.base;
  const avantageMax = P.isole ? IR26.isole + Math.max(0, P.demi - 2) * IR26.demiPart : P.demi * IR26.demiPart;
  const plafonne = brutBase - avantageMax > brutQF;
  const brut = Math.max(brutQF, brutBase - avantageMax);
  const forfait = couple ? IR26.decote.couple : IR26.decote.seul;
  const decote = Math.min(brut, Math.max(0, forfait - IR26.decote.taux * brut));
  let net = brut - decote;
  const nonRecouvre = net > 0 && net < IR26.recouvrement;
  const quotient = rni / (plafonne ? P.base : P.parts);
  const tmi = b.find(([h]) => quotient <= h)[1];
  // Revenu imposé dans chaque tranche (pour le graphique), à partir du quotient retenu
  const partsRetenues = plafonne ? P.base : P.parts;
  let bas = 0; const tranches = b.map(([h, t]) => { const x = Math.max(0, Math.min(quotient, h) - bas) * partsRetenues; bas = h; return { t, x }; });
  return { ...P, brutQF, brutBase, avantageMax, plafonne, brut, decote, net: nonRecouvre ? 0 : net, calcule: net, nonRecouvre, tmi, quotient, tranches };
}
const abattSalaire = (s) => s > 0 ? Math.min(s, Math.min(IR26.sal.max, Math.max(IR26.sal.min, s * .1))) : 0;
// Pensions : 10 % avec un minimum par pensionné, puis un plafond pour l'ensemble du foyer
const abattPensions = (liste) => Math.min(IR26.pen.max, liste.reduce((a, p) => a + (p > 0 ? Math.min(p, Math.max(IR26.pen.min, p * .1)) : 0), 0));
function cehr(rfr, couple) {
  const t = couple ? [[500000, 0], [1000000, .03], [Infinity, .04]] : [[250000, 0], [500000, .03], [Infinity, .04]];
  return baremeProgressif(rfr, t);
}

// ---------------------------------------------------------------- Les outils
const OUTILS_PRO = {
  // ============================================================ Impôt sur le revenu
  ir: {
    intro: "Impôt d'un foyer sur ses revenus de 2025 (payé en 2026), avec l'abattement de 10 % sur les salaires et les pensions, le quotient familial et son plafonnement, la décote et la contribution sur les hauts revenus.",
    html: () => groupe("Le foyer",
        ctl.choix("couple", "Situation", [[0, "Personne seule"], [1, "Couple marié ou pacsé"]], 1) +
        ctl.choix("enf", "Enfants à charge (résidence exclusive)", [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"]], 2) +
        ctl.choix("isole", "Parent qui vit seul avec ses enfants (case T)", [[0, "Non"], [1, "Oui"]], 0)) +
      groupe("Les revenus de 2025",
        ctl.curseur("s1", "Salaires du déclarant 1 (net imposable, avant abattement)", 0, 400000, 500, 42000) +
        ctl.curseur("s2", "Salaires du déclarant 2 (couple)", 0, 400000, 500, 30000) +
        ctl.curseur("p1", "Pensions de retraite du déclarant 1", 0, 150000, 500, 0) +
        ctl.curseur("p2", "Pensions de retraite du déclarant 2 (couple)", 0, 150000, 500, 0) +
        ctl.curseur("autres", "Autres revenus nets imposables (fonciers, BIC, BNC…)", 0, 1000000, 500, 0) +
        ctl.curseur("charges", "Charges déductibles (versements PER, pension alimentaire…)", 0, 100000, 100, 0)) + ctl.resultat(),
    init: (z) => brancher(z, { s1: euros, s2: euros, p1: euros, p2: euros, autres: euros, charges: euros }, (v, r) => {
      const couple = v.couple === 1, s2 = couple ? v.s2 : 0, p2 = couple ? v.p2 : 0;
      const ab1 = abattSalaire(v.s1), ab2 = abattSalaire(s2), abP = abattPensions([v.p1, p2]);
      const rni = Math.max(0, v.s1 - ab1 + s2 - ab2 + v.p1 + p2 - abP + v.autres - v.charges);
      const R = impotRevenu(rni, couple, v.enf, v.isole === 1);
      const plus = impotRevenu(rni + 1000, couple, v.enf, v.isole === 1).net - R.net;
      const c = cehr(rni, couple), total = R.net + c;
      const seuilCdhr = couple ? 500000 : 250000;
      r.className = "simu-resultat neutre";
      r.innerHTML = phrase(`Ce foyer paiera environ <strong>${euros(total)}</strong> d'impôt sur ses revenus de 2025${c ? ", contribution sur les hauts revenus comprise" : ""}.`) +
        `<div class="op-chiffres"><span><b>${pct(rni ? total / rni : 0)}</b>taux moyen</span><span><b>${Math.round(R.tmi * 100)} %</b>tranche marginale</span><span><b>${fr2(R.parts)}</b>part${R.parts > 1 ? "s" : ""}</span><span><b>${euros(plus)}</b>d'impôt en plus pour 1 000 € de revenu en plus</span></div>` +
        barres(R.tranches.filter((x) => x.x > 0).map((x) => ({ libelle: `Tranche ${Math.round(x.t * 100)} %`, valeur: x.x, texte: `${euros(x.x)} → ${euros(x.x * x.t)} d'impôt`, couleur: x.t === 0 ? "var(--ok)" : x.t <= .11 ? "var(--i3, var(--accent))" : "var(--ko)" }))) +
        (R.plafonne ? alerte(`Le plafonnement du quotient familial s'applique : l'avantage des enfants est limité à ${euros(R.avantageMax)}. Le barème est donc calculé sur ${fr2(R.base)} part${R.base > 1 ? "s" : ""}.`) : "") +
        (rni > seuilCdhr ? alerte(`Revenu supérieur à ${euros(seuilCdhr)} : la contribution différentielle sur les hauts revenus (imposition minimale de 20 %) peut s'ajouter. Elle n'est pas calculée ici.`) : "") +
        detail([
          ["Salaires déclarant 1 − abattement de 10 %", `${euros(v.s1)} − ${euros(ab1)}`],
          couple ? ["Salaires déclarant 2 − abattement de 10 %", `${euros(s2)} − ${euros(ab2)}`] : null,
          (v.p1 || p2) ? ["Pensions − abattement de 10 % (plafonné à 4 439 € pour le foyer)", `${euros(v.p1 + p2)} − ${euros(abP)}`] : null,
          v.autres ? ["+ Autres revenus nets", euros(v.autres)] : null,
          v.charges ? ["− Charges déductibles", euros(v.charges)] : null,
          ["= Revenu net imposable", euros(rni), "total"],
          ["Nombre de parts", fr2(R.parts)],
          ["Quotient familial (revenu ÷ parts)", euros(rni / R.parts)],
          ["Impôt avec toutes les parts", euros(R.brutQF), "sous"],
          ["Impôt sans les parts des enfants, moins l'avantage maximal", `${euros(R.brutBase)} − ${euros(R.avantageMax)}`, "sous"],
          ["Impôt brut retenu (le plus élevé des deux)", euros(R.brut)],
          R.decote ? [`− Décote (${euros(couple ? IR26.decote.couple : IR26.decote.seul)} − 45,25 % de l'impôt brut)`, euros(R.decote), "moins"] : null,
          R.nonRecouvre ? ["Impôt inférieur à 61 € : non recouvré", euros(R.calcule)] : null,
          c ? ["+ Contribution exceptionnelle sur les hauts revenus", euros(c)] : null,
          ["= Impôt estimé", euros(total), "total"],
        ]);
    }),
    bases: [
      ["Barème 2026 sur les revenus 2025 : 0 % jusqu'à 11 600 €, 11 % jusqu'à 29 579 €, 30 % jusqu'à 84 577 €, 41 % jusqu'à 181 917 €, 45 % au-delà (par part).", SRC.bareme],
      ["Parts : 1 (personne seule) ou 2 (couple), + 0,5 par enfant pour les deux premiers, + 1 à partir du troisième ; + 0,5 pour un parent isolé (case T).", SRC.bareme],
      ["Plafonnement du quotient familial : 1 807 € par demi-part ; 4 262 € pour les deux premières demi-parts d'un parent isolé.", SRC.aideMemoire],
      ["Décote : 897 € (personne seule) ou 1 483 € (couple) moins 45,25 % de l'impôt brut ; impôt non recouvré sous 61 €.", SRC.aideMemoire],
      ["Abattement de 10 % : salaires entre 509 € et 14 555 € par personne ; pensions au moins 454 € par pensionné et au plus 4 439 € par foyer.", SRC.aideMemoire],
      ["Contribution exceptionnelle sur les hauts revenus : 3 % puis 4 % au-delà de 250 000 € (personne seule) ou 500 000 € (couple).", SRC.cehr],
      ["Contribution différentielle (CDHR) : signalée au-delà de 250 000 € / 500 000 €, non calculée.", SRC.cdhr],
    ],
    hypotheses: ["Le revenu fiscal de référence est assimilé au revenu net imposable pour la contribution sur les hauts revenus.", "Les salaires saisis sont les montants nets imposables, sans option pour les frais réels."],
    limites: ["Réductions et crédits d'impôt (emploi à domicile, dons, garde d'enfants…).", "Revenus soumis au prélèvement forfaitaire (dividendes, intérêts) : voir l'outil « Dividendes : PFU ou barème ? ».", "Demi-parts particulières (invalidité, anciens combattants, personne seule ayant élevé un enfant), résidence alternée, enfants majeurs rattachés.", "Système du quotient pour les revenus exceptionnels et la contribution différentielle sur les hauts revenus."],
  },

  // ============================================================ Frais de notaire
  "frais-notaire": {
    intro: "Ce que paie l'acheteur en plus du prix : les droits de mutation (la plus grosse part, reversée au département, à la commune et à l'État), la contribution de sécurité immobilière et la rémunération du notaire.",
    html: () => groupe("Le bien",
        ctl.curseur("px", "Prix du bien (hors frais d'agence à la charge de l'acheteur)", 20000, 3000000, 5000, 300000) +
        ctl.choix("ty", "Type de bien", [["ancien", "Ancien"], ["neuf", "Neuf ou sur plan (VEFA)"]], "ancien")) +
      groupe("Le département et l'acheteur",
        ctl.choix("dep", "Taux voté par le département (voir le tableau officiel)", [[5, "5,00 %"], [4.5, "4,50 %"], [3.8, "3,80 %"]], 5) +
        ctl.choix("pa", "Première propriété, achetée pour y habiter (ancien)", [[0, "Non"], [1, "Oui"]], 0)) + ctl.resultat(),
    init: (z) => brancher(z, { px: euros }, (v, r) => {
      const neuf = v.ty === "neuf";
      const tauxDep = neuf ? .70 : (v.pa === 1 ? Math.min(v.dep, 4.5) : v.dep);
      const dep = v.px * tauxDep / 100, assiette = dep * (neuf ? .0214 : .0237), com = neuf ? 0 : v.px * .012;
      const droits = dep + assiette + com, csi = Math.max(15, v.px * .001);
      const emolHT = baremeProgressif(v.px, [[6500, .0387], [17000, .01596], [60000, .01064], [Infinity, .00799]]), emol = emolHT * 1.2;
      const sur = droits + csi, total = sur + emol;
      r.className = "simu-resultat neutre";
      r.innerHTML = phrase(`Comptez environ <strong>${euros(total)}</strong> de frais pour un achat à ${euros(v.px)}, soit <strong>${pct(total / v.px)}</strong> du prix. Les taxes en représentent <strong>${euros(sur)}</strong>.`) +
        barres([{ libelle: "Droits de mutation", valeur: droits, couleur: "var(--ko)" }, { libelle: "Sécurité immobilière", valeur: csi, couleur: "var(--i3, var(--accent))" }, { libelle: "Notaire (estimation)", valeur: emol, couleur: "var(--accent)" }], Math.max(droits, emol, 1)) +
        (v.pa === 1 && !neuf && v.dep > 4.5 ? alerte("Première propriété achetée pour y habiter : la hausse à 5 % ne s'applique pas, le taux départemental reste à 4,50 %.") : "") +
        detail([
          [`Taxe départementale : ${euros(v.px)} × ${fr2(tauxDep)} %`, euros(dep)],
          [`Frais d'assiette et de recouvrement : ${neuf ? "2,14" : "2,37"} % de la taxe départementale`, euros(assiette)],
          neuf ? null : ["Taxe communale : 1,20 % du prix", euros(com)],
          ["= Droits de mutation", `${euros(droits)} (${pc2(droits / v.px)})`, "total"],
          ["Contribution de sécurité immobilière : 0,1 % (au moins 15 €)", euros(csi)],
          ["= Taxes (montants certains)", euros(sur), "total"],
          ["Émoluments du notaire, estimation : 3,870 % jusqu'à 6 500 €, 1,596 % jusqu'à 17 000 €, 1,064 % jusqu'à 60 000 €, 0,799 % au-delà, + TVA 20 %", `${euros(emolHT)} HT → ${euros(emol)} TTC`, "sous"],
          ["= Total estimé, hors débours et formalités", euros(total), "total"],
        ]);
    }),
    bases: [
      ["Ancien : part départementale (taux voté entre 1,20 % et 5 % du 1er avril 2025 au 31 mars 2028), taxe communale de 1,20 %, frais d'assiette de 2,37 % de la part départementale ; taux global maximal 6,32 %.", SRC.notaire],
      ["Neuf ou VEFA : taux départemental réduit de 0,70 % et frais d'assiette de 2,14 %, soit 0,71 % ; contribution de sécurité immobilière de 0,1 % (minimum 15 €).", SRC.notaire],
      ["La hausse au-delà de 4,50 % ne s'applique pas à la première propriété de l'acheteur destinée à sa résidence principale.", SRC.dmtoBofip],
      ["Le taux de chaque département : tableau officiel de la DGFiP (la plupart sont à 5,00 %, quelques-uns à 4,50 % ou 3,80 %).", SRC.dmtoTable],
      ["Émoluments du notaire : barème proportionnel réglementé (code de commerce). Les tarifs ont été refixés par arrêté pour la période du 1er mars 2026 au 29 février 2028 : à confirmer auprès du notaire.", SRC.tarifNotaire],
    ],
    hypotheses: ["Le prix saisi est la base des droits (prix figurant dans l'acte).", "Les émoluments sont calculés avec le barème connu avant mars 2026 : c'est une estimation, signalée comme telle dans le détail."],
    limites: ["Débours et frais de formalités (cadastre, documents d'urbanisme…), variables selon le dossier.", "Frais de garantie du prêt (hypothèque, privilège de prêteur de deniers ou caution).", "Remise éventuelle sur les émoluments et cas particuliers (biens professionnels, terrains, Mayotte, communes à taux particulier)."],
  },

  // ============================================================ Capacité d'emprunt
  "capacite-emprunt": {
    intro: "Ce qu'un foyer peut emprunter sans dépasser la limite du Haut Conseil de stabilité financière : 35 % des revenus consacrés au crédit, sur 25 ans au plus.",
    html: () => groupe("Le foyer",
        ctl.curseur("rv", "Revenus nets mensuels du foyer (avant impôt)", 1000, 40000, 100, 5000) +
        ctl.curseur("ch", "Crédits déjà en cours (mensualités)", 0, 10000, 50, 0) +
        ctl.curseur("ap", "Apport personnel", 0, 1000000, 1000, 30000)) +
      groupe("Le crédit",
        ctl.curseur("tx", "Taux nominal du crédit (%/an)", 0.5, 7, 0.05, 3.3) +
        ctl.curseur("as", "Assurance emprunteur (% du capital par an)", 0, 1, 0.01, 0.3) +
        ctl.choix("du", "Durée", [[15, "15 ans"], [20, "20 ans"], [22, "22 ans"], [25, "25 ans"]], 25)) + ctl.resultat(),
    init: (z) => brancher(z, { rv: euros, ch: euros, ap: euros, tx: (x) => fr2(x) + " %", as: (x) => fr2(x) + " %" }, (v, r) => {
      const limite = v.rv * .35, mens = Math.max(0, limite - v.ch), t = v.tx / 100 / 12, n = v.du * 12, a = v.as / 100 / 12;
      const facteur = (t ? t / (1 - Math.pow(1 + t, -n)) : 1 / n) + a;
      const capital = mens / facteur, credit = capital * (facteur - a), assur = capital * a;
      const interets = credit * n - capital, coutAssur = assur * n;
      const i1 = capital * t;   // intérêts du premier mois
      r.className = "simu-resultat " + (mens > 0 ? "gain" : "perte");
      r.innerHTML = (mens <= 0 ? phrase("<strong>Pas de capacité d'emprunt</strong> : les crédits en cours atteignent déjà 35 % des revenus.") :
        phrase(`Avec ${euros(v.rv)} de revenus par mois, ce foyer peut emprunter environ <strong>${euros(capital)}</strong> sur ${v.du} ans, soit un budget de <strong>${euros(capital + v.ap)}</strong> avec l'apport.`)) +
        `<div class="op-chiffres"><span><b>${euros(mens)}</b>mensualité maximale</span><span><b>${euros(interets)}</b>intérêts sur ${v.du} ans</span><span><b>${euros(coutAssur)}</b>assurance sur ${v.du} ans</span><span><b>${euros(v.rv - v.ch - mens)}</b>reste après crédits, par mois</span></div>` +
        barres([{ libelle: "Capital emprunté", valeur: capital, couleur: "var(--i3, var(--accent))" }, { libelle: "Intérêts", valeur: interets, couleur: "var(--ko)" }, { libelle: "Assurance", valeur: coutAssur, couleur: "var(--accent)" }], Math.max(capital, 1)) +
        detail([
          ["Limite de 35 % des revenus", `${euros(v.rv)} × 35 % = ${euros(limite)}`],
          v.ch ? ["− Crédits déjà en cours", euros(v.ch), "moins"] : null,
          ["= Mensualité maximale (crédit + assurance)", euros(mens), "total"],
          [`dont crédit (taux ${fr2(v.tx)} % sur ${n} mois)`, euros(credit), "sous"],
          [`dont assurance (${fr2(v.as)} % du capital par an)`, euros(assur), "sous"],
          ["= Capital empruntable", euros(capital), "total"],
          ["+ Apport", euros(v.ap)],
          ["= Budget total (prix + frais d'achat)", euros(capital + v.ap), "total"],
          ["Intérêts du premier mois", euros(i1), "sous"],
          ["Coût total du crédit (intérêts + assurance)", euros(interets + coutAssur)],
        ]);
    }),
    bases: [
      ["Norme HCSF (décision D-HCSF-2021-7, contraignante depuis janvier 2022) : taux d'effort maximal de 35 % et durée maximale de 25 ans.", SRC.hcsfAN],
      ["Différé possible en cas d'entrée en jouissance décalée (construction neuve, travaux d'au moins 10 % du coût), dans la limite de 27 ans.", SRC.hcsfAN],
      ["Les banques peuvent déroger pour 20 % de leur production trimestrielle (70 % au moins de cette marge réservée aux résidences principales, 30 % aux primo-accédants).", SRC.hcsfAN],
      ["La norme est rappelée et suivie par l'ACPR (Banque de France).", SRC.hcsfAcpr],
      ["Page de référence du Haut Conseil de stabilité financière.", SRC.hcsf],
    ],
    hypotheses: ["Par prudence, l'assurance emprunteur est comptée dans la mensualité comparée aux 35 %.", "Prêt amortissable à mensualités constantes, assurance calculée sur le capital emprunté.", "Le budget inclut les frais d'achat : retirez les frais de notaire (outil « Frais de notaire ») pour connaître le prix accessible."],
    limites: ["Appréciation propre à chaque banque (reste à vivre, stabilité des revenus, épargne).", "Revenus locatifs, prêts aidés (prêt à taux zéro, Action Logement), prêts relais et différé.", "Frais de dossier et de garantie."],
  },

  // ============================================================ IFI
  ifi: {
    intro: "Impôt sur la fortune immobilière dû au 1er janvier : barème, décote entre 1,3 et 1,4 M€, abattement de 30 % sur la résidence principale et plafonnement à 75 % des revenus.",
    html: () => groupe("Le patrimoine immobilier au 1er janvier",
        ctl.curseur("rp", "Résidence principale (valeur vénale)", 0, 10000000, 25000, 1200000) +
        ctl.curseur("au", "Autres biens immobiliers (locatif, résidence secondaire)", 0, 20000000, 25000, 600000) +
        ctl.curseur("sc", "Parts de SCPI, SCI, OPCI (part immobilière taxable)", 0, 10000000, 10000, 100000) +
        ctl.curseur("de", "Dettes déductibles (emprunts immobiliers restant dus, taxe foncière…)", 0, 10000000, 10000, 200000)) +
      groupe("Pour le plafonnement (facultatif)",
        ctl.curseur("rev", "Revenus mondiaux nets de l'année précédente (0 = non calculé)", 0, 5000000, 5000, 0) +
        ctl.curseur("imp", "Impôts sur ces revenus (impôt sur le revenu, prélèvements…)", 0, 3000000, 1000, 0)) + ctl.resultat(),
    init: (z) => brancher(z, { rp: euros, au: euros, sc: euros, de: euros, rev: euros, imp: euros }, (v, r) => {
      const ab = v.rp * .3, brut = v.rp - ab + v.au + v.sc, net = Math.max(0, brut - v.de);
      const T = [[800000, 0], [1300000, .005], [2570000, .007], [5000000, .01], [10000000, .0125], [Infinity, .015]];
      let ifi = 0, dec = 0, plaf = 0;
      const lignes = [];
      if (net >= 1300000) {
        let bas = 0; for (const [h, t] of T) { const x = Math.max(0, Math.min(net, h) - bas); if (x > 0 && t > 0) lignes.push([`Tranche à ${fr2(t * 100)} % : ${euros(x)}`, euros(x * t), "sous"]); ifi += x * t; bas = h; }
        if (net < 1400000) { dec = 17500 - .0125 * net; ifi -= dec; }
        if (v.rev > 0) { plaf = Math.max(0, ifi + v.imp - .75 * v.rev); plaf = Math.min(plaf, ifi); ifi -= plaf; }
      }
      r.className = "simu-resultat " + (ifi > 0 ? "perte" : "gain");
      r.innerHTML = (net < 1300000 ? phrase(`<strong>Pas d'IFI</strong> : le patrimoine net taxable (${euros(net)}) est inférieur au seuil de 1 300 000 €. Marge avant le seuil : ${euros(1300000 - net)}.`) :
        phrase(`IFI estimé : <strong>${euros(ifi)}</strong> pour un patrimoine net taxable de ${euros(net)}, soit ${pct(ifi / net)} de ce patrimoine.`)) +
        barres([{ libelle: "Résidence principale (après 30 %)", valeur: v.rp - ab, couleur: "var(--i3, var(--accent))" }, { libelle: "Autres biens et parts", valeur: v.au + v.sc, couleur: "var(--accent)" }, { libelle: "Dettes", valeur: v.de, couleur: "var(--ok)" }], Math.max(brut, 1)) +
        detail([
          ["Résidence principale − abattement de 30 %", `${euros(v.rp)} − ${euros(ab)}`],
          ["+ Autres biens immobiliers et parts", euros(v.au + v.sc)],
          ["− Dettes déductibles", euros(v.de), "moins"],
          ["= Patrimoine net taxable", euros(net), "total"],
          net >= 1300000 ? ["Barème appliqué dès 800 000 € (seuil de 1,3 M€ atteint)", ""] : ["Seuil d'imposition", "1 300 000 €"],
          ...lignes,
          dec ? ["− Décote : 17 500 € − 1,25 % du patrimoine net", euros(dec), "moins"] : null,
          plaf ? ["− Plafonnement (IFI + impôts au-delà de 75 % des revenus)", euros(plaf), "moins"] : null,
          ["= IFI estimé", euros(ifi), "total"],
        ]);
    }),
    bases: [
      ["Barème : 0 % jusqu'à 800 000 €, 0,5 % jusqu'à 1 300 000 €, 0,7 % jusqu'à 2 570 000 €, 1 % jusqu'à 5 000 000 €, 1,25 % jusqu'à 10 000 000 €, 1,5 % au-delà. Imposition à partir de 1 300 000 € de patrimoine net.", SRC.ifi],
      ["Décote entre 1 300 000 € et 1 400 000 € : 17 500 € − 1,25 % du patrimoine net taxable.", SRC.ifi],
      ["Abattement de 30 % sur la valeur de la résidence principale.", SRC.ifi],
      ["Plafonnement : l'IFI est réduit de ce qui dépasse 75 % des revenus de l'année précédente, en ajoutant les impôts dus sur ces revenus (réservé aux résidents fiscaux français).", SRC.ifi],
      ["Dettes déductibles : existantes au 1er janvier et liées aux biens taxables (achat, travaux, impôts comme la taxe foncière…).", SRC.ifi],
    ],
    hypotheses: ["Les parts de sociétés sont saisies pour leur seule valeur immobilière taxable.", "Les dettes saisies remplissent les conditions de déduction."],
    limites: ["Biens professionnels exonérés, bois et forêts, biens ruraux loués à long terme.", "Règles particulières de déduction des dettes (prêts in fine, dettes familiales, plafonnement des dettes des gros patrimoines).", "Calcul exact des revenus et impôts retenus pour le plafonnement."],
  },

  // ============================================================ Dividendes : PFU ou barème
  dividendes: {
    intro: "Compare les deux façons d'imposer les revenus de placement : le prélèvement forfaitaire unique (12,8 % d'impôt) ou le barème, après un abattement de 40 % sur les dividendes. L'impôt au barème est calculé sur le vrai foyer.",
    html: () => groupe("Le foyer",
        ctl.choix("couple", "Situation", [[0, "Personne seule"], [1, "Couple marié ou pacsé"]], 1) +
        ctl.choix("enf", "Enfants à charge", [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]], 0) +
        ctl.curseur("rni", "Revenu net imposable du foyer, sans les placements", 0, 500000, 1000, 50000)) +
      groupe("Les revenus de placement de l'année",
        ctl.curseur("di", "Dividendes d'actions (montant brut)", 0, 300000, 100, 5000) +
        ctl.curseur("in", "Autres revenus de placement (intérêts, plus-values de titres)", 0, 300000, 100, 0)) + ctl.resultat(),
    init: (z) => brancher(z, { rni: euros, di: euros, in: euros }, (v, r) => {
      const couple = v.couple === 1, tot = v.di + v.in;
      const pfu = tot * .128;
      const base = impotRevenu(v.rni, couple, v.enf, false), avec = impotRevenu(v.rni + v.di * .6 + v.in, couple, v.enf, false);
      const bareme = avec.net - base.net, ps = tot * .186, csgDed = tot * .068 * avec.tmi;
      const mieux = bareme + 0.5 < pfu ? "barème" : pfu + 0.5 < bareme ? "PFU" : "égalité";
      r.className = "simu-resultat " + (mieux === "barème" ? "gain" : "neutre");
      r.innerHTML = phrase(mieux === "égalité" ? "Les deux options coûtent à peu près la même chose." :
        `Ici, le <strong>${mieux}</strong> est le plus avantageux : <strong>${euros(Math.abs(pfu - bareme))}</strong> d'impôt en moins${mieux === "barème" ? `, et environ ${euros(csgDed)} de CSG déductible l'année suivante` : ""}.`) +
        barres([{ libelle: "PFU : impôt", valeur: pfu, couleur: "#2c6e91" }, { libelle: "Barème : impôt", valeur: bareme, couleur: "#e0723b" }, { libelle: "Prélèv. sociaux (les deux)", valeur: ps, couleur: "var(--doux)" }], Math.max(pfu, bareme, ps, 1)) +
        detail([
          ["Revenus de placement", euros(tot)],
          ["PFU : 12,8 % d'impôt", euros(pfu), "total"],
          [`Barème : dividendes après abattement de 40 % + autres revenus`, `${euros(v.di * .6)} + ${euros(v.in)}`],
          [`Impôt du foyer sans les placements → avec`, `${euros(base.net)} → ${euros(avec.net)}`],
          ["Barème : supplément d'impôt", euros(bareme), "total"],
          [`Tranche marginale du foyer avec les placements`, `${Math.round(avec.tmi * 100)} %`, "sous"],
          ["Prélèvements sociaux : 18,6 % (dans les deux cas)", euros(ps)],
          ["Barème : CSG déductible l'année suivante (6,8 % × tranche marginale), estimation", euros(csgDed), "sous"],
        ]);
    }),
    bases: [
      ["Prélèvement forfaitaire unique : 12,8 % d'impôt sur le revenu, plus les prélèvements sociaux.", SRC.placements],
      ["Prélèvements sociaux de 18,6 % à compter du 1er janvier 2026 (CSG de 10,6 % sur les revenus de capitaux mobiliers).", SRC.placements],
      ["Option pour le barème : abattement de 40 % sur les dividendes et CSG en partie déductible ; plus favorable en général pour un foyer non imposable ou imposé à 11 %.", SRC.placements],
      ["CSG déductible : 6,8 % ; détail des prélèvements (CSG 10,6 %, CRDS 0,5 %, prélèvement de solidarité 7,5 %).", SRC.aideMemoire],
      ["Impôt au barème calculé avec le barème 2026, le quotient familial et la décote (même moteur que l'outil Impôt sur le revenu).", SRC.bareme],
    ],
    hypotheses: ["Option globale : elle vaut pour tous les revenus de placement et plus-values de l'année du foyer.", "Les plus-values saisies sont imposées sans abattement pour durée de détention.", "L'économie liée à la CSG déductible est estimée avec la tranche marginale actuelle."],
    limites: ["Abattements pour durée de détention des titres achetés avant 2018.", "Prélèvement forfaitaire non libératoire déjà payé (acompte imputé sur l'impôt final).", "Contribution sur les hauts revenus et revenus de source étrangère."],
  },

  // ============================================================ Girardin industriel
  girardin: {
    intro: "Dimensionne une opération de Girardin industriel : la réduction obtenue ne compte dans le plafond de 18 000 € des niches fiscales que pour une fraction de son montant, fixée par le BOFiP.",
    html: () => groupe("La situation fiscale",
        ctl.curseur("imp", "Impôt sur le revenu dû avant réductions", 0, 200000, 500, 15000) +
        ctl.curseur("autres", "Autres avantages soumis au plafond de 10 000 € (emploi à domicile, PME…)", 0, 10000, 250, 0) +
        ctl.curseur("om", "Autres avantages outre-mer ou SOFICA déjà utilisés", 0, 18000, 250, 0)) +
      groupe("L'opération",
        ctl.choix("fr", "Fraction retenue dans le plafond (indiquée par le monteur)", [[.44, "44 %"], [.34, "34 %"]], .44) +
        ctl.curseur("taux", "Réduction promise, en % de l'apport", 100, 130, 1, 112)) + ctl.resultat(),
    init: (z) => brancher(z, { imp: euros, autres: euros, om: euros, taux: (x) => x + " %" }, (v, r) => {
      const autres = Math.min(v.autres, 10000), place = Math.max(0, 18000 - autres - v.om);
      const maxPlafond = place / v.fr, dispo = Math.max(0, v.imp - autres - v.om);
      const red = Math.min(dispo, maxPlafond), apport = red / (v.taux / 100), gain = red - apport;
      const limite = red === dispo ? "l'impôt restant" : "le plafond des niches";
      r.className = "simu-resultat " + (gain > 0 ? "gain" : "neutre");
      r.innerHTML = phrase(red > 0 ? `Réduction visée : <strong>${euros(red)}</strong> pour un apport de <strong>${euros(apport)}</strong> (non récupéré), soit un gain net de <strong>${euros(gain)}</strong>. Ce qui limite l'opération : ${limite}.` :
        "<strong>Pas de place</strong> : le plafond des niches ou l'impôt est déjà entièrement utilisé.") +
        barres([{ libelle: "Apport", valeur: apport, couleur: "var(--ko)" }, { libelle: "Réduction", valeur: red, couleur: "var(--i3, var(--accent))" }, { libelle: "Gain net", valeur: gain, couleur: "var(--ok)" }], Math.max(red, 1)) +
        detail([
          ["Plafond global des niches (10 000 € + 8 000 € outre-mer)", "18 000 €"],
          ["− Autres avantages (dans la limite de 10 000 €)", euros(autres), "moins"],
          ["− Autres avantages outre-mer déjà utilisés", euros(v.om), "moins"],
          ["= Place restante dans le plafond", euros(place), "total"],
          [`Réduction maximale : ${euros(place)} ÷ ${fr2(v.fr * 100)} %`, euros(maxPlafond)],
          ["Impôt restant après les autres avantages", euros(dispo)],
          ["= Réduction visée (le plus petit des deux)", euros(red), "total"],
          [`Apport : ${euros(red)} ÷ ${v.taux} %`, euros(apport)],
          ["= Gain net (réduction − apport)", euros(gain), "total"],
        ]);
    }),
    bases: [
      ["Plafond global : 10 000 € pour la plupart des avantages, porté à 18 000 € pour les réductions outre-mer et les SOFICA ; le plafond de 10 000 € s'applique en premier.", SRC.plafonnement],
      ["La réduction Girardin industriel (article 199 undecies B du CGI) compte dans le plafond pour 34 % ou 44 % de son montant selon le cas prévu par la loi (hausse de la part rétrocédée à l'exploitant, investissements depuis le 1er janvier 2015).", SRC.girardin],
      ["Si l'investisseur exploite lui-même le bien à titre professionnel, la totalité de la réduction est retenue.", SRC.girardin],
    ],
    hypotheses: ["Par prudence, la réduction visée ne dépasse pas l'impôt restant.", "La fraction (34 % ou 44 %) et le taux de réduction sont ceux annoncés par le monteur de l'opération."],
    limites: ["Report éventuel d'une réduction supérieure à l'impôt.", "Risque de reprise de la réduction si le matériel n'est pas exploité pendant la durée prévue.", "Avantages déjà reportés des années précédentes."],
  },

  // ============================================================ SCPI : loyers
  "scpi-loyers": {
    intro: "Impôt et prélèvements sociaux sur les revenus de SCPI, au micro-foncier ou au régime réel : lequel coûte le moins ? Parts détenues en direct, SCPI qui louent en France.",
    html: () => groupe("Les revenus fonciers de l'année",
        ctl.curseur("rev", "Revenus bruts des parts de SCPI (relevé fiscal)", 0, 60000, 100, 6000) +
        ctl.curseur("dir", "Loyers bruts d'un bien loué vide en direct (0 si aucun)", 0, 60000, 100, 0) +
        ctl.curseur("chg", "Charges déductibles au réel (frais et charges de la SCPI, autres)", 0, 30000, 100, 900) +
        ctl.curseur("int", "Intérêts d'emprunt (si les parts sont financées à crédit)", 0, 30000, 100, 0)) +
      groupe("Le foyer", tmiChoix(.30)) + ctl.resultat(),
    init: (z) => brancher(z, { rev: euros, dir: euros, chg: euros, int: euros }, (v, r) => {
      const brut = v.rev + v.dir, micro = brut <= 15000 && v.dir > 0;
      const netMicro = brut * .7, netReel = brut - v.chg - v.int;
      const calc = (base) => ({ ir: Math.max(0, base) * v.tmi, ps: Math.max(0, base) * .172 });
      const M = calc(netMicro), R = calc(netReel);
      const coutM = M.ir + M.ps, coutR = R.ir + R.ps;
      const choix = micro && coutM <= coutR ? "micro" : "reel", X = choix === "micro" ? M : R;
      r.className = "simu-resultat neutre";
      r.innerHTML = phrase(micro ? `Impôt et prélèvements sociaux : <strong>${euros(coutM)}</strong> au micro-foncier, <strong>${euros(coutR)}</strong> au régime réel. Le moins coûteux ici : <strong>${choix === "micro" ? "le micro-foncier" : "le régime réel"}</strong>${Math.abs(coutM - coutR) >= 1 ? ` (${euros(Math.abs(coutM - coutR))} d'écart)` : ""}.` :
        `Impôt et prélèvements sociaux au régime réel : <strong>${euros(coutR)}</strong> sur ${euros(brut)} de revenus bruts.`) +
        (!micro ? alerte(brut > 15000 ? "Revenus fonciers bruts supérieurs à 15 000 € : le régime réel s'applique." : "Sans bien loué vide détenu en direct, le micro-foncier n'est pas possible pour des parts de SCPI seules : le régime réel s'applique.") : "") +
        (netReel < 0 ? alerte(`Résultat réel négatif (${euros(netReel)}) : c'est un déficit foncier. Son imputation (dans la limite de 10 700 € par an sur le revenu global) n'est pas chiffrée ici.`) : "") +
        barres([...(micro ? [{ libelle: "Micro-foncier", valeur: coutM, couleur: choix === "micro" ? "var(--ok)" : "var(--ko)" }] : []), { libelle: "Régime réel", valeur: coutR, couleur: choix === "reel" ? "var(--ok)" : "var(--ko)" }], Math.max(coutM, coutR, 1)) +
        detail([
          ["Revenus fonciers bruts (SCPI + direct)", euros(brut)],
          micro ? ["Micro-foncier : revenu imposable après abattement de 30 %", euros(netMicro), choix === "micro" ? "total" : "sous"] : null,
          micro ? ["Micro-foncier : impôt + prélèvements sociaux", `${euros(M.ir)} + ${euros(M.ps)}`, "sous"] : null,
          ["Réel : revenus − charges − intérêts", `${euros(brut)} − ${euros(v.chg)} − ${euros(v.int)} = ${euros(netReel)}`, choix === "reel" ? "total" : "sous"],
          ["Réel : impôt + prélèvements sociaux", `${euros(R.ir)} + ${euros(R.ps)}`, "sous"],
          [`Impôt au taux marginal de ${Math.round(v.tmi * 100)} %`, euros(X.ir)],
          ["Prélèvements sociaux : 17,2 %", euros(X.ps)],
          micro ? ["Option pour le réel", "possible, irrévocable 3 ans", "sous"] : null,
        ]);
    }),
    bases: [
      ["Micro-foncier : revenus fonciers bruts jusqu'à 15 000 € par foyer, abattement forfaitaire de 30 % ; le seuil tient compte de la quote-part des revenus des SCPI.", SRC.fonciers],
      ["Le micro-foncier ne s'applique pas si le foyer ne perçoit que des revenus de parts de sociétés immobilières, sauf s'il déclare aussi un bien détenu en direct.", SRC.fonciers],
      ["Option pour le réel par le dépôt d'une déclaration 2044, irrévocable pendant trois ans.", SRC.fonciers],
      ["Régime réel : déduction des charges (travaux, frais de gestion, assurance, intérêts d'emprunt, taxe foncière…) ; déficit imputable sur le revenu global dans la limite de 10 700 € par an.", SRC.locNue],
      ["Prélèvements sociaux de 17,2 % sur les revenus fonciers (non concernés par la hausse de 2026).", SRC.locNue],
    ],
    hypotheses: ["L'impôt est calculé au taux marginal choisi, sur l'ensemble du revenu foncier.", "Les parts sont détenues en direct (hors assurance-vie et hors société à l'impôt sur les sociétés)."],
    limites: ["Revenus financiers des SCPI (imposés comme revenus de placement) et revenus de source étrangère.", "Imputation détaillée d'un déficit foncier et report sur les années suivantes.", "SCPI fiscales (Pinel, Malraux, déficit foncier) et nue-propriété."],
  },

  // ============================================================ SCPI : frais d'entrée
  "scpi-frais": {
    intro: "Les frais de souscription réduisent la somme réellement placée dans l'immobilier. Combien d'années de revenus faut-il pour les compenser ?",
    html: () => groupe("La souscription",
        ctl.curseur("inv", "Somme investie", 1000, 1000000, 1000, 50000) +
        ctl.curseur("frais", "Frais de souscription (document d'informations clés)", 0, 15, .1, 10) +
        ctl.curseur("td", "Taux de distribution annoncé (%/an, brut, non garanti)", 0, 10, .05, 4.5) +
        ctl.curseur("an", "Durée de détention envisagée (années)", 1, 30, 1, 10)) + ctl.resultat(),
    init: (z) => brancher(z, { inv: euros, frais: (x) => fr2(x) + " %", td: (x) => fr2(x) + " %", an: (x) => x + " an" + (x > 1 ? "s" : "") }, (v, r) => {
      const f = v.inv * v.frais / 100, place = v.inv - f, dist = v.inv * v.td / 100;
      const annees = dist > 0 ? f / dist : Infinity, cumul = dist * v.an;
      r.className = "simu-resultat neutre";
      r.innerHTML = phrase(`Sur ${euros(v.inv)} investis, <strong>${euros(place)}</strong> travaillent réellement dans l'immobilier. Il faut environ <strong>${Number.isFinite(annees) ? fr2(annees, 1) + " ans" : "—"}</strong> de revenus distribués pour compenser les ${euros(f)} de frais.`) +
        camembert(1 - v.frais / 100, "var(--i3, var(--accent))", "var(--ko)", `Placé : ${euros(place)}`, `Frais : ${euros(f)}`) +
        detail([
          [`Frais de souscription : ${euros(v.inv)} × ${fr2(v.frais)} %`, euros(f)],
          ["= Somme placée dans l'immobilier", euros(place), "total"],
          [`Revenus distribués par an : ${euros(v.inv)} × ${fr2(v.td)} %`, euros(dist)],
          ["Années de revenus pour compenser les frais", Number.isFinite(annees) ? fr2(annees, 1) : "—", "total"],
          [`Revenus cumulés sur ${v.an} ans (avant impôt, sans revalorisation)`, euros(cumul)],
          ["Revenus cumulés − frais", euros(cumul - f), "total"],
        ]);
    }),
    bases: [
      ["Calcul arithmétique : aucun chiffre réglementaire. Les frais et le taux de distribution sont ceux du document d'informations clés et du rapport annuel de la SCPI choisie.", ["AMF · Les SCPI, ce qu'il faut savoir", "https://www.amf-france.org/fr/espace-epargnants/comprendre-les-produits-financiers/placements-collectifs/scpi"]],
    ],
    hypotheses: ["Le taux de distribution est appliqué au montant investi (prix de souscription) et supposé constant : il n'est pas garanti.", "Le prix des parts est supposé stable : ni plus-value, ni moins-value."],
    limites: ["Impôt et prélèvements sociaux sur les revenus (voir l'outil « Loyers de SCPI »).", "Frais de retrait ou de cession, frais de gestion annuels déjà déduits des revenus distribués.", "Délai de jouissance (mois sans revenus après la souscription)."],
  },

  // ============================================================ Plus-value immobilière
  "plus-value-immobiliere": {
    intro: "Impôt sur la vente d'un bien qui n'est pas la résidence principale : abattements pour durée de détention, 19 % d'impôt, 17,2 % de prélèvements sociaux et taxe sur les plus-values élevées.",
    html: () => groupe("L'achat",
        ctl.curseur("pa", "Prix d'achat (ou valeur déclarée si reçu par donation ou succession)", 10000, 5000000, 5000, 200000) +
        ctl.choix("orig", "Comment le bien a-t-il été obtenu ?", [["achat", "Acheté"], ["gratuit", "Donation ou succession"]], "achat") +
        ctl.curseur("fa", "Frais d'acquisition réels (0 = forfait de 7,5 % si acheté)", 0, 500000, 500, 0) +
        ctl.curseur("tr", "Travaux réels justifiés (0 = forfait de 15 % après 5 ans)", 0, 2000000, 1000, 0)) +
      groupe("La vente",
        ctl.curseur("pv", "Prix de vente", 10000, 8000000, 5000, 320000) +
        ctl.curseur("an", "Années pleines de détention", 0, 35, 1, 12) +
        ctl.choix("rp", "Était-ce la résidence principale au jour de la vente ?", [[0, "Non"], [1, "Oui"]], 0)) + ctl.resultat(),
    init: (z) => brancher(z, { pa: euros, fa: euros, tr: euros, pv: euros, an: (x) => x + " an" + (x > 1 ? "s" : "") }, (v, r) => {
      if (v.rp === 1) { r.className = "simu-resultat gain"; r.innerHTML = phrase("<strong>Pas d'impôt</strong> : la plus-value de la vente de la résidence principale est exonérée.") + note("Source : impots.gouv.fr. L'exonération suppose que le bien soit la résidence principale au jour de la vente."); return; }
      if (v.pv <= 15000) { r.className = "simu-resultat gain"; r.innerHTML = phrase("<strong>Prix de vente inférieur ou égal à 15 000 €</strong> : pas de déclaration de plus-value à déposer (notice 2048-IMM)."); return; }
      const forfaitFa = v.orig === "achat" && v.fa === 0, fa = forfaitFa ? v.pa * .075 : v.fa;
      const forfaitTr = v.tr === 0 && v.an > 5, tr = forfaitTr ? v.pa * .15 : v.tr;
      const brute = v.pv - v.pa - fa - tr;
      const abIr = v.an <= 5 ? 0 : v.an >= 22 ? 1 : (v.an - 5) * .06;
      const abPs = v.an <= 5 ? 0 : v.an <= 21 ? (v.an - 5) * .0165 : v.an === 22 ? .28 : Math.min(1, .28 + (v.an - 22) * .09);
      if (brute <= 0) { r.className = "simu-resultat gain"; r.innerHTML = phrase(`<strong>Pas de plus-value</strong> (${euros(brute)}) : pas d'impôt.`); return; }
      const baseIr = brute * (1 - abIr), basePs = brute * (1 - abPs);
      const ir = baseIr * .19, ps = basePs * .172, sur = surtaxePV(baseIr), total = ir + ps + sur;
      r.className = "simu-resultat perte";
      r.innerHTML = phrase(`Impôt total estimé : <strong>${euros(total)}</strong> sur une plus-value de ${euros(brute)}. Le vendeur garde <strong>${euros(v.pv - total)}</strong> du prix de vente.`) +
        `<div class="op-chiffres"><span><b>${pct(abIr)}</b>abattement impôt</span><span><b>${pct(abPs)}</b>abattement prélèv. sociaux</span><span><b>${v.an >= 22 ? "acquise" : (22 - v.an) + " ans"}</b>avant l'exonération d'impôt</span><span><b>${v.an >= 30 ? "acquise" : (30 - v.an) + " ans"}</b>avant l'exonération totale</span></div>` +
        barres([{ libelle: "Impôt 19 %", valeur: ir, couleur: "#e0723b" }, { libelle: "Prélèv. sociaux 17,2 %", valeur: ps, couleur: "#2c6e91" }, { libelle: "Taxe plus-values élevées", valeur: sur, couleur: "var(--ko)" }], Math.max(ir, ps, sur, 1)) +
        detail([
          ["Prix de vente", euros(v.pv)],
          ["− Prix d'achat", euros(v.pa), "moins"],
          [forfaitFa ? "− Frais d'acquisition : forfait de 7,5 %" : "− Frais d'acquisition réels", euros(fa), "moins"],
          [forfaitTr ? "− Travaux : forfait de 15 % (détention de plus de 5 ans)" : "− Travaux réels", euros(tr), "moins"],
          ["= Plus-value brute", euros(brute), "total"],
          [`Impôt : abattement de ${pct(abIr)} → base`, euros(baseIr)],
          ["Impôt sur le revenu : 19 %", euros(ir)],
          [`Prélèvements sociaux : abattement de ${pct(abPs)} → base`, euros(basePs)],
          ["Prélèvements sociaux : 17,2 %", euros(ps)],
          baseIr > 50000 ? ["Taxe sur les plus-values élevées (de 2 % à 6 %, avec lissage)", euros(sur)] : ["Taxe sur les plus-values élevées", "non due (≤ 50 000 €)", "sous"],
          ["= Total", euros(total), "total"],
        ]);
    }),
    bases: [
      ["Taux : 19 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux ; exonération de la résidence principale.", SRC.pvPage],
      ["Abattement pour l'impôt : 6 % par an de la 6e à la 21e année, 4 % la 22e (exonération après 22 ans).", SRC.pvNotice],
      ["Abattement pour les prélèvements sociaux : 1,65 % par an de la 6e à la 21e année, 1,60 % la 22e, 9 % par an au-delà (exonération après 30 ans).", SRC.pvNotice],
      ["Forfait de 7,5 % pour les frais d'une acquisition à titre onéreux ; forfait de 15 % pour les travaux si le bien est vendu plus de 5 ans après l'achat.", SRC.pvNotice],
      ["Taxe sur les plus-values élevées (article 1609 nonies G du CGI) au-delà de 50 000 € de plus-value imposable : barème de 2 % à 6 % avec lissage.", SRC.pvNotice],
      ["Pas de déclaration à déposer pour un prix de vente inférieur ou égal à 15 000 €.", SRC.pvNotice],
    ],
    hypotheses: ["Les années saisies sont des années pleines de détention.", "Bien reçu par donation ou succession : le forfait de 7,5 % ne s'applique pas (frais réels seulement)."],
    limites: ["Autres exonérations (première vente d'un logement autre que la résidence principale, retraités ou invalides modestes, expropriation…).", "Frais de vente déductibles du prix (commission payée par le vendeur, diagnostics).", "Location meublée au réel : réintégration des amortissements pour les ventes depuis le 15 février 2025.", "Vendeurs non-résidents et biens détenus par une société."],
  },

  // ============================================================ Vente de parts de SCI
  "cession-parts-sci": {
    intro: "Droits d'enregistrement payés lors de la vente de parts de société : 5 % pour une société à prépondérance immobilière, 3 % après un abattement pour les autres sociétés à parts sociales.",
    html: () => groupe("La cession",
        ctl.curseur("px", "Prix de vente des parts", 0, 5000000, 1000, 120000) +
        ctl.curseur("tot", "Nombre total de parts de la société", 1, 100000, 1, 1000) +
        ctl.curseur("ced", "Nombre de parts vendues", 1, 100000, 1, 400) +
        ctl.choix("im", "Société à prépondérance immobilière (cas courant d'une SCI) ?", [[1, "Oui"], [0, "Non"]], 1)) + ctl.resultat(),
    init: (z) => brancher(z, { px: euros, tot: (x) => fr2(x, 0), ced: (x) => fr2(x, 0) }, (v, r) => {
      const ced = Math.min(v.ced, v.tot), abParPart = 23000 / v.tot, ab = abParPart * ced;
      const base = v.im === 1 ? v.px : Math.max(0, v.px - ab);
      const droits = v.px > 0 ? Math.max(25, base * (v.im === 1 ? .05 : .03)) : 0;
      r.className = "simu-resultat perte";
      r.innerHTML = phrase(`Droits d'enregistrement estimés : <strong>${euros(droits)}</strong>, soit ${pct(v.px ? droits / v.px : 0)} du prix.`) +
        (v.ced > v.tot ? alerte("Le nombre de parts vendues ne peut pas dépasser le nombre total de parts : calcul fait sur la totalité.") : "") +
        detail([
          ["Prix de vente des parts", euros(v.px)],
          v.im === 1 ? null : [`− Abattement : 23 000 € ÷ ${fr2(v.tot, 0)} parts × ${fr2(ced, 0)} parts vendues`, euros(ab), "moins"],
          ["= Base taxable", euros(base), "total"],
          [`Taux : ${v.im === 1 ? "5 %" : "3 %"} (minimum de perception 25 €)`, euros(droits), "total"],
        ]);
    }),
    bases: [
      ["Parts de personnes morales à prépondérance immobilière : droit proportionnel de 5 % (2° du I de l'article 726 du CGI).", SRC.parts],
      ["Parts sociales des autres sociétés : 3 % après un abattement égal à 23 000 € divisés par le nombre total de parts, multiplié par le nombre de parts vendues.", SRC.parts],
      ["Minimum de perception : 25 €.", SRC.parts],
    ],
    hypotheses: ["Le prix saisi est la base des droits (prix ou valeur réelle si elle est supérieure)."],
    limites: ["Qualification exacte de la prépondérance immobilière : à vérifier par le rédacteur de l'acte.", "Actions de sociétés (0,1 %) et cas d'exonération particuliers.", "Impôt sur la plus-value du vendeur."],
  },
};

// Taxe sur les plus-values immobilières élevées (notice 2048-IMM, art. 1609 nonies G du CGI), PV = plus-value imposable à l'impôt.
function surtaxePV(pv) {
  if (pv <= 50000) return 0;
  if (pv <= 60000) return .02 * pv - (60000 - pv) / 20;
  if (pv <= 100000) return .02 * pv;
  if (pv <= 110000) return .03 * pv - (110000 - pv) / 10;
  if (pv <= 150000) return .03 * pv;
  if (pv <= 160000) return .04 * pv - (160000 - pv) * .15;
  if (pv <= 200000) return .04 * pv;
  if (pv <= 210000) return .05 * pv - (210000 - pv) * .20;
  if (pv <= 250000) return .05 * pv;
  if (pv <= 260000) return .06 * pv - (260000 - pv) * .25;
  return .06 * pv;
}

// Bloc « Sur quoi se base ce calcul » affiché sous chaque outil poussé.
function blocSources(o) {
  const lien = ([t, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a>`;
  return `<section class="op-sources" aria-label="Sur quoi se base ce calcul">
    <h3>📚 Sur quoi se base ce calcul</h3>
    <ol>${o.bases.map(([t, s]) => `<li>${t}<br><small>${lien(s)}</small></li>`).join("")}</ol>
    ${o.hypotheses?.length ? `<h4>Hypothèses retenues</h4><ul>${o.hypotheses.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
    ${o.limites?.length ? `<h4>Ce que l'outil ne prend pas en compte</h4><ul>${o.limites.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
    <p class="doux">Règles vérifiées le ${VERIFIE_PRO} sur les sources ci-dessus. Estimation pédagogique, à confirmer avant tout conseil.</p>
  </section>`;
}
if (typeof module !== "undefined") module.exports = { OUTILS_PRO, impotRevenu, surtaxePV, cehr, abattSalaire, abattPensions };
