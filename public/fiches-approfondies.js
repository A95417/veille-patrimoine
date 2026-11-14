// version 1.6 — Contenu approfondi des fiches « Apprendre ».
// Chaque règle renvoie à sa source officielle (s: [nom, url]). Rien n'est ajouté sans source.
// Lot 1 : donations, succession, démembrement, régimes matrimoniaux (vérifié le 14 novembre 2026).

const SRC = {
  spDonation: ["Service-public · Droits de donation", "https://www.service-public.gouv.fr/particuliers/vosdroits/F14205"],
  spDonArgent: ["Service-public · Don d'argent", "https://www.service-public.gouv.fr/particuliers/vosdroits/F36656"],
  donManuel: ["impots.gouv.fr · Don manuel", "https://www.impots.gouv.fr/portail/particulier/don-manuel"],
  donNotaire: ["impots.gouv.fr · Donations par acte notarié", "https://www.impots.gouv.fr/particulier/donations-par-acte-notarie"],
  spDeclSucc: ["Service-public · Déclaration de succession", "https://www.service-public.gouv.fr/particuliers/vosdroits/F80"],
  payerSucc: ["impots.gouv.fr · Payer les droits de succession", "https://www.impots.gouv.fr/particulier/questions/comment-puis-je-payer-les-droits-de-succession"],
  calculSucc: ["impots.gouv.fr · Calculer les droits de succession", "https://www.impots.gouv.fr/particulier/questions/comment-dois-je-calculer-les-droits-de-succession"],
  cgi764: ["Légifrance · CGI art. 764 à 775", "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006197324"],
  ccConjoint: ["Légifrance · Code civil art. 756 à 767", "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000006150139/"],
  cgi751: ["Légifrance · CGI art. 751", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000027517865"],
  bofipUsufruit: ["BOFiP · Usufruit temporaire", "https://bofip.impots.gouv.fr/bofip/2323-PGP.html/identifiant=BOI-ENR-DMTG-10-40-10-50-20131223"],
  cgi669: ["Légifrance · CGI art. 669", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006310173/"],
  bofipIfi: ["BOFiP · IFI et biens démembrés", "https://bofip.impots.gouv.fr/export/pdf/12307"],
  bofip990: ["BOFiP · Art. 990 I et démembrement", "https://bofip.impots.gouv.fr/bofip/1335-PGP.html/identifiant=BOI-TCAS-AUT-60-20230330"],
  cc1397: ["Légifrance · Code civil art. 1397", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038584427"],
  ccCommu: ["Légifrance · Code civil art. 1400 à 1527", "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006136354"],
  cc215: ["Légifrance · Code civil art. 215", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006422766"],
  cc220: ["Légifrance · Code civil art. 220", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000028748098"],
  ccPartic: ["Légifrance · Code civil art. 1569 à 1581", "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006136376/"],
};

const APPROFONDI = {
  // ------------------------------------------------------------------ DONATIONS
  donations: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Les abattements qu'on oublie", icone: "🎁",
        points: [
          { t: "Un enfant qui donne à son père ou à sa mère bénéficie aussi d'un abattement de 100 000 € (donation à un ascendant).", s: SRC.spDonation },
          { t: "Entre époux ou partenaires de PACS, le barème est différent de la ligne directe : 5 % jusqu'à 8 072 €, 10 % jusqu'à 15 932 €, 15 % jusqu'à 31 865 €, 20 % jusqu'à 552 324 €, puis 30 %, 40 % et 45 %.", s: SRC.spDonation },
          { t: "Neveu ou nièce : 55 % au-delà de l'abattement. Autres parents jusqu'au 4e degré : 55 %. Au-delà du 4e degré ou sans lien de parenté : 60 %.", s: SRC.spDonation },
        ],
      },
      {
        titre: "Le don d'argent en détail", icone: "💶",
        points: [
          { t: "31 865 € par donateur et par bénéficiaire, sans droits : donateur de moins de 80 ans, bénéficiaire majeur ou émancipé (enfant, petit-enfant, arrière-petit-enfant ; à défaut, neveu ou nièce).", s: SRC.spDonArgent },
          { t: "Cumulé avec l'abattement classique : jusqu'à 131 865 € d'un parent à un enfant, 63 730 € d'un grand-parent à un petit-enfant, tous les 15 ans.", s: SRC.spDonArgent },
          { t: "Le don doit être déclaré dans le mois qui suit.", s: SRC.spDonArgent },
        ],
      },
      {
        titre: "L'exonération « logement » jusqu'à fin 2026", icone: "🏠",
        points: [
          { t: "Dons d'argent faits entre le 15 février 2025 et le 31 décembre 2026 : jusqu'à 100 000 € par donateur et 300 000 € par bénéficiaire.", s: SRC.spDonArgent },
          { t: "Les fonds doivent être utilisés dans les 6 mois : achat d'un logement neuf ou en VEFA (sur plan), ou travaux de rénovation énergétique de la résidence principale éligibles à MaPrimeRénov'.", s: SRC.spDonArgent },
          { t: "Engagement de 5 ans (résidence principale ou location) et déclaration sur formulaire papier.", s: SRC.spDonArgent },
        ],
      },
      {
        titre: "Déclarer un don manuel", icone: "📝",
        points: [
          { t: "Depuis le 1er janvier 2026, la déclaration en ligne est obligatoire ; le formulaire papier n° 2735 ne sert plus que si l'on est dispensé de la déclaration en ligne.", s: SRC.donManuel },
          { t: "Au-delà de 15 000 €, le formulaire n° 2734 permet de reporter le paiement des droits jusqu'au décès du donateur.", s: SRC.donManuel },
          { t: "C'est la date d'enregistrement qui fait courir le délai de 15 ans.", s: SRC.donManuel },
          { t: "Valeur retenue : la plus élevée entre la valeur au jour de la remise et celle au jour de la déclaration.", s: SRC.donManuel },
        ],
      },
      {
        titre: "Quand le notaire est obligatoire", icone: "✍️",
        points: [
          { t: "Un notaire est obligatoire pour donner un bien immobilier, pour une donation-partage et pour une donation entre époux.", s: SRC.spDonation },
          { t: "Donation-partage : les biens sont évalués au jour de la donation, sans « rapport » à la succession. Les enfants ne pourront pas se disputer sur une hausse de valeur.", s: SRC.donNotaire },
          { t: "Donation entre époux (au dernier vivant) : droit fixe de 125 €.", s: SRC.donNotaire },
          { t: "Pour un bien immobilier s'ajoute la taxe de publicité foncière : 0,60 %, plus 2,37 % de cette taxe, plus 0,1 % de contribution de sécurité immobilière.", s: SRC.donNotaire },
        ],
      },
      {
        titre: "Réductions et paiement", icone: "✂️",
        points: [
          { t: "Donation d'une entreprise : réduction de 50 % des droits si le donateur a moins de 70 ans et donne en pleine propriété.", s: SRC.spDonation },
          { t: "Les droits payés par le donateur à la place du bénéficiaire ne sont pas considérés comme une donation supplémentaire.", s: SRC.spDonation },
          { t: "Paiement possible par remise d'œuvres d'art ou de biens (dation) à partir de 10 000 € de droits.", s: SRC.spDonation },
        ],
      },
    ],
    cas: [
      {
        titre: "Le don d'un enfant à sa mère", niveau: "Facile",
        enonce: "Paul, 45 ans, donne 60 000 € à sa mère veuve pour l'aider. Aucun don dans les 15 dernières années.",
        question: "Combien de droits ?",
        etapes: ["Lien de parenté : enfant vers ascendant, c'est la ligne directe.", "Abattement : 100 000 € pour une donation à un ascendant.", "60 000 € reste sous l'abattement."],
        reponse: "0 € de droits. La donation doit tout de même être déclarée.",
        s: SRC.spDonation,
      },
      {
        titre: "130 000 € à un enfant", niveau: "Intermédiaire",
        enonce: "Sophie, 72 ans, donne 130 000 € en argent à sa fille de 40 ans. Aucun don dans les 15 dernières années.",
        question: "Combien de droits ? Et si elle oublie le don familial d'argent ?",
        etapes: ["Le don d'argent (donatrice de moins de 80 ans, fille majeure) exonère 31 865 €.", "L'abattement parent-enfant ajoute 100 000 € : 131 865 € au total.", "130 000 € est sous ce plafond : 0 € de droits.", "Sans le don familial : 130 000 − 100 000 = 30 000 € taxables.", "Barème : 8 072 × 5 % + 4 037 × 10 % + 3 823 × 15 % + 14 068 × 20 % ≈ 4 194 €."],
        reponse: "0 € en utilisant les deux exonérations, contre environ 4 194 € avec le seul abattement de 100 000 €.",
        s: SRC.spDonArgent,
      },
      {
        titre: "Le grand-père de 82 ans", niveau: "Piège",
        enonce: "Un grand-père de 82 ans donne 40 000 € en argent à sa petite-fille de 25 ans. Il pense que le don familial s'applique.",
        question: "Combien de droits ?",
        etapes: ["Le don familial d'argent exige un donateur de moins de 80 ans : il est exclu.", "Reste l'abattement grand-parent / petit-enfant de 31 865 €.", "Part taxable : 40 000 − 31 865 = 8 135 €.", "Barème : 8 072 × 5 % + 63 × 10 % ≈ 410 €."],
        reponse: "Environ 410 € de droits. L'âge du donateur compte au jour du don.",
        s: SRC.spDonArgent,
      },
    ],
    vraiFaux: [
      { texte: "Depuis 2026, un don manuel se déclare en ligne.", vrai: true, explication: "La déclaration en ligne est obligatoire depuis le 1er janvier 2026 (impots.gouv.fr)." },
      { texte: "Dans une donation-partage, les biens sont réévalués au décès.", vrai: false, explication: "Ils sont figés à leur valeur au jour de la donation, sans rapport." },
      { texte: "Les droits payés par le donateur s'ajoutent à la donation et sont taxés.", vrai: false, explication: "Ils ne constituent pas une donation supplémentaire (Service-public)." },
    ],
    quiz: [
      { question: "Quel est le délai pour utiliser l'argent reçu avec l'exonération « logement » ?", choix: ["1 mois", "6 mois", "1 an", "5 ans"], bonne: 1, explication: "6 mois ; l'engagement de conserver le logement est, lui, de 5 ans." },
      { question: "Combien coûte une donation entre époux (au dernier vivant) en droits ?", choix: ["Rien", "Droit fixe de 125 €", "5 % du patrimoine", "1 594 €"], bonne: 1, explication: "Un droit fixe de 125 € (impots.gouv.fr)." },
      { question: "Quand un notaire est-il obligatoire ?", choix: ["Pour tout don de plus de 15 000 €", "Pour un bien immobilier, une donation-partage ou entre époux", "Jamais", "Seulement entre non-parents"], bonne: 1, explication: "Un don d'argent peut se faire sans notaire, mais doit être déclaré." },
      { question: "Quelle réduction pour la donation d'une entreprise en pleine propriété par un donateur de moins de 70 ans ?", choix: ["10 %", "25 %", "50 %", "75 %"], bonne: 2, explication: "50 % de réduction des droits (Service-public). Ne pas confondre avec l'exonération Dutreil de 75 % sur la valeur." },
    ],
    cartes: [
      { recto: "Délai de déclaration d'un don familial d'argent", verso: "1 mois." },
      { recto: "Formulaire 2734", verso: "Don manuel de plus de 15 000 € : permet de payer les droits au décès du donateur." },
      { recto: "Donation-partage", verso: "Valeur figée au jour de la donation, pas de rapport : la paix des familles." },
    ],
    liens: [
      { type: "officiel", titre: "Droits de donation (Service-public)", url: SRC.spDonation[1] },
      { type: "officiel", titre: "Don d'argent et exonération logement (Service-public)", url: SRC.spDonArgent[1] },
      { type: "officiel", titre: "Déclarer un don manuel (impots.gouv.fr)", url: SRC.donManuel[1] },
      { type: "officiel", titre: "Donations par acte notarié (impots.gouv.fr)", url: SRC.donNotaire[1] },
    ],
  },

  // ------------------------------------------------------------------ SUCCESSION
  succession: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Les droits du conjoint survivant", icone: "💍",
        points: [
          { t: "Enfants tous communs : le conjoint choisit entre l'usufruit de la totalité et un quart en pleine propriété (art. 757).", s: SRC.ccConjoint },
          { t: "Au moins un enfant d'une autre union : le conjoint reçoit un quart en pleine propriété, sans choix possible (art. 757).", s: SRC.ccConjoint },
          { t: "Sans enfant, avec le père et la mère du défunt : le conjoint recueille la moitié (art. 757-1). Sans enfant ni parents : tout (art. 757-2).", s: SRC.ccConjoint },
          { t: "Si un héritier l'invite par écrit à choisir et qu'il ne répond pas dans les 3 mois, le conjoint est réputé avoir choisi l'usufruit (art. 758-3).", s: SRC.ccConjoint },
          { t: "Il peut rester gratuitement 1 an dans le logement (art. 763), puis demander un droit viager d'habitation, à réclamer dans l'année du décès (art. 764 à 765-1).", s: SRC.ccConjoint },
        ],
      },
      {
        titre: "Calculer l'actif taxable", icone: "🧮",
        points: [
          { t: "Résidence principale : abattement de 20 % sur sa valeur si elle est occupée par le conjoint, le partenaire de PACS ou des enfants mineurs ou protégés (CGI art. 764 bis).", s: SRC.cgi764 },
          { t: "Mobilier : à défaut d'inventaire ou de vente publique, il est évalué au minimum à 5 % des autres biens de la succession, sauf preuve contraire (CGI art. 764).", s: SRC.cgi764 },
          { t: "Frais funéraires déductibles dans la limite de 1 500 €.", s: SRC.calculSucc },
          { t: "Certaines dettes ne sont pas déductibles (CGI art. 773), comme, en principe, la dette de restitution d'une somme d'argent dont le défunt s'était réservé l'usufruit (quasi-usufruit), pour les successions ouvertes depuis le 29 décembre 2023 (art. 774 bis, avec des exceptions).", s: SRC.cgi764 },
        ],
      },
      {
        titre: "Frères et sœurs : l'exonération totale", icone: "👫",
        points: [
          { t: "Un frère ou une sœur est exonéré si les 3 conditions sont réunies : célibataire, veuf, divorcé ou séparé ; plus de 50 ans ou handicapé ; domicilié avec le défunt pendant les 5 ans avant le décès.", s: SRC.calculSucc },
          { t: "À défaut d'autre abattement, un héritier bénéficie de 1 594 €.", s: SRC.calculSucc },
        ],
      },
      {
        titre: "Déclarer : délais et dispenses", icone: "📅",
        points: [
          { t: "Délai : 6 mois après le décès (12 mois si le décès a lieu à l'étranger).", s: SRC.spDeclSucc },
          { t: "Pas de déclaration pour les enfants, petits-enfants, parents, le conjoint ou le partenaire de PACS si l'actif brut est inférieur à 50 000 € et sans donation non déclarée ; pour les autres héritiers, sous 3 000 €.", s: SRC.spDeclSucc },
          { t: "En retard : intérêts de 0,20 % par mois, et majorations de 10 % à 80 %.", s: SRC.spDeclSucc },
          { t: "À partir de 5 965 €, un acte de notoriété (chez le notaire) prouve la qualité d'héritier ; en dessous, une attestation signée par tous les héritiers suffit.", s: SRC.spDeclSucc },
        ],
      },
      {
        titre: "Payer en plusieurs fois", icone: "💳",
        points: [
          { t: "Paiement fractionné sur 1 an, ou 3 ans si l'actif est composé d'au moins 50 % de biens non liquides (immobilier…).", s: SRC.payerSucc },
          { t: "Intérêts : 2 % pour les demandes faites depuis le 1er janvier 2026.", s: SRC.payerSucc },
          { t: "Paiement différé possible, notamment pour l'héritier qui reçoit la nue-propriété : il paie à la fin de l'usufruit.", s: SRC.payerSucc },
          { t: "Transmission d'entreprise : paiement différé 5 ans, puis fractionné sur 10 ans.", s: SRC.payerSucc },
        ],
      },
    ],
    cas: [
      {
        titre: "La maison de famille", niveau: "Facile",
        enonce: "Marc décède. Sa femme continue d'habiter leur résidence principale, estimée 400 000 €.",
        question: "Quelle valeur retient-on pour les droits de succession ?",
        etapes: ["Le logement est la résidence principale du défunt.", "Il est occupé par le conjoint survivant : abattement de 20 %.", "400 000 × 80 % = 320 000 €."],
        reponse: "320 000 €. L'abattement de 20 % profite à tous les héritiers, pas seulement au conjoint.",
        s: SRC.cgi764,
      },
      {
        titre: "Calculer les droits d'un enfant", niveau: "Intermédiaire",
        enonce: "Un enfant unique reçoit 250 000 € nets de sa mère. Aucune donation dans les 15 ans.",
        question: "Combien de droits ?",
        etapes: ["Abattement : 100 000 €. Part taxable : 150 000 €.", "5 % sur 8 072 € = 403,60 €.", "10 % sur 4 037 € = 403,70 €.", "15 % sur 3 823 € = 573,45 €.", "20 % sur 134 068 € = 26 813,60 €."],
        reponse: "Environ 28 194 € de droits, soit un peu plus de 11 % de ce qu'il reçoit.",
        s: SRC.calculSucc,
      },
      {
        titre: "La famille recomposée", niveau: "Piège",
        enonce: "Julien décède sans testament ni donation entre époux. Il laisse sa femme et deux enfants : l'un est commun, l'autre est né d'une première union.",
        question: "Sa femme peut-elle choisir l'usufruit de toute la succession ?",
        etapes: ["Il y a un enfant qui n'est pas issu des deux époux.", "Dans ce cas, l'article 757 ne laisse pas d'option.", "Le conjoint reçoit un quart en pleine propriété."],
        reponse: "Non : un quart en pleine propriété seulement. Pour lui donner plus, il fallait un testament ou une donation au dernier vivant.",
        s: SRC.ccConjoint,
      },
    ],
    vraiFaux: [
      { texte: "La déclaration de succession doit être déposée dans les 6 mois du décès (en France).", vrai: true, explication: "6 mois, 12 mois pour un décès à l'étranger." },
      { texte: "Le conjoint survivant peut rester gratuitement 1 an dans le logement.", vrai: true, explication: "Article 763 du Code civil." },
      { texte: "Les frais funéraires sont déductibles sans limite.", vrai: false, explication: "Dans la limite de 1 500 €." },
    ],
    quiz: [
      { question: "Quel abattement sur la résidence principale occupée par le conjoint ?", choix: ["10 %", "20 %", "30 %", "50 %"], bonne: 1, explication: "20 % (CGI art. 764 bis)." },
      { question: "Combien de temps le conjoint a-t-il pour choisir, une fois invité par écrit ?", choix: ["1 mois", "3 mois", "6 mois", "1 an"], bonne: 1, explication: "3 mois ; à défaut, il est réputé avoir choisi l'usufruit." },
      { question: "Taux d'intérêt du paiement fractionné demandé en 2026 ?", choix: ["0,2 %", "1 %", "2 %", "4 %"], bonne: 2, explication: "2 % pour les demandes faites depuis le 1er janvier 2026." },
      { question: "Sans enfant, avec les deux parents du défunt, que reçoit le conjoint ?", choix: ["Rien", "Un quart", "La moitié", "Tout"], bonne: 2, explication: "La moitié (art. 757-1), l'autre moitié allant aux parents." },
    ],
    cartes: [
      { recto: "Article 763 du Code civil", verso: "Le conjoint peut occuper gratuitement le logement pendant 1 an." },
      { recto: "Forfait mobilier", verso: "Sans inventaire : au minimum 5 % des autres biens, sauf preuve contraire (CGI art. 764)." },
      { recto: "Pénalités de retard (succession)", verso: "0,20 % par mois, plus une majoration de 10 % à 80 %." },
    ],
    liens: [
      { type: "officiel", titre: "Déclaration de succession (Service-public)", url: SRC.spDeclSucc[1] },
      { type: "officiel", titre: "Calcul des droits (impots.gouv.fr)", url: SRC.calculSucc[1] },
      { type: "officiel", titre: "Payer les droits (impots.gouv.fr)", url: SRC.payerSucc[1] },
      { type: "officiel", titre: "Droits du conjoint, art. 756 à 767 (Légifrance)", url: SRC.ccConjoint[1] },
    ],
  },

  // ------------------------------------------------------------------ DÉMEMBREMENT
  demembrement: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "L'usufruit temporaire", icone: "⏳",
        points: [
          { t: "Un usufruit à durée fixe vaut 23 % de la pleine propriété « pour chaque période de dix ans de la durée de l'usufruit, sans fraction et sans égard à l'âge de l'usufruitier » : 20 ans = 2 périodes = 46 %.", s: SRC.cgi669 },
          { t: "Il ne peut pas dépasser la valeur de l'usufruit viager de l'usufruitier.", s: SRC.bofipUsufruit },
        ],
      },
      {
        titre: "La présomption de l'article 751", icone: "🔎",
        points: [
          { t: "Un bien dont le défunt avait l'usufruit et un héritier présomptif la nue-propriété est présumé faire partie de la succession : il est taxé en pleine propriété.", s: SRC.cgi751 },
          { t: "Exception : le démembrement vient d'une donation régulière faite plus de 3 mois avant le décès (les deux conditions sont exigées ; pas de délai pour une donation par contrat de mariage). Un achat de nue-propriété n'entre pas dans l'exception.", s: SRC.cgi751 },
          { t: "La preuve contraire est possible, par exemple en prouvant une donation d'argent datée qui a financé la nue-propriété.", s: SRC.cgi751 },
        ],
      },
      {
        titre: "Démembrement et IFI", icone: "🏛️",
        points: [
          { t: "Principe : l'usufruitier déclare le bien en pleine propriété à l'IFI, le nu-propriétaire ne déclare rien.", s: SRC.bofipIfi },
          { t: "Exceptions : usufruit légal du conjoint survivant, vente avec réserve d'usufruit à une personne hors article 751, don de la nue-propriété à l'État, une collectivité, un établissement public ou une association ou fondation reconnue d'utilité publique.", s: SRC.bofipIfi },
          { t: "Une donation avec réserve d'usufruit n'est pas une exception : le parent reste imposé sur toute la valeur.", s: SRC.bofipIfi },
        ],
      },
      {
        titre: "Clause bénéficiaire démembrée (assurance-vie)", icone: "📜",
        points: [
          { t: "Le capital est réparti entre usufruitier et nu-propriétaire selon le barème de l'article 669.", s: SRC.bofip990 },
          { t: "L'abattement de 152 500 € est partagé entre eux au prorata.", s: SRC.bofip990 },
          { t: "Si l'usufruitier est le conjoint (exonéré), sa part d'abattement n'est pas reportée sur les enfants : elle est perdue.", s: SRC.bofip990 },
        ],
      },
    ],
    cas: [
      {
        titre: "Un usufruit de 20 ans", niveau: "Facile",
        enonce: "Une mère donne pendant 20 ans l'usufruit d'un studio de 300 000 € à une association, puis le récupère.",
        question: "Quelle valeur fiscale pour cet usufruit ?",
        etapes: ["23 % par période de 10 ans, sans égard à l'âge.", "20 ans font 2 périodes.", "2 × 23 % = 46 % ; 300 000 × 46 % = 138 000 €."],
        reponse: "138 000 €.",
        s: SRC.cgi669,
      },
      {
        titre: "La donation qui ne réduit pas l'IFI", niveau: "Piège",
        enonce: "Un couple donne la nue-propriété de son immeuble de rapport de 2 M€ à ses enfants, en gardant l'usufruit.",
        question: "Leur IFI baisse-t-il ?",
        etapes: ["À l'IFI, l'usufruitier déclare en principe la pleine propriété.", "La donation avec réserve d'usufruit n'est pas dans la liste des exceptions.", "Les parents restent imposés sur les 2 M€."],
        reponse: "Non. La donation fait baisser la future succession, pas l'IFI.",
        s: SRC.bofipIfi,
      },
      {
        titre: "L'achat juste avant le décès", niveau: "Intermédiaire",
        enonce: "Un père achète un appartement : lui prend l'usufruit, son fils la nue-propriété, avec l'argent du père. Il décède 2 mois plus tard.",
        question: "Que se passe-t-il au décès ?",
        etapes: ["Le fils est héritier présomptif et le père était usufruitier : article 751.", "C'est un achat, pas une donation régulière de plus de 3 mois : l'exception ne joue pas.", "Le bien est présumé dans la succession, en pleine propriété."],
        reponse: "Il est taxé comme si le père le détenait en pleine propriété, sauf preuve contraire (par exemple une donation d'argent datée et déclarée).",
        s: SRC.cgi751,
      },
    ],
    vraiFaux: [
      { texte: "Le nu-propriétaire déclare le bien à l'IFI.", vrai: false, explication: "C'est en principe l'usufruitier, en pleine propriété." },
    ],
    quiz: [
      { question: "Combien vaut fiscalement un usufruit temporaire de 10 ans ?", choix: ["10 %", "23 %", "46 %", "Selon l'âge"], bonne: 1, explication: "23 % par période de 10 ans, sans égard à l'âge de l'usufruitier (CGI art. 669)." },
      { question: "Que perd-on avec une clause « conjoint usufruitier, enfants nus-propriétaires » ?", choix: ["Rien", "La part d'abattement du conjoint, non reportée", "L'exonération du conjoint", "Le barème 669"], bonne: 1, explication: "L'abattement de 152 500 € est partagé ; la part du conjoint exonéré est perdue." },
    ],
    cartes: [
      { recto: "Usufruit temporaire", verso: "23 % par période de 10 ans, sans égard à l'âge (CGI art. 669)." },
      { recto: "Article 751 du CGI", verso: "Présomption de propriété du défunt usufruitier, sauf donation régulière faite plus de 3 mois avant le décès." },
    ],
    liens: [
      { type: "officiel", titre: "Barème de l'usufruit, art. 669 (Légifrance)", url: SRC.cgi669[1] },
      { type: "officiel", titre: "Présomption de l'art. 751 (Légifrance)", url: SRC.cgi751[1] },
      { type: "officiel", titre: "IFI et biens démembrés (BOFiP)", url: SRC.bofipIfi[1] },
      { type: "officiel", titre: "Assurance-vie démembrée (BOFiP)", url: SRC.bofip990[1] },
    ],
  },

  // ------------------------------------------------------------------ RÉGIMES MATRIMONIAUX
  "regimes-matrimoniaux": {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Propre ou commun ? Les règles fines", icone: "⚖️",
        points: [
          { t: "Tout bien est présumé commun, sauf à prouver qu'il est propre (art. 1402).", s: SRC.ccCommu },
          { t: "Restent propres « par nature » : vêtements personnels, indemnités pour un préjudice corporel ou moral, biens à caractère personnel, et instruments de travail (sauf récompense) (art. 1404).", s: SRC.ccCommu },
          { t: "Les biens reçus par donation ou succession restent propres, sauf si le donateur prévoit qu'ils entrent dans la communauté (art. 1405).", s: SRC.ccCommu },
          { t: "Un bien échangé contre un propre reste propre, sauf si la soulte payée par la communauté dépasse la valeur du bien cédé (art. 1407).", s: SRC.ccCommu },
          { t: "Pour qu'un bien acheté avec de l'argent propre reste propre, l'acte d'achat doit le déclarer (clause d'emploi ou de remploi, art. 1434).", s: SRC.ccCommu },
        ],
      },
      {
        titre: "Les récompenses", icone: "🔁",
        points: [
          { t: "Si l'argent propre d'un époux a profité à la communauté, la communauté lui doit une récompense (art. 1433).", s: SRC.ccCommu },
          { t: "À l'inverse, l'époux qui a tiré un profit personnel des biens communs doit récompense à la communauté (art. 1437).", s: SRC.ccCommu },
          { t: "Montant : en principe le plus faible entre la dépense faite et le profit subsistant ; jamais moins que la dépense si elle était nécessaire ; jamais moins que le profit subsistant si l'argent a servi à acheter, conserver ou améliorer un bien encore présent (art. 1469).", s: SRC.ccCommu },
        ],
      },
      {
        titre: "Les protections de tous les couples mariés", icone: "🛡️",
        points: [
          { t: "Aucun époux ne peut vendre seul le logement de la famille ni ses meubles, même s'il en est seul propriétaire. L'autre peut demander l'annulation dans l'année où il l'apprend (art. 215).", s: SRC.cc215 },
          { t: "Les dettes pour l'entretien du ménage ou l'éducation des enfants engagent les deux époux solidairement (art. 220).", s: SRC.cc220 },
          { t: "Sauf : dépenses manifestement excessives ; achats à tempérament sans l'accord des deux ; emprunts sans l'accord des deux, sauf petites sommes nécessaires à la vie courante.", s: SRC.cc220 },
        ],
      },
      {
        titre: "Les clauses qui protègent le survivant", icone: "🗝️",
        points: [
          { t: "Préciput : le survivant prélève un bien ou une somme avant tout partage (art. 1515).", s: SRC.ccCommu },
          { t: "Partage inégal ou attribution intégrale de la communauté au survivant (art. 1520 et 1524). Ce ne sont pas des donations (art. 1525).", s: SRC.ccCommu },
          { t: "Communauté universelle : tous les biens présents et à venir, sauf les propres par nature, et toutes les dettes (art. 1526).", s: SRC.ccCommu },
          { t: "Enfants non communs : l'avantage qui dépasse la quotité disponible spéciale entre époux peut être réduit. Ces enfants peuvent renoncer à cette action avant le décès du survivant (art. 1527).", s: SRC.ccCommu },
        ],
      },
      {
        titre: "La participation aux acquêts, pas à pas", icone: "📈",
        points: [
          { t: "Pendant le mariage : chacun gère librement ses biens, comme en séparation (art. 1569).", s: SRC.ccPartic },
          { t: "À la fin : acquêts nets = patrimoine final − patrimoine originaire (biens d'avant le mariage, donations et successions) (art. 1570 à 1575).", s: SRC.ccPartic },
          { t: "L'époux qui s'est le moins enrichi reçoit la moitié de la différence : la créance de participation (art. 1575).", s: SRC.ccPartic },
          { t: "Paiement en argent ; le juge peut accorder jusqu'à 5 ans de délai (art. 1576). Clauses possibles : partage inégal, tout au survivant (art. 1581).", s: SRC.ccPartic },
        ],
      },
      {
        titre: "Changer de régime : la procédure", icone: "🔄",
        points: [
          { t: "Par acte notarié, dans l'intérêt de la famille ; l'acte contient la liquidation de l'ancien régime si elle est nécessaire.", s: SRC.cc1397 },
          { t: "Les enfants majeurs sont informés personnellement ; les créanciers par un avis dans un journal d'annonces légales. Chacun peut s'opposer dans les 3 mois.", s: SRC.cc1397 },
          { t: "En cas d'opposition, l'acte doit être homologué par le tribunal. Avec des enfants mineurs, le notaire peut saisir le juge des tutelles.", s: SRC.cc1397 },
          { t: "Effet entre époux à la date de l'acte ; à l'égard des tiers, 3 mois après la mention en marge de l'acte de mariage.", s: SRC.cc1397 },
        ],
      },
    ],
    cas: [
      {
        titre: "La créance de participation", niveau: "Intermédiaire",
        enonce: "Mariés en participation aux acquêts. Claire : patrimoine originaire 100 000 €, final 300 000 €. Hugo : originaire 50 000 €, final 110 000 €.",
        question: "Que doit Claire à Hugo au divorce ?",
        etapes: ["Acquêts nets de Claire : 300 000 − 100 000 = 200 000 €.", "Acquêts nets d'Hugo : 110 000 − 50 000 = 60 000 €.", "Différence : 140 000 €.", "Hugo a droit à la moitié de cette différence."],
        reponse: "Une créance de 70 000 €, payable en argent.",
        s: SRC.ccPartic,
      },
      {
        titre: "L'héritage placé dans l'achat commun", niveau: "Piège",
        enonce: "Mariée sans contrat, Léa reçoit 80 000 € d'héritage et les utilise pour l'appartement acheté avec son mari, sans rien préciser dans l'acte.",
        question: "Son argent est-il perdu en cas de divorce ?",
        etapes: ["L'héritage était un bien propre (art. 1405).", "Sans clause de remploi dans l'acte, l'appartement est commun.", "Mais la communauté a profité de son argent propre : elle lui doit une récompense (art. 1433).", "L'argent a servi à acheter un bien encore présent : la récompense ne peut pas être inférieure au profit subsistant, elle suit donc la valeur de l'appartement (art. 1469)."],
        reponse: "Non, elle a droit à une récompense, mais elle devra prouver l'origine des fonds. Le bon réflexe : faire déclarer l'origine de l'argent dans l'acte d'achat.",
        s: SRC.ccCommu,
      },
      {
        titre: "La vente du logement familial", niveau: "Facile",
        enonce: "Marié en séparation de biens, Thomas est seul propriétaire de la maison où vit la famille. Il veut la vendre seul.",
        question: "Le peut-il ?",
        etapes: ["Il s'agit du logement de la famille.", "L'article 215 s'applique à tous les régimes.", "L'accord des deux époux est obligatoire."],
        reponse: "Non. Sans l'accord de sa femme, elle peut faire annuler la vente dans l'année où elle l'apprend.",
        s: SRC.cc215,
      },
    ],
    vraiFaux: [
      { texte: "En séparation de biens, un époux propriétaire peut vendre seul le logement familial.", vrai: false, explication: "Non : l'article 215 exige l'accord des deux époux, quel que soit le régime." },
      { texte: "Pour le Code civil, une clause d'attribution intégrale de la communauté est une donation.", vrai: false, explication: "L'article 1525 dit qu'elle n'est pas une donation, ni sur le fond ni sur la forme." },
      { texte: "Un achat à tempérament sans l'accord du conjoint l'engage solidairement.", vrai: false, explication: "Les achats à tempérament sans l'accord des deux échappent à la solidarité (art. 220)." },
    ],
    quiz: [
      { question: "Comment garder propre un bien acheté avec un héritage ?", choix: ["Rien à faire", "Une déclaration de remploi dans l'acte d'achat", "Un testament", "Le déclarer aux impôts"], bonne: 1, explication: "Article 1434 du Code civil." },
      { question: "Participation aux acquêts : A s'enrichit de 90 000 €, B de 30 000 €. Créance de B ?", choix: ["15 000 €", "30 000 €", "45 000 €", "60 000 €"], bonne: 1, explication: "(90 000 − 30 000) / 2 = 30 000 €." },
      { question: "Quand un changement de régime doit-il passer devant le juge ?", choix: ["Toujours", "Jamais", "En cas d'opposition", "S'il y a des biens immobiliers"], bonne: 2, explication: "Homologation en cas d'opposition d'un enfant majeur ou d'un créancier (art. 1397)." },
    ],
    cartes: [
      { recto: "Article 215 du Code civil", verso: "Logement familial : accord des deux époux pour le vendre, quel que soit le régime." },
      { recto: "Récompense", verso: "Somme due entre un époux et la communauté quand l'un a profité de l'argent de l'autre (art. 1433 et 1437)." },
      { recto: "Préciput", verso: "Le survivant prélève un bien avant partage (art. 1515)." },
    ],
    liens: [
      { type: "officiel", titre: "Changer de régime, art. 1397 (Légifrance)", url: SRC.cc1397[1] },
      { type: "officiel", titre: "Communauté, art. 1400 à 1527 (Légifrance)", url: SRC.ccCommu[1] },
      { type: "officiel", titre: "Participation aux acquêts (Légifrance)", url: SRC.ccPartic[1] },
      { type: "officiel", titre: "Logement de la famille, art. 215 (Légifrance)", url: SRC.cc215[1] },
    ],
  },
};

// ====================================================================== LOT 2 : ÉPARGNE (vérifié le 14 novembre 2026)
Object.assign(SRC, {
  avRachat: ["Service-public · Assurance-vie : imposition des gains", "https://www.service-public.gouv.fr/particuliers/vosdroits/F35006"],
  avPartiel: ["BOFiP · Rachat partiel d'assurance-vie", "https://bofip.impots.gouv.fr/bofip/3951-PGP.html/identifiant=BOI-RPPM-RCM-20-10-20-50-20191220"],
  avDeces: ["impots.gouv.fr · Bénéficiaire d'une assurance-vie", "https://www.impots.gouv.fr/particulier/questions/je-suis-beneficiaire-dune-assurance-vie-comment-la-declarer"],
  ps2026: ["Service-public · Prélèvements sociaux", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2329"],
  per: ["Service-public · PER individuel", "https://www.service-public.gouv.fr/particuliers/vosdroits/F36526"],
  pea: ["Service-public · PEA", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385"],
  peaBofip: ["BOFiP · Régime fiscal du PEA", "https://bofip.impots.gouv.fr/bofip/1560-PGP.html/identifiant=BOI-RPPM-RCM-40-50-30-20261026"],
  peaRetraits: ["BOFiP · Retraits et clôture du PEA", "https://bofip.impots.gouv.fr/bofip/2221-PGP.html/identifiant=BOI-ANNX-000072-20240730"],
  scpiAmf: ["AMF · Investir dans une SCPI", "https://www.amf-france.org/sites/institutionnel/files/private/2023-12/2023_investir_dans_une_scpi.pdf"],
  scpiRetrait: ["AMF · SCPI : retrait ou ordre de vente", "https://www.amf-france.org/en/news-publications/news/scpis-unlike-orders-sell-units-redemption-requests-do-note-have-validity-period-and-do-not-have-be"],
  scpiDelai: ["AMF · Médiateur : délai de retrait", "https://www.amf-france.org/en/amf-ombudsman/ombudsman-online-diary/latest/scpi-redemption-request-even-if-order-may-be-executed-within-indefinite-period-time"],
  avAcompte: ["BOFiP · Acompte sur les gains d'assurance-vie", "https://bofip.impots.gouv.fr/bofip/3742-PGP.html/identifiant=BOI-RPPM-RCM-30-20-30-20191220"],
  psNote: ["AMF · Note sur les produits structurés", "https://www.amf-france.org/sites/institutionnel/files/private/2026-06/note_explicative_-_produits_structures.pdf"],
  psEtude: ["AMF-ACPR · Étude produits structurés (juin 2026)", "https://www.amf-france.org/sites/institutionnel/files/private/2026-06/Etude-du-pole-commun-amf-acpr-sur-la-distribution-les-frais-et-les-performances-des-produits-structures-juin_0.pdf"],
});

Object.assign(APPROFONDI, {
  // ------------------------------------------------------------------ ASSURANCE-VIE
  "assurance-vie": {
    verifie: "14 novembre 2026",
    remplacer: {
      cas: {
        enonce: "Mme Martin, 72 ans, veuve, veut placer 100 000 € sur une assurance-vie au profit de ses deux enfants.",
        question: "Comment sera taxé ce capital à son décès ?",
        reponse: "Versements faits après 70 ans : abattement global de 30 500 €. Les 69 500 € restants (34 750 € par enfant) sont ajoutés à la succession, mais chaque enfant garde son abattement de 100 000 € s'il n'a pas déjà été utilisé par des donations ou le reste de l'héritage. Les intérêts produits d'ici là sont exonérés. Les contrats alimentés avant 70 ans gardent leurs 152 500 € par enfant.",
      },
    },
    blocs: [
      {
        titre: "Rachat : combien de gains dans mon retrait ?", icone: "🧮",
        points: [
          { t: "Chaque retrait contient des versements et des gains. Gains du retrait = retrait − (versements × retrait ÷ valeur du contrat).", s: SRC.avPartiel },
          { t: "Après plusieurs retraits, on ne compte que les versements qui n'ont pas encore été remboursés.", s: SRC.avPartiel },
        ],
      },
      {
        titre: "Le prélèvement à la source, puis la déclaration", icone: "🧾",
        points: [
          { t: "Au retrait, l'assureur prélève un acompte sur les gains : 12,8 % avant 8 ans, 7,5 % après 8 ans. L'abattement n'est pas déduit à ce stade ; le calcul définitif se fait dans la déclaration de revenus, et le trop-perçu est remboursé.", s: SRC.avAcompte },
          { t: "Après 8 ans, l'abattement de 4 600 € (9 200 € pour un couple) vaut pour l'ensemble des contrats d'une même personne.", s: SRC.avRachat },
          { t: "Le taux de 7,5 % dépend du total des versements non remboursés sur tous les contrats, comparé à 150 000 € ; la fraction qui dépasse est imposée à 12,8 %.", s: SRC.avRachat },
          { t: "Dispense de l'acompte si le revenu fiscal de référence de l'avant-dernière année est inférieur à 25 000 € (50 000 € pour un couple) : demande à faire avant le 30 novembre de l'année précédente.", s: SRC.avRachat },
          { t: "Prélèvements sociaux : 17,2 % pour l'assurance-vie, alors que la plupart des placements passent à 18,6 % en 2026.", s: SRC.ps2026 },
        ],
      },
      {
        titre: "Au décès : les règles à connaître", icone: "📜",
        points: [
          { t: "Versements faits jusqu'au 12 octobre 1998 inclus : exonérés sur les contrats souscrits avant le 20 novembre 1991 ; pour les contrats souscrits ensuite, seulement s'ils ont été faits avant 70 ans.", s: SRC.avDeces },
          { t: "Exonérés : conjoint, partenaire de PACS, et frère ou sœur célibataire, veuf, divorcé ou séparé, de plus de 50 ans (ou invalide), ayant vécu 5 ans avec le défunt.", s: SRC.avDeces },
          { t: "Le capital revient dans la succession si aucun bénéficiaire n'est désigné.", s: SRC.avDeces },
          { t: "Versements après 70 ans : le bénéficiaire dépose le formulaire 2705-A dans les 6 mois, un par assureur. L'assureur ne paie qu'au vu de ce formulaire traité.", s: SRC.avDeces },
          { t: "Pour savoir si l'on est bénéficiaire d'un contrat, on peut interroger l'AGIRA (avec l'acte de décès).", s: SRC.avDeces },
        ],
      },
    ],
    cas: [
      {
        titre: "Un retrait après 10 ans", niveau: "Facile",
        enonce: "Paul, célibataire, a un contrat de 10 ans en unités de compte : 100 000 € de valeur, dont 80 000 € de versements. Il retire 10 000 €.",
        question: "Combien d'impôt et de prélèvements sociaux ?",
        etapes: ["Versements contenus dans le retrait : 80 000 × 10 000 ÷ 100 000 = 8 000 €.", "Gains du retrait : 10 000 − 8 000 = 2 000 €.", "Contrat de plus de 8 ans : abattement de 4 600 € pour un célibataire, donc 0 € d'impôt.", "Prélèvements sociaux : 2 000 × 17,2 % = 344 €."],
        reponse: "0 € d'impôt (l'acompte de 7,5 % prélevé sera remboursé via la déclaration) et 344 € de prélèvements sociaux.",
        s: SRC.avPartiel,
      },
      {
        titre: "Décès à 78 ans, versements avant 70 ans", niveau: "Piège",
        enonce: "Une mère a versé sur son contrat entre 50 et 65 ans. Elle décède à 78 ans. Son fils unique reçoit 400 000 €.",
        question: "Quel régime s'applique : 152 500 € ou 30 500 € ?",
        etapes: ["Ce qui compte, c'est l'âge au moment des versements, pas l'âge au décès.", "Versements avant 70 ans : abattement de 152 500 € pour le fils.", "Part taxable : 400 000 − 152 500 = 247 500 €.", "Taux de 20 % (sous 700 000 €) : 247 500 × 20 % = 49 500 €."],
        reponse: "49 500 € de prélèvement. Le régime des 30 500 € ne concerne que les versements faits après 70 ans.",
        s: SRC.avDeces,
      },
    ],
    vraiFaux: [
      { texte: "Sur un retrait, l'assureur prélève un acompte même si les gains seront couverts par l'abattement.", vrai: true, explication: "L'abattement ne s'applique pas au calcul de l'acompte (BOFiP) ; l'excédent est remboursé après la déclaration de revenus." },
      { texte: "En 2026, les gains d'assurance-vie supportent 18,6 % de prélèvements sociaux.", vrai: false, explication: "L'assurance-vie reste à 17,2 % (Service-public)." },
      { texte: "Sans bénéficiaire désigné, le capital revient dans la succession.", vrai: true, explication: "Il est alors taxé selon les règles des successions." },
    ],
    quiz: [
      { question: "Contrat de 50 000 €, dont 40 000 € versés. Retrait de 5 000 €. Gains contenus ?", choix: ["500 €", "1 000 €", "4 000 €", "5 000 €"], bonne: 1, explication: "5 000 − 40 000 × 5 000 ÷ 50 000 = 5 000 − 4 000 = 1 000 €." },
      { question: "Quel formulaire pour des versements faits après 70 ans ?", choix: ["2735", "2705-A", "2042", "2074"], bonne: 1, explication: "Le 2705-A, à déposer dans les 6 mois, un par assureur." },
      { question: "Les versements faits jusqu'à quelle date sont exonérés au décès ?", choix: ["31 décembre 1991", "12 octobre 1998", "27 septembre 2017", "1er janvier 2026"], bonne: 1, explication: "Jusqu'au 12 octobre 1998 inclus, avec une condition d'âge (avant 70 ans) pour les contrats souscrits depuis le 20 novembre 1991." },
    ],
    cartes: [
      { recto: "Gains d'un retrait", verso: "Retrait − versements × (retrait ÷ valeur du contrat)." },
      { recto: "AGIRA", verso: "Organisme à interroger pour savoir si l'on est bénéficiaire d'un contrat." },
      { recto: "Formulaire 2705-A", verso: "Déclaration des capitaux décès issus de versements après 70 ans, dans les 6 mois." },
    ],
    liens: [
      { type: "officiel", titre: "Imposition des gains (Service-public)", url: SRC.avRachat[1] },
      { type: "officiel", titre: "Bénéficiaire d'une assurance-vie (impots.gouv.fr)", url: SRC.avDeces[1] },
      { type: "officiel", titre: "Calcul d'un rachat partiel (BOFiP)", url: SRC.avPartiel[1] },
    ],
  },

  // ------------------------------------------------------------------ PER
  per: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Les 7 cas de déblocage anticipé", icone: "🔓",
        points: [
          { t: "Achat de la résidence principale (sauf l'épargne issue des versements obligatoires).", s: SRC.per },
          { t: "Décès du conjoint ou du partenaire de PACS.", s: SRC.per },
          { t: "Invalidité de 2e ou 3e catégorie du titulaire, de ses enfants, de son conjoint ou partenaire de PACS.", s: SRC.per },
          { t: "Affection grave, handicap ou accident d'une particulière gravité d'un enfant à charge.", s: SRC.per },
          { t: "Surendettement (la commission écrit à l'organisme).", s: SRC.per },
          { t: "Fin des droits au chômage, ou fin d'un mandat social depuis 2 ans sans contrat de travail ni retraite.", s: SRC.per },
          { t: "Cessation d'une activité non salariée après une liquidation judiciaire.", s: SRC.per },
        ],
      },
      {
        titre: "La sortie, ligne par ligne", icone: "🎯",
        points: [
          { t: "Versements déduits, sortie en capital : la part de versements est imposée au barème (sans abattement de 10 % ni prélèvements sociaux) ; les gains à 31,4 % (12,8 % + 18,6 %).", s: SRC.per },
          { t: "Versements non déduits, sortie en capital : la part de versements est exonérée ; seuls les gains sont taxés à 31,4 %.", s: SRC.per },
          { t: "Versements déduits, sortie en rente : imposée comme une pension de retraite, avec l'abattement de 10 %.", s: SRC.per },
          { t: "Versements non déduits, sortie en rente : seule une fraction est imposable, selon l'âge au premier versement : 70 % avant 50 ans, 50 % de 50 à 59 ans, 40 % de 60 à 69 ans, 30 % après 69 ans.", s: SRC.per },
          { t: "Pour ne pas déduire, il faut le signaler au gestionnaire à chaque versement.", s: SRC.per },
        ],
      },
      {
        titre: "Transférer son PER", icone: "🔀",
        points: [
          { t: "D'un PER vers un autre PER : gratuit après 5 ans de détention ; sinon, frais de 1 % au maximum.", s: SRC.per },
          { t: "D'un ancien produit (Perp, Madelin, Perco…) vers un PER : frais jusqu'à 5 % s'il a moins de 10 ans ; transfert en 4 mois au plus.", s: SRC.per },
        ],
      },
      {
        titre: "Au décès du titulaire", icone: "🕊️",
        points: [
          { t: "PER d'assurance, décès avant 70 ans : 152 500 € d'abattement par bénéficiaire, puis 20 % jusqu'à 700 000 € et 31,25 % au-delà.", s: SRC.per },
          { t: "PER d'assurance, décès après 70 ans : droits de succession après un abattement global de 30 500 €.", s: SRC.per },
          { t: "PER bancaire (compte-titres) : l'épargne entre dans la succession.", s: SRC.per },
        ],
      },
    ],
    cas: [
      {
        titre: "Acheter sa résidence principale", niveau: "Facile",
        enonce: "Inès, 34 ans, a 25 000 € sur son PER individuel, tout en versements volontaires. Elle achète sa première résidence principale.",
        question: "Peut-elle récupérer son épargne ?",
        etapes: ["L'achat de la résidence principale fait partie des cas de déblocage anticipé.", "Seule l'épargne issue des versements obligatoires reste bloquée.", "Ses versements sont volontaires."],
        reponse: "Oui, elle peut tout débloquer. La sortie est taxée comme une sortie en capital.",
        s: SRC.per,
      },
      {
        titre: "Sortie en capital, déduit ou pas ?", niveau: "Intermédiaire",
        enonce: "À la retraite, Karim sort son PER en capital : 50 000 € de versements et 20 000 € de gains.",
        question: "Comment est-ce taxé s'il avait déduit ses versements ? Et sinon ?",
        etapes: ["Gains, dans les deux cas : 20 000 × 31,4 % = 6 280 €.", "Versements déduits : les 50 000 € s'ajoutent à ses revenus, au barème.", "Versements non déduits : les 50 000 € sont exonérés."],
        reponse: "Gains : 6 280 € dans tous les cas. Les 50 000 € sont imposés au barème s'il les avait déduits, exonérés sinon.",
        s: SRC.per,
      },
      {
        titre: "Décès à 72 ans", niveau: "Piège",
        enonce: "Un client a ouvert un PER d'assurance à 50 ans et y a versé jusqu'à 62 ans. Il décède à 72 ans, encore en phase d'épargne.",
        question: "Ses enfants ont-ils 152 500 € d'abattement chacun, comme en assurance-vie ?",
        etapes: ["Pour le PER d'assurance, Service-public retient l'âge au décès du titulaire.", "Décès après 70 ans : abattement global de 30 500 €.", "Le reste suit les droits de succession."],
        reponse: "Non : 30 500 € au total, puis droits de succession. Bien comparer avec l'assurance-vie, où l'âge des versements compte.",
        s: SRC.per,
      },
    ],
    vraiFaux: [
      { texte: "Le surendettement permet de débloquer un PER.", vrai: true, explication: "C'est l'un des 7 cas de déblocage anticipé." },
      { texte: "Transférer un PER de 3 ans vers un autre PER est toujours gratuit.", vrai: false, explication: "Avant 5 ans, des frais de 1 % au maximum peuvent s'appliquer." },
    ],
    quiz: [
      { question: "Versements non déduits, rente commencée à 63 ans : quelle fraction est imposable ?", choix: ["30 %", "40 %", "50 %", "70 %"], bonne: 1, explication: "40 % de 60 à 69 ans." },
      { question: "Taux sur les gains d'une sortie en capital en 2026 ?", choix: ["17,2 %", "30 %", "31,4 %", "12,8 %"], bonne: 2, explication: "12,8 % d'impôt + 18,6 % de prélèvements sociaux." },
      { question: "Frais maximum pour transférer un PER de moins de 5 ans ?", choix: ["0 %", "1 %", "3 %", "5 %"], bonne: 1, explication: "1 % ; gratuit après 5 ans." },
    ],
    cartes: [
      { recto: "Déblocage anticipé", verso: "7 cas : résidence principale, décès du conjoint, invalidité, accident grave d'un enfant, surendettement, fin de chômage, liquidation judiciaire." },
      { recto: "Rente, versements non déduits", verso: "Fraction imposable : 70 / 50 / 40 / 30 % selon l'âge au premier versement." },
    ],
    liens: [{ type: "officiel", titre: "PER individuel (Service-public)", url: SRC.per[1] }],
  },

  // ------------------------------------------------------------------ PEA
  pea: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Qui peut ouvrir, et combien ?", icone: "👤",
        points: [
          { t: "Un seul PEA classique par personne majeure domiciliée fiscalement en France, jamais joint. Chaque époux peut avoir le sien.", s: SRC.pea },
          { t: "Plafonds de versements : 150 000 € pour le PEA, 225 000 € pour le PEA-PME-ETI, et 225 000 € au total pour les deux.", s: SRC.pea },
          { t: "Un jeune majeur rattaché au foyer de ses parents peut ouvrir un PEA plafonné à 20 000 € (pas de PEA-PME-ETI).", s: SRC.pea },
        ],
      },
      {
        titre: "Ce qu'on peut y mettre", icone: "🧺",
        points: [
          { t: "Actions de sociétés de l'Union européenne ou de l'Espace économique européen (hors actions de préférence), parts de SARL, et fonds investis à au moins 75 % en titres éligibles.", s: SRC.pea },
          { t: "Interdit de détenir, avec sa famille, plus de 25 % des droits d'une société via le PEA.", s: SRC.pea },
          { t: "Titres non cotés : l'exonération de leurs revenus est limitée à 10 % du montant investi ; au-delà, ils sont imposés chaque année.", s: SRC.peaBofip },
        ],
      },
      {
        titre: "Retirer avant 5 ans sans clôturer", icone: "⏱️",
        points: [
          { t: "En principe, tout retrait avant 5 ans clôture le plan.", s: SRC.pea },
          { t: "Exceptions : licenciement, invalidité, mise à la retraite anticipée (du titulaire ou de son conjoint), titres d'une société en liquidation, ou création / reprise d'entreprise avec réinvestissement sous 3 mois.", s: SRC.pea },
          { t: "Après un retrait pour créer ou reprendre une entreprise, plus aucun versement n'est possible. Après un licenciement, une invalidité, une retraite anticipée ou une liquidation, les versements restent possibles dans la limite du plafond.", s: SRC.peaRetraits },
          { t: "Fiscalité : création ou reprise d'entreprise, gains exonérés d'impôt ; licenciement, invalidité, retraite anticipée ou liquidation, gains imposés. Les prélèvements sociaux sont dus dans tous les cas.", s: SRC.peaRetraits },
        ],
      },
      {
        titre: "Rente et décès", icone: "🕊️",
        points: [
          { t: "Après 5 ans, une sortie en rente viagère est exonérée d'impôt ; une fraction (70, 50, 40 ou 30 % selon l'âge) supporte les prélèvements sociaux.", s: SRC.pea },
          { t: "Au décès, le plan est clôturé : les gains sont exonérés d'impôt même avant 5 ans, seuls les prélèvements sociaux sont dus, et la valeur entre dans la succession.", s: SRC.pea },
        ],
      },
    ],
    cas: [
      {
        titre: "Le plafond d'une famille", niveau: "Intermédiaire",
        enonce: "Un couple marié et leur fils étudiant de 21 ans, rattaché à leur foyer fiscal.",
        question: "Combien la famille peut-elle verser au maximum sur des PEA ?",
        etapes: ["Chaque époux : 225 000 € au total (PEA + PEA-PME-ETI), dont 150 000 € au plus sur le PEA.", "Deux époux : 2 × 225 000 = 450 000 €.", "Le fils rattaché : PEA plafonné à 20 000 €, sans PEA-PME-ETI."],
        reponse: "470 000 € de versements (hors gains).",
        s: SRC.pea,
      },
      {
        titre: "Licencié à 3 ans", niveau: "Piège",
        enonce: "Ludovic est licencié. Son PEA a 3 ans. Il retire 10 000 €.",
        question: "Son PEA est-il clôturé ? Ses gains sont-ils exonérés ?",
        etapes: ["Le licenciement est une exception : le plan reste ouvert.", "Il peut continuer à verser, dans la limite du plafond.", "Les gains de ce retrait sont imposés, plus les prélèvements sociaux."],
        reponse: "Plan maintenu, versements toujours possibles, mais gains imposés (plus les prélèvements sociaux). Seule la création ou reprise d'entreprise exonère d'impôt avant 5 ans.",
        s: SRC.peaRetraits,
      },
      {
        titre: "Décès à 2 ans", niveau: "Facile",
        enonce: "Le titulaire d'un PEA de 2 ans décède.",
        question: "Les gains sont-ils taxés à l'impôt ?",
        etapes: ["Le décès clôture le plan.", "Les gains sont exonérés d'impôt, même avant 5 ans.", "Seuls les prélèvements sociaux sont dus ; la valeur entre dans la succession."],
        reponse: "Pas d'impôt sur le revenu, seulement les prélèvements sociaux. La valeur du PEA est soumise aux droits de succession.",
        s: SRC.pea,
      },
    ],
    vraiFaux: [
      { texte: "Un couple marié peut ouvrir un PEA commun.", vrai: false, explication: "Le PEA est personnel ; chaque époux ouvre le sien." },
      { texte: "Après 5 ans, un retrait partiel ne clôture pas le PEA.", vrai: true, explication: "Et les versements restent possibles." },
    ],
    quiz: [
      { question: "Plafond de versements cumulés PEA + PEA-PME-ETI par personne ?", choix: ["150 000 €", "225 000 €", "300 000 €", "375 000 €"], bonne: 1, explication: "225 000 €, dont 150 000 € au plus sur le PEA classique." },
      { question: "Quel retrait avant 5 ans est exonéré d'impôt ?", choix: ["Licenciement", "Invalidité", "Création ou reprise d'entreprise", "Aucun"], bonne: 2, explication: "Les fonds doivent être réinvestis dans les 3 mois." },
    ],
    cartes: [
      { recto: "PEA d'un jeune rattaché", verso: "Plafond de 20 000 € tant qu'il est rattaché au foyer de ses parents." },
      { recto: "Règle des 25 %", verso: "Pas plus de 25 % des droits d'une société, avec sa famille, dans un PEA." },
    ],
    liens: [
      { type: "officiel", titre: "Le PEA (Service-public)", url: SRC.pea[1] },
      { type: "officiel", titre: "Retraits et clôture (BOFiP)", url: SRC.peaRetraits[1] },
    ],
  },

  // ------------------------------------------------------------------ SCPI
  scpi: {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Les 3 risques à dire au client", icone: "⚠️",
        points: [
          { t: "Capital non garanti : le prix de revente peut être inférieur au prix d'achat.", s: SRC.scpiAmf },
          { t: "Revenus non garantis : ils baissent si des locataires partent ou si les relocations sont moins favorables.", s: SRC.scpiAmf },
          { t: "Liquidité limitée : revendre peut prendre plusieurs semaines, voire plusieurs mois. L'AMF conseille un horizon long, de 10 à 20 ans.", s: SRC.scpiAmf },
        ],
      },
      {
        titre: "Les frais en clair", icone: "💸",
        points: [
          { t: "Frais de souscription : entre 5 et 12 % selon l'AMF.", s: SRC.scpiAmf },
          { t: "Frais de gestion : 8 à 10 % des revenus chaque année.", s: SRC.scpiAmf },
          { t: "En SCPI à capital variable, le prix de retrait = prix de souscription − commission de souscription.", s: SRC.scpiRetrait },
        ],
      },
      {
        titre: "Revendre : retrait ou ordre de vente ?", icone: "🚪",
        points: [
          { t: "Capital variable : on dépose une demande de retrait, exécutée seulement s'il y a de nouvelles souscriptions en face, dans l'ordre d'arrivée.", s: SRC.scpiRetrait },
          { t: "Une demande de retrait n'expire pas. La renouveler fait perdre sa place dans la file.", s: SRC.scpiRetrait },
          { t: "Capital fixe : on passe un ordre de vente sur le marché secondaire, valable 12 mois, prolongeable de 12 mois sur demande.", s: SRC.scpiRetrait },
          { t: "Si des retraits en attente depuis plus de 12 mois atteignent 10 % des parts, la société de gestion doit prévenir l'AMF et réunir une assemblée dans les 2 mois.", s: SRC.scpiRetrait },
          { t: "Une vente de gré à gré (trouver soi-même un acheteur) reste possible, sous réserve d'une clause d'agrément.", s: SRC.scpiRetrait },
        ],
      },
      {
        titre: "À vérifier avant d'investir", icone: "🔍",
        points: [
          { t: "Type d'immeubles, qualité et diversification du parc, régularité des revenus, stabilité du taux d'occupation.", s: SRC.scpiAmf },
          { t: "Le bulletin trimestriel indique le nombre de parts en attente de retrait : un bon indicateur de liquidité.", s: SRC.scpiRetrait },
          { t: "Avoir déjà une épargne de précaution et n'investir que de l'argent inutile avant plusieurs années.", s: SRC.scpiAmf },
        ],
      },
    ],
    cas: [
      {
        titre: "Revendre tout de suite", niveau: "Facile",
        enonce: "Un client achète 10 000 € de parts d'une SCPI à capital variable avec 10 % de commission de souscription. Il veut sortir 3 mois plus tard, prix inchangé.",
        question: "Combien récupère-t-il, au mieux ?",
        etapes: ["Prix de retrait = prix de souscription − commission.", "10 000 − 10 % = 9 000 €.", "Et seulement si de nouveaux souscripteurs prennent le relais."],
        reponse: "Au mieux 9 000 €, soit 1 000 € de perte. Une SCPI ne se garde pas 3 mois.",
        s: SRC.scpiRetrait,
      },
      {
        titre: "Relancer sa demande", niveau: "Piège",
        enonce: "Six mois après sa demande de retrait, une cliente veut la refaire « pour relancer la société de gestion ».",
        question: "Bonne idée ?",
        etapes: ["Une demande de retrait n'a pas de durée de validité.", "La renouveler fait perdre son rang dans la file d'attente.", "Mieux vaut suivre le bulletin trimestriel et appeler la société de gestion."],
        reponse: "Non : elle repasserait en fin de file. Sa demande reste valable tant qu'elle ne la révoque pas.",
        s: SRC.scpiRetrait,
      },
    ],
    vraiFaux: [
      { texte: "Un ordre de vente de parts de SCPI à capital fixe est valable sans limite de durée.", vrai: false, explication: "12 mois, prolongeable de 12 mois sur demande expresse." },
      { texte: "Une demande de retrait complète garantit un remboursement rapide.", vrai: false, explication: "Non : il faut des souscriptions en contrepartie ; le délai peut être indéterminé (médiateur de l'AMF)." },
    ],
    quiz: [
      { question: "Frais de gestion annuels d'une SCPI selon l'AMF ?", choix: ["1 à 2 % du capital", "8 à 10 % des revenus", "5 à 12 % des revenus", "Aucun"], bonne: 1, explication: "8 à 10 % des revenus ; les 5 à 12 % sont les frais d'entrée." },
      { question: "Que se passe-t-il si les retraits bloqués depuis plus de 12 mois atteignent 10 % des parts ?", choix: ["Rien", "La SCPI est dissoute", "L'AMF est prévenue et une assemblée est convoquée", "Les parts sont rachetées par l'État"], bonne: 2, explication: "Assemblée générale extraordinaire dans les 2 mois." },
    ],
    cartes: [
      { recto: "Demande de retrait", verso: "SCPI à capital variable : pas de durée de validité, exécutée s'il y a des souscriptions en face." },
      { recto: "Ordre de vente", verso: "SCPI à capital fixe : valable 12 mois, prolongeable 12 mois." },
    ],
    liens: [
      { type: "officiel", titre: "Investir dans une SCPI (AMF)", url: SRC.scpiAmf[1] },
      { type: "officiel", titre: "Retrait ou ordre de vente (AMF)", url: SRC.scpiRetrait[1] },
      { type: "officiel", titre: "Délai de retrait non garanti (médiateur AMF)", url: SRC.scpiDelai[1] },
    ],
  },

  // ------------------------------------------------------------------ PRODUITS STRUCTURÉS
  "produits-structures": {
    verifie: "14 novembre 2026",
    blocs: [
      {
        titre: "Le vocabulaire, version AMF", icone: "📖",
        points: [
          { t: "Produit structuré : placement dont la valeur dépend d'un ou plusieurs sous-jacents, selon une formule fixée à l'avance.", s: SRC.psNote },
          { t: "Autocall : le produit s'arrête tout seul avant l'échéance si un seuil est atteint à une date d'observation ; le capital est remboursé avec les gains prévus.", s: SRC.psNote },
          { t: "Barrière : à l'échéance, si elle n'a pas été franchie, le capital est rendu (hors frais de l'enveloppe) ; si elle l'a été, la perte égale la baisse de l'indice, jusqu'à la perte totale.", s: SRC.psNote },
          { t: "Indice à décrément : un indice dividendes réinvestis dont on retire chaque année un montant fixe. La performance peut en être nettement réduite.", s: SRC.psNote },
          { t: "Selon la situation de l'émetteur, l'investisseur peut perdre une partie ou la totalité de son capital.", s: SRC.psNote },
        ],
      },
      {
        titre: "Ce que dit l'étude AMF-ACPR de juin 2026", icone: "📊",
        points: [
          { t: "La très grande majorité des produits sont des autocalls.", s: SRC.psEtude },
          { t: "Fin 2024 : 74 % offrent une protection du capital, dont 14 % totale et inconditionnelle ; 26 % n'en offrent aucune.", s: SRC.psEtude },
          { t: "Sur 2022-2024, durée moyenne avant rappel : environ 2 ans, pour une échéance théorique de 8 à 12 ans (marchés haussiers).", s: SRC.psEtude },
          { t: "Coût d'entrée total moyen : 5,83 % (de 1,20 % à 13,16 %), dont, en moyenne, 3,95 % perçus par le distributeur final lorsqu'il s'agit d'un CIF-CGP (données déclaratives).", s: SRC.psEtude },
          { t: "Sur 2022-2024, retard de 2,4 points par rapport à des fonds indiciels sur les mêmes sous-jacents (échantillon de 65 produits).", s: SRC.psEtude },
        ],
      },
      {
        titre: "Ce que l'AMF attend du conseiller", icone: "✅",
        points: [
          { t: "Définir son propre marché cible au lieu de recopier celui du producteur.", s: SRC.psEtude },
          { t: "Évaluer les connaissances et l'expérience du client avec un questionnaire qui ne repose pas sur sa seule auto-évaluation.", s: SRC.psEtude },
          { t: "Annoncer les coûts avant la souscription, en montant total : seuls 13 % des prestataires contrôlés le faisaient correctement.", s: SRC.psEtude },
        ],
      },
    ],
    cas: [
      {
        titre: "La barrière franchie", niveau: "Facile",
        enonce: "Autocall de 50 000 €, barrière à −40 %. Jamais rappelé. À l'échéance, l'indice a baissé de 45 % depuis le lancement.",
        question: "Que récupère le client ?",
        etapes: ["La baisse (−45 %) dépasse la barrière (−40 %) : la protection saute.", "La perte égale la baisse de l'indice : 45 %.", "50 000 × 55 % = 27 500 €."],
        reponse: "27 500 € (hors frais de l'enveloppe). La barrière protège d'une baisse modérée, pas d'une forte baisse.",
        s: SRC.psNote,
      },
      {
        titre: "Le coût d'entrée", niveau: "Intermédiaire",
        enonce: "Un client place 50 000 € dans un produit structuré dont le coût d'entrée est égal à la moyenne de l'étude AMF-ACPR.",
        question: "Combien de frais à l'entrée ?",
        etapes: ["Coût d'entrée moyen : 5,83 %.", "50 000 × 5,83 % = 2 915 €."],
        reponse: "Environ 2 915 €, à annoncer au client en montant total avant la souscription.",
        s: SRC.psEtude,
      },
      {
        titre: "Comparer avec le CAC 40", niveau: "Piège",
        enonce: "Un client compare son produit, indexé sur un indice à décrément, avec la hausse du CAC 40 publiée dans la presse.",
        question: "La comparaison est-elle juste ?",
        etapes: ["Un indice à décrément part des dividendes réinvestis puis retire un montant fixe.", "Ce n'est pas le même indice que le CAC 40 classique.", "L'AMF note que cela complique la comparaison."],
        reponse: "Non : il faut comparer à l'indice exact du produit, indiqué dans sa documentation.",
        s: SRC.psNote,
      },
    ],
    vraiFaux: [
      { texte: "Un produit structuré à barrière garantit le capital.", vrai: false, explication: "Seulement si la barrière n'est pas franchie, et sous réserve de la solidité de l'émetteur." },
      { texte: "En 2022-2024, les autocalls ont souvent été remboursés bien avant leur échéance.", vrai: true, explication: "Environ 2 ans en moyenne, contre 8 à 12 ans théoriques (étude AMF-ACPR)." },
    ],
    quiz: [
      { question: "Quel est le coût d'entrée moyen relevé par l'AMF-ACPR en 2026 ?", choix: ["0,56 %", "2,69 %", "5,83 %", "13,16 %"], bonne: 2, explication: "5,83 % en moyenne, de 1,20 % à 13,16 %." },
      { question: "Barrière à −30 %, baisse de 35 % à l'échéance : perte ?", choix: ["0 %", "5 %", "30 %", "35 %"], bonne: 3, explication: "La barrière est franchie : la perte égale la baisse de l'indice." },
    ],
    cartes: [
      { recto: "Indice à décrément", verso: "Indice dividendes réinvestis moins un montant fixe chaque année." },
      { recto: "Coût d'entrée moyen (AMF-ACPR 2026)", verso: "5,83 %, de 1,20 % à 13,16 %." },
    ],
    liens: [
      { type: "officiel", titre: "Note explicative produits structurés (AMF)", url: SRC.psNote[1] },
      { type: "officiel", titre: "Étude frais et performances (AMF-ACPR, 2026)", url: SRC.psEtude[1] },
    ],
  },
});

// ====================================================================== LOT 3 : IFI, GIRARDIN, APPORT-CESSION, DUTREIL (vérifié le 15 novembre 2026)
Object.assign(SRC, {
  ifiCalcul: ["Service-public · Calcul de l'IFI", "https://www.service-public.gouv.fr/particuliers/vosdroits/F138"],
  ifiPassif: ["impots.gouv.fr · Passif déductible à l'IFI", "https://www.impots.gouv.fr/particulier/questions/que-puis-je-deduire-au-niveau-du-passif-de-limpot-sur-la-fortune-immobiliere"],
  ifiInFine: ["BOFiP · Prêts in fine à l'IFI", "https://bofip.impots.gouv.fr/bofip/11365-PGP.html/identifiant=BOI-PAT-IFI-20-40-20-20190502"],
  ifiBiens: ["impots.gouv.fr · Patrimoine taxable à l'IFI", "https://www.impots.gouv.fr/particulier/patrimoine-taxable-lifi"],
  ifiPretsFam: ["BOFiP · IFI, dettes non déductibles", "https://bofip.impots.gouv.fr/bofip/11367-PGP.html/identifiant=BOI-PAT-IFI-20-40-30-20180608"],
  cgi787B: ["Légifrance · CGI art. 787 B", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047623071"],
  dutreil2026: ["BOFiP · Dutreil, loi de finances 2026", "https://bofip.impots.gouv.fr/bofip/15125-PGP.html/ACTU-2026-00114"],
  cgi150: ["Légifrance · CGI art. 150-0 B ter", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053542872"],
  apport2026: ["BOFiP · Apport-cession, loi de finances 2026", "https://bofip.impots.gouv.fr/bofip/15099-PGP.html/ACTU-2026-00099"],
  cgi199: ["Légifrance · CGI art. 199 undecies B", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051202835"],
});

Object.assign(APPROFONDI, {
  // ------------------------------------------------------------------ IFI
  ifi: {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "La décote, entre 1,3 et 1,4 M€", icone: "📉",
        points: [
          { t: "Décote = 17 500 € − 1,25 % × patrimoine net taxable, à retirer de l'IFI brut.", s: SRC.ifiCalcul },
          { t: "Exemple officiel : 1 350 000 € nets → IFI brut 2 850 €, décote 625 €, IFI à payer 2 225 €.", s: SRC.ifiCalcul },
        ],
      },
      {
        titre: "Les dettes : ce qui se déduit", icone: "➖",
        points: [
          { t: "Une dette se déduit si elle existe au 1er janvier, est à la charge du foyer et concerne des biens taxables.", s: SRC.ifiPassif },
          { t: "Déductibles : emprunts pour acheter ou faire des travaux, charges de copropriété impayées au 1er janvier, taxe foncière et IFI théorique.", s: SRC.ifiPassif },
          { t: "Non déductibles en principe : les prêts consentis par un membre du foyer, un ascendant, un descendant, un frère ou une sœur (ou une société qu'on contrôle), sauf si l'on prouve que le prêt est conclu à des conditions normales. Les dettes liées à des biens exonérés ne se déduisent pas non plus.", s: SRC.ifiPretsFam },
          { t: "Résidence principale : la dette se déduit dans la limite de sa valeur imposable (70 % de sa valeur, après l'abattement de 30 %).", s: SRC.ifiPassif },
          { t: "Au-delà de 5 M€ de patrimoine, la part des dettes qui dépasse 60 % de sa valeur ne se déduit qu'à moitié.", s: SRC.ifiPassif },
        ],
      },
      {
        titre: "Le prêt in fine", icone: "⏳",
        points: [
          { t: "Il ne se déduit pas en totalité chaque année : déduction = montant emprunté − montant emprunté × années écoulées ÷ durée du prêt.", s: SRC.ifiInFine },
          { t: "Seules les années complètes comptent. Un prêt sans terme est traité comme un prêt de 20 ans (−1/20 par an).", s: SRC.ifiInFine },
        ],
      },
      {
        titre: "Ce qui allège encore", icone: "🌲",
        points: [
          { t: "Biens immobiliers affectés à l'activité professionnelle principale : exonérés sous conditions.", s: SRC.ifiBiens },
          { t: "Bois et forêts, parts de groupements forestiers : exonérés à 75 %. Biens ruraux loués à long terme : exonération partielle, sous conditions.", s: SRC.ifiBiens },
          { t: "Don à un organisme d'intérêt général : réduction d'IFI de 75 % du don, dans la limite de 50 000 €.", s: SRC.ifiCalcul },
          { t: "Plafonnement : si IFI + impôts sur le revenu dépassent 75 % des revenus de l'année précédente, l'IFI baisse de l'excédent.", s: SRC.ifiCalcul },
        ],
      },
    ],
    cas: [
      {
        titre: "Juste au-dessus du seuil", niveau: "Facile",
        enonce: "Un couple a 1 350 000 € de patrimoine immobilier net taxable au 1er janvier.",
        question: "Combien d'IFI ?",
        etapes: ["De 800 000 à 1 300 000 € : 500 000 × 0,5 % = 2 500 €.", "De 1 300 000 à 1 350 000 € : 50 000 × 0,7 % = 350 €.", "IFI brut : 2 850 €.", "Décote : 17 500 − 1 350 000 × 1,25 % = 625 €."],
        reponse: "2 850 − 625 = 2 225 €.",
        s: SRC.ifiCalcul,
      },
      {
        titre: "Le prêt in fine", niveau: "Intermédiaire",
        enonce: "Prêt in fine de 600 000 € sur 10 ans, versé le 1er mars 2023, pour un appartement loué.",
        question: "Combien peut-on déduire dans l'IFI 2026 ?",
        etapes: ["Au 1er janvier 2026, 2 années complètes se sont écoulées (mars 2023 → mars 2025).", "Déduction = 600 000 − 600 000 × 2 ÷ 10.", "= 600 000 − 120 000."],
        reponse: "480 000 €, et non 600 000 €.",
        s: SRC.ifiInFine,
      },
      {
        titre: "Beaucoup de dettes", niveau: "Piège",
        enonce: "Un client a 6 M€ de patrimoine immobilier taxable et 4 M€ de dettes.",
        question: "Peut-il déduire les 4 M€ ?",
        etapes: ["Patrimoine supérieur à 5 M€ : plafonnement des dettes.", "60 % de 6 M€ = 3,6 M€, déductibles en totalité.", "Excédent : 0,4 M€, déductible à 50 % = 0,2 M€."],
        reponse: "Non : 3,8 M€ seulement.",
        s: SRC.ifiPassif,
      },
    ],
    vraiFaux: [
      { texte: "Un prêt consenti par les parents se déduit toujours à l'IFI.", vrai: false, explication: "En principe non, sauf si l'on prouve qu'il est conclu à des conditions normales (échéances respectées, vrais remboursements)." },
      { texte: "Un don à un organisme d'intérêt général réduit l'IFI de 75 % du don.", vrai: true, explication: "Dans la limite de 50 000 € de réduction." },
    ],
    quiz: [
      { question: "IFI brut pour 2 000 000 € nets taxables ?", choix: ["2 500 €", "4 900 €", "7 400 €", "14 000 €"], bonne: 2, explication: "500 000 × 0,5 % + 700 000 × 0,7 % = 2 500 + 4 900 = 7 400 €." },
      { question: "Quelle décote pour 1 380 000 € ?", choix: ["0 €", "250 €", "625 €", "17 500 €"], bonne: 1, explication: "17 500 − 1 380 000 × 1,25 % = 17 500 − 17 250 = 250 €." },
    ],
    cartes: [
      { recto: "Décote IFI", verso: "17 500 € − 1,25 % du patrimoine net, entre 1,3 et 1,4 M€." },
      { recto: "Prêt in fine (IFI)", verso: "Déduction dégressive : montant × (1 − années écoulées ÷ durée)." },
    ],
    liens: [
      { type: "officiel", titre: "Calcul de l'IFI (Service-public)", url: SRC.ifiCalcul[1] },
      { type: "officiel", titre: "Passif déductible (impots.gouv.fr)", url: SRC.ifiPassif[1] },
      { type: "officiel", titre: "Patrimoine taxable (impots.gouv.fr)", url: SRC.ifiBiens[1] },
    ],
  },

  // ------------------------------------------------------------------ PACTE DUTREIL
  "pacte-dutreil": {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Quelle société ?", icone: "🏭",
        points: [
          { t: "Activité principale industrielle, commerciale, artisanale, agricole ou libérale. Gérer son propre patrimoine mobilier ou immobilier ne compte pas.", s: SRC.cgi787B },
          { t: "Une holding « animatrice » est admise : elle participe activement à la politique de son groupe et, le cas échéant, rend à ses filiales des services internes.", s: SRC.cgi787B },
        ],
      },
      {
        titre: "Les biens de luxe exclus (depuis le 21 février 2026)", icone: "🛥️",
        points: [
          { t: "Est exclue la valeur de certains biens qui ne sont pas affectés exclusivement à l'activité pendant les 3 ans avant la transmission (ou depuis leur achat) et jusqu'à la fin de l'engagement individuel : biens de chasse ou de pêche, véhicules de tourisme, yachts et bateaux de plaisance, aéronefs, bijoux, métaux précieux, objets d'art, de collection ou d'antiquité, chevaux de course ou de concours, vins et alcools, logements et résidences.", s: SRC.cgi787B },
          { t: "La règle s'applique aussi aux biens détenus par les filiales contrôlées.", s: SRC.cgi787B },
          { t: "Elle vise les transmissions à partir du 21 février 2026, comme l'engagement individuel porté à 6 ans.", s: SRC.dutreil2026 },
        ],
      },
      {
        titre: "L'engagement collectif en détail", icone: "🤝",
        points: [
          { t: "Seuils : 17 % des droits financiers et 34 % des droits de vote (non coté) ; 10 % et 20 % (coté), à respecter pendant toute la durée.", s: SRC.cgi787B },
          { t: "Pas d'engagement au décès ? Les héritiers peuvent le signer dans les 6 mois.", s: SRC.cgi787B },
          { t: "Engagement « réputé acquis » : détention depuis 2 ans au moins (seul ou avec son conjoint, partenaire ou concubin) atteignant les seuils, si l'un d'eux travaille ou dirige la société depuis 2 ans.", s: SRC.cgi787B },
          { t: "Il ne s'impose à l'administration qu'à partir de l'enregistrement de l'acte qui le constate.", s: SRC.cgi787B },
        ],
      },
      {
        titre: "Après la transmission", icone: "📋",
        points: [
          { t: "Chaque bénéficiaire conserve ses titres 6 ans à compter de la fin de l'engagement collectif : au moins 8 ans au total.", s: SRC.cgi787B },
          { t: "Une attestation de la société accompagne la déclaration ou l'acte, puis une autre est fournie dans les 3 mois après la fin de l'engagement individuel.", s: SRC.cgi787B },
          { t: "Donation avec réserve d'usufruit possible si les statuts limitent les droits de vote de l'usufruitier aux décisions sur les bénéfices.", s: SRC.cgi787B },
        ],
      },
    ],
    cas: [
      {
        titre: "Le décès sans pacte", niveau: "Facile",
        enonce: "Un chef d'entreprise décède sans avoir signé de pacte Dutreil. Ses deux enfants héritent des titres.",
        question: "Le Dutreil est-il perdu ?",
        etapes: ["La loi permet aux héritiers de signer l'engagement collectif après le décès.", "Délai : 6 mois après la transmission.", "Puis chacun prend l'engagement individuel de 6 ans."],
        reponse: "Non, s'ils signent l'engagement collectif dans les 6 mois.",
        s: SRC.cgi787B,
      },
      {
        titre: "Le yacht dans la société", niveau: "Intermédiaire",
        enonce: "Une société vaut 3 M€, dont un yacht de 300 000 € qui n'est pas utilisé exclusivement pour l'activité. Donation sous Dutreil en mars 2026.",
        question: "Sur quelle valeur portent les droits, avant abattement ?",
        etapes: ["Le yacht est exclu de l'exonération : 300 000 € taxables en entier.", "Le reste : 2 700 000 €, exonéré à 75 %.", "25 % × 2 700 000 = 675 000 €.", "675 000 + 300 000 = 975 000 €."],
        reponse: "975 000 €, contre 750 000 € avant la loi de finances 2026.",
        s: SRC.cgi787B,
      },
      {
        titre: "L'usufruit qui garde tout", niveau: "Piège",
        enonce: "Un père donne la nue-propriété de ses titres à ses enfants sous Dutreil, garde l'usufruit et tous les droits de vote.",
        question: "Le Dutreil s'applique-t-il ?",
        etapes: ["La donation avec réserve d'usufruit est possible.", "Mais les droits de vote de l'usufruitier doivent être limités, par les statuts, aux décisions sur les bénéfices.", "Ici, le père garde tous les votes."],
        reponse: "Non, tant que les statuts ne sont pas modifiés. À régler avant la donation.",
        s: SRC.cgi787B,
      },
    ],
    vraiFaux: [
      { texte: "Une holding animatrice peut bénéficier du pacte Dutreil.", vrai: true, explication: "Elle est considérée comme ayant une activité commerciale (art. 787 B)." },
      { texte: "Les héritiers peuvent signer l'engagement collectif dans l'année du décès.", vrai: false, explication: "Dans les 6 mois." },
    ],
    quiz: [
      { question: "Seuils de l'engagement collectif pour une société cotée ?", choix: ["17 % et 34 %", "10 % et 20 %", "25 % et 50 %", "5 % et 10 %"], bonne: 1, explication: "10 % des droits financiers et 20 % des droits de vote." },
      { question: "Durée minimale totale de conservation (collectif + individuel) depuis 2026 ?", choix: ["4 ans", "6 ans", "8 ans", "10 ans"], bonne: 2, explication: "2 ans d'engagement collectif + 6 ans d'engagement individuel." },
    ],
    cartes: [
      { recto: "Engagement réputé acquis", verso: "Détention depuis 2 ans aux seuils, avec une activité ou une direction dans la société depuis 2 ans." },
      { recto: "Biens somptuaires", verso: "Exclus de l'exonération s'ils ne sont pas affectés exclusivement à l'activité 3 ans avant la transmission et jusqu'à la fin de l'engagement individuel." },
    ],
    liens: [
      { type: "officiel", titre: "Article 787 B du CGI (Légifrance)", url: SRC.cgi787B[1] },
      { type: "officiel", titre: "Nouveautés 2026 (BOFiP)", url: SRC.dutreil2026[1] },
    ],
  },

  // ------------------------------------------------------------------ APPORT-CESSION
  "apport-cession": {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Comment réinvestir ?", icone: "🔁",
        points: [
          { t: "Financer des moyens d'exploitation d'une activité opérationnelle ; la gestion de son propre patrimoine immobilier est exclue.", s: SRC.cgi150 },
          { t: "Acheter des titres donnant le contrôle d'une société opérationnelle, ou souscrire au capital de sociétés éligibles.", s: SRC.cgi150 },
          { t: "Souscrire à des fonds (FCPR, FPCI, SLP, SCR) respectant des quotas ; les sommes doivent être appelées et versées dans les 5 ans.", s: SRC.cgi150 },
          { t: "Les biens ou titres acquis sont conservés au moins 5 ans.", s: SRC.cgi150 },
        ],
      },
      {
        titre: "Les détails qui coûtent cher", icone: "⚠️",
        points: [
          { t: "Une soulte est admise jusqu'à 10 % de la valeur nominale des titres reçus ; la plus-value correspondante est imposée tout de suite.", s: SRC.cgi150 },
          { t: "Chaque complément de prix ouvre un nouveau délai de 3 ans pour réinvestir 70 % de ce complément.", s: SRC.cgi150 },
          { t: "Si le réinvestissement n'est pas respecté, la plus-value est imposée avec l'intérêt de retard, compté depuis la date de l'apport.", s: SRC.cgi150 },
          { t: "Le transfert du domicile fiscal hors de France fait aussi tomber le report.", s: SRC.cgi150 },
        ],
      },
      {
        titre: "Donation des titres de la holding", icone: "🎁",
        points: [
          { t: "Si le donataire contrôle la holding, il reprend la plus-value en report ; elle est imposée chez lui s'il cède, apporte ou annule les titres dans les 6 ans (11 ans pour un réinvestissement en fonds).", s: SRC.apport2026 },
          { t: "Pas de remise en cause en cas de décès du donataire (ou de son conjoint ou partenaire de PACS soumis à imposition commune), d'invalidité de 2e ou 3e catégorie ou de licenciement.", s: SRC.cgi150 },
        ],
      },
    ],
    cas: [
      {
        titre: "Réinvestir trop peu", niveau: "Facile",
        enonce: "Apport en 2026 (plus-value de 1 M€). La holding revend 18 mois plus tard pour 3 M€ et ne réinvestit que 1,8 M€ dans les 3 ans.",
        question: "Le report est-il maintenu ?",
        etapes: ["Cession dans les 3 ans de l'apport : il faut réinvestir 70 %.", "70 % × 3 M€ = 2,1 M€.", "1,8 M€ < 2,1 M€."],
        reponse: "Non : le report tombe, la plus-value de 1 M€ est imposée, avec l'intérêt de retard depuis la date de l'apport.",
        s: SRC.cgi150,
      },
      {
        titre: "Le complément de prix", niveau: "Intermédiaire",
        enonce: "La holding a vendu la société 2 ans après l'apport et a réinvesti correctement. Un an plus tard, elle reçoit un complément de prix de 500 000 €.",
        question: "Que doit-elle faire ?",
        etapes: ["Le complément de prix ouvre un nouveau délai de 3 ans.", "Il faut réinvestir 70 % du complément.", "70 % × 500 000 = 350 000 €."],
        reponse: "Réinvestir 350 000 € dans des actifs éligibles dans les 3 ans suivant ce complément.",
        s: SRC.cgi150,
      },
      {
        titre: "La SCI de location", niveau: "Piège",
        enonce: "Le dirigeant veut que sa holding réinvestisse le prix dans une SCI qui achète des appartements à louer.",
        question: "Est-ce un réinvestissement éligible ?",
        etapes: ["Le réinvestissement doit financer une activité opérationnelle.", "La gestion de son propre patrimoine immobilier est expressément exclue."],
        reponse: "Non : la location d'appartements n'est pas éligible, le report tomberait.",
        s: SRC.cgi150,
      },
    ],
    vraiFaux: [
      { texte: "Un complément de prix doit aussi être réinvesti à 70 %.", vrai: true, explication: "Dans un nouveau délai de 3 ans (art. 150-0 B ter)." },
      { texte: "Quitter la France n'a pas d'effet sur le report.", vrai: false, explication: "Le transfert du domicile fiscal hors de France fait tomber le report." },
    ],
    quiz: [
      { question: "Prix de 4 M€ cédé dans les 3 ans de l'apport. Minimum à réinvestir ?", choix: ["2,4 M€", "2,8 M€", "3 M€", "4 M€"], bonne: 1, explication: "70 % × 4 M€ = 2,8 M€." },
      { question: "Soulte maximale admise lors de l'apport ?", choix: ["5 %", "10 % de la valeur nominale des titres reçus", "20 %", "Aucune"], bonne: 1, explication: "10 % de la valeur nominale ; la plus-value correspondante est imposée tout de suite." },
    ],
    cartes: [
      { recto: "Intérêt de retard (150-0 B ter)", verso: "Dû depuis la date de l'apport si l'obligation de réinvestir n'est pas respectée." },
      { recto: "Complément de prix", verso: "Nouveau délai de 3 ans pour réinvestir 70 %." },
    ],
    liens: [
      { type: "officiel", titre: "Article 150-0 B ter du CGI (Légifrance)", url: SRC.cgi150[1] },
      { type: "officiel", titre: "Nouveautés 2026 (BOFiP)", url: SRC.apport2026[1] },
    ],
  },

  // ------------------------------------------------------------------ GIRARDIN
  "girardin-industriel": {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Ce que dit le texte (art. 199 undecies B)", icone: "📜",
        points: [
          { t: "Réduction de base : 38,25 % du prix hors taxes du matériel neuf ; 45,9 % notamment en Guyane, à Mayotte, Saint-Pierre-et-Miquelon, Wallis-et-Futuna, en Nouvelle-Calédonie. Énergies renouvelables : 45,9 % (53,55 % dans ces territoires).", s: SRC.cgi199 },
          { t: "En location, 66 % de l'avantage doit être rétrocédé à l'entreprise locataire (baisse du loyer et du prix de rachat) ; 56 % pour les programmes de moins de 300 000 € par exploitant.", s: SRC.cgi199 },
          { t: "Conservation : 5 ans, ou la durée normale d'utilisation si elle est plus courte (7 ans au moins si cette durée atteint 7 ans).", s: SRC.cgi199 },
          { t: "Agrément du ministère du Budget au-delà de 1 M€ par programme, ou de 250 000 € quand l'investisseur ne participe pas à l'exploitation ; obligatoire quel que soit le montant dans certains secteurs (transports, plaisance, agriculture, pêche…).", s: SRC.cgi199 },
        ],
      },
      {
        titre: "Si la réduction dépasse l'impôt", icone: "➡️",
        points: [
          { t: "La partie non utilisée se reporte sur l'impôt sur le revenu des années suivantes, jusqu'à la 5e année incluse.", s: SRC.cgi199 },
          { t: "Si le locataire cesse son activité, la reprise de la réduction est limitée aux trois quarts.", s: SRC.cgi199 },
        ],
      },
    ],
    cas: [
      {
        titre: "Trop de réduction", niveau: "Piège",
        enonce: "Une cliente paie 7 000 € d'impôt. Son opération Girardin lui donne 10 000 € de réduction.",
        question: "Les 3 000 € en trop sont-ils perdus ?",
        etapes: ["La réduction s'impute d'abord sur l'impôt de l'année : 7 000 €.", "Le solde de 3 000 € se reporte sur les années suivantes, jusqu'à la 5e.", "Mais elle a avancé de l'argent pour un gain retardé et incertain."],
        reponse: "Non, ils se reportent jusqu'à 5 ans. Mieux vaut quand même dimensionner l'apport à l'impôt de l'année.",
        s: SRC.cgi199,
      },
    ],
    vraiFaux: [
      { texte: "Un programme de 400 000 € auquel l'investisseur ne participe pas doit être agréé.", vrai: true, explication: "Seuil de 250 000 € quand l'investisseur ne participe pas à l'exploitation." },
    ],
    quiz: [
      { question: "Taux de rétrocession au locataire pour un programme de 200 000 € ?", choix: ["44 %", "56 %", "66 %", "100 %"], bonne: 1, explication: "56 % sous 300 000 € par exploitant, 66 % au-delà." },
    ],
    liens: [{ type: "officiel", titre: "Article 199 undecies B du CGI (Légifrance)", url: SRC.cgi199[1] }],
  },
});

// ====================================================================== NOUVELLES FICHES (vérifié le 15 novembre 2026)
Object.assign(SRC, {
  spSci: ["Service-public · SCI : ce qu'il faut savoir", "https://entreprendre.service-public.gouv.fr/vosdroits/F38553"],
  sciMeuble: ["impots.gouv.fr · Les SCI", "https://www.impots.gouv.fr/particulier/les-sci"],
  sciPv: ["impots.gouv.fr · Plus-value d'une SCI à l'IR", "https://www.impots.gouv.fr/particulier/questions/la-societe-civile-immobiliere-imposee-limpot-sur-le-revenu-dont-je-suis"],
  sciLivret: ["impots.gouv.fr · Livret fiscal des sociétés civiles", "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/1_creation_entreprise/livret_fiscal/nid_12250_sci_livret_fiscal_createur_dentreprise.pdf"],
  cc1861: ["Légifrance · Code civil art. 1861", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006444345"],
  crl: ["BOFiP · Contribution sur les revenus locatifs", "https://bofip.impots.gouv.fr/bofip/9659-PGP.html/identifiant=BOI-RFPI-CTRL-20-10-20140808"],
  isPv: ["BOFiP · Plus-values à l'IS", "https://bofip.impots.gouv.fr/bofip/5642-PGP.html/identifiant=BOI-IS-BASE-20-20130311"],
  cc1857: ["Légifrance · Code civil art. 1857", "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006444321"],
});

Object.assign(APPROFONDI, {
  sci: {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Créer et faire vivre la SCI", icone: "🏗️",
        points: [
          { t: "Au moins 2 associés, personnes physiques ou sociétés ; possible entre époux, quel que soit leur régime matrimonial.", s: SRC.spSci },
          { t: "Capital libre (1 € minimum), en argent ou en biens ; les apports en industrie (son travail) n'entrent pas dans le capital.", s: SRC.spSci },
          { t: "Un ou plusieurs gérants, associés ou non. Sauf clause contraire, nommés et révoqués à la majorité des parts ; ils rendent compte au moins une fois par an.", s: SRC.spSci },
          { t: "Les décisions qui dépassent les pouvoirs du gérant se prennent à l'unanimité, sauf autre majorité prévue par les statuts, avec un procès-verbal.", s: SRC.spSci },
        ],
      },
      {
        titre: "La responsabilité des associés", icone: "⚖️",
        points: [
          { t: "Les associés répondent indéfiniment des dettes, à proportion de leur part dans le capital à la date où la dette est exigible (art. 1857).", s: SRC.cc1857 },
          { t: "Non solidaire et subsidiaire : chacun pour sa part, et le créancier doit d'abord agir contre la société.", s: SRC.spSci },
        ],
      },
      {
        titre: "Les déclarations fiscales", icone: "🧾",
        points: [
          { t: "SCI à l'impôt sur le revenu : déclaration 2072 chaque année ; chaque associé reporte sa quote-part sur sa déclaration 2044.", s: SRC.sciLivret },
          { t: "SCI à l'impôt sur les sociétés : déclaration 2065 et comptabilité commerciale ; un déficit ne se déduit pas des revenus des associés.", s: SRC.sciMeuble },
          { t: "Location meublée : c'est une activité commerciale. La SCI reste à l'impôt sur le revenu si ces recettes ne dépassent pas 10 % du total.", s: SRC.sciMeuble },
          { t: "Contribution de 2,5 % due par une SCI à l'IS, ou par une SCI à l'IR dont au moins un associé est à l'IS (elle porte alors sur la totalité des loyers). Elle vise les locaux d'un immeuble achevé depuis au moins 15 ans au 1er janvier, hors loyers soumis à TVA.", s: SRC.crl },
        ],
      },
      {
        titre: "Vendre un bien ou des parts", icone: "🔑",
        points: [
          { t: "SCI à l'impôt sur le revenu qui vend un immeuble : régime des plus-values des particuliers, imposé chez chaque associé au prorata de ses parts (19 % + 17,2 %, abattements pour durée de détention).", s: SRC.sciPv },
          { t: "Le notaire dépose la déclaration 2048-IMM et paie l'impôt ; chaque associé reporte sa quote-part sur sa déclaration de revenus. Une surtaxe s'ajoute si la plus-value dépasse 50 000 €.", s: SRC.sciPv },
          { t: "SCI à l'IS qui vend un immeuble : la plus-value entre dans le résultat imposable de la société, au taux de droit commun, sans abattement pour durée de détention.", s: SRC.isPv },
          { t: "L'associé qui occupe gratuitement le logement comme résidence principale peut bénéficier de l'exonération, au prorata de sa participation.", s: SRC.sciPv },
          { t: "Cession de parts : agrément de tous les associés en principe. Sauf clause contraire des statuts, les cessions à un ascendant ou un descendant du cédant en sont dispensées, qu'elles soient gratuites ou vendues.", s: SRC.cc1861 },
        ],
      },
      {
        titre: "Transmettre avec une SCI", icone: "🎁",
        points: [
          { t: "On peut donner des parts petit à petit aux enfants : 100 000 € d'abattement par parent et par enfant, renouvelable tous les 15 ans.", s: SRC.spSci },
          { t: "À l'IFI, les parts de SCI sont taxables pour la valeur de l'immobilier qu'elles représentent.", s: SRC.ifiBiens },
        ],
      },
    ],
    cas: [
      {
        titre: "Vendre ses parts", niveau: "Facile",
        enonce: "Marc vend à sa sœur toutes ses parts d'une SCI qui ne détient que des appartements loués, pour 120 000 €.",
        question: "Combien de droits d'enregistrement ?",
        etapes: ["L'actif est composé à plus de 50 % d'immobilier non affecté à une exploitation : SCI à prépondérance immobilière.", "Taux : 5 % du prix.", "120 000 × 5 % = 6 000 €."],
        reponse: "6 000 €. Et la sœur doit être agréée par les associés, sauf clause contraire.",
        s: SRC.spSci,
      },
      {
        titre: "Les loyers gardés dans la SCI", niveau: "Intermédiaire",
        enonce: "SCI à l'impôt sur le revenu, deux associés à 50 %. Elle a 20 000 € de revenu foncier net, entièrement gardé pour rembourser l'emprunt.",
        question: "Combien chaque associé déclare-t-il ?",
        etapes: ["Les bénéfices sont imposés chez les associés, même s'ils ne sont pas distribués.", "Quote-part de chacun : 50 %.", "20 000 × 50 % = 10 000 €."],
        reponse: "10 000 € chacun en revenus fonciers, alors qu'ils n'ont rien touché. À anticiper dans le budget du client.",
        s: SRC.spSci,
      },
      {
        titre: "Le meublé qui change tout", niveau: "Piège",
        enonce: "Une SCI à l'impôt sur le revenu encaisse 40 000 € de loyers nus et décide de louer un studio meublé pour 8 000 € par an.",
        question: "La SCI reste-t-elle à l'impôt sur le revenu ?",
        etapes: ["Recettes totales : 48 000 €.", "Part du meublé : 8 000 ÷ 48 000 ≈ 16,7 %.", "Au-delà de 10 %, l'activité commerciale n'est plus accessoire."],
        reponse: "Non : elle bascule à l'impôt sur les sociétés, avec déclaration 2065 et comptabilité commerciale.",
        s: SRC.sciMeuble,
      },
    ],
    liens: [
      { type: "officiel", titre: "SCI : ce qu'il faut savoir (Service-public)", url: SRC.spSci[1] },
      { type: "officiel", titre: "SCI et location meublée (impots.gouv.fr)", url: SRC.sciMeuble[1] },
      { type: "officiel", titre: "Responsabilité des associés, art. 1857 (Légifrance)", url: SRC.cc1857[1] },
    ],
  },
});

Object.assign(SRC, {
  spMeuble: ["Service-public · Revenus d'une location meublée", "https://www.service-public.gouv.fr/particuliers/vosdroits/F32744"],
  faqLmnp: ["impots.gouv.fr · FAQ location meublée (2026)", "https://www.impots.gouv.fr/sites/default/files/media/1_metier/5_international/actualite/faq-lmnp-03_2026.pdf"],
  tourisme: ["impots.gouv.fr · Meublés de tourisme", "https://www.impots.gouv.fr/particulier/questions/je-suis-proprietaire-dune-location-meublee-de-tourisme-quel-est-le-nouveau"],
  spPv: ["Service-public · Plus-value immobilière", "https://www.service-public.gouv.fr/particuliers/vosdroits/F10864"],
  pvExo: ["impots.gouv.fr · Plus-values exonérées", "https://www.impots.gouv.fr/particulier/plus-values-exonerees"],
});

Object.assign(APPROFONDI, {
  lmnp: {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Démarrer : les formalités", icone: "📝",
        points: [
          { t: "Immatriculation gratuite sur le guichet unique des formalités d'entreprises, dans les 15 jours qui suivent la première location : elle donne un numéro SIRET.", s: SRC.spMeuble },
          { t: "Micro-BIC : on déclare les recettes brutes avec le numéro SIRET. Régime réel : liasse 2031, puis report sur la 2042-C-PRO.", s: SRC.spMeuble },
          { t: "La cotisation foncière des entreprises (CFE) peut être due selon la situation du bien : se renseigner auprès du service des impôts des entreprises.", s: SRC.spMeuble },
        ],
      },
      {
        titre: "Micro-BIC ou réel : les règles fines", icone: "⚖️",
        points: [
          { t: "L'option pour le réel se fait avant la date limite de déclaration et se renouvelle tacitement chaque année.", s: SRC.spMeuble },
          { t: "Tolérance : la 1re ou la 2e année de dépassement du plafond, le micro-BIC continue de s'appliquer une année de plus.", s: SRC.spMeuble },
          { t: "Un gîte rural ne relève du micro-BIC que s'il est classé meublé de tourisme.", s: SRC.spMeuble },
          { t: "Meublés de tourisme : nouveaux plafonds depuis les revenus 2025 (loi du 19 novembre 2024), 15 000 € et 30 % pour les non classés.", s: SRC.tourisme },
        ],
      },
      {
        titre: "Louer une partie de sa résidence principale", icone: "🛏️",
        points: [
          { t: "Exonération possible jusqu'au 31 décembre 2026 si le loyer reste raisonnable : en 2026, 215 € par m² et par an en Île-de-France, 159 € ailleurs.", s: SRC.spMeuble },
          { t: "Location occasionnelle à des personnes de passage : exonérée jusqu'à 760 € par an.", s: SRC.spMeuble },
        ],
      },
      {
        titre: "À la revente", icone: "🔑",
        points: [
          { t: "Le LMNP garde le régime des plus-values des particuliers, avec les abattements pour durée de détention.", s: SRC.spMeuble },
          { t: "Ventes depuis le 15 février 2025 : les amortissements déduits au réel sont retirés du prix d'achat, ce qui augmente la plus-value. Les résidences pour étudiants ou seniors ne sont pas concernées.", s: SRC.faqLmnp },
          { t: "Une SCI qui loue régulièrement en meublé passe à l'impôt sur les sociétés.", s: SRC.faqLmnp },
        ],
      },
    ],
    cas: [
      {
        titre: "Classé ou pas classé ?", niveau: "Facile",
        enonce: "Deux propriétaires encaissent chacun 12 000 € de location saisonnière. L'un a fait classer son meublé de tourisme, l'autre non.",
        question: "Quel montant est imposable pour chacun, au micro-BIC ?",
        etapes: ["Classé : abattement de 50 % → 6 000 €.", "Non classé : abattement de 30 % → 8 400 €."],
        reponse: "6 000 € contre 8 400 € : le classement fait baisser la base de 2 400 €.",
        s: SRC.tourisme,
      },
      {
        titre: "LMNP ou LMP ?", niveau: "Intermédiaire",
        enonce: "Un couple encaisse 30 000 € de loyers meublés par an. Ses salaires s'élèvent à 80 000 €.",
        question: "Est-il loueur professionnel ?",
        etapes: ["Recettes > 23 000 € : la première condition du LMNP n'est pas remplie.", "Mais les recettes (30 000 €) sont inférieures aux autres revenus (80 000 €).", "Il suffit d'une des deux conditions pour rester LMNP."],
        reponse: "Non, il reste LMNP : les loyers sont inférieurs à ses autres revenus.",
        s: SRC.spMeuble,
      },
      {
        titre: "La revente après le réel", niveau: "Piège",
        enonce: "Un studio loué meublé à l'année (hors résidence services) a été acheté 200 000 €. Au régime réel, 40 000 € d'amortissements ont été déduits. Il est revendu 260 000 € en 2026.",
        question: "Sur quelle plus-value brute part-on (hors forfaits) ?",
        etapes: ["Vente après le 15 février 2025 : les amortissements sont réintégrés.", "Prix d'achat retenu : 200 000 − 40 000 = 160 000 €.", "Plus-value brute : 260 000 − 160 000 = 100 000 €."],
        reponse: "100 000 € au lieu de 60 000 €. Ensuite s'appliquent les abattements pour durée de détention.",
        s: SRC.faqLmnp,
      },
    ],
    liens: [
      { type: "officiel", titre: "Location meublée (Service-public)", url: SRC.spMeuble[1] },
      { type: "officiel", titre: "FAQ location meublée 2026 (impots.gouv.fr)", url: SRC.faqLmnp[1] },
    ],
  },

  "plus-values-immobilieres": {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Bien calculer les prix", icone: "🧮",
        points: [
          { t: "Prix de vente : celui de l'acte, diminué de certains frais justifiés (diagnostics obligatoires…) et augmenté des sommes perçues en plus.", s: SRC.spPv },
          { t: "Bien reçu par donation ou succession : le prix d'achat est la valeur retenue pour les droits de donation ou de succession.", s: SRC.spPv },
          { t: "Une moins-value n'est en principe pas imputable.", s: SRC.spPv },
        ],
      },
      {
        titre: "Les exonérations à connaître", icone: "🛡️",
        points: [
          { t: "Résidence principale : y compris si on a déménagé, à condition de l'avoir habitée jusqu'à la mise en vente et de vendre dans un délai normal (en général environ un an).", s: SRC.pvExo },
          { t: "Première vente d'un logement autre que la résidence principale : exonérée si on n'a pas été propriétaire de sa résidence principale dans les 4 ans et qu'on rachète sa résidence principale dans les 24 mois. Une seule fois.", s: SRC.spPv },
          { t: "Retraités ou invalides modestes, non soumis à l'IFI : pour une vente en 2026, revenu fiscal de référence 2024 sous 12 793 € pour une part, plus 3 428 € par demi-part.", s: SRC.spPv },
          { t: "Expropriation : exonérée si au moins 90 % de l'indemnité est réinvestie dans les 12 mois.", s: SRC.pvExo },
          { t: "Abattement exceptionnel de 60 % ou 70 % (jusqu'à 85 %) dans certaines zones, pour une promesse signée entre 2024 et fin 2027, hors vente à un proche.", s: SRC.spPv },
        ],
      },
    ],
    cas: [
      {
        titre: "Vendre 6 mois plus tard ?", niveau: "Intermédiaire",
        enonce: "Un client détient un appartement depuis 21 ans et 6 mois. La plus-value brute est de 100 000 €.",
        question: "Combien gagne-t-il en attendant d'atteindre 22 ans pleins ?",
        etapes: ["À 21 ans : abattement impôt 16 × 6 % = 96 % → base 4 000 € → 760 € d'impôt.", "À 22 ans : abattement de 100 % → 0 € d'impôt.", "Prélèvements sociaux : 26,4 % d'abattement à 21 ans (base 73 600 € → 12 659 €), 28 % à 22 ans (base 72 000 € → 12 384 €)."],
        reponse: "Environ 1 035 € d'économie (760 € d'impôt + 275 € de prélèvements sociaux).",
        s: SRC.spPv,
      },
      {
        titre: "Le studio hérité", niveau: "Piège",
        enonce: "Une cliente revend 180 000 € un studio hérité il y a 3 ans. Il avait été déclaré 170 000 € dans la succession ; son père l'avait acheté 60 000 €.",
        question: "Quelle plus-value brute (hors frais) ?",
        etapes: ["Pour un bien hérité, le prix d'achat est la valeur déclarée dans la succession.", "180 000 − 170 000 = 10 000 €.", "Et non 120 000 € en partant du prix payé par le père."],
        reponse: "10 000 € de plus-value brute.",
        s: SRC.spPv,
      },
    ],
    liens: [
      { type: "officiel", titre: "Plus-value immobilière (Service-public)", url: SRC.spPv[1] },
      { type: "officiel", titre: "Plus-values exonérées (impots.gouv.fr)", url: SRC.pvExo[1] },
    ],
  },
});

Object.assign(SRC, {
  spPee: ["Service-public · Plan d'épargne entreprise", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2142"],
  spInter: ["Service-public · Intéressement", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2140"],
  spPartic: ["Service-public · Participation", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2141"],
  spDeblocage: ["Service-public · Déblocage anticipé", "https://www.service-public.gouv.fr/particuliers/vosdroits/F31622"],
  spPerco: ["Service-public · PER d'entreprise collectif", "https://www.service-public.gouv.fr/particuliers/vosdroits/F36526/1"],
});

Object.assign(APPROFONDI, {
  "epargne-salariale": {
    verifie: "15 novembre 2026",
    blocs: [
      {
        titre: "Participation : la formule et le défaut", icone: "🧮",
        points: [
          { t: "Formule légale : réserve = ½ × (bénéfice net − 5 % des capitaux propres) × (salaires ÷ valeur ajoutée). Un accord peut prévoir mieux, jamais moins.", s: SRC.spPartic },
          { t: "Sans choix du salarié, la moitié de sa participation est placée sur le PER collectif ; l'autre moitié selon l'accord.", s: SRC.spPartic },
          { t: "Sans accord de participation, les sommes vont sur un compte bloqué pendant 8 ans.", s: SRC.spPartic },
        ],
      },
      {
        titre: "Intéressement : les règles", icone: "🎯",
        points: [
          { t: "Plafond global : 20 % des salaires bruts versés. Sans demande de versement immédiat, la prime va sur le PEE s'il existe.", s: SRC.spInter },
          { t: "Entreprises de 11 à 49 salariés bénéficiaires 3 années de suite (bénéfice net ≥ 1 % du chiffre d'affaires) : elles doivent mettre en place un dispositif de partage de la valeur (expérimentation).", s: SRC.spInter },
        ],
      },
      {
        titre: "Débloquer un PEE avant 5 ans", icone: "🔓",
        points: [
          { t: "Mariage ou PACS ; naissance ou adoption d'un 3e enfant ; divorce ou séparation avec garde d'un enfant ; violences conjugales.", s: SRC.spDeblocage },
          { t: "Invalidité ou décès (salarié, conjoint, partenaire, enfants pour l'invalidité) ; fin du contrat de travail ; surendettement ; activité d'aidant familial.", s: SRC.spDeblocage },
          { t: "Création ou reprise d'entreprise ; achat ou agrandissement de la résidence principale, ou sa rénovation énergétique ; achat d'un véhicule propre ou d'un vélo électrique neuf.", s: SRC.spDeblocage },
          { t: "Demande dans les 6 mois de l'événement, sauf fin de contrat, décès, invalidité, violences conjugales, surendettement et aidant (pas de délai).", s: SRC.spDeblocage },
        ],
      },
      {
        titre: "Le PER collectif en détail", icone: "🏦",
        points: [
          { t: "Frais de gestion pris en charge par l'employeur tant que le salarié est dans l'entreprise.", s: SRC.spPerco },
          { t: "Jusqu'à 10 jours de repos non pris par an peuvent y être versés (sans compte épargne-temps).", s: SRC.spPerco },
          { t: "Gestion pilotée « équilibré horizon retraite » par défaut : plus de risque loin de la retraite, moins en s'en approchant.", s: SRC.spPerco },
        ],
      },
    ],
    cas: [
      {
        titre: "Toucher tout l'abondement", niveau: "Facile",
        enonce: "L'entreprise abonde le PEE à 300 % (3 € pour 1 € versé). Le salarié verse 2 000 €.",
        question: "Combien d'abondement ?",
        etapes: ["300 % de 2 000 € = 6 000 €.", "Mais le plafond 2026 est de 3 844,80 € (hors titres de l'entreprise)."],
        reponse: "3 844,80 €. Verser 1 281,60 € suffit pour toucher le maximum.",
        s: SRC.spPee,
      },
      {
        titre: "Le choix oublié", niveau: "Intermédiaire",
        enonce: "Tom reçoit 4 000 € de participation et ne répond pas dans les 15 jours. Son entreprise a un accord de participation et un PER collectif.",
        question: "Où va son argent ?",
        etapes: ["Sans choix, la moitié va sur le PER collectif : 2 000 €.", "L'autre moitié est placée selon l'accord.", "La part sur le PER est bloquée jusqu'à la retraite (sauf cas de déblocage)."],
        reponse: "2 000 € bloqués jusqu'à la retraite, 2 000 € selon l'accord. Dans tous les cas, pas d'impôt sur le revenu.",
        s: SRC.spPartic,
      },
      {
        titre: "Le mariage et le PER collectif", niveau: "Piège",
        enonce: "Léa se marie et veut récupérer son épargne salariale : 8 000 € sur le PEE, 5 000 € sur le PER collectif.",
        question: "Que peut-elle débloquer ?",
        etapes: ["Le mariage est un cas de déblocage du PEE (demande dans les 6 mois).", "Ce n'est pas un cas de déblocage du PER collectif."],
        reponse: "Les 8 000 € du PEE seulement.",
        s: SRC.spDeblocage,
      },
    ],
    liens: [
      { type: "officiel", titre: "PER d'entreprise collectif (Service-public)", url: SRC.spPerco[1] },
    ],
  },
});
