// version 1.0 — Contenu approfondi des fiches « Apprendre ».
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
          { t: "Depuis le 1er janvier 2026, la déclaration en ligne est obligatoire ; le formulaire papier n° 2735 ne sert plus que dans des cas d'exonération.", s: SRC.donManuel },
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
          { t: "Mobilier : forfait de 5 % de l'actif, sauf preuve contraire (CGI art. 764).", s: SRC.cgi764 },
          { t: "Frais funéraires déductibles dans la limite de 1 500 €.", s: SRC.calculSucc },
          { t: "Certaines dettes ne sont pas déductibles (CGI art. 773), comme la dette de restitution d'un quasi-usufruit pour les successions ouvertes depuis le 29 décembre 2023 (art. 774 bis).", s: SRC.cgi764 },
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
          { t: "Pas de déclaration pour un enfant ou le conjoint si l'actif brut est inférieur à 50 000 € et sans donation non déclarée ; pour les autres héritiers, sous 3 000 €.", s: SRC.spDeclSucc },
          { t: "En retard : intérêts de 0,20 % par mois, et majorations de 10 % à 80 %.", s: SRC.spDeclSucc },
          { t: "Au-delà de 5 000 €, un acte de notoriété (chez le notaire) prouve la qualité d'héritier.", s: SRC.spDeclSucc },
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
      { recto: "Forfait mobilier", verso: "5 % de l'actif, sauf preuve contraire (CGI art. 764)." },
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
          { t: "Un usufruit à durée fixe vaut 23 % de la pleine propriété par période de 10 ans, sans fraction : 11 ans comptent comme 2 périodes, soit 46 %.", s: SRC.cgi669 },
          { t: "Il ne peut pas dépasser la valeur de l'usufruit viager de l'usufruitier.", s: SRC.cgi669 },
        ],
      },
      {
        titre: "La présomption de l'article 751", icone: "🔎",
        points: [
          { t: "Un bien dont le défunt avait l'usufruit et un héritier présomptif la nue-propriété est présumé faire partie de la succession : il est taxé en pleine propriété.", s: SRC.cgi751 },
          { t: "Exception : un démembrement réalisé par donation régulière, ou plus de 3 mois avant le décès.", s: SRC.cgi751 },
          { t: "La preuve contraire est possible, par exemple en prouvant une donation d'argent datée qui a financé la nue-propriété.", s: SRC.cgi751 },
        ],
      },
      {
        titre: "Démembrement et IFI", icone: "🏛️",
        points: [
          { t: "Principe : l'usufruitier déclare le bien en pleine propriété à l'IFI, le nu-propriétaire ne déclare rien.", s: SRC.bofipIfi },
          { t: "Exceptions : usufruit légal du conjoint survivant, vente avec réserve d'usufruit à une personne hors article 751, don à l'État.", s: SRC.bofipIfi },
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
        titre: "Un usufruit de 12 ans", niveau: "Facile",
        enonce: "Une mère donne pendant 12 ans l'usufruit d'un studio de 300 000 € à une association, puis le récupère.",
        question: "Quelle valeur fiscale pour cet usufruit ?",
        etapes: ["23 % par période de 10 ans, sans fraction.", "12 ans font 2 périodes.", "2 × 23 % = 46 % ; 300 000 × 46 % = 138 000 €."],
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
        etapes: ["Le fils est héritier présomptif et le père était usufruitier : article 751.", "Le démembrement a moins de 3 mois et ne vient pas d'une donation régulière.", "Le bien est présumé dans la succession, en pleine propriété."],
        reponse: "Il est taxé comme si le père le détenait en pleine propriété, sauf preuve contraire (par exemple une donation d'argent datée et déclarée).",
        s: SRC.cgi751,
      },
    ],
    vraiFaux: [
      { texte: "Un usufruit temporaire de 15 ans vaut 34,5 %.", vrai: false, explication: "Sans fraction : 15 ans font 2 périodes de 10 ans, soit 46 %." },
      { texte: "Le nu-propriétaire déclare le bien à l'IFI.", vrai: false, explication: "C'est en principe l'usufruitier, en pleine propriété." },
    ],
    quiz: [
      { question: "Combien vaut fiscalement un usufruit temporaire de 8 ans ?", choix: ["18,4 %", "23 %", "46 %", "Selon l'âge"], bonne: 1, explication: "23 % par période de 10 ans, toute période commencée comptant entière." },
      { question: "Que perd-on avec une clause « conjoint usufruitier, enfants nus-propriétaires » ?", choix: ["Rien", "La part d'abattement du conjoint, non reportée", "L'exonération du conjoint", "Le barème 669"], bonne: 1, explication: "L'abattement de 152 500 € est partagé ; la part du conjoint exonéré est perdue." },
    ],
    cartes: [
      { recto: "Usufruit temporaire", verso: "23 % par période de 10 ans, sans fraction (CGI art. 669)." },
      { recto: "Article 751 du CGI", verso: "Présomption de propriété du défunt usufruitier, sauf donation régulière ou démembrement de plus de 3 mois." },
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
          { t: "Montant : en principe le plus faible entre la dépense faite et le profit subsistant ; jamais moins que la dépense si elle était nécessaire (art. 1469).", s: SRC.ccCommu },
        ],
      },
      {
        titre: "Les protections de tous les couples mariés", icone: "🛡️",
        points: [
          { t: "Aucun époux ne peut vendre seul le logement de la famille ni ses meubles, même s'il en est seul propriétaire. L'autre peut demander l'annulation dans l'année où il l'apprend (art. 215).", s: SRC.cc215 },
          { t: "Les dettes pour l'entretien du ménage ou l'éducation des enfants engagent les deux époux solidairement (art. 220).", s: SRC.cc220 },
          { t: "Sauf : dépenses manifestement excessives, achats à crédit et emprunts sans l'accord des deux (hors petites sommes pour la vie courante).", s: SRC.cc220 },
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
        etapes: ["L'héritage était un bien propre (art. 1405).", "Sans clause de remploi dans l'acte, l'appartement est commun.", "Mais la communauté a profité de son argent propre : elle lui doit une récompense (art. 1433)."],
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
      { texte: "Une clause d'attribution intégrale est fiscalement une donation.", vrai: false, explication: "L'article 1525 dit le contraire." },
      { texte: "Un achat à crédit sans l'accord du conjoint l'engage solidairement.", vrai: false, explication: "Les achats à tempérament sans l'accord des deux échappent à la solidarité (art. 220)." },
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
