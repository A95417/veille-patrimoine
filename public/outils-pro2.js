// version 1.0 — simulateurs « poussés » de la Boîte à outils (lot 2 : transmission, épargne et retraite, entreprise).
// Même règle que le lot 1 : chaque chiffre vient d'une source officielle citée ; une règle non vérifiée n'entre pas dans le calcul.
// Dépend de outils-fiches.js et outils-pro.js (chargés avant).

Object.assign(SRC, {
  donTarifs: ["Service-public · Droits de donation selon le lien de parenté (vérifié le 13/05/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203"],
  donSansDroits: ["impots.gouv.fr · Donner sans payer de droits (modifié le 13/07/2026)", "https://www.impots.gouv.fr/particulier/questions/que-puis-je-donner-mes-enfants-petits-enfants-sans-avoir-payer-de-droits"],
  sucCalcul: ["impots.gouv.fr · Calcul des droits de succession (modifié le 22/07/2026)", "https://www.impots.gouv.fr/particulier/questions/comment-dois-je-calculer-les-droits-de-succession"],
  sucEval: ["Service-public · Évaluation de la succession et calcul des droits", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14200"],
  heritage: ["Service-public · Héritage : défunt ayant eu des enfants", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2126"],
  usufruit: ["BOFiP · BOI-ENR-DMTG-10-40-10-50 (barème de l'article 669 du CGI)", "https://bofip.impots.gouv.fr/doctrine/pgp/2323-PGP"],
  avDeces: ["impots.gouv.fr · Bénéficiaire d'une assurance-vie : imposition des primes", "https://www.impots.gouv.fr/international-particulier/questions/je-suis-beneficiaire-dune-assurance-vie-comment-sont-imposees"],
  avRachat: ["Service-public · Revenus d'un contrat d'assurance-vie (à jour au 01/01/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F22414"],
  avProduits: ["BOFiP · BOI-RPPM-RCM-20-10-20-50 (produits d'un rachat partiel)", "https://bofip.impots.gouv.fr/export/pdf/7002"],
  per: ["Service-public · Plan d'épargne retraite (vérifié le 12/10/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F34982"],
  per2026: ["Service-public · PER : nouvelles règles de déduction (29/04/2026)", "https://www.service-public.gouv.fr/particuliers/actualites/A18841"],
  pea: ["impots.gouv.fr · Retraits d'un PEA (modifié le 17/07/2026)", "https://www.impots.gouv.fr/particulier/questions/jai-un-plan-depargne-en-actions-pea-les-retraits-sont-ils-imposables"],
  peaSp: ["Service-public · Plan d'épargne en actions (vérifié le 22/05/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385"],
  pee: ["Service-public · Plan d'épargne entreprise (à jour au 01/01/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2885"],
  structures: ["AMF · Note explicative sur les produits structurés (2026)", "https://www.amf-france.org/sites/institutionnel/files/private/2026-06/note_explicative_-_produits_structures.pdf"],
  apport: ["BOFiP · BOI-RPPM-PVBMI-30-10-60-30 (en vigueur au 10/08/2026)", "https://bofip.impots.gouv.fr/bofip/12040-PGP.html"],
  apport2026: ["BOFiP · ACTU-2026-00099, loi de finances 2026, article 11", "https://bofip.impots.gouv.fr/bofip/15099-PGP.html/ACTU-2026-00099"],
  dutreil: ["BOFiP · BOI-ENR-DMTG-10-20-40-10 (pacte Dutreil)", "https://bofip.impots.gouv.fr/bofip/6509-PGP.html/identifiant=BOI-ENR-DMTG-10-20-40-10-20240530"],
  dutreil2026: ["BOFiP · ACTU-2026-00114, loi de finances 2026, article 8", "https://bofip.impots.gouv.fr/bofip/15125-PGP.html"],
  contratMariage: ["Service-public · Contrat de mariage (vérifié le 27/01/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F948"],
  communaute: ["Service-public · Mariage sans contrat (vérifié le 27/04/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F835"],
  pacs: ["Service-public · Effets d'un Pacs (vérifié le 27/01/2026)", "https://www.service-public.gouv.fr/particuliers/vosdroits/F1026"],
});

// ---------------------------------------------------------------- Barèmes de donation et de succession selon le lien
const BAREME_EPOUX = [[8072, .05], [15932, .10], [31865, .15], [552324, .20], [902838, .30], [1805677, .40], [Infinity, .45]];
const LIENS = {
  enfant: { nom: "Enfant", don: 100000, suc: 100000, bareme: BAREME_LIGNE_DIRECTE },
  petit: { nom: "Petit-enfant", don: 31865, suc: 1594, bareme: BAREME_LIGNE_DIRECTE },
  arriere: { nom: "Arrière-petit-enfant", don: 5310, suc: 1594, bareme: BAREME_LIGNE_DIRECTE },
  epoux: { nom: "Époux ou partenaire de PACS", don: 80724, suc: Infinity, bareme: BAREME_EPOUX },
  frere: { nom: "Frère ou sœur", don: 15932, suc: 15932, bareme: [[24430, .35], [Infinity, .45]] },
  neveu: { nom: "Neveu ou nièce", don: 7967, suc: 7967, bareme: [[Infinity, .55]] },
  autre: { nom: "Autre personne", don: 0, suc: 1594, bareme: [[Infinity, .60]] },
};
// Droits sur un nouveau montant, en tenant compte des donations des 15 dernières années (abattement et tranches déjà utilisés).
function droitsCumules(nouveau, anterieur, abattement, bareme) {
  const avant = Math.max(0, anterieur - abattement), apres = Math.max(0, anterieur + nouveau - abattement);
  return { droits: baremeProgressif(apres, bareme) - baremeProgressif(avant, bareme), abattRestant: Math.max(0, abattement - anterieur), taxable: apres - avant };
}
const usufruitViager = (age) => age < 21 ? .9 : age >= 91 ? .1 : .9 - .1 * Math.floor((age - 11) / 10);
const choixLien = (nom, defaut, sansEpoux) => ctl.choix(nom, "Lien avec la personne qui donne ou transmet", Object.entries(LIENS).filter(([k]) => !(sansEpoux && k === "epoux")).map(([k, l]) => [k, l.nom]), defaut);
const deuxDec = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

Object.assign(OUTILS_PRO, {
  // ============================================================ Droits de succession
  succession: {
    intro: "Ce que paient les enfants à un décès, avec ou sans conjoint survivant, en tenant compte des donations des 15 dernières années et de la réserve héréditaire.",
    html: () => groupe("La succession",
        ctl.curseur("pa", "Patrimoine net (biens − dettes), hors assurance-vie", 0, 10000000, 10000, 900000) +
        ctl.curseur("rp", "Dont résidence principale (abattement de 20 % si occupée par le conjoint ou un enfant)", 0, 5000000, 10000, 0) +
        ctl.choix("en", "Nombre d'enfants", [[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"]], 2) +
        ctl.curseur("dj", "Donations déjà reçues par chaque enfant dans les 15 ans", 0, 1000000, 5000, 0)) +
      groupe("Le conjoint (marié)",
        ctl.choix("cj", "Conjoint survivant et choix (enfants tous communs)", [["non", "Pas de conjoint"], ["quart", "1/4 en pleine propriété"], ["usu", "Usufruit de la totalité"]], "non") +
        ctl.curseur("ag", "Âge du conjoint (pour la valeur de l'usufruit)", 20, 100, 1, 75)) + ctl.resultat(),
    init: (z) => brancher(z, { pa: euros, rp: euros, dj: euros, ag: (x) => x + " ans" }, (v, r) => {
      const rp = Math.min(v.rp, v.pa), abRp = v.cj !== "non" ? rp * .2 : 0, masse = v.pa - abRp;
      const usu = usufruitViager(v.ag);
      const partEnfants = v.cj === "quart" ? masse * .75 : v.cj === "usu" ? masse * (1 - usu) : masse;
      const parEnfant = partEnfants / v.en;
      const D = droitsCumules(parEnfant, v.dj, 100000, BAREME_LIGNE_DIRECTE), total = D.droits * v.en;
      const reserve = v.en === 1 ? .5 : v.en === 2 ? 2 / 3 : .75;
      r.className = "simu-resultat " + (total > 0 ? "perte" : "gain");
      r.innerHTML = phrase(`Chaque enfant reçoit une part taxable de <strong>${euros(parEnfant)}</strong> et paie <strong>${euros(D.droits)}</strong>. Total des droits : <strong>${euros(total)}</strong>${v.pa ? `, soit ${pct(total / v.pa)} du patrimoine` : ""}.`) +
        (v.cj !== "non" ? `<p class="op-alerte" style="border-left-color:var(--ok)">Le conjoint est exonéré de droits de succession${v.cj === "usu" ? ` : il garde l'usage et les revenus de tout le patrimoine. À ${v.ag} ans, l'usufruit vaut ${Math.round(usu * 100)} % (barème fiscal)` : " : il reçoit 1/4 en pleine propriété"}.</p>` : "") +
        barres([{ libelle: "Reçu net / enfant", valeur: parEnfant - D.droits, couleur: "var(--ok)" }, { libelle: "Droits / enfant", valeur: D.droits, couleur: "var(--ko)" }], Math.max(parEnfant, 1)) +
        `<h4 style="margin:14px 0 6px;font-size:.95rem">Réserve héréditaire avec ${v.en} enfant${v.en > 1 ? "s" : ""}</h4>` +
        camembert(reserve, "var(--i3, var(--accent))", "var(--i1, #c7d2fe)", `Réserve des enfants : ${v.en === 1 ? "1/2" : v.en === 2 ? "2/3" : "3/4"}`, `Quotité disponible : ${v.en === 1 ? "1/2" : v.en === 2 ? "1/3" : "1/4"}`) +
        detail([
          ["Patrimoine net", euros(v.pa)],
          abRp ? ["− Abattement de 20 % sur la résidence principale occupée par le conjoint", euros(abRp), "moins"] : null,
          ["= Masse taxable", euros(masse), "total"],
          v.cj === "quart" ? ["Part des enfants : 3/4 en pleine propriété", euros(partEnfants)] : v.cj === "usu" ? [`Part des enfants : nue-propriété (${100 - Math.round(usu * 100)} % à ${v.ag} ans)`, euros(partEnfants)] : ["Part des enfants : la totalité", euros(partEnfants)],
          [`Part de chaque enfant (÷ ${v.en})`, euros(parEnfant)],
          v.dj ? ["Abattement de 100 000 € restant après les donations des 15 ans", euros(D.abattRestant), "sous"] : ["Abattement par enfant", "100 000 €", "sous"],
          ["Part taxable par enfant", euros(D.taxable)],
          ["Droits par enfant (barème de 5 % à 45 %)", euros(D.droits), "total"],
          ["= Total des droits", euros(total), "total"],
        ]);
    }),
    bases: [
      ["Abattement de 100 000 € par enfant ; le conjoint et le partenaire de PACS sont exonérés ; un abattement déjà utilisé dans les 15 ans avant le décès n'est pas disponible.", SRC.sucCalcul],
      ["Barème en ligne directe : 5 % jusqu'à 8 072 €, 10 % jusqu'à 12 109 €, 15 % jusqu'à 15 932 €, 20 % jusqu'à 552 324 €, 30 % jusqu'à 902 838 €, 40 % jusqu'à 1 805 677 €, 45 % au-delà.", SRC.sucCalcul],
      ["Donations des 15 dernières années rapportées pour le calcul ; abattement de 20 % sur la résidence principale occupée par le conjoint ou un enfant.", SRC.sucEval],
      ["Sans testament, avec des enfants tous communs : le conjoint choisit l'usufruit de la totalité ou 1/4 en pleine propriété. Réserve héréditaire : 1/2 (1 enfant), 2/3 (2 enfants), 3/4 (3 enfants ou plus). Le partenaire de PACS n'hérite que par testament.", SRC.heritage],
      ["Valeur de l'usufruit selon l'âge de l'usufruitier (article 669 du CGI).", SRC.usufruit],
    ],
    hypotheses: ["Le patrimoine est partagé à parts égales entre les enfants.", "Les donations saisies ont été reçues par chaque enfant du défunt dans les 15 ans."],
    limites: ["Assurance-vie (voir l'outil « Assurance-vie ou succession ? »).", "Testament, donation au dernier vivant, enfants non communs, petits-enfants venant en représentation.", "Frais de notaire de la succession et frais funéraires (déductibles dans la limite de 1 500 € sans justificatif)."],
  },

  // ============================================================ Donation
  donation: {
    intro: "Droits d'une donation selon le lien de parenté, avec le rappel des donations des 15 dernières années, le don familial d'argent, le don pour un logement et la donation de la seule nue-propriété.",
    html: () => groupe("La donation",
        ctl.curseur("don", "Valeur donnée (pleine propriété)", 0, 3000000, 1000, 150000) +
        choixLien("li", "enfant") +
        ctl.curseur("dj", "Donations déjà faites à cette personne dans les 15 ans (même donateur)", 0, 2000000, 1000, 0)) +
      groupe("Exonérations et forme de la donation",
        ctl.choix("ar", "Don familial d'argent : donateur de moins de 80 ans, bénéficiaire majeur (+ 31 865 €)", [[0, "Non"], [1, "Oui"]], 0) +
        ctl.choix("lo", "Don d'argent pour un logement neuf ou une rénovation énergétique, versé avant le 31/12/2026 (jusqu'à 100 000 €)", [[0, "Non"], [1, "Oui"]], 0) +
        ctl.choix("hd", "Bénéficiaire en situation de handicap (+ 159 325 €)", [[0, "Non"], [1, "Oui"]], 0) +
        ctl.choix("np", "Donner seulement la nue-propriété (le donateur garde l'usufruit)", [[0, "Non"], [1, "Oui"]], 0) +
        ctl.curseur("ag", "Âge du donateur (si nue-propriété)", 20, 100, 1, 65)) + ctl.resultat(),
    init: (z) => brancher(z, { don: euros, dj: euros, ag: (x) => x + " ans" }, (v, r) => {
      const L = LIENS[v.li], ligne = ["enfant", "petit", "arriere"].includes(v.li);
      const np = v.np === 1 ? 1 - usufruitViager(v.ag) : 1, base = v.don * np;
      const famil = v.ar === 1 && ligne ? Math.min(31865, base) : 0;
      const loge = v.lo === 1 && v.li !== "epoux" ? Math.min(100000, base - famil) : 0;
      const reste = Math.max(0, base - famil - loge);
      const abatt = L.don + (v.hd === 1 ? 159325 : 0);
      const D = droitsCumules(reste, v.dj, abatt, L.bareme);
      r.className = "simu-resultat " + (D.droits > 0 ? "neutre" : "gain");
      r.innerHTML = phrase(D.droits > 0 ? `Droits de donation estimés : <strong>${euros(D.droits)}</strong>, soit ${pct(v.don ? D.droits / v.don : 0)} de la valeur donnée. Le bénéficiaire reçoit <strong>${euros(v.don - D.droits)}</strong> net.` :
        `<strong>Aucun droit à payer</strong> : la donation reste dans les abattements et exonérations disponibles.`) +
        (v.ar === 1 && !famil ? alerte("Le don familial d'argent n'est appliqué ici qu'aux enfants, petits-enfants et arrière-petits-enfants.") : "") +
        (v.lo === 1 && v.li === "epoux" ? alerte("Le don pour un logement n'est pas appliqué au conjoint dans cet outil.") : "") +
        barres([{ libelle: "Reçu net", valeur: v.don - D.droits, couleur: "var(--ok)" }, { libelle: "Droits", valeur: D.droits, couleur: "var(--ko)" }], Math.max(v.don, 1)) +
        detail([
          ["Valeur donnée en pleine propriété", euros(v.don)],
          v.np === 1 ? [`Nue-propriété à ${v.ag} ans : ${Math.round(np * 100)} % (article 669)`, euros(base)] : null,
          famil ? ["− Don familial d'argent exonéré", euros(famil), "moins"] : null,
          loge ? ["− Don pour un logement exonéré", euros(loge), "moins"] : null,
          ["= Valeur soumise au barème", euros(reste), "total"],
          [`Abattement (${L.nom.toLowerCase()}${v.hd === 1 ? " + handicap" : ""})`, euros(abatt), "sous"],
          v.dj ? ["Déjà donné dans les 15 ans (abattement et tranches déjà utilisés)", euros(v.dj), "sous"] : null,
          ["Abattement encore disponible", euros(D.abattRestant)],
          ["Part taxable de cette donation", euros(D.taxable)],
          ["= Droits de donation", euros(D.droits), "total"],
        ]);
    }),
    bases: [
      ["Abattements : enfant 100 000 €, petit-enfant 31 865 €, arrière-petit-enfant 5 310 €, époux ou partenaire de PACS 80 724 €, frère ou sœur 15 932 €, neveu ou nièce 7 967 € ; + 159 325 € en cas de handicap.", SRC.donTarifs],
      ["Barèmes : ligne directe de 5 % à 45 % ; époux et PACS avec des tranches décalées ; frères et sœurs 35 % jusqu'à 24 430 € puis 45 % ; neveux et nièces 55 % ; autres 60 %.", SRC.donTarifs],
      ["Les donations d'un même donateur au même bénéficiaire se cumulent sur 15 ans.", SRC.donTarifs],
      ["Don familial de sommes d'argent : 31 865 €, sous conditions (donateur de moins de 80 ans, bénéficiaire majeur).", SRC.donSansDroits],
      ["Dons pour un logement neuf ou une rénovation énergétique (article 790 A bis) : jusqu'à 100 000 € par donateur, versés entre le 15 février 2025 et le 31 décembre 2026, utilisés dans les 6 mois.", SRC.donSansDroits],
      ["Nue-propriété : valeur selon l'âge de l'usufruitier (article 669 du CGI).", SRC.usufruit],
    ],
    hypotheses: ["Les donations antérieures saisies ont été faites par le même donateur au même bénéficiaire, en pleine propriété.", "Le don pour un logement est imputé avant l'abattement personnel."],
    limites: ["Réductions de droits particulières (pacte Dutreil, voir l'outil dédié).", "Conditions détaillées des exonérations (affectation des fonds, durée d'occupation du logement, plafond de 300 000 € par bénéficiaire).", "Frais de notaire de l'acte de donation."],
  },

  // ============================================================ Usufruit
  usufruit: {
    intro: "Valeur fiscale de l'usufruit et de la nue-propriété : barème de l'article 669 du CGI pour un usufruit viager, ou 23 % par période de 10 ans pour un usufruit temporaire.",
    html: () => groupe("Le bien et l'usufruit",
        ctl.curseur("val", "Valeur du bien en pleine propriété", 10000, 5000000, 10000, 400000) +
        ctl.choix("ty", "Type d'usufruit", [["viager", "Viager (à vie)"], ["temp", "Temporaire (durée fixe)"]], "viager") +
        ctl.curseur("age", "Âge de l'usufruitier", 18, 100, 1, 65) +
        ctl.curseur("du", "Durée de l'usufruit temporaire (années)", 1, 30, 1, 10)) + ctl.resultat(),
    init: (z) => brancher(z, { val: euros, age: (x) => x + " ans", du: (x) => x + " an" + (x > 1 ? "s" : "") }, (v, r) => {
      const viager = usufruitViager(v.age), periodes = Math.ceil(v.du / 10);
      const us = v.ty === "viager" ? viager : Math.min(.23 * periodes, viager);
      const np = 1 - us, dNp = droitsCumules(v.val * np, 0, 100000, BAREME_LIGNE_DIRECTE).droits, dPp = droitsCumules(v.val, 0, 100000, BAREME_LIGNE_DIRECTE).droits;
      r.className = "simu-resultat neutre";
      r.innerHTML = phrase(`Usufruit : <strong>${pct(us)}</strong>, soit ${euros(v.val * us)}. Nue-propriété : <strong>${pct(np)}</strong>, soit ${euros(v.val * np)}.`) +
        `<div style="display:flex;height:16px;border-radius:8px;overflow:hidden;margin:6px 0 10px"><span style="display:block;width:${us * 100}%;background:var(--i3, var(--accent))"></span><span style="display:block;width:${np * 100}%;background:var(--i1, #c7d2fe)"></span></div>` +
        barres([{ libelle: "Donner la pleine propriété", valeur: dPp, couleur: "var(--ko)" }, { libelle: "Donner la nue-propriété", valeur: dNp, couleur: "var(--ok)" }], Math.max(dPp, 1)) +
        note("Barres : droits d'une donation à un enfant (abattement de 100 000 €, sans donation antérieure), pour comparer.") +
        detail([
          v.ty === "viager" ? [`Âge de l'usufruitier : ${v.age} ans → barème de l'article 669`, pct(viager)] : [`Usufruit temporaire de ${v.du} ans : ${periodes} période${periodes > 1 ? "s" : ""} de 10 ans × 23 %`, pct(.23 * periodes)],
          v.ty === "temp" && .23 * periodes > viager ? ["Plafonné à la valeur de l'usufruit viager", pct(viager), "sous"] : null,
          ["Valeur de l'usufruit", euros(v.val * us), "total"],
          ["Valeur de la nue-propriété", euros(v.val * np), "total"],
          ["Droits si donation de la pleine propriété à un enfant", euros(dPp)],
          ["Droits si donation de la nue-propriété à un enfant", euros(dNp)],
          ["= Économie", euros(dPp - dNp), "total"],
        ]);
    }),
    bases: [
      ["Usufruit viager : 90 % avant 21 ans révolus, puis 10 points de moins par tranche de 10 ans (80 %, 70 %… ), 10 % à partir de 91 ans révolus.", SRC.usufruit],
      ["Usufruit à durée fixe : 23 % de la pleine propriété pour chaque période de dix ans de sa durée, sans fraction, sans dépasser la valeur de l'usufruit viager.", SRC.usufruit],
      ["Comparaison : abattement de 100 000 € par enfant et barème en ligne directe.", SRC.donTarifs],
    ],
    hypotheses: ["« Sans fraction » : toute période de dix ans commencée est comptée entière (15 ans = 2 périodes).", "Âge en années révolues au jour de la donation."],
    limites: ["Valeur économique de l'usufruit (différente de la valeur fiscale).", "Usufruit au profit d'une personne morale (limité à 30 ans, valeur maximale 69 %).", "Réunion de l'usufruit et de la nue-propriété au décès (sans droits supplémentaires dans le cas général)."],
  },

  // ============================================================ Qui possède quoi ?
  "regimes-matrimoniaux": {
    intro: "Paul et Julie : à qui appartient chaque bien, et ce que chacun récupère si l'union prend fin, selon le régime du couple.",
    html: () => groupe("Les biens du couple",
        ctl.curseur("b1", "Appartement acheté par Paul avant l'union", 0, 2000000, 5000, 200000) +
        ctl.curseur("b2", "Héritage reçu par Julie pendant l'union", 0, 2000000, 5000, 100000) +
        ctl.curseur("b3", "Résidence achetée pendant l'union, payée par les deux à parts égales", 0, 3000000, 5000, 400000) +
        ctl.curseur("b4", "Épargne constituée sur les salaires de Julie", 0, 1000000, 1000, 60000)) +
      groupe("Le régime", ctl.choix("reg", "Régime", [["legal", "Communauté légale"], ["separation", "Séparation de biens"], ["participation", "Participation aux acquêts"], ["universelle", "Communauté universelle"], ["pacs", "PACS (par défaut)"]], "legal")) + ctl.resultat(),
    init: (z) => brancher(z, { b1: euros, b2: euros, b3: euros, b4: euros }, (v, r) => {
      // propriété de chaque bien : [part Paul, part Julie, statut]
      const S = {
        legal: [[1, 0, "Propre de Paul"], [0, 1, "Propre de Julie"], [.5, .5, "Commun"], [.5, .5, "Commun (salaires)"]],
        separation: [[1, 0, "Paul"], [0, 1, "Julie"], [.5, .5, "Indivision 50/50"], [0, 1, "Julie"]],
        participation: [[1, 0, "Paul"], [0, 1, "Julie"], [.5, .5, "Indivision 50/50"], [0, 1, "Julie"]],
        universelle: [[.5, .5, "Commun"], [.5, .5, "Commun"], [.5, .5, "Commun"], [.5, .5, "Commun"]],
        pacs: [[1, 0, "Paul"], [0, 1, "Julie"], [.5, .5, "Indivision 50/50"], [0, 1, "Julie"]],
      }[v.reg];
      const vals = [v.b1, v.b2, v.b3, v.b4], noms = ["Appartement acheté par Paul avant l'union", "Héritage reçu par Julie", "Résidence achetée pendant l'union", "Épargne sur les salaires de Julie"];
      let P = 0, J = 0; S.forEach(([p, j], i) => { P += vals[i] * p; J += vals[i] * j; });
      let creance = 0;
      if (v.reg === "participation") { creance = v.b4 / 2; P += creance; J -= creance; }   // enrichissement de Julie (épargne) − celui de Paul (0), partagé par moitié
      r.className = "simu-resultat neutre";
      r.innerHTML = `<div class="qui-quoi">${noms.map((n, i) => `<div class="qq-ligne"><span>${n} : ${euros(vals[i])}</span><span class="qq-tag qq-${S[i][0] === 1 ? "p" : S[i][1] === 1 ? "j" : "c"}">${S[i][2]}</span></div>`).join("")}</div>` +
        barres([{ libelle: "Paul", valeur: P, couleur: "#2c6e91" }, { libelle: "Julie", valeur: J, couleur: "#e0723b" }], Math.max(P, J, 1)) +
        phrase(`Si l'union prend fin : Paul repart avec <strong>${euros(P)}</strong>, Julie avec <strong>${euros(J)}</strong>.`) +
        (v.reg === "participation" ? note(`Participation aux acquêts : Julie s'est enrichie de ${euros(v.b4)} (épargne), Paul de 0 € : Paul reçoit une créance de participation de la moitié de la différence, ${euros(creance)}.`) : "") +
        (v.reg === "universelle" ? note("Avec une clause d'attribution intégrale au survivant, tout revient au conjoint survivant au premier décès.") : "") +
        (v.reg === "pacs" ? note("Le partenaire de PACS n'est pas héritier : sans testament, il ne reçoit rien au décès (il est exonéré de droits s'il est légataire).") : "");
    }),
    bases: [
      ["Communauté légale : sont propres les biens possédés avant le mariage et ceux reçus par donation ou succession ; sont communs les biens acquis pendant le mariage et les revenus du travail ; partage par moitié à la dissolution.", SRC.communaute],
      ["Séparation de biens : chacun conserve ses biens personnels. Participation aux acquêts : fonctionne comme une séparation, puis l'enrichissement de chacun est partagé à la dissolution (créance de participation). Communauté universelle : tous les biens présents et à venir sont communs ; clause d'attribution intégrale possible.", SRC.contratMariage],
      ["PACS : séparation des patrimoines par défaut ; un bien dont on ne prouve pas la propriété est présumé à moitié chacun ; le partenaire n'hérite que par testament.", SRC.pacs],
    ],
    hypotheses: ["La résidence achetée à deux est financée à parts égales (indivision 50/50 hors communauté).", "Participation : seule l'épargne de Julie constitue un enrichissement pendant l'union ; créance égale à la moitié de la différence des enrichissements."],
    limites: ["Récompenses, reprises et dettes lors de la liquidation.", "Clauses particulières du contrat de mariage ou de la convention de PACS (indivision choisie).", "Droits du conjoint survivant dans la succession (voir l'outil « Droits de succession »)."],
  },

  // ============================================================ Assurance-vie ou succession
  "assurance-vie-transmission": {
    intro: "Ce que paie un bénéficiaire au décès selon que le capital passe par l'assurance-vie ou par la succession, avec les primes versées avant et après 70 ans.",
    html: () => groupe("Le contrat",
        ctl.curseur("av", "Capital transmis issu des primes versées avant 70 ans", 0, 3000000, 5000, 400000) +
        ctl.curseur("ap", "Primes versées après 70 ans pour ce bénéficiaire", 0, 1000000, 5000, 0) +
        ctl.choix("nb", "Bénéficiaires non exonérés qui partagent l'abattement de 30 500 €", [[1, "1"], [2, "2"], [3, "3"], [4, "4"]], 1)) +
      groupe("Le bénéficiaire", choixLien("li", "enfant")) + ctl.resultat(),
    init: (z) => brancher(z, { av: euros, ap: euros }, (v, r) => {
      const L = LIENS[v.li], ex = v.li === "epoux";
      const t = Math.max(0, v.av - 152500), pr990 = ex ? 0 : Math.min(t, 700000) * .20 + Math.max(0, t - 700000) * .3125;
      const ab757 = 30500 / v.nb, base757 = Math.max(0, v.ap - ab757);
      const d757 = ex ? 0 : droitsCumules(base757, 0, L.suc, L.bareme).droits;
      const totalAv = pr990 + d757, capital = v.av + v.ap;
      const dSuc = ex ? 0 : droitsCumules(capital, 0, L.suc, L.bareme).droits;
      r.className = "simu-resultat " + (totalAv < dSuc ? "gain" : "neutre");
      r.innerHTML = phrase(ex ? "<strong>Aucun impôt</strong> : le conjoint et le partenaire de PACS sont exonérés, par l'assurance-vie comme par la succession." :
        `Par l'assurance-vie, ce bénéficiaire paie <strong>${euros(totalAv)}</strong> ; par la succession, il paierait <strong>${euros(dSuc)}</strong>${dSuc > totalAv ? `, soit <strong>${euros(dSuc - totalAv)}</strong> d'économie` : ""}.`) +
        barres([{ libelle: "Assurance-vie", valeur: totalAv, couleur: "var(--ok)" }, { libelle: "Succession", valeur: dSuc, couleur: "var(--ko)" }], Math.max(totalAv, dSuc, 1)) +
        detail([
          ["Primes versées avant 70 ans : capital transmis", euros(v.av)],
          ["− Abattement de 152 500 € par bénéficiaire", euros(Math.min(v.av, 152500)), "moins"],
          [`Prélèvement : 20 % jusqu'à 700 000 €, 31,25 % au-delà`, euros(pr990), "total"],
          v.ap ? ["Primes versées après 70 ans", euros(v.ap)] : null,
          v.ap ? [`− Part de l'abattement global de 30 500 € (÷ ${v.nb})`, euros(Math.min(v.ap, ab757)), "moins"] : null,
          v.ap ? [`Droits de succession sur le reste (abattement ${L.nom.toLowerCase()} : ${euros(L.suc)})`, euros(d757), "total"] : null,
          ["= Total par l'assurance-vie", euros(totalAv), "total"],
          [`Par la succession : ${euros(capital)} − abattement de ${euros(Math.min(L.suc, capital))}, barème ${L.nom.toLowerCase()}`, euros(dSuc), "total"],
        ]);
    }),
    bases: [
      ["Primes versées avant 70 ans : abattement de 152 500 € par bénéficiaire, puis prélèvement de 20 % jusqu'à 700 000 € et 31,25 % au-delà.", SRC.avDeces],
      ["Primes versées après 70 ans : droits de succession sur la fraction des primes qui dépasse 30 500 €, abattement global réparti entre les bénéficiaires non exonérés.", SRC.avDeces],
      ["Conjoint et partenaire de PACS exonérés.", SRC.avDeces],
      ["Succession : abattements (enfant 100 000 €, frère ou sœur 15 932 €, neveu ou nièce 7 967 €, autre 1 594 €) et barèmes selon le lien.", SRC.sucCalcul],
    ],
    hypotheses: ["L'abattement personnel de succession du bénéficiaire n'est utilisé par rien d'autre (aucun autre bien reçu, aucune donation dans les 15 ans).", "Contrat souscrit après le 20/11/1991, primes versées après le 13/10/1998."],
    limites: ["Gains produits par les primes versées après 70 ans (non pris en compte ici).", "Contrats anciens, démembrement de la clause bénéficiaire, bénéficiaires multiples sur les primes avant 70 ans.", "Exonération des frères et sœurs sous conditions."],
  },

  // ============================================================ Retrait d'assurance-vie
  "assurance-vie-retrait": {
    intro: "Impôt et prélèvements sur un retrait partiel : la part de gains du retrait est calculée comme le prévoit le BOFiP, puis imposée selon l'âge du contrat.",
    html: () => groupe("Le contrat",
        ctl.curseur("va", "Valeur du contrat avant le retrait", 1000, 3000000, 1000, 120000) +
        ctl.curseur("pr", "Primes versées (non encore remboursées)", 0, 3000000, 1000, 90000) +
        ctl.curseur("re", "Montant du retrait", 0, 3000000, 500, 20000) +
        ctl.choix("ag", "Âge du contrat", [["moins", "Moins de 8 ans"], ["plus", "8 ans ou plus"]], "plus")) +
      groupe("Le foyer",
        ctl.choix("fo", "Foyer", [[4600, "Personne seule"], [9200, "Couple"]], 4600) +
        ctl.choix("pl", "Primes versées sur tous les contrats de la personne", [["sous", "150 000 € ou moins"], ["sur", "Plus de 150 000 €"]], "sous")) + ctl.resultat(),
    init: (z) => brancher(z, { va: euros, pr: euros, re: euros }, (v, r) => {
      const re = Math.min(v.re, v.va), primesRemb = v.pr * re / v.va, gains = Math.max(0, re - primesRemb);
      const ps = gains * .172;
      let ir = null, txt;
      if (v.ag === "moins") { ir = gains * .128; txt = "12,8 % (contrat de moins de 8 ans)"; }
      else if (v.pl === "sous") { ir = Math.max(0, gains - v.fo) * .075; txt = `7,5 % après l'abattement de ${euros(v.fo)}`; }
      r.className = "simu-resultat " + (ir === 0 ? "gain" : "neutre");
      r.innerHTML = phrase(`Sur un retrait de ${euros(re)}, <strong>${euros(gains)}</strong> sont des gains. ` + (ir === null ? "Prélèvements sociaux : " + `<strong>${euros(ps)}</strong>.` : `Impôt : <strong>${euros(ir)}</strong> · prélèvements sociaux : <strong>${euros(ps)}</strong>. Vous récupérez <strong>${euros(re - ir - ps)}</strong> net.`)) +
        (ir === null ? alerte("Plus de 150 000 € de primes : une partie des gains est imposée à 12,8 % au lieu de 7,5 %. Ce partage n'est pas calculé ici.") : "") +
        barres([{ libelle: "Capital remboursé", valeur: primesRemb, couleur: "var(--i3, var(--accent))" }, { libelle: "Gains", valeur: gains, couleur: "var(--ok)" }, { libelle: "Impôt + PS", valeur: (ir || 0) + ps, couleur: "var(--ko)" }], Math.max(re, 1)) +
        detail([
          ["Retrait", euros(re)],
          [`Primes remboursées : ${euros(v.pr)} × ${euros(re)} ÷ ${euros(v.va)}`, euros(primesRemb), "moins"],
          ["= Gains compris dans le retrait", euros(gains), "total"],
          ir !== null ? [`Impôt sur le revenu : ${txt}`, euros(ir)] : ["Impôt sur le revenu", "non calculé (plus de 150 000 €)", "sous"],
          ["Prélèvements sociaux : 17,2 %", euros(ps)],
          ir !== null ? ["= Net perçu", euros(re - ir - ps), "total"] : null,
        ]);
    }),
    bases: [
      ["Produit d'un rachat partiel = montant du rachat − primes versées × (montant du rachat ÷ valeur de rachat totale).", SRC.avProduits],
      ["Contrat de moins de 8 ans : 12,8 % (ou barème sur option). Contrat de 8 ans ou plus : abattement annuel de 4 600 € (personne seule) ou 9 200 € (couple), puis 7,5 % pour les primes jusqu'à 150 000 € et 12,8 % au-delà.", SRC.avRachat],
      ["Prélèvements sociaux de 17,2 % sur les gains d'assurance-vie.", SRC.avRachat],
    ],
    hypotheses: ["Primes versées depuis le 27/09/2017.", "L'abattement de 4 600 € / 9 200 € n'a pas déjà été utilisé dans l'année."],
    limites: ["Prélèvements sociaux déjà payés chaque année sur le fonds en euros (non dus une seconde fois).", "Partage des gains entre 7,5 % et 12,8 % au-delà de 150 000 € de primes ; option pour le barème.", "Primes versées avant 2017 et contrats anciens."],
  },

  // ============================================================ PER
  per: {
    intro: "Économie d'impôt d'un versement sur un PER individuel : plafond de déduction 2026, report des plafonds non utilisés et impôt réel du foyer avant et après le versement.",
    html: () => groupe("Le foyer",
        ctl.choix("couple", "Situation", [[0, "Personne seule"], [1, "Couple marié ou pacsé"]], 1) +
        ctl.choix("enf", "Enfants à charge", [[0, "0"], [1, "1"], [2, "2"], [3, "3"]], 0) +
        ctl.curseur("rni", "Revenu net imposable du foyer (avant le versement)", 0, 600000, 1000, 80000)) +
      groupe("Le versement",
        ctl.curseur("rev", "Revenus d'activité 2025 du titulaire (nets de frais professionnels)", 0, 500000, 1000, 50000) +
        ctl.curseur("rep", "Plafonds non utilisés des années précédentes (avis d'impôt)", 0, 200000, 100, 0) +
        ctl.curseur("ver", "Versement sur le PER en 2026", 0, 200000, 500, 5000) +
        ctl.choix("age", "Âge au moment du versement", [["moins", "Moins de 70 ans"], ["plus", "70 ans ou plus"]], "moins")) + ctl.resultat(),
    init: (z) => brancher(z, { rni: euros, rev: euros, rep: euros, ver: euros }, (v, r) => {
      const plafAnnee = Math.min(37680, Math.max(4710, v.rev * .10)), plafond = plafAnnee + v.rep;
      const deduit = v.age === "plus" ? 0 : Math.min(v.ver, plafond, v.rni);
      const avant = impotRevenu(v.rni, v.couple === 1, v.enf, false), apres = impotRevenu(v.rni - deduit, v.couple === 1, v.enf, false);
      const eco = avant.net - apres.net;
      r.className = "simu-resultat " + (eco > 0 ? "gain" : "neutre");
      r.innerHTML = phrase(v.age === "plus" ? "<strong>Pas de déduction</strong> : depuis le 1er janvier 2026, les versements faits à partir de 70 ans restent possibles mais ne sont plus déductibles." :
        `Ce versement de ${euros(v.ver)} fait baisser l'impôt du foyer de <strong>${euros(eco)}</strong> : l'effort réel est de <strong>${euros(v.ver - eco)}</strong>.`) +
        (v.ver > plafond && v.age !== "plus" ? alerte(`Le versement dépasse le plafond disponible (${euros(plafond)}) : ${euros(v.ver - plafond)} ne sont pas déductibles.`) : "") +
        barres([{ libelle: "Versement", valeur: v.ver, couleur: "var(--i3, var(--accent))" }, { libelle: "Économie d'impôt", valeur: eco, couleur: "var(--ok)" }, { libelle: "Effort réel", valeur: v.ver - eco, couleur: "var(--accent)" }], Math.max(v.ver, 1)) +
        detail([
          ["Plafond 2026 : 10 % des revenus d'activité 2025 (entre 4 710 € et 37 680 €)", euros(plafAnnee)],
          v.rep ? ["+ Plafonds non utilisés reportés", euros(v.rep)] : null,
          ["= Plafond disponible", euros(plafond), "total"],
          ["Montant déduit", euros(deduit)],
          [`Impôt du foyer avant → après (tranche ${Math.round(avant.tmi * 100)} %)`, `${euros(avant.net)} → ${euros(apres.net)}`],
          ["= Économie d'impôt", euros(eco), "total"],
          ["Effort réel (versement − économie)", euros(v.ver - eco), "total"],
        ]);
    }),
    bases: [
      ["Plafond 2026 pour un salarié : 10 % des revenus d'activité de 2025 nets de frais professionnels, au plus 37 680 €, au moins 4 710 € ; plafond personnalisé sur l'avis d'impôt.", SRC.per],
      ["Report des plafonds non utilisés : 5 ans à partir des sommes de 2026 (3 ans pour les parts de 2024 et 2025) ; mutualisation possible entre conjoints.", SRC.per2026],
      ["Depuis le 1er janvier 2026, les versements faits après 70 ans ne sont plus déductibles.", SRC.per],
      ["À la sortie en capital, la part des versements déduits est imposée au barème ; les gains supportent le prélèvement forfaitaire (12,8 % + 18,6 %).", SRC.per],
      ["Impôt du foyer calculé avec le barème 2026, le quotient familial et la décote.", SRC.bareme],
    ],
    hypotheses: ["Le titulaire est salarié (règles particulières pour les indépendants).", "Le plafond n'est pas déjà réduit par des cotisations de retraite supplémentaire obligatoires ou certains abondements de l'employeur."],
    limites: ["Mutualisation du plafond avec le conjoint (à ajouter au plafond reporté si elle est utilisée).", "Travailleurs non salariés (plafond « Madelin »).", "Imposition à la sortie (estimation dépendant de la situation future)."],
  },

  // ============================================================ PEA ou compte-titres
  pea: {
    intro: "Ce que coûtent les gains au retrait selon l'âge du PEA, comparé à un compte-titres, avec les plafonds de versement.",
    html: () => groupe("Le plan",
        ctl.curseur("g", "Gains compris dans le retrait", 0, 500000, 500, 20000) +
        ctl.choix("age", "Âge du PEA au moment du retrait", [["moins", "Moins de 5 ans"], ["plus", "5 ans ou plus"]], "plus") +
        ctl.curseur("vs", "Versements faits sur le PEA (pour vérifier le plafond)", 0, 300000, 1000, 80000)) + ctl.resultat(),
    init: (z) => brancher(z, { g: euros, vs: euros }, (v, r) => {
      const irPea = v.age === "plus" ? 0 : v.g * .128, psPea = v.g * .186, cto = v.g * .314;
      r.className = "simu-resultat " + (v.age === "plus" ? "gain" : "neutre");
      r.innerHTML = phrase(v.age === "plus" ? `Après 5 ans, seuls les prélèvements sociaux sont dus : <strong>${euros(psPea)}</strong>, au lieu de ${euros(cto)} sur un compte-titres, soit <strong>${euros(cto - psPea)}</strong> d'économie.` :
        `Avant 5 ans, le retrait coûte <strong>${euros(irPea + psPea)}</strong>, comme sur un compte-titres, et ferme en principe le plan.`) +
        (v.vs > 150000 ? alerte("Les versements sur un PEA classique sont plafonnés à 150 000 € (225 000 € au total avec un PEA-PME-ETI).") : "") +
        barres([{ libelle: "PEA", valeur: irPea + psPea, couleur: "var(--ok)" }, { libelle: "Compte-titres", valeur: cto, couleur: "var(--ko)" }], Math.max(cto, 1)) +
        detail([
          ["Gains", euros(v.g)],
          [`PEA : impôt sur le revenu ${v.age === "plus" ? "(exonéré après 5 ans)" : "12,8 %"}`, euros(irPea)],
          ["PEA : prélèvements sociaux 18,6 %", euros(psPea)],
          ["= Coût sur le PEA", euros(irPea + psPea), "total"],
          ["Compte-titres : prélèvement forfaitaire unique 31,4 % (12,8 % + 18,6 %)", euros(cto), "total"],
        ]);
    }),
    bases: [
      ["Retrait avant 5 ans : 12,8 % d'impôt et 18,6 % de prélèvements sociaux (ou barème sur option). Après 5 ans : gains exonérés d'impôt, prélèvements sociaux de 18,6 %.", SRC.pea],
      ["Plafonds : 150 000 € pour le PEA, 225 000 € au total avec le PEA-PME-ETI. Avant 5 ans, un retrait entraîne en principe la clôture (sauf exceptions) ; après 5 ans, un retrait partiel ne ferme pas le plan.", SRC.peaSp],
      ["Compte-titres : prélèvement forfaitaire unique de 12,8 % et prélèvements sociaux de 18,6 %.", SRC.placements],
    ],
    hypotheses: ["Les gains saisis sont ceux compris dans le retrait.", "Pas d'option pour le barème."],
    limites: ["Exceptions de retrait avant 5 ans sans clôture (licenciement, invalidité, création d'entreprise…).", "Taux historiques des prélèvements sociaux pour les gains anciens.", "Compte-titres : option pour le barème et abattement de 40 % sur les dividendes (voir l'outil Dividendes)."],
  },

  // ============================================================ PEE
  pee: {
    intro: "Ce que verse l'employeur sur le plan d'épargne entreprise et le versement qui permet d'obtenir le maximum, dans les plafonds 2026.",
    html: () => groupe("Les versements",
        ctl.curseur("rem", "Rémunération annuelle brute", 10000, 500000, 1000, 45000) +
        ctl.curseur("ve", "Votre versement volontaire sur le PEE", 0, 125000, 50, 1000) +
        ctl.choix("ta", "Taux d'abondement prévu par le règlement du plan", [[50, "50 %"], [100, "100 %"], [200, "200 %"], [300, "300 %"]], 100) +
        ctl.choix("ti", "Investi en titres de l'entreprise ?", [[0, "Non"], [1, "Oui"]], 0)) + ctl.resultat(),
    init: (z) => brancher(z, { rem: euros, ve: euros }, (v, r) => {
      const plafond = v.ti === 1 ? 6920.64 : 3844.80, maxVers = v.rem * .25, ve = Math.min(v.ve, maxVers);
      const ab = Math.min(ve * v.ta / 100, ve * 3, plafond), optimal = plafond / Math.min(v.ta / 100, 3);
      r.className = "simu-resultat gain";
      r.innerHTML = phrase(`L'employeur verse <strong>${deuxDec(ab)}</strong> : avec votre versement, <strong>${deuxDec(ve + ab)}</strong> sont placés.${ab >= plafond - .01 ? " Vous touchez le maximum." : ` Pour toucher le maximum, versez ${deuxDec(optimal)}.`}`) +
        (v.ve > maxVers ? alerte(`Les versements volontaires sont limités à 25 % de la rémunération annuelle brute, soit ${euros(maxVers)} : calcul fait sur ce montant.`) : "") +
        barres([{ libelle: "Votre versement", valeur: ve, couleur: "var(--i3, var(--accent))" }, { libelle: "Abondement", valeur: ab, couleur: "var(--ok)" }], Math.max(ve, ab, 1)) +
        detail([
          ["Versement retenu (au plus 25 % de la rémunération)", deuxDec(ve)],
          [`Abondement théorique : ${v.ta} % du versement`, deuxDec(ve * v.ta / 100)],
          ["Limite : 3 fois le versement", deuxDec(ve * 3), "sous"],
          [`Plafond annuel ${v.ti === 1 ? "(titres de l'entreprise)" : ""}`, deuxDec(plafond), "sous"],
          ["= Abondement", deuxDec(ab), "total"],
          ["Versement pour obtenir le maximum", deuxDec(optimal)],
        ]);
    }),
    bases: [
      ["Versements volontaires limités à 25 % de la rémunération annuelle brute.", SRC.pee],
      ["Abondement limité à 3 fois le versement du salarié et à 3 844,80 € par an (6 920,64 € si investi en titres de l'entreprise).", SRC.pee],
      ["Abondement exonéré d'impôt sur le revenu dans ces plafonds, mais soumis à la CSG et à la CRDS.", SRC.pee],
    ],
    hypotheses: ["Le taux d'abondement est celui du règlement du plan, sans tranches."],
    limites: ["CSG et CRDS sur l'abondement (montant non calculé).", "Intéressement et participation placés sur le plan.", "Abondement sur le PER collectif (plafond distinct)."],
  },

  // ============================================================ Autocall
  autocall: {
    intro: "Exemple fictif pour comprendre le mécanisme d'un autocall : chaque année, on regarde l'indice ; s'il est au-dessus de son niveau de départ, le produit s'arrête et verse les coupons accumulés. À l'échéance, une barrière protège le capital jusqu'à un certain niveau de baisse.",
    html: () => groupe("Les caractéristiques (fictives)",
        ctl.curseur("cp", "Coupon par année écoulée", 0, 15, .5, 6) +
        ctl.curseur("ba", "Barrière de protection du capital à l'échéance (baisse maximale)", 0, 70, 5, 40) +
        ctl.choix("du", "Durée maximale", [[4, "4 ans"], [6, "6 ans"], [8, "8 ans"], [10, "10 ans"]], 8)) +
      groupe("Le parcours de l'indice (évolution depuis le départ, à chaque date anniversaire)",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => ctl.curseur("a" + a, `Année ${a}`, -80, 60, 1, a <= 2 ? -8 : a <= 4 ? -3 : 4)).join("")) + ctl.resultat(),
    init: (z) => brancher(z, { cp: (x) => fr2(x) + " %", ba: (x) => "−" + x + " %", ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => ["a" + a, (x) => (x > 0 ? "+" : "") + x + " %"])) }, (v, r) => {
      const lignes = []; let fin = null;
      for (let a = 1; a <= v.du; a++) {
        const p = v["a" + a];
        if (p >= 0) { fin = { a, txt: `Remboursement anticipé en année ${a} : 100 % du capital + ${fr2(v.cp * a)} % de gains (${a} × ${fr2(v.cp)} %).`, res: 100 + v.cp * a, cls: "gain" }; lignes.push([`Année ${a} : indice ${p > 0 ? "+" : ""}${p} %`, "au-dessus du départ → arrêt", "total"]); break; }
        lignes.push([`Année ${a} : indice ${p} %`, a < v.du ? "sous le départ → on continue" : "échéance"]);
        if (a === v.du) fin = p >= -v.ba ? { a, txt: `Échéance : l'indice a baissé de ${-p} %, sans franchir la barrière de −${v.ba} %. Capital récupéré : 100 %, sans gain.`, res: 100, cls: "neutre" } :
          { a, txt: `Échéance : l'indice a baissé de ${-p} %, au-delà de la barrière de −${v.ba} %. Capital récupéré : ${100 + p} %, soit une perte de ${-p} %.`, res: 100 + p, cls: "perte" };
      }
      r.className = "simu-resultat " + fin.cls;
      r.innerHTML = phrase(fin.txt) + barres([{ libelle: "Capital investi", valeur: 100, texte: "100 %", couleur: "var(--i3, var(--accent))" }, { libelle: "Récupéré", valeur: fin.res, texte: fr2(fin.res) + " %", couleur: fin.res >= 100 ? "var(--ok)" : "var(--ko)" }], Math.max(100, fin.res)) +
        detail([...lignes, ["Durée effective", fin.a + " an" + (fin.a > 1 ? "s" : "")], ["Montant récupéré (en % du capital)", fr2(fin.res) + " %", "total"]], "Le déroulé, année par année");
    }),
    bases: [
      ["Mécanisme général des produits structurés (remboursement anticipé, coupons, barrière, risque de perte en capital) : présentation de l'AMF. Les chiffres de cet outil sont fictifs et ne décrivent aucun produit réel.", SRC.structures],
    ],
    hypotheses: ["Seuil de remboursement anticipé : niveau de départ de l'indice, chaque année.", "Coupon « à mémoire » : versé pour chaque année écoulée au moment du remboursement.", "Barrière observée uniquement à l'échéance."],
    limites: ["Frais, fiscalité de l'enveloppe (compte-titres, assurance-vie…) et dividendes non perçus de l'indice.", "Risque de défaut de la banque émettrice.", "Clauses propres à chaque produit (seuil dégressif, barrière de coupon, observation quotidienne) : lire le document d'informations clés."],
  },

  // ============================================================ Apport-cession
  "apport-cession": {
    intro: "Quand la holding revend dans les 3 ans les titres apportés, le report d'imposition n'est maintenu que si elle réinvestit une part du prix. Règles applicables aux cessions depuis le 21 février 2026.",
    html: () => groupe("L'opération",
        ctl.curseur("prix", "Prix de cession des titres par la holding", 50000, 50000000, 50000, 2000000) +
        ctl.curseur("ans", "Délai entre l'apport et la cession (années)", 0, 6, .25, 1.5) +
        ctl.curseur("re", "Réinvestissement éligible prévu", 0, 50000000, 10000, 1000000)) + ctl.resultat(),
    init: (z) => brancher(z, { prix: euros, ans: (x) => fr2(x) + " an" + (x > 1 ? "s" : ""), re: euros }, (v, r) => {
      if (v.ans >= 3) { r.className = "simu-resultat gain"; r.innerHTML = phrase("<strong>Pas d'obligation de réinvestir</strong> : la cession intervient au moins 3 ans après l'apport, le report d'imposition est maintenu.") + detail([["Délai apport → cession", fr2(v.ans) + " ans"], ["Seuil de 3 ans (de date à date)", "atteint", "total"]]); return; }
      const min = v.prix * .70, ok = v.re >= min;
      r.className = "simu-resultat " + (ok ? "gain" : "perte");
      r.innerHTML = phrase(`Cession dans les 3 ans : la holding doit réinvestir au moins <strong>${euros(min)}</strong> (70 % du prix) dans les 3 ans. ${ok ? "Le réinvestissement prévu suffit." : `Il manque <strong>${euros(min - v.re)}</strong> : sinon, le report prend fin.`}`) +
        camembert(.7, "var(--i3, var(--accent))", "var(--i1, #c7d2fe)", `À réinvestir : ${euros(min)}`, `Libre : ${euros(v.prix - min)}`) +
        detail([
          ["Prix de cession", euros(v.prix)],
          ["Réinvestissement minimal : 70 %", euros(min), "total"],
          ["Réinvestissement prévu", euros(v.re)],
          [ok ? "Écart" : "Manque", euros(Math.abs(v.re - min)), ok ? "sous" : "total"],
          ["Délai pour réinvestir", "3 ans après la cession"],
          ["Conservation des biens acquis en direct", "5 ans"],
        ]);
    }),
    bases: [
      ["Le report prend fin si la société cède les titres apportés dans les trois ans de l'apport (de date à date), sauf réinvestissement dans les conditions prévues.", SRC.apport],
      ["Loi de finances 2026 (cessions depuis le 21 février 2026) : réinvestissement d'au moins 70 % (au lieu de 60 %), dans un délai de 3 ans (au lieu de 2) ; conservation des biens acquis en direct pendant 5 ans (au lieu de 1) ; champ des activités éligibles resserré.", SRC.apport2026],
    ],
    hypotheses: ["L'apporteur contrôle la holding et l'apport relève de l'article 150-0 B ter du CGI.", "Le réinvestissement saisi porte sur des activités éligibles."],
    limites: ["Liste détaillée des activités éligibles et des investissements dans des fonds.", "Calcul de la plus-value en report et de l'impôt dû si le report prend fin.", "Donation des titres reçus en échange (délais de 6 et 11 ans)."],
  },

  // ============================================================ Pacte Dutreil
  "pacte-dutreil": {
    intro: "Droits d'une donation de titres d'entreprise aux enfants, avec et sans pacte Dutreil : exonération de 75 % de la valeur et réduction de 50 % si le donateur a moins de 70 ans.",
    html: () => groupe("La donation",
        ctl.curseur("val", "Valeur des titres donnés (pleine propriété)", 100000, 50000000, 50000, 3000000) +
        ctl.choix("n", "Nombre d'enfants (parts égales)", [[1, "1"], [2, "2"], [3, "3"], [4, "4"]], 2) +
        ctl.curseur("dj", "Donations déjà reçues par chaque enfant dans les 15 ans", 0, 2000000, 5000, 0) +
        ctl.choix("age", "Âge du donateur", [["moins", "Moins de 70 ans"], ["plus", "70 ans ou plus"]], "moins")) + ctl.resultat(),
    init: (z) => brancher(z, { val: euros, dj: euros }, (v, r) => {
      const part = v.val / v.n;
      const sans = droitsCumules(part, v.dj, 100000, BAREME_LIGNE_DIRECTE).droits;
      const avecBrut = droitsCumules(part * .25, v.dj, 100000, BAREME_LIGNE_DIRECTE).droits, red = v.age === "moins" ? avecBrut * .5 : 0, avec = avecBrut - red;
      r.className = "simu-resultat gain";
      r.innerHTML = phrase(`Avec le pacte, chaque enfant paie <strong>${euros(avec)}</strong> au lieu de ${euros(sans)}. Économie totale : <strong>${euros((sans - avec) * v.n)}</strong>.`) +
        barres([{ libelle: "Sans pacte", valeur: sans * v.n, couleur: "var(--ko)" }, { libelle: "Avec pacte", valeur: avec * v.n, couleur: "var(--ok)" }], Math.max(sans * v.n, 1)) +
        detail([
          [`Part de chaque enfant (÷ ${v.n})`, euros(part)],
          ["Sans pacte : droits par enfant (abattement de 100 000 €, barème)", euros(sans)],
          ["Avec pacte : 75 % exonérés → base", euros(part * .25)],
          ["Droits sur cette base", euros(avecBrut)],
          red ? ["− Réduction de 50 % (donateur de moins de 70 ans, pleine propriété)", euros(red), "moins"] : null,
          ["= Droits par enfant avec pacte", euros(avec), "total"],
          ["Engagement collectif de conservation", "2 ans au moins"],
          ["Engagement individuel (transmissions depuis le 21/02/2026)", "6 ans"],
        ]);
    }),
    bases: [
      ["Exonération à concurrence de 75 % de la valeur des titres ; engagement collectif de conservation d'au moins deux ans en cours au jour de la transmission (article 787 B du CGI).", SRC.dutreil],
      ["Réduction de droits de 50 % pour une donation en pleine propriété lorsque le donateur a moins de 70 ans (article 790 du CGI), cumulable sous conditions.", SRC.dutreil],
      ["Loi de finances 2026 : engagement individuel porté de quatre à six ans ; biens somptuaires non affectés à l'activité opérationnelle exclus de l'exonération (transmissions depuis le 21 février 2026).", SRC.dutreil2026],
      ["Abattement de 100 000 € par enfant et barème en ligne directe, avec rappel des donations des 15 ans.", SRC.donTarifs],
    ],
    hypotheses: ["Toutes les conditions du pacte sont remplies (activité éligible, fonctions de direction, engagements).", "La valeur saisie ne comprend pas de biens somptuaires."],
    limites: ["Transmission par décès (même exonération, sans réduction de 50 %).", "Donation avec réserve d'usufruit et prise en charge des droits par le donateur.", "Paiement différé et fractionné des droits."],
  },
});
