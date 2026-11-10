// version 1.0 — fiches complémentaires de la rubrique « Apprendre » (vérifiées le 10 novembre 2026,
// uniquement à partir de sources officielles ou institutionnelles : impots.gouv.fr, BOFiP, Service-public,
// justice.fr, notaires, AMF, direction générale du Trésor).

FICHES.push(
  // ------------------------------------------------------------------ RÉGIMES MATRIMONIAUX ET PACS
  {
    id: "regimes-matrimoniaux",
    illu: "anneaux",
    titre: "Régimes matrimoniaux et PACS",
    sousTitre: "Qui possède quoi dans le couple ?",
    theme: "transmission",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "regime matrimonial",
    libelleFiscalite: "Les régimes en un coup d'œil",
    libellePourQui: "Les bons réflexes",
    libellePasPourQui: "Attention si…",
    enUnePhrase: "Le régime matrimonial décide à qui appartiennent les biens du couple pendant le mariage, et comment ils se partagent en cas de divorce ou de décès : c'est la première question à poser avant tout conseil patrimonial.",
    chiffres: [
      { valeur: "4", libelle: "grands régimes : communauté réduite aux acquêts (régime légal), séparation, participation aux acquêts, communauté universelle" },
      { valeur: "½", libelle: "des biens communs appartient à chaque époux" },
      { valeur: "3 mois", libelle: "pour que les enfants majeurs ou les créanciers s'opposent à un changement de régime" },
      { valeur: "0 €", libelle: "de droits de succession entre époux, comme entre partenaires de PACS" },
    ],
    essentiel: [
      { titre: "Sans contrat : la communauté réduite aux acquêts", texte: "C'est le régime légal. Les biens possédés avant le mariage et ceux reçus par donation ou succession restent propres à chaque époux ; les biens acquis pendant le mariage sont communs et appartiennent pour moitié à chacun." },
      { titre: "La séparation de biens", texte: "Chaque époux reste seul propriétaire de ses biens et de ses dettes. Ce qui est acheté ensemble est en indivision, selon l'apport de chacun." },
      { titre: "La participation aux acquêts", texte: "Pendant le mariage, elle fonctionne comme une séparation de biens. À la dissolution, on compare l'enrichissement de chaque époux et on le partage." },
      { titre: "La communauté universelle", texte: "Tous les biens, présents et à venir, sont communs. Avec une clause d'attribution intégrale, le conjoint survivant recueille toute la communauté : les enfants n'hériteront qu'au second décès. Les enfants d'une autre union peuvent agir pour protéger leur part (action en retranchement)." },
      { titre: "Changer de régime, c'est possible", texte: "Devant notaire, dans l'intérêt de la famille. Les enfants majeurs et les créanciers sont informés et disposent de 3 mois pour s'opposer ; le juge n'intervient qu'en cas d'opposition." },
    ],
    schema: [
      { titre: "Avant le mariage", texte: "Contrat chez le notaire, ou rien = régime légal" },
      { titre: "Pendant le mariage", texte: "Biens propres et biens communs" },
      { titre: "Divorce ou décès", texte: "Liquidation du régime" },
      { titre: "Puis la succession", texte: "Elle porte sur la part du défunt" },
    ],
    fiscalite: [
      {
        titre: "Les quatre régimes",
        colonnes: ["Régime", "Biens acquis pendant le mariage", "À la dissolution"],
        lignes: [
          ["Communauté réduite aux acquêts (légal)", "Communs (moitié chacun)", "Chacun reprend ses propres, la communauté est partagée"],
          ["Séparation de biens", "À celui qui achète (indivision si achat commun)", "Chacun reprend ses biens"],
          ["Participation aux acquêts", "À celui qui achète", "L'enrichissement de chacun est partagé"],
          ["Communauté universelle", "Tout est commun, même ce qui existait avant", "Partage, ou tout au survivant avec clause d'attribution intégrale"],
        ],
      },
      {
        titre: "Et le PACS ?",
        colonnes: ["Point", "Règle"],
        lignes: [
          ["Régime par défaut", "Séparation des patrimoines ; les achats communs sont en indivision"],
          ["Option", "Indivision des biens acquis pendant le PACS (moitié chacun)"],
          ["Héritage", "Le partenaire n'est pas héritier : il faut un testament"],
          ["Droits de succession", "Le partenaire est exonéré, comme le conjoint"],
        ],
      },
    ],
    pourQui: ["Toujours demander le régime matrimonial (ou la convention de PACS) avant un conseil patrimonial", "Penser à un testament pour les partenaires de PACS", "Faire préciser l'origine des fonds lors d'un achat avec de l'argent reçu par donation ou succession"],
    pasPourQui: ["Famille recomposée et communauté universelle avec attribution intégrale : risque de conflit avec les enfants d'une autre union", "Un époux entrepreneur sous le régime légal : les biens communs peuvent être exposés", "Couple pacsé qui pense que le survivant héritera automatiquement"],
    pieges: [
      "Croire qu'en communauté tout est commun : les donations et héritages restent propres.",
      "Acheter un bien avec de l'argent hérité sans le préciser dans l'acte : il risque d'être considéré comme commun.",
      "Oublier qu'un partenaire de PACS n'hérite pas sans testament.",
      "Conseiller une communauté universelle sans regarder s'il y a des enfants d'une autre union.",
    ],
    phraseClient: "Avant de parler placements, je dois savoir comment vous êtes mariés ou pacsés : c'est ce qui détermine à qui appartient chaque bien aujourd'hui, et ce qui se passerait pour chacun de vous demain.",
    cas: {
      enonce: "Julie et Marc sont mariés sans contrat. Julie hérite de 200 000 € de ses parents et achète un appartement avec cette somme.",
      question: "L'appartement est-il commun ou propre à Julie ?",
      reponse: "L'argent hérité est propre à Julie. Pour que l'appartement le soit aussi, l'acte d'achat doit mentionner que le prix est payé avec ses fonds propres et qu'il s'agit d'un remploi. Sans cette précision, l'appartement risque d'être considéré comme commun, Julie n'ayant alors qu'un droit à récompense.",
    },
    vraiFaux: [
      { texte: "Sans contrat de mariage, les époux sont mariés sous la séparation de biens.", vrai: false, explication: "Le régime légal est la communauté réduite aux acquêts." },
      { texte: "En communauté réduite aux acquêts, un héritage reste propre à celui qui le reçoit.", vrai: true, explication: "Les biens reçus par donation ou succession sont des biens propres." },
      { texte: "Un partenaire de PACS hérite automatiquement de son partenaire.", vrai: false, explication: "Il n'est pas héritier : un testament est nécessaire. Il est en revanche exonéré de droits de succession." },
      { texte: "Pour changer de régime matrimonial, il faut toujours passer devant un juge.", vrai: false, explication: "Le notaire suffit ; le juge n'intervient qu'en cas d'opposition." },
      { texte: "Avec une clause d'attribution intégrale, les enfants n'héritent qu'au décès du second parent.", vrai: true, explication: "Le conjoint survivant recueille toute la communauté." },
      { texte: "En séparation de biens, un bien acheté à deux est en indivision.", vrai: true, explication: "Il appartient à chacun selon sa part." },
    ],
    quiz: [
      { question: "Quel est le régime matrimonial légal en France ?", choix: ["Séparation de biens", "Communauté universelle", "Communauté réduite aux acquêts", "Participation aux acquêts"], bonne: 2, explication: "C'est le régime qui s'applique sans contrat de mariage." },
      { question: "Sous le régime légal, une maison reçue en donation pendant le mariage est…", choix: ["Commune", "Propre à celui qui la reçoit", "À moitié commune", "Indivise"], bonne: 1, explication: "Les biens reçus par donation ou succession restent propres." },
      { question: "Combien de temps les enfants majeurs ont-ils pour s'opposer à un changement de régime ?", choix: ["1 mois", "3 mois", "6 mois", "2 ans"], bonne: 1, explication: "3 mois à partir de l'information." },
      { question: "Quel régime fonctionne comme une séparation pendant le mariage, puis partage l'enrichissement ?", choix: ["Participation aux acquêts", "Communauté universelle", "Régime légal", "PACS"], bonne: 0, explication: "C'est la participation aux acquêts." },
      { question: "Par défaut, quel est le régime des biens des partenaires de PACS ?", choix: ["Communauté", "Séparation des patrimoines", "Indivision totale", "Participation"], bonne: 1, explication: "Séparation par défaut ; l'indivision des acquêts est une option." },
      { question: "Quel risque présente la communauté universelle avec attribution intégrale en famille recomposée ?", choix: ["Aucun", "Les enfants d'une autre union peuvent agir en retranchement", "Le conjoint paie 45 % de droits", "Le régime est interdit"], bonne: 1, explication: "Ils peuvent protéger leur part par l'action en retranchement." },
    ],
    cartes: [
      { recto: "Biens propres (régime légal)", verso: "Biens possédés avant le mariage et biens reçus par donation ou succession." },
      { recto: "Biens communs", verso: "Biens acquis pendant le mariage ; ils appartiennent pour moitié à chaque époux." },
      { recto: "Récompense", verso: "Compensation due quand la communauté a profité de fonds propres d'un époux, ou l'inverse." },
      { recto: "Clause d'attribution intégrale", verso: "Le conjoint survivant recueille toute la communauté ; les enfants héritent au second décès." },
      { recto: "Changement de régime", verso: "Acte notarié, information des enfants majeurs et créanciers, 3 mois d'opposition, juge seulement en cas d'opposition." },
      { recto: "PACS et héritage", verso: "Pas d'héritage sans testament, mais exonération de droits de succession." },
    ],
    paires: [
      { terme: "Régime légal", definition: "Communauté réduite aux acquêts" },
      { terme: "Séparation de biens", definition: "Chacun garde ses biens et ses dettes" },
      { terme: "Participation aux acquêts", definition: "L'enrichissement est partagé à la fin" },
      { terme: "Communauté universelle", definition: "Tous les biens sont communs" },
      { terme: "PACS", definition: "Séparation par défaut, testament indispensable" },
    ],
    liens: [
      { type: "officiel", titre: "Changer ou modifier son régime matrimonial (justice.fr)", url: "https://www.justice.fr/fiche/changer-modifier-regime-matrimonial" },
      { type: "officiel", titre: "Est-il possible de changer de régime matrimonial ? (notaires.fr)", url: "https://www.notaires.fr/fr/faq/est-il-possible-de-changer-de-regime-matrimonial" },
      { type: "officiel", titre: "PACS : un vrai statut (Chambre des notaires de Paris)", url: "https://paris.notaires.fr/fr/actualites/pacs-un-vrai-statut" },
      { type: "video", titre: "Vidéos : comprendre les régimes matrimoniaux", url: YT("régimes matrimoniaux expliqués notaire communauté séparation") },
    ],
  },

  // ------------------------------------------------------------------ DÉMEMBREMENT
  {
    id: "demembrement",
    illu: "maison-coupee",
    titre: "Le démembrement de propriété",
    sousTitre: "Usufruit et nue-propriété : couper la propriété en deux",
    theme: "regl",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "usufruit",
    simulateur: "bareme669",
    libelleFiscalite: "Le barème fiscal (article 669 du CGI)",
    enUnePhrase: "On sépare la propriété d'un bien entre l'usufruitier, qui l'utilise ou en perçoit les revenus, et le nu-propriétaire, qui en deviendra plein propriétaire à la fin de l'usufruit : c'est l'outil de base de la transmission.",
    chiffres: [
      { valeur: "3", libelle: "droits dans la propriété : user (usus), percevoir les revenus (fructus), disposer (abusus)" },
      { valeur: "60 %", libelle: "valeur fiscale de l'usufruit d'une personne de 41 à 50 ans" },
      { valeur: "23 %", libelle: "valeur d'un usufruit temporaire, par période de 10 ans" },
      { valeur: "0 €", libelle: "d'impôt quand l'usufruit s'éteint au décès de l'usufruitier (article 1133 du CGI)" },
    ],
    essentiel: [
      { titre: "Trois droits, deux personnes", texte: "L'usufruitier a l'usus et le fructus : il habite le bien ou le loue et perçoit les loyers. Le nu-propriétaire a l'abusus, sans pouvoir profiter du bien tant que l'usufruit dure." },
      { titre: "Qui paie quoi ?", texte: "L'usufruitier paie l'entretien, les charges courantes, la taxe foncière et l'assurance. Le nu-propriétaire paie les grosses réparations (murs porteurs, toiture entière…), sauf si elles viennent d'un défaut d'entretien." },
      { titre: "Donner la nue-propriété coûte moins cher", texte: "Dans une donation avec réserve d'usufruit, les droits ne portent que sur la nue-propriété, évaluée selon l'âge du donateur : plus il est jeune, plus la nue-propriété vaut peu." },
      { titre: "La fin de l'usufruit, sans impôt", texte: "Au décès de l'usufruitier, le nu-propriétaire devient plein propriétaire automatiquement, sans droits à payer sur cette « réunion » (article 1133 du CGI)." },
      { titre: "Le quasi-usufruit", texte: "Sur une somme d'argent, l'usufruitier peut la dépenser, à charge de restituer l'équivalent à la fin : le nu-propriétaire détient une créance de restitution, qu'il faut sécuriser (inventaire, convention)." },
    ],
    schema: [
      { titre: "Pleine propriété", texte: "Usus + fructus + abusus" },
      { titre: "Démembrement", texte: "Par donation, succession ou achat" },
      { titre: "Pendant l'usufruit", texte: "L'usufruitier profite, le nu-propriétaire attend" },
      { titre: "Décès de l'usufruitier", texte: "Pleine propriété reconstituée, sans droits" },
    ],
    fiscalite: [
      {
        titre: "Valeur de l'usufruit viager selon l'âge de l'usufruitier",
        colonnes: ["Âge de l'usufruitier", "Usufruit", "Nue-propriété"],
        lignes: [
          ["Moins de 21 ans", "90 %", "10 %"], ["21 à 30 ans", "80 %", "20 %"], ["31 à 40 ans", "70 %", "30 %"],
          ["41 à 50 ans", "60 %", "40 %"], ["51 à 60 ans", "50 %", "50 %"], ["61 à 70 ans", "40 %", "60 %"],
          ["71 à 80 ans", "30 %", "70 %"], ["81 à 90 ans", "20 %", "80 %"], ["91 ans et plus", "10 %", "90 %"],
        ],
        note: "Usufruit temporaire : 23 % de la valeur en pleine propriété par période de 10 ans (sans fraction). Le barème fiscal s'impose pour le calcul des droits ; sur le plan civil, une évaluation économique peut être retenue.",
      },
    ],
    pourQui: ["Transmettre un bien à ses enfants tout en continuant à l'habiter ou à en percevoir les revenus", "Réduire le coût fiscal d'une donation (on ne taxe que la nue-propriété)", "Protéger un conjoint survivant (usufruit) tout en préservant les enfants (nue-propriété)"],
    pasPourQui: ["Un donateur qui veut garder la possibilité de vendre seul : il faudra l'accord du nu-propriétaire", "Une donation de somme d'argent en quasi-usufruit sans convention écrite"],
    pieges: [
      "Oublier que la vente du bien entier exige l'accord de l'usufruitier et du nu-propriétaire.",
      "Confondre la valeur fiscale (barème) et la valeur économique de l'usufruit.",
      "Mal répartir les travaux : les grosses réparations sont à la charge du nu-propriétaire.",
      "Laisser un quasi-usufruit sans inventaire ni convention : la créance de restitution devient difficile à prouver.",
    ],
    phraseClient: "En donnant la nue-propriété, vous transmettez dès aujourd'hui le bien à vos enfants, à moindre coût fiscal, tout en gardant le droit de l'habiter ou d'en percevoir les loyers jusqu'à la fin de votre vie. À votre décès, ils en deviendront pleinement propriétaires, sans droits supplémentaires.",
    cas: {
      enonce: "Un couple marié, tous deux âgés de 65 ans, donne la nue-propriété d'un appartement de 400 000 € (bien commun) à leur fils unique, et se réserve l'usufruit.",
      question: "Sur quelle valeur les droits sont-ils calculés, et combien coûtent-ils ?",
      reponse: "À 65 ans, l'usufruit vaut 40 % et la nue-propriété 60 %, soit 240 000 €. Chaque parent donne la moitié (120 000 €) et bénéficie d'un abattement de 100 000 € : 20 000 € taxables chacun, soit environ 2 194 € de droits par parent selon le barème en ligne directe, environ 4 389 € au total. En pleine propriété, la base aurait été de 400 000 €.",
    },
    vraiFaux: [
      { texte: "L'usufruitier peut vendre seul le bien en pleine propriété.", vrai: false, explication: "Il faut l'accord du nu-propriétaire ; chacun peut seulement céder son propre droit." },
      { texte: "La taxe foncière est en principe à la charge de l'usufruitier.", vrai: true, explication: "L'usufruitier supporte les charges courantes et les impôts du bien." },
      { texte: "Plus l'usufruitier est âgé, plus la valeur fiscale de l'usufruit est élevée.", vrai: false, explication: "C'est l'inverse : l'usufruit d'une personne âgée vaut moins." },
      { texte: "Au décès de l'usufruitier, le nu-propriétaire paie des droits sur l'usufruit récupéré.", vrai: false, explication: "La réunion de l'usufruit à la nue-propriété au décès ne donne lieu à aucun impôt." },
      { texte: "Un usufruit temporaire de 10 ans vaut 23 % de la pleine propriété.", vrai: true, explication: "23 % par période de 10 ans." },
      { texte: "Le quasi-usufruit permet à l'usufruitier de dépenser une somme d'argent.", vrai: true, explication: "À charge de restituer l'équivalent à la fin de l'usufruit." },
    ],
    quiz: [
      { question: "Quels droits a l'usufruitier ?", choix: ["L'abusus seul", "L'usus et le fructus", "Les trois droits", "Aucun droit tant que le nu-propriétaire vit"], bonne: 1, explication: "Il utilise le bien et en perçoit les revenus." },
      { question: "Valeur de la nue-propriété si l'usufruitier a 72 ans ?", choix: ["30 %", "60 %", "70 %", "80 %"], bonne: 2, explication: "De 71 à 80 ans, l'usufruit vaut 30 %, la nue-propriété 70 %." },
      { question: "Qui paie le remplacement complet de la toiture ?", choix: ["L'usufruitier", "Le nu-propriétaire", "Moitié chacun", "Le locataire"], bonne: 1, explication: "C'est une grosse réparation, à la charge du nu-propriétaire (sauf défaut d'entretien)." },
      { question: "Que se passe-t-il au décès de l'usufruitier ?", choix: ["Le bien entre dans sa succession", "Le nu-propriétaire devient plein propriétaire sans droits", "Le bien est vendu", "Les enfants paient 20 % de droits"], bonne: 1, explication: "La pleine propriété se reconstitue sans impôt (article 1133 du CGI)." },
      { question: "Comment est évalué un usufruit temporaire de 20 ans ?", choix: ["23 %", "46 %", "60 %", "Selon l'âge"], bonne: 1, explication: "23 % par période de 10 ans : 2 × 23 % = 46 %." },
      { question: "Sur quelle valeur portent les droits d'une donation avec réserve d'usufruit ?", choix: ["La pleine propriété", "La nue-propriété", "L'usufruit", "Aucune"], bonne: 1, explication: "On ne taxe que la nue-propriété transmise." },
    ],
    cartes: [
      { recto: "Usus, fructus, abusus", verso: "User du bien, en percevoir les fruits (revenus), en disposer (vendre, donner)." },
      { recto: "Article 669 du CGI", verso: "Barème fiscal de l'usufruit viager, selon l'âge de l'usufruitier (de 90 % à 10 %)." },
      { recto: "Usufruit temporaire", verso: "23 % de la pleine propriété par période de 10 ans." },
      { recto: "Article 1133 du CGI", verso: "Pas d'impôt quand l'usufruit rejoint la nue-propriété au décès de l'usufruitier." },
      { recto: "Quasi-usufruit", verso: "Sur une chose consomptible (argent) : l'usufruitier peut la dépenser et devra restituer l'équivalent." },
      { recto: "Grosses réparations", verso: "À la charge du nu-propriétaire : murs porteurs, voûtes, poutres, toitures entières." },
    ],
    paires: [
      { terme: "Usufruitier", definition: "Utilise le bien et perçoit les revenus" },
      { terme: "Nu-propriétaire", definition: "Deviendra plein propriétaire" },
      { terme: "Abusus", definition: "Droit de vendre ou donner" },
      { terme: "Quasi-usufruit", definition: "Usufruit sur une somme d'argent" },
      { terme: "Créance de restitution", definition: "Ce que le quasi-usufruitier devra rendre" },
    ],
    liens: [
      { type: "officiel", titre: "Comprendre l'usufruit (notaires.fr)", url: "https://www.notaires.fr/index%2ephp/fr/donation-succession/donation/lusufruit" },
      { type: "officiel", titre: "Article 1133 du CGI : réunion de l'usufruit à la nue-propriété (Légifrance)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006305932" },
      { type: "video", titre: "Vidéos : comprendre l'usufruit et la nue-propriété", url: YT("usufruit nue-propriété démembrement explication notaire") },
    ],
  },

  // ------------------------------------------------------------------ APPORT-CESSION 150-0 B TER
  {
    id: "apport-cession",
    illu: "holding",
    titre: "Apport-cession (150-0 B ter)",
    sousTitre: "Vendre son entreprise via une holding et reporter l'impôt",
    theme: "economie",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "apport cession",
    libelleFiscalite: "Les règles depuis la loi de finances 2026",
    enUnePhrase: "Le dirigeant apporte les titres de sa société à une holding qu'il contrôle : la plus-value est mise en report d'imposition ; si la holding revend vite, elle doit réinvestir une grande partie du prix dans l'économie réelle.",
    chiffres: [
      { valeur: "3 ans", libelle: "si la holding revend les titres apportés dans ce délai, l'obligation de réinvestir s'applique" },
      { valeur: "70 %", libelle: "du prix de cession à réinvestir au minimum (60 % avant la loi de finances 2026)" },
      { valeur: "3 ans", libelle: "pour réinvestir à compter de la cession (2 ans auparavant)" },
      { valeur: "5 ans", libelle: "de conservation des réinvestissements directs (1 an auparavant)" },
    ],
    essentiel: [
      { titre: "Le principe", texte: "L'apport de titres à une société soumise à l'impôt sur les sociétés, contrôlée par l'apporteur, fait naître une plus-value qui n'est pas imposée tout de suite : elle est placée en report d'imposition (article 150-0 B ter du CGI)." },
      { titre: "Revente rapide = réinvestissement obligatoire", texte: "Si la holding cède les titres apportés dans les 3 ans de l'apport, le report n'est maintenu que si elle réinvestit au moins 70 % du prix dans un délai de 3 ans, dans des activités éligibles (cessions réalisées depuis le 21 février 2026)." },
      { titre: "Un champ d'activités resserré", texte: "La loi de finances 2026 a resserré la liste des activités éligibles au réinvestissement, et porté à 5 ans la durée de conservation des biens ou titres acquis en remploi direct." },
      { titre: "Ce qui met fin au report", texte: "Notamment la cession, le rachat, le remboursement ou l'annulation des titres de la holding reçus en échange de l'apport, ou le non-respect de l'obligation de réinvestissement : la plus-value reportée devient alors imposable." },
      { titre: "Et en cas de donation ?", texte: "Si les titres de la holding sont donnés, le donataire reprend la plus-value en report ; elle devient imposable chez lui s'il cède, apporte ou annule ces titres dans les 6 ans (11 ans dans certains cas d'investissement)." },
    ],
    schema: [
      { titre: "Le dirigeant", texte: "Apporte ses titres" },
      { titre: "La holding qu'il contrôle", texte: "Plus-value en report" },
      { titre: "Vente dans les 3 ans ?", texte: "Réinvestir 70 % en 3 ans" },
      { titre: "Réinvestissements", texte: "Conservés 5 ans" },
    ],
    fiscalite: [
      {
        titre: "Avant / après la loi de finances 2026",
        colonnes: ["Règle", "Avant", "Cessions depuis le 21 février 2026"],
        lignes: [
          ["Part du prix à réinvestir", "60 %", "70 %"],
          ["Délai pour réinvestir", "2 ans", "3 ans"],
          ["Conservation des réinvestissements directs", "1 an", "5 ans"],
          ["Activités éligibles", "Champ large", "Champ resserré"],
          ["Donation des titres : délai de conservation par le donataire", "5 ans (10 ans cas particulier)", "6 ans (11 ans cas particulier)"],
        ],
        note: "Source : BOFiP, actualité ACTU-2026-00099 (loi n° 2026-103 du 19 février 2026 de finances pour 2026, article 11). Montage technique : à valider avec un avocat fiscaliste.",
      },
    ],
    pourQui: ["Un chef d'entreprise qui prépare la vente de sa société et veut réinvestir dans d'autres activités", "Un projet de réinvestissement entrepreneurial réel (et non de gestion de patrimoine personnel)"],
    pasPourQui: ["Un dirigeant qui veut récupérer rapidement le prix de vente pour un usage personnel", "Un projet de placement financier ou immobilier « de rendement » avec le prix de cession"],
    pieges: [
      "Oublier que le report n'est pas une exonération : la plus-value reste due quand il prend fin.",
      "Réinvestir dans une activité devenue non éligible depuis la loi de finances 2026.",
      "Revendre un actif réinvesti avant 5 ans.",
      "Appliquer les anciens seuils (60 %, 2 ans) à une cession réalisée depuis le 21 février 2026.",
    ],
    phraseClient: "En apportant vos titres à votre holding avant la vente, l'impôt sur votre plus-value est reporté. En contrepartie, si la holding vend dans les 3 ans, elle devra réinvestir au moins 70 % du prix dans des activités économiques et les conserver 5 ans.",
    cas: {
      enonce: "Paul apporte en 2026 les titres de sa société à sa holding (plus-value d'apport : 1 M€). La holding revend la société 18 mois plus tard pour 3 M€.",
      question: "Que doit faire la holding pour que l'impôt reste reporté ?",
      reponse: "La cession intervient dans les 3 ans de l'apport : la holding doit réinvestir au moins 70 % du prix, soit 2,1 M€, dans un délai de 3 ans, dans des activités éligibles, et conserver les biens ou titres acquis en remploi direct 5 ans. Sinon, le report prend fin et la plus-value de 1 M€ est imposée.",
    },
    vraiFaux: [
      { texte: "Le 150-0 B ter exonère définitivement la plus-value d'apport.", vrai: false, explication: "C'est un report d'imposition : l'impôt reste dû si le report prend fin." },
      { texte: "Depuis 2026, la holding doit réinvestir 70 % du prix si elle cède dans les 3 ans.", vrai: true, explication: "Pour les cessions réalisées depuis le 21 février 2026." },
      { texte: "Le délai pour réinvestir est de 2 ans pour une cession réalisée en mars 2026.", vrai: false, explication: "Il est désormais de 3 ans." },
      { texte: "La cession des titres de la holding met fin au report.", vrai: true, explication: "C'est l'un des événements qui rendent la plus-value imposable." },
      { texte: "Les réinvestissements directs doivent être conservés 5 ans.", vrai: true, explication: "Contre 1 an auparavant." },
      { texte: "La holding doit être contrôlée par l'apporteur.", vrai: true, explication: "C'est une condition du report de l'article 150-0 B ter." },
    ],
    quiz: [
      { question: "Que se passe-t-il pour la plus-value lors de l'apport à une holding contrôlée ?", choix: ["Elle est exonérée", "Elle est mise en report d'imposition", "Elle est taxée à 45 %", "Elle est effacée au bout de 3 ans"], bonne: 1, explication: "Elle est placée en report d'imposition." },
      { question: "Quel pourcentage du prix faut-il réinvestir depuis 2026 ?", choix: ["50 %", "60 %", "70 %", "100 %"], bonne: 2, explication: "70 % pour les cessions depuis le 21 février 2026." },
      { question: "Dans quel délai après la cession faut-il réinvestir ?", choix: ["1 an", "2 ans", "3 ans", "5 ans"], bonne: 2, explication: "Le délai est passé de 2 à 3 ans." },
      { question: "La holding cède 4 ans après l'apport. Faut-il réinvestir ?", choix: ["Oui, 70 %", "Non, l'obligation vise les cessions dans les 3 ans", "Oui, 100 %", "Oui, 60 %"], bonne: 1, explication: "L'obligation de réinvestir ne concerne que les cessions dans les 3 ans de l'apport." },
      { question: "Combien de temps conserver les actifs acquis en remploi direct ?", choix: ["1 an", "3 ans", "5 ans", "8 ans"], bonne: 2, explication: "5 ans depuis la loi de finances 2026." },
      { question: "Quel texte officiel commente ces changements ?", choix: ["Le BOFiP", "Le code civil", "Le règlement général de l'AMF", "Le code du travail"], bonne: 0, explication: "Le Bulletin officiel des finances publiques (actualité de 2026 sur l'article 150-0 B ter)." },
    ],
    cartes: [
      { recto: "Report d'imposition", verso: "La plus-value est calculée lors de l'apport mais imposée plus tard, quand le report prend fin." },
      { recto: "Holding contrôlée", verso: "Société soumise à l'IS, contrôlée par l'apporteur : condition du report de l'article 150-0 B ter." },
      { recto: "Règle des 3 ans", verso: "Cession par la holding dans les 3 ans de l'apport : obligation de réinvestir." },
      { recto: "Réinvestissement (2026)", verso: "70 % du prix, dans les 3 ans, dans des activités éligibles." },
      { recto: "Conservation (2026)", verso: "5 ans pour les biens ou titres acquis en remploi direct." },
      { recto: "Fin du report", verso: "Notamment cession, rachat, remboursement ou annulation des titres de la holding." },
    ],
    paires: [
      { terme: "Apport", definition: "Les titres passent à la holding" },
      { terme: "Report", definition: "L'impôt est décalé dans le temps" },
      { terme: "70 %", definition: "Part minimale du prix à réinvestir" },
      { terme: "3 ans", definition: "Délai pour réinvestir" },
      { terme: "5 ans", definition: "Conservation des réinvestissements" },
    ],
    liens: [
      { type: "officiel", titre: "BOFiP : aménagements du 150-0 B ter par la loi de finances 2026", url: "https://bofip.impots.gouv.fr/bofip/15099-PGP.html/ACTU-2026-00099" },
      { type: "officiel", titre: "BOFiP : régime du report d'imposition (doctrine complète)", url: "https://bofip.impots.gouv.fr/bofip/10195-PGP.html/identifiant=BOI-RPPM-PVBMI-30-10-60-20160304" },
      { type: "video", titre: "Vidéos : comprendre l'apport-cession", url: YT("apport cession 150-0 B ter holding explication") },
    ],
  },

  // ------------------------------------------------------------------ DONATIONS
  {
    id: "donations",
    illu: "cadeau",
    titre: "Les donations",
    sousTitre: "Transmettre de son vivant, au bon moment",
    theme: "crypto",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "donation",
    enUnePhrase: "Donner de son vivant permet d'utiliser des abattements qui se renouvellent tous les 15 ans, et de transmettre en franchise de droits des montants importants si l'on s'y prend tôt.",
    chiffres: [
      { valeur: "100 000 €", libelle: "par parent et par enfant, renouvelable tous les 15 ans" },
      { valeur: "31 865 €", libelle: "par grand-parent et par petit-enfant" },
      { valeur: "+ 31 865 €", libelle: "don familial de sommes d'argent, cumulable (donateur de moins de 80 ans, bénéficiaire majeur)" },
      { valeur: "100 000 €", libelle: "d'exonération exceptionnelle par donateur pour un logement neuf ou une rénovation énergétique, jusqu'au 31 décembre 2026" },
    ],
    essentiel: [
      { titre: "Des abattements qui se rechargent", texte: "Chaque parent peut donner 100 000 € à chaque enfant sans droits ; l'abattement se reconstitue au bout de 15 ans. Les donations de moins de 15 ans sont « rappelées » et consomment l'abattement." },
      { titre: "Le don familial de sommes d'argent", texte: "Une somme d'argent jusqu'à 31 865 € peut être donnée sans droits à un enfant, petit-enfant ou arrière-petit-enfant majeur (à défaut, neveu ou nièce), si le donateur a moins de 80 ans. Il se cumule avec l'abattement classique." },
      { titre: "Une exonération temporaire pour le logement", texte: "Les dons d'argent faits entre le 15 février 2025 et le 31 décembre 2026 pour acheter un logement neuf ou financer une rénovation énergétique sont exonérés jusqu'à 100 000 € par donateur (300 000 € par bénéficiaire), sous conditions d'utilisation et de durée d'occupation." },
      { titre: "Au-delà : un barème progressif", texte: "En ligne directe, de 5 % à 45 % après abattement. Entre frères et sœurs, 35 % puis 45 % ; au-delà, 55 % ou 60 %." },
      { titre: "Donner la nue-propriété, c'est payer moins", texte: "En se réservant l'usufruit, le donateur ne paie des droits que sur la nue-propriété, d'autant plus faible qu'il est jeune (voir la fiche Démembrement)." },
    ],
    schema: [
      { titre: "Le donateur", texte: "Choisit quoi et à qui donner" },
      { titre: "Les abattements", texte: "100 000 €, 31 865 €… tous les 15 ans" },
      { titre: "Le barème", texte: "Sur ce qui dépasse" },
      { titre: "15 ans plus tard", texte: "Les abattements se rechargent" },
    ],
    fiscalite: [
      {
        titre: "Les abattements sur donations",
        colonnes: ["Bénéficiaire", "Abattement (tous les 15 ans)"],
        lignes: [
          ["Enfant (de chaque parent)", "100 000 €"], ["Petit-enfant (de chaque grand-parent)", "31 865 €"], ["Arrière-petit-enfant", "5 310 €"],
          ["Conjoint ou partenaire de PACS", "80 724 €"], ["Frère ou sœur", "15 932 €"], ["Neveu ou nièce", "7 967 €"],
          ["Personne handicapée", "159 325 € (cumulable)"], ["Concubin", "Aucun"],
        ],
      },
      {
        titre: "Barème en ligne directe (sur la part taxable)",
        colonnes: ["Tranche", "Taux"],
        lignes: [
          ["Jusqu'à 8 072 €", "5 %"], ["8 072 € à 12 109 €", "10 %"], ["12 109 € à 15 932 €", "15 %"], ["15 932 € à 552 324 €", "20 %"],
          ["552 324 € à 902 838 €", "30 %"], ["902 838 € à 1 805 677 €", "40 %"], ["Au-delà de 1 805 677 €", "45 %"],
        ],
        note: "Frères et sœurs : 35 % jusqu'à 24 430 €, 45 % au-delà. Parents jusqu'au 4e degré : 55 %. Au-delà et non-parents : 60 %.",
      },
    ],
    pourQui: ["Des parents ou grands-parents qui veulent aider leurs descendants tôt et alléger la future succession", "Un projet de logement neuf ou de rénovation énergétique d'un proche avant fin 2026"],
    pasPourQui: ["Un donateur qui risque d'avoir besoin de cet argent plus tard : une donation est irrévocable", "Donner sans regarder l'équilibre entre enfants (penser à la donation-partage)"],
    pieges: [
      "Oublier le rappel fiscal : une donation de moins de 15 ans consomme encore l'abattement.",
      "Croire que le don familial d'argent est possible à tout âge : le donateur doit avoir moins de 80 ans et le bénéficiaire être majeur.",
      "Faire un don manuel sans le déclarer : il doit être déclaré à l'administration fiscale.",
      "Ne pas vérifier les conditions d'utilisation de l'exonération « logement » (délai, résidence principale pendant 5 ans).",
    ],
    phraseClient: "Chaque parent peut donner 100 000 € à chaque enfant sans aucun droit, et recommencer 15 ans plus tard. Commencer tôt permet de transmettre beaucoup plus, en franchise d'impôt.",
    cas: {
      enonce: "Un grand-père de 75 ans veut donner 50 000 € en argent à son petit-fils de 25 ans.",
      question: "Combien de droits ?",
      reponse: "Aucun. Le don familial de sommes d'argent (31 865 €, donateur de moins de 80 ans, bénéficiaire majeur) se cumule avec l'abattement grand-parent / petit-enfant (31 865 €) : 63 730 € au total, soit plus que les 50 000 € donnés. Le don doit toutefois être déclaré.",
    },
    vraiFaux: [
      { texte: "Un parent peut donner 100 000 € à chaque enfant sans droits, tous les 15 ans.", vrai: true, explication: "C'est l'abattement en ligne directe, renouvelable tous les 15 ans." },
      { texte: "Le don familial de sommes d'argent est possible quel que soit l'âge du donateur.", vrai: false, explication: "Le donateur doit avoir moins de 80 ans." },
      { texte: "Les concubins bénéficient d'un abattement de 15 932 €.", vrai: false, explication: "Aucun abattement entre concubins ; taux de 60 %." },
      { texte: "Le don familial d'argent se cumule avec l'abattement de 100 000 €.", vrai: true, explication: "Les deux se cumulent." },
      { texte: "Entre frères et sœurs, l'abattement sur donation est de 15 932 €.", vrai: true, explication: "Puis 35 % jusqu'à 24 430 € et 45 % au-delà." },
      { texte: "L'exonération exceptionnelle de 100 000 € pour un logement neuf court jusqu'à fin 2030.", vrai: false, explication: "Elle vise les dons faits jusqu'au 31 décembre 2026." },
    ],
    quiz: [
      { question: "Quel abattement entre un grand-parent et un petit-enfant ?", choix: ["5 310 €", "15 932 €", "31 865 €", "100 000 €"], bonne: 2, explication: "31 865 € par grand-parent et par petit-enfant." },
      { question: "Tous les combien les abattements se renouvellent-ils ?", choix: ["5 ans", "10 ans", "15 ans", "20 ans"], bonne: 2, explication: "Délai du rappel fiscal : 15 ans." },
      { question: "Deux parents, un enfant : combien sans droits en une fois (hors don d'argent) ?", choix: ["100 000 €", "131 865 €", "200 000 €", "263 730 €"], bonne: 2, explication: "100 000 € de chaque parent." },
      { question: "Quel taux s'applique à la tranche de 15 932 € à 552 324 € en ligne directe ?", choix: ["10 %", "15 %", "20 %", "30 %"], bonne: 2, explication: "20 %, la tranche la plus fréquente." },
      { question: "Conditions du don familial de sommes d'argent ?", choix: ["Donateur de moins de 80 ans, bénéficiaire majeur", "Donateur de plus de 70 ans", "Bénéficiaire mineur uniquement", "Aucune condition"], bonne: 0, explication: "Donateur de moins de 80 ans et bénéficiaire majeur (ou émancipé)." },
      { question: "Quel abattement entre époux pour une donation ?", choix: ["Aucun", "31 865 €", "80 724 €", "Exonération totale"], bonne: 2, explication: "80 724 € en donation (l'exonération totale concerne la succession)." },
    ],
    cartes: [
      { recto: "Abattement parent → enfant", verso: "100 000 €, renouvelable tous les 15 ans." },
      { recto: "Don familial de sommes d'argent", verso: "31 865 €, donateur < 80 ans, bénéficiaire majeur ; cumulable." },
      { recto: "Rappel fiscal", verso: "Les donations de moins de 15 ans sont prises en compte pour le calcul des abattements." },
      { recto: "Exonération logement (2025-2026)", verso: "Jusqu'à 100 000 € par donateur pour un logement neuf ou une rénovation énergétique, dons faits jusqu'au 31 décembre 2026." },
      { recto: "Abattement entre époux (donation)", verso: "80 724 €." },
      { recto: "Taux entre non-parents", verso: "60 %, sans abattement (sauf cas particuliers)." },
    ],
    paires: [
      { terme: "100 000 €", definition: "Parent vers enfant" },
      { terme: "31 865 €", definition: "Grand-parent vers petit-enfant" },
      { terme: "80 724 €", definition: "Entre époux ou partenaires de PACS" },
      { terme: "15 932 €", definition: "Entre frères et sœurs" },
      { terme: "15 ans", definition: "Délai de renouvellement" },
    ],
    liens: [
      { type: "officiel", titre: "Que puis-je donner sans droits ? (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/questions/que-puis-je-donner-mes-enfants-petits-enfants-sans-avoir-payer-de-droits" },
      { type: "officiel", titre: "Calcul et paiement des droits (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/calcul-et-paiement-des-droits" },
      { type: "officiel", titre: "Droits de donation selon le lien de parenté (Service-public)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14203" },
      { type: "video", titre: "Vidéos : comprendre les donations", url: YT("donation abattement 100000 euros explication notaire") },
    ],
  },

  // ------------------------------------------------------------------ SUCCESSION
  {
    id: "succession",
    illu: "arbre",
    titre: "La succession",
    sousTitre: "Qui hérite, et combien ça coûte ?",
    theme: "fisc",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "succession",
    enUnePhrase: "À un décès, la loi protège les enfants (réserve héréditaire), donne des droits au conjoint, et taxe chaque héritier selon son lien de parenté après un abattement.",
    chiffres: [
      { valeur: "½ · ⅔ · ¾", libelle: "réserve des enfants : avec 1, 2, ou 3 enfants et plus" },
      { valeur: "0 €", libelle: "de droits pour le conjoint et le partenaire de PACS" },
      { valeur: "100 000 €", libelle: "d'abattement par enfant et par parent décédé" },
      { valeur: "45 %", libelle: "taux maximal en ligne directe (au-delà de 1 805 677 €)" },
    ],
    essentiel: [
      { titre: "La réserve héréditaire", texte: "Les enfants ne peuvent pas être déshérités : ils ont droit à la moitié du patrimoine avec 1 enfant, aux deux tiers avec 2 enfants, aux trois quarts avec 3 enfants ou plus. Le reste, la quotité disponible, peut être donné ou légué librement." },
      { titre: "Le conjoint survivant", texte: "Il est exonéré de droits de succession. Sans testament ni donation entre époux, ses droits légaux dépendent de la famille : avec des enfants tous communs, il choisit entre l'usufruit de la totalité et un quart en pleine propriété ; une donation au dernier vivant élargit ces options." },
      { titre: "Le partenaire de PACS", texte: "Il n'hérite pas sans testament, mais s'il est désigné, il ne paie aucun droit de succession." },
      { titre: "Les droits : abattement puis barème", texte: "Chaque héritier bénéficie d'un abattement selon son lien de parenté (100 000 € par enfant), puis le barème s'applique à ce qui dépasse." },
      { titre: "Ce qui échappe à la succession", texte: "Les capitaux d'assurance-vie versés à un bénéficiaire désigné suivent leurs propres règles (voir la fiche Assurance-vie)." },
    ],
    schema: [
      { titre: "Décès", texte: "Ouverture de la succession" },
      { titre: "Liquidation du régime matrimonial", texte: "On isole la part du défunt" },
      { titre: "Partage", texte: "Réserve et quotité disponible" },
      { titre: "Droits", texte: "Abattement puis barème, par héritier" },
    ],
    fiscalite: [
      {
        titre: "Abattements en succession",
        colonnes: ["Héritier", "Abattement"],
        lignes: [
          ["Conjoint ou partenaire de PACS", "Exonéré"], ["Enfant", "100 000 €"], ["Frère ou sœur", "15 932 € (exonération totale sous conditions)"],
          ["Neveu ou nièce", "7 967 €"], ["Personne handicapée", "159 325 € (cumulable)"], ["Autres héritiers (à défaut d'autre abattement)", "1 594 €"],
        ],
        note: "Le barème en ligne directe est le même que pour les donations : de 5 % à 45 %.",
      },
      {
        titre: "Réserve héréditaire et quotité disponible",
        colonnes: ["Nombre d'enfants", "Réserve (pour les enfants)", "Quotité disponible"],
        lignes: [["1", "1/2", "1/2"], ["2", "2/3", "1/3"], ["3 ou plus", "3/4", "1/4"]],
      },
    ],
    pourQui: ["Faire le point sur les droits du conjoint et des enfants avant toute stratégie", "Penser à la donation au dernier vivant pour protéger le conjoint", "Rédiger un testament pour un partenaire de PACS ou un concubin"],
    pasPourQui: ["Concubin sans testament : il n'hérite pas et serait taxé à 60 %", "Famille recomposée sans organisation préalable"],
    pieges: [
      "Croire qu'on peut tout léguer à une personne alors qu'il y a des enfants : la réserve les protège.",
      "Oublier que le partenaire de PACS n'hérite pas sans testament.",
      "Raisonner avant d'avoir liquidé le régime matrimonial : la succession ne porte que sur la part du défunt.",
      "Oublier les donations de moins de 15 ans, qui consomment les abattements.",
    ],
    phraseClient: "Vos enfants ont une part protégée par la loi, votre conjoint est exonéré de droits, et chaque enfant bénéficie de 100 000 € d'abattement par parent. Avec une donation au dernier vivant et un bon testament, on peut organiser le reste comme vous le souhaitez.",
    cas: {
      enonce: "Un époux décède en laissant sa femme et deux enfants communs. Sa part du patrimoine vaut 600 000 €. Sa veuve choisit le quart en pleine propriété.",
      question: "Que paie chacun ?",
      reponse: "La veuve reçoit 150 000 € et ne paie rien (exonération). Chaque enfant reçoit 225 000 € : après l'abattement de 100 000 €, 125 000 € sont taxables, soit environ 23 194 € de droits chacun selon le barème en ligne directe.",
    },
    vraiFaux: [
      { texte: "Avec deux enfants, on peut léguer librement la moitié de son patrimoine.", vrai: false, explication: "Avec deux enfants, la quotité disponible est d'un tiers." },
      { texte: "Le conjoint survivant ne paie pas de droits de succession.", vrai: true, explication: "Il est exonéré, comme le partenaire de PACS." },
      { texte: "Un partenaire de PACS hérite sans testament.", vrai: false, explication: "Il faut un testament ; il est ensuite exonéré de droits." },
      { texte: "Chaque enfant bénéficie d'un abattement de 100 000 € sur la part reçue de chaque parent.", vrai: true, explication: "100 000 € par enfant et par parent." },
      { texte: "Un concubin est taxé à 60 % s'il hérite par testament.", vrai: true, explication: "Il n'a pas de lien de parenté : taux de 60 %." },
      { texte: "Avec trois enfants, la réserve héréditaire représente les trois quarts du patrimoine.", vrai: true, explication: "La quotité disponible n'est alors que d'un quart." },
    ],
    quiz: [
      { question: "Quelle est la quotité disponible avec un enfant ?", choix: ["1/4", "1/3", "1/2", "Tout"], bonne: 2, explication: "Avec un enfant, la réserve est d'une moitié, la quotité disponible aussi." },
      { question: "Combien paie le conjoint survivant ?", choix: ["20 %", "Rien", "5 %", "45 %"], bonne: 1, explication: "Il est totalement exonéré." },
      { question: "Quel abattement pour un neveu ?", choix: ["1 594 €", "7 967 €", "15 932 €", "31 865 €"], bonne: 1, explication: "7 967 € pour un neveu ou une nièce." },
      { question: "Avec des enfants tous communs, quel choix a le conjoint (sans testament ni donation entre époux) ?", choix: ["La moitié en pleine propriété", "L'usufruit de la totalité ou un quart en pleine propriété", "Rien", "Tout en pleine propriété"], bonne: 1, explication: "Il choisit entre l'usufruit de la totalité et un quart en pleine propriété." },
      { question: "Quel est l'abattement « par défaut » pour un héritier sans autre abattement ?", choix: ["0 €", "1 594 €", "7 967 €", "15 932 €"], bonne: 1, explication: "1 594 €." },
      { question: "Les capitaux d'assurance-vie versés à un bénéficiaire désigné…", choix: ["Entrent dans la succession classique", "Suivent leurs propres règles, hors succession", "Sont toujours taxés à 60 %", "Reviennent à l'État"], bonne: 1, explication: "Ils sont hors succession, avec une fiscalité spécifique." },
    ],
    cartes: [
      { recto: "Réserve héréditaire", verso: "Part du patrimoine réservée aux enfants : 1/2, 2/3 ou 3/4 selon leur nombre." },
      { recto: "Quotité disponible", verso: "Ce que l'on peut donner ou léguer librement." },
      { recto: "Donation au dernier vivant", verso: "Donation entre époux qui élargit les droits du conjoint survivant." },
      { recto: "Conjoint et PACS", verso: "Exonérés de droits de succession." },
      { recto: "Frère ou sœur", verso: "15 932 € d'abattement ; exonération totale sous conditions (âge ou infirmité, vie commune…)." },
      { recto: "Concubin", verso: "Pas d'héritage sans testament, taxé à 60 %." },
    ],
    paires: [
      { terme: "1 enfant", definition: "Réserve de 1/2" },
      { terme: "2 enfants", definition: "Réserve de 2/3" },
      { terme: "3 enfants ou plus", definition: "Réserve de 3/4" },
      { terme: "Conjoint", definition: "Exonéré de droits" },
      { terme: "Concubin", definition: "60 % de droits" },
    ],
    liens: [
      { type: "officiel", titre: "Quelles sont les règles pour hériter ? (Service-public)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F36739/1_0" },
      { type: "officiel", titre: "Calcul et paiement des droits (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/calcul-et-paiement-des-droits" },
      { type: "officiel", titre: "Ordre des héritiers et barème (notaires de France)", url: "https://www.notaires.fr/en/donation-succession/succession/order-succession-and-inheritance-tax" },
      { type: "video", titre: "Vidéos : comprendre la succession", url: YT("succession réserve héréditaire droits conjoint explication notaire") },
    ],
  },

  // ------------------------------------------------------------------ IFI
  {
    id: "ifi",
    illu: "balance",
    titre: "L'IFI",
    sousTitre: "L'impôt sur la fortune immobilière",
    theme: "immo",
    duree: 6,
    verifie: "10 novembre 2026",
    recherche: "ifi",
    simulateur: "ifi",
    enUnePhrase: "Si le patrimoine immobilier net du foyer dépasse 1,3 million d'euros au 1er janvier, il est soumis chaque année à un impôt progressif de 0,5 % à 1,5 %.",
    chiffres: [
      { valeur: "1,3 M€", libelle: "de patrimoine immobilier net au 1er janvier : le seuil d'imposition" },
      { valeur: "30 %", libelle: "d'abattement sur la valeur de la résidence principale" },
      { valeur: "0,5 → 1,5 %", libelle: "le barème progressif" },
      { valeur: "Inchangé", libelle: "en 2026 : le projet d'« impôt sur la fortune improductive » n'a pas été retenu" },
    ],
    essentiel: [
      { titre: "Qui est concerné ?", texte: "Les foyers dont le patrimoine immobilier net taxable dépasse 1,3 M€ au 1er janvier de l'année." },
      { titre: "Quels biens ?", texte: "Les immeubles détenus directement ou indirectement : résidence principale et secondaire, locatif, parts de SCI ou de SCPI, et la part immobilière des unités de compte d'assurance-vie." },
      { titre: "Ce qui allège", texte: "Un abattement de 30 % sur la résidence principale et la déduction de certaines dettes (emprunts immobiliers notamment), sous conditions." },
      { titre: "Les biens professionnels", texte: "Les immeubles affectés à l'activité professionnelle du redevable peuvent être exonérés, sous conditions." },
      { titre: "Le plafonnement", texte: "L'IFI ajouté à l'impôt sur le revenu ne peut pas dépasser 75 % des revenus de l'année précédente ; l'excédent vient en réduction de l'IFI." },
    ],
    schema: [
      { titre: "1er janvier", texte: "On évalue le patrimoine immobilier" },
      { titre: "Abattements et dettes", texte: "30 % sur la résidence principale, passif déductible" },
      { titre: "Seuil de 1,3 M€", texte: "Dépassé ? Barème dès 800 000 €" },
      { titre: "Décote et plafonnement", texte: "Entre 1,3 et 1,4 M€ ; 75 % des revenus" },
    ],
    fiscalite: [
      {
        titre: "Barème de l'IFI",
        colonnes: ["Patrimoine net taxable", "Taux"],
        lignes: [
          ["Jusqu'à 800 000 €", "0 %"], ["800 000 € à 1 300 000 €", "0,50 %"], ["1 300 000 € à 2 570 000 €", "0,70 %"],
          ["2 570 000 € à 5 000 000 €", "1 %"], ["5 000 000 € à 10 000 000 €", "1,25 %"], ["Au-delà de 10 000 000 €", "1,50 %"],
        ],
        note: "Décote entre 1 300 000 € et 1 400 000 € : 17 500 € − 1,25 % × patrimoine net taxable. Exemple officiel (BOFiP) : 1 374 000 € → 2 693 € d'IFI.",
      },
    ],
    pourQui: ["Un client dont l'immobilier (y compris SCPI et unités de compte immobilières) approche 1,3 M€", "Vérifier l'impact d'un achat immobilier ou d'un crédit sur l'IFI"],
    pasPourQui: ["Oublier les SCPI et les unités de compte immobilières dans le calcul", "Raisonner sur la valeur brute sans abattement ni dettes"],
    pieges: [
      "Oublier la part immobilière des SCPI et des unités de compte.",
      "Appliquer le barème à partir de 1,3 M€ : une fois le seuil franchi, il s'applique dès 800 000 €.",
      "Oublier l'abattement de 30 % sur la résidence principale.",
      "Croire que l'IFI a été transformé en 2026 : il est resté inchangé.",
    ],
    phraseClient: "L'IFI ne concerne que l'immobilier, au-delà de 1,3 million d'euros nets au 1er janvier. Votre résidence principale bénéficie de 30 % d'abattement et vos emprunts immobiliers se déduisent : regardons ensemble où vous vous situez.",
    cas: {
      enonce: "Un couple possède sa résidence principale (1 000 000 €) et un appartement loué (600 000 €) sur lequel il reste 100 000 € d'emprunt.",
      question: "Est-il redevable de l'IFI ?",
      reponse: "Résidence principale après 30 % d'abattement : 700 000 €. Appartement : 600 000 € − 100 000 € de dette = 500 000 €. Total net : 1 200 000 €, sous le seuil de 1,3 M€ : pas d'IFI (sous réserve des conditions de déduction de la dette).",
    },
    vraiFaux: [
      { texte: "L'IFI concerne aussi les actions et l'épargne financière.", vrai: false, explication: "Seul l'immobilier (direct ou indirect) est concerné." },
      { texte: "La résidence principale bénéficie d'un abattement de 30 %.", vrai: true, explication: "Sur sa valeur vénale au 1er janvier." },
      { texte: "Les parts de SCPI entrent dans l'IFI.", vrai: true, explication: "Pour leur part immobilière." },
      { texte: "Une fois le seuil de 1,3 M€ dépassé, le barème s'applique dès 800 000 €.", vrai: true, explication: "La tranche de 800 000 € à 1,3 M€ est taxée à 0,5 %." },
      { texte: "En 2026, l'IFI a été remplacé par un impôt sur la fortune improductive.", vrai: false, explication: "Ce projet n'a pas été retenu dans la loi de finances 2026." },
      { texte: "L'IFI et l'impôt sur le revenu sont plafonnés à 75 % des revenus.", vrai: true, explication: "Le mécanisme de plafonnement limite l'IFI." },
    ],
    quiz: [
      { question: "Quel est le seuil de l'IFI ?", choix: ["800 000 €", "1 000 000 €", "1 300 000 €", "2 570 000 €"], bonne: 2, explication: "1,3 M€ de patrimoine immobilier net taxable." },
      { question: "Quel abattement sur la résidence principale ?", choix: ["10 %", "20 %", "30 %", "50 %"], bonne: 2, explication: "30 %." },
      { question: "À quelle date évalue-t-on le patrimoine ?", choix: ["31 décembre", "1er janvier", "15 juin", "Date de déclaration"], bonne: 1, explication: "Au 1er janvier de l'année d'imposition." },
      { question: "Quel est le taux de la dernière tranche ?", choix: ["1 %", "1,25 %", "1,5 %", "2 %"], bonne: 2, explication: "1,5 % au-delà de 10 M€." },
      { question: "Lequel de ces biens n'entre pas dans l'IFI ?", choix: ["Une résidence secondaire", "Des parts de SCPI", "Un portefeuille d'actions de sociétés industrielles", "Un appartement loué"], bonne: 2, explication: "Les actions de sociétés opérationnelles ne sont pas de l'immobilier." },
      { question: "Que limite le plafonnement de l'IFI ?", choix: ["IFI + impôt sur le revenu à 75 % des revenus", "L'IFI à 1 % du patrimoine", "L'IFI à 10 000 €", "Rien"], bonne: 0, explication: "IFI et impôt sur le revenu ne peuvent excéder 75 % des revenus." },
    ],
    cartes: [
      { recto: "Seuil de l'IFI", verso: "1,3 M€ de patrimoine immobilier net au 1er janvier." },
      { recto: "Résidence principale", verso: "Abattement de 30 % sur sa valeur." },
      { recto: "Décote", verso: "Entre 1,3 et 1,4 M€ : 17 500 € − 1,25 % du patrimoine net taxable." },
      { recto: "Plafonnement", verso: "IFI + impôt sur le revenu ≤ 75 % des revenus." },
      { recto: "Biens concernés", verso: "Immobilier détenu en direct ou via SCI, SCPI, unités de compte immobilières." },
      { recto: "IFI en 2026", verso: "Inchangé : l'impôt sur la fortune improductive n'a pas été retenu." },
    ],
    paires: [
      { terme: "1,3 M€", definition: "Seuil d'imposition" },
      { terme: "30 %", definition: "Abattement résidence principale" },
      { terme: "75 %", definition: "Plafonnement par rapport aux revenus" },
      { terme: "1er janvier", definition: "Date d'évaluation" },
      { terme: "1,5 %", definition: "Taux de la dernière tranche" },
    ],
    liens: [
      { type: "officiel", titre: "BOFiP : tarif de l'IFI (barème et décote)", url: "https://bofip.impots.gouv.fr/bofip/11319-PGP.html/identifiant=BOI-PAT-IFI-40-10-20180608" },
      { type: "officiel", titre: "Patrimoine taxable à l'IFI (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/patrimoine-taxable-lifi" },
      { type: "officiel", titre: "Passif déductible de l'IFI (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/questions/que-puis-je-deduire-au-niveau-du-passif-de-limpot-sur-la-fortune-immobiliere" },
      { type: "video", titre: "Vidéos : comprendre l'IFI", url: YT("IFI impôt sur la fortune immobilière explication calcul") },
    ],
  },

  // ------------------------------------------------------------------ PEA
  {
    id: "pea",
    illu: "fusee",
    titre: "Le PEA",
    sousTitre: "Investir en actions européennes avec un avantage fiscal",
    theme: "marches",
    duree: 6,
    verifie: "10 novembre 2026",
    recherche: "pea",
    enUnePhrase: "Une enveloppe pour investir en actions européennes : après 5 ans, les gains ne paient plus d'impôt sur le revenu, seulement les prélèvements sociaux.",
    chiffres: [
      { valeur: "150 000 €", libelle: "de versements au maximum sur un PEA" },
      { valeur: "225 000 €", libelle: "plafond commun PEA + PEA-PME" },
      { valeur: "5 ans", libelle: "pour que les gains soient exonérés d'impôt sur le revenu" },
      { valeur: "18,6 %", libelle: "de prélèvements sociaux sur les gains en 2026 (au lieu de 17,2 %)" },
    ],
    essentiel: [
      { titre: "Un par personne", texte: "Un seul PEA par personne (deux pour un couple). On y loge des actions de sociétés européennes et des fonds investis au moins à 75 % dans ces actions." },
      { titre: "Avant 5 ans : retrait = clôture", texte: "Un retrait avant 5 ans entraîne la clôture du plan, sauf exceptions (licenciement, invalidité, mise à la retraite anticipée), et les gains sont taxés au prélèvement forfaitaire (31,4 % en 2026)." },
      { titre: "Après 5 ans : souplesse", texte: "Les gains sont exonérés d'impôt sur le revenu (seuls les prélèvements sociaux restent dus). On peut retirer sans clôturer et continuer à verser." },
      { titre: "Le PEA jeune", texte: "Un jeune rattaché au foyer fiscal de ses parents peut ouvrir un PEA plafonné à 20 000 € ; le plafond passe à 150 000 € à la fin du rattachement." },
      { titre: "L'antériorité compte", texte: "Le délai de 5 ans court depuis le premier versement : ouvrir tôt, même avec un petit montant, est un bon réflexe. Le capital n'est pas garanti." },
    ],
    schema: [
      { titre: "Ouverture", texte: "Premier versement : le compteur démarre" },
      { titre: "Investissement", texte: "Actions européennes, fonds éligibles" },
      { titre: "5 ans", texte: "Gains exonérés d'impôt sur le revenu" },
      { titre: "Retraits", texte: "Partiels, sans clôture" },
    ],
    fiscalite: [
      {
        titre: "Fiscalité des gains",
        colonnes: ["Ancienneté", "Impôt sur le revenu", "Prélèvements sociaux", "Conséquence d'un retrait"],
        lignes: [
          ["Moins de 5 ans", "12,8 %", "18,6 %", "Clôture du plan (sauf exceptions)"],
          ["5 ans et plus", "Exonéré", "18,6 %", "Pas de clôture, versements toujours possibles"],
        ],
        note: "La hausse des prélèvements sociaux à 18,6 % s'applique à tous les retraits faits depuis début 2026, quelle que soit l'ancienneté des gains.",
      },
    ],
    pourQui: ["Investir à long terme en actions européennes", "Un client qui dispose déjà d'une épargne de précaution", "Ouvrir tôt pour « prendre date »"],
    pasPourQui: ["Une épargne dont on aura besoin avant 5 ans", "Un client qui ne supporte pas les fluctuations de la Bourse"],
    pieges: [
      "Retirer avant 5 ans sans motif d'exception : le plan est clôturé.",
      "Oublier que le capital n'est pas garanti.",
      "Croire que les gains sont totalement exonérés après 5 ans : les prélèvements sociaux restent dus (18,6 % en 2026).",
      "Ouvrir un deuxième PEA classique : un seul par personne.",
    ],
    phraseClient: "Le PEA vous permet d'investir en actions européennes ; après 5 ans, vos gains ne paient plus d'impôt sur le revenu, seulement les prélèvements sociaux. Le plus tôt vous l'ouvrez, le plus tôt le compteur démarre.",
    cas: {
      enonce: "Un PEA ouvert il y a 6 ans vaut 100 000 €, dont 40 000 € de gains. Le client retire 30 000 €.",
      question: "Combien paiera-t-il ?",
      reponse: "Le retrait contient 40 % de gains, soit 12 000 €. Après 5 ans, ils sont exonérés d'impôt sur le revenu mais soumis à 18,6 % de prélèvements sociaux : environ 2 232 €. Le plan n'est pas clôturé.",
    },
    vraiFaux: [
      { texte: "Un retrait avant 5 ans entraîne en principe la clôture du PEA.", vrai: true, explication: "Sauf exceptions (licenciement, invalidité, retraite anticipée)." },
      { texte: "On peut avoir deux PEA classiques à son nom.", vrai: false, explication: "Un seul PEA par personne." },
      { texte: "Après 5 ans, les gains sont exonérés de prélèvements sociaux.", vrai: false, explication: "Ils restent soumis aux prélèvements sociaux (18,6 % en 2026)." },
      { texte: "Le plafond de versements du PEA est de 150 000 €.", vrai: true, explication: "Et 225 000 € avec le PEA-PME." },
      { texte: "Après 5 ans, on peut continuer à verser après un retrait.", vrai: true, explication: "C'est possible depuis la loi Pacte, dans la limite du plafond." },
      { texte: "Le PEA jeune est plafonné à 20 000 €.", vrai: true, explication: "Tant que le jeune est rattaché au foyer fiscal de ses parents." },
    ],
    quiz: [
      { question: "Quel est le plafond de versements d'un PEA ?", choix: ["75 000 €", "100 000 €", "150 000 €", "225 000 €"], bonne: 2, explication: "150 000 € ; 225 000 € de plafond commun avec le PEA-PME." },
      { question: "Au bout de combien d'années les gains sont-ils exonérés d'impôt sur le revenu ?", choix: ["2 ans", "5 ans", "8 ans", "10 ans"], bonne: 1, explication: "5 ans après le premier versement." },
      { question: "Quel taux de prélèvements sociaux en 2026 ?", choix: ["17,2 %", "18,6 %", "12,8 %", "30 %"], bonne: 1, explication: "18,6 % depuis la hausse de la CSG." },
      { question: "Quel motif permet un retrait avant 5 ans sans clôture ?", choix: ["Un voyage", "Un licenciement", "L'achat d'une voiture", "Aucun"], bonne: 1, explication: "Licenciement, invalidité ou mise à la retraite anticipée." },
      { question: "Que peut-on loger dans un PEA ?", choix: ["Des actions américaines en direct", "Des actions européennes et des fonds éligibles", "Des SCPI", "Des obligations d'État"], bonne: 1, explication: "Actions de sociétés européennes et fonds investis au moins à 75 % en actions éligibles." },
      { question: "À partir de quand court le délai de 5 ans ?", choix: ["La signature", "Le premier versement", "Le dernier versement", "Le 1er janvier suivant"], bonne: 1, explication: "La date du premier versement." },
    ],
    cartes: [
      { recto: "Plafond PEA", verso: "150 000 € de versements ; 225 000 € avec le PEA-PME." },
      { recto: "Règle des 5 ans", verso: "Après 5 ans : gains exonérés d'impôt sur le revenu, retraits sans clôture." },
      { recto: "Prélèvements sociaux 2026", verso: "18,6 % sur les gains du PEA." },
      { recto: "PEA jeune", verso: "Pour un jeune rattaché fiscalement, plafond de 20 000 €." },
      { recto: "Retrait avant 5 ans", verso: "Clôture, sauf licenciement, invalidité ou retraite anticipée." },
      { recto: "Titres éligibles", verso: "Actions européennes et fonds investis au moins à 75 % en titres éligibles." },
    ],
    paires: [
      { terme: "150 000 €", definition: "Plafond du PEA" },
      { terme: "225 000 €", definition: "Plafond commun avec le PEA-PME" },
      { terme: "20 000 €", definition: "Plafond du PEA jeune" },
      { terme: "5 ans", definition: "Exonération d'impôt sur le revenu" },
      { terme: "18,6 %", definition: "Prélèvements sociaux en 2026" },
    ],
    liens: [
      { type: "officiel", titre: "Investir dans un PEA : ce qu'il faut savoir (AMF, PDF)", url: "https://www.amf-france.org/sites/institutionnel/files/private/2023-12/2023_investir_dans_un_pea.pdf" },
      { type: "officiel", titre: "Moderniser le PEA et le PEA-PME (direction générale du Trésor)", url: "https://www.tresor.economie.gouv.fr/banque-assurance-finance/les-mesures-de-la-loi-pacte-pour-le-financement-de-l-economie/moderniser-le-pea-et-le-pea-pme" },
      { type: "officiel", titre: "Plan d'épargne en actions (Service-public)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2385" },
      { type: "video", titre: "Vidéos : comprendre le PEA", url: YT("PEA plan épargne actions explication fiscalité") },
    ],
  },

  // ------------------------------------------------------------------ PACTE DUTREIL
  {
    id: "pacte-dutreil",
    illu: "usine",
    titre: "Le pacte Dutreil",
    sousTitre: "Transmettre son entreprise en famille",
    theme: "economie",
    duree: 7,
    verifie: "10 novembre 2026",
    recherche: "dutreil",
    enUnePhrase: "En s'engageant à conserver les titres et à poursuivre l'activité, la famille ne paie les droits de donation ou de succession que sur 25 % de la valeur de l'entreprise transmise.",
    chiffres: [
      { valeur: "75 %", libelle: "de la valeur des titres exonérée de droits" },
      { valeur: "2 ans", libelle: "minimum d'engagement collectif de conservation" },
      { valeur: "6 ans", libelle: "d'engagement individuel de chaque bénéficiaire (4 ans avant la loi de finances 2026)" },
      { valeur: "− 50 %", libelle: "de droits en plus si le donateur a moins de 70 ans" },
    ],
    essentiel: [
      { titre: "L'avantage", texte: "Les titres d'une société exerçant une activité industrielle, commerciale, artisanale, agricole ou libérale, transmis par donation ou succession, sont exonérés de droits à hauteur de 75 % de leur valeur." },
      { titre: "L'engagement collectif", texte: "Le défunt ou le donateur et ses associés s'engagent à conserver les titres au moins 2 ans ; il doit porter sur au moins 17 % des droits financiers et 34 % des droits de vote (société non cotée)." },
      { titre: "L'engagement individuel", texte: "Chaque héritier ou donataire s'engage à conserver les titres reçus pendant 6 ans à compter de la fin de l'engagement collectif (transmissions depuis le 21 février 2026 ; 4 ans auparavant)." },
      { titre: "La direction de l'entreprise", texte: "Pendant 3 ans après la fin de l'engagement collectif, l'un des signataires ou bénéficiaires doit exercer l'activité principale ou une fonction de direction." },
      { titre: "Les biens de luxe exclus", texte: "Depuis la loi de finances 2026, les biens non affectés exclusivement à l'activité (véhicules de tourisme, yachts, avions, bijoux, objets d'art, chevaux de course, vins et alcools, logements non professionnels…) sont exclus de l'exonération." },
    ],
    schema: [
      { titre: "Engagement collectif", texte: "2 ans minimum" },
      { titre: "Transmission", texte: "Donation ou succession : 75 % exonérés" },
      { titre: "Engagement individuel", texte: "6 ans pour chaque bénéficiaire" },
      { titre: "Direction", texte: "3 ans après la fin de l'engagement collectif" },
    ],
    fiscalite: [
      {
        titre: "Ce que change la loi de finances 2026",
        colonnes: ["Règle", "Avant", "Transmissions depuis le 21 février 2026"],
        lignes: [
          ["Exonération", "75 %", "75 %"],
          ["Engagement individuel", "4 ans", "6 ans"],
          ["Biens somptuaires (yacht, véhicules de tourisme, art, bijoux…)", "Dans la base exonérée", "Exclus de l'exonération"],
        ],
        note: "Sources : Service-public entreprendre (fiche F36019) et BOFiP (actualité ACTU-2026-00114). Montage à réaliser avec un notaire ou un avocat.",
      },
    ],
    pourQui: ["Un chef d'entreprise qui veut transmettre sa société à ses enfants", "Une transmission anticipée par donation, surtout avant 70 ans"],
    pasPourQui: ["Des héritiers qui comptent revendre l'entreprise rapidement", "Une société dont l'activité est principalement patrimoniale (gestion de biens)"],
    pieges: [
      "Céder des titres avant la fin de l'engagement individuel : l'avantage est remis en cause.",
      "Appliquer l'ancienne durée de 4 ans à une transmission faite depuis le 21 février 2026.",
      "Oublier d'exclure les biens somptuaires de la base exonérée.",
      "Négliger la condition de direction pendant 3 ans.",
    ],
    phraseClient: "Avec un pacte Dutreil, vos enfants ne paieront des droits que sur un quart de la valeur de votre entreprise, à condition de conserver les titres plusieurs années et que l'un d'eux en assure la direction. Si vous donnez avant 70 ans, les droits sont encore réduits de moitié.",
    cas: {
      enonce: "Une dirigeante de 65 ans donne à sa fille unique, en pleine propriété, les titres de sa société, valorisés 2 M€, sous pacte Dutreil.",
      question: "Quel est l'ordre de grandeur des droits ?",
      reponse: "Base taxable : 25 % × 2 M€ = 500 000 €, moins 100 000 € d'abattement = 400 000 €, soit environ 78 194 € selon le barème, réduits de 50 % (donatrice de moins de 70 ans) : environ 39 097 €. Sans pacte, sur 1,9 M€ taxables, les droits seraient d'environ 308 697 € après la même réduction.",
    },
    vraiFaux: [
      { texte: "Le pacte Dutreil exonère 75 % de la valeur des titres transmis.", vrai: true, explication: "Les droits ne portent que sur 25 % de la valeur." },
      { texte: "Depuis 2026, l'engagement individuel dure 4 ans.", vrai: false, explication: "Il est passé à 6 ans pour les transmissions depuis le 21 février 2026." },
      { texte: "Un yacht détenu par la société profite de l'exonération.", vrai: false, explication: "Les biens somptuaires non affectés à l'activité sont exclus depuis 2026." },
      { texte: "L'engagement collectif dure au moins 2 ans.", vrai: true, explication: "Il porte sur au moins 17 % des droits financiers et 34 % des droits de vote." },
      { texte: "Si le donateur a moins de 70 ans, une réduction de 50 % des droits s'applique.", vrai: true, explication: "Pour une donation en pleine propriété." },
      { texte: "Le pacte Dutreil concerne aussi les sociétés de pure gestion de patrimoine.", vrai: false, explication: "Il vise les sociétés à activité industrielle, commerciale, artisanale, agricole ou libérale." },
    ],
    quiz: [
      { question: "Quelle part de la valeur des titres est exonérée ?", choix: ["25 %", "50 %", "75 %", "100 %"], bonne: 2, explication: "75 %." },
      { question: "Quelle est la durée minimale de l'engagement collectif ?", choix: ["1 an", "2 ans", "4 ans", "6 ans"], bonne: 1, explication: "2 ans au minimum." },
      { question: "Durée de l'engagement individuel depuis la loi de finances 2026 ?", choix: ["2 ans", "4 ans", "6 ans", "8 ans"], bonne: 2, explication: "6 ans (4 ans auparavant)." },
      { question: "Pendant combien de temps une fonction de direction doit-elle être exercée après l'engagement collectif ?", choix: ["1 an", "3 ans", "5 ans", "10 ans"], bonne: 1, explication: "3 ans." },
      { question: "Lequel de ces biens est exclu de l'exonération depuis 2026 ?", choix: ["Une machine-outil", "Un yacht", "Un brevet", "Un stock de marchandises"], bonne: 1, explication: "Les biens somptuaires non affectés à l'activité sont exclus." },
      { question: "Quels seuils doit atteindre l'engagement collectif (société non cotée) ?", choix: ["10 % et 20 %", "17 % des droits financiers et 34 % des droits de vote", "50 % et 50 %", "Aucun seuil"], bonne: 1, explication: "17 % des droits financiers et 34 % des droits de vote." },
    ],
    cartes: [
      { recto: "Exonération Dutreil", verso: "75 % de la valeur des titres transmis." },
      { recto: "Engagement collectif", verso: "2 ans minimum, 17 % des droits financiers et 34 % des droits de vote." },
      { recto: "Engagement individuel (2026)", verso: "6 ans pour chaque héritier ou donataire." },
      { recto: "Fonction de direction", verso: "3 ans après la fin de l'engagement collectif." },
      { recto: "Biens somptuaires (2026)", verso: "Exclus : véhicules de tourisme, yachts, avions, bijoux, art, chevaux de course, vins, logements non professionnels…" },
      { recto: "Donation avant 70 ans", verso: "Réduction de 50 % des droits." },
    ],
    paires: [
      { terme: "75 %", definition: "Part de la valeur exonérée" },
      { terme: "2 ans", definition: "Engagement collectif minimum" },
      { terme: "6 ans", definition: "Engagement individuel" },
      { terme: "3 ans", definition: "Fonction de direction" },
      { terme: "Moins de 70 ans", definition: "Réduction de 50 % des droits" },
    ],
    liens: [
      { type: "officiel", titre: "Donation de parts sociales de SARL (Service-public entreprendre)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36019" },
      { type: "officiel", titre: "BOFiP : recentrage du pacte Dutreil (actualité 2026)", url: "https://bofip.impots.gouv.fr/bofip/15125-PGP.html/ACTU-2026-00114" },
      { type: "video", titre: "Vidéos : comprendre le pacte Dutreil", url: YT("pacte Dutreil transmission entreprise explication") },
    ],
  },
);

// Illustration propre à chaque fiche (elle reprend les couleurs de sa thématique et s'anime doucement).
const ILLUS_FICHES = {
  "assurance-vie": `<path class="f2 anim-flotte" d="M90 70a70 52 0 01140 0z"/><path class="s3" d="M160 70v34a10 10 0 01-20 0" stroke-width="5" stroke-linecap="round"/>
    <path class="fc" d="M90 70q17-14 35 0q17-14 35 0q17-14 35 0q17-14 35 0" opacity=".5"/>
    <ellipse class="f3" cx="250" cy="98" rx="26" ry="7"/><ellipse class="f2" cx="250" cy="88" rx="26" ry="7"/><ellipse class="f3" cx="250" cy="78" rx="26" ry="7"/>
    <circle class="f1 anim-pulse" cx="52" cy="34" r="16"/>`,
  "per": `<circle class="f1 anim-pulse" cx="248" cy="44" r="30"/><path class="f3" d="M110 18h60l-24 40 24 40h-60l24-40z"/><path class="f0" d="M122 26h36l-18 28z"/>
    <path class="f2 anim-sable" d="M126 92h28l-14-22z"/><path class="s2 anim-trace" d="M20 104c40-6 60-26 90-30" stroke-width="4" stroke-linecap="round"/>`,
  "scpi": `<rect class="f3" x="40" y="36" width="54" height="72" rx="3"/><rect class="f2" x="104" y="16" width="62" height="92" rx="3"/><rect class="f3" x="176" y="50" width="46" height="58" rx="3"/>
    <g class="fc anim-clignote"><rect x="50" y="46" width="10" height="10"/><rect x="72" y="46" width="10" height="10"/><rect x="50" y="66" width="10" height="10"/><rect x="116" y="28" width="12" height="12"/>
    <rect x="142" y="28" width="12" height="12"/><rect x="116" y="52" width="12" height="12"/><rect x="142" y="76" width="12" height="12"/><rect x="186" y="62" width="9" height="9"/></g>
    <circle class="f1 anim-pulse" cx="270" cy="40" r="24"/>`,
  "produits-structures": `<path class="s3" d="M20 80H300" stroke-width="2" stroke-dasharray="6 6"/><text x="252" y="96" font-size="11" class="f3" style="font-family:system-ui">barrière</text>
    <path class="s2 anim-trace" d="M20 50c30-10 50 20 80 10s40-40 70-20 40 30 60 10 40-24 70-26" stroke-width="5" stroke-linecap="round"/>
    <circle class="f3 anim-pulse" cx="100" cy="60" r="7"/><circle class="f3 anim-pulse" cx="230" cy="40" r="7"/>`,
  "girardin-industriel": `<path class="f1" d="M0 100q40-12 80 0t80 0 80 0 80 0v20H0z"/><path class="f2 anim-vague" d="M0 108q40-10 80 0t80 0 80 0 80 0v12H0z"/>
    <path class="s3" d="M88 98c4-24 2-46-6-64" stroke-width="6" stroke-linecap="round"/>
    <g class="f3 anim-balance" style="transform-origin:82px 34px"><path d="M82 34c-16-12-34-10-44 0 14-4 28-4 44 0z"/><path d="M82 34c12-16 32-18 44-8-16-2-30 2-44 8z"/><path d="M82 34c-4-16 4-28 16-32-6 10-10 20-16 32z"/></g>
    <rect class="f3" x="180" y="62" width="70" height="30" rx="4"/><rect class="f2" x="250" y="72" width="26" height="20" rx="3"/><circle class="fc" cx="200" cy="94" r="7"/><circle class="fc" cx="262" cy="94" r="7"/>`,
  "anneaux": `<circle class="s3 anim-flotte" cx="130" cy="62" r="34" stroke-width="9"/><circle class="s2 anim-flotte-2" cx="180" cy="62" r="34" stroke-width="9"/>
    <path class="f1" d="M240 92l22-16 22 16v18h-44z"/><circle class="f1 anim-pulse" cx="52" cy="36" r="18"/>`,
  "maison-coupee": `<path class="f3" d="M90 108V58l60-40v90z"/><path class="f2 anim-ecarte" d="M156 108V18l60 40v50z"/><path class="s3" d="M153 10v108" stroke-width="2" stroke-dasharray="5 5"/>
    <text x="98" y="100" font-size="9.5" class="fc" style="font-family:system-ui;font-weight:700">USUFRUIT</text><text x="161" y="100" font-size="9" class="fc" style="font-family:system-ui;font-weight:700">NUE-PROPRIÉTÉ</text>
    <circle class="f1 anim-pulse" cx="270" cy="36" r="20"/>`,
  "holding": `<circle class="f3" cx="50" cy="58" r="16"/><path class="f3" d="M28 104c0-18 10-28 22-28s22 10 22 28z"/>
    <path class="s2 anim-trace" d="M80 64h44" stroke-width="4" stroke-linecap="round" marker-end=""/><path class="f2" d="M122 56l12 8-12 8z"/>
    <rect class="f2" x="140" y="38" width="56" height="50" rx="8"/><text x="148" y="68" font-size="11" class="fc" style="font-family:system-ui;font-weight:700">HOLDING</text>
    <path class="s3 anim-trace" d="M198 62l40-30M198 62h40M198 62l40 30" stroke-width="3" stroke-linecap="round"/>
    <rect class="f1 anim-pulse" x="240" y="20" width="30" height="22" rx="4"/><rect class="f1 anim-pulse" x="240" y="51" width="30" height="22" rx="4"/><rect class="f1 anim-pulse" x="240" y="82" width="30" height="22" rx="4"/>`,
  "cadeau": `<rect class="f2 anim-flotte" x="110" y="52" width="100" height="58" rx="4"/><rect class="f3" x="102" y="38" width="116" height="18" rx="4"/><rect class="f1" x="152" y="38" width="16" height="72"/>
    <path class="s3" d="M160 38c-14-22-36-18-30-4 4 8 18 6 30 4zM160 38c14-22 36-18 30-4-4 8-18 6-30 4z" stroke-width="4"/>
    <circle class="f1 anim-pulse" cx="60" cy="40" r="14"/><circle class="f1 anim-pulse" cx="262" cy="36" r="10"/>`,
  "arbre": `<path class="s3" d="M160 24v26M160 50h-70v20M160 50h70v20M90 70h-30v18M90 70h30v18M230 70v18" stroke-width="3"/>
    <circle class="f3 anim-pulse" cx="160" cy="22" r="12"/><circle class="f2" cx="90" cy="72" r="10"/><circle class="f2" cx="230" cy="72" r="10"/>
    <circle class="f1" cx="60" cy="96" r="9"/><circle class="f1" cx="120" cy="96" r="9"/><circle class="f1" cx="230" cy="96" r="9"/>`,
  "balance": `<path class="s3" d="M160 20v84M120 108h80" stroke-width="5" stroke-linecap="round"/>
    <g class="anim-balance" style="transform-origin:160px 30px"><path class="s3" d="M90 30h140" stroke-width="5" stroke-linecap="round"/>
    <path class="f2" d="M70 70h40l-20-36z"/><path class="f3" d="M74 62l16-12 16 12v10h-32z"/><path class="f1" d="M210 70h40l-20-36z"/><circle class="f3" cx="230" cy="60" r="8"/></g>`,
  "fusee": `<path class="s2 anim-trace" d="M30 104l50-20 40 6 50-30 40 8 60-40" stroke-width="5" stroke-linecap="round"/>
    <g class="anim-flotte"><path class="f3" d="M262 30c10-14 22-18 30-18-1 8-4 20-18 30l-8 2z"/><circle class="f0" cx="280" cy="24" r="4"/></g>
    <g class="f1">${Array.from({ length: 12 }, (_, i) => `<circle cx="${70 + 22 * Math.cos(i * Math.PI / 6)}" cy="${40 + 22 * Math.sin(i * Math.PI / 6)}" r="3"/>`).join("")}</g>`,
  "usine": `<path class="f3" d="M40 108V60l40 20V60l40 20V60l40 20v28z"/><rect class="f2" x="170" y="30" width="18" height="78"/>
    <circle class="f1 anim-fumee" cx="179" cy="22" r="8"/><circle class="f1 anim-fumee-2" cx="192" cy="10" r="6"/>
    <path class="s2" d="M220 70h50" stroke-width="5" stroke-linecap="round"/><path class="f2" d="M266 60l16 10-16 10z"/><circle class="f1 anim-pulse" cx="270" cy="34" r="14"/>`,
};
function illustrationFiche(f, hauteur = 120) {
  const dessin = ILLUS_FICHES[f.illu || f.id];
  if (!dessin) return illustration(f.theme, hauteur);
  return `<svg class="ill anime th-${f.theme}" viewBox="0 0 320 120" height="${hauteur}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <rect class="f0" width="320" height="120"/>${dessin}</svg>`;
}
