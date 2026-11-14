// version 1.0 — nouvelles fiches de la rubrique « Apprendre » (parcours Immobilier et compléments).
// Uniquement à partir de sources officielles : Service-public, impots.gouv.fr, BOFiP, Légifrance.

FICHES.push(
  // ------------------------------------------------------------------ SCI
  {
    id: "sci",
    titre: "La SCI",
    sousTitre: "Détenir et transmettre l'immobilier à plusieurs",
    theme: "immo",
    duree: 7,
    verifie: "15 novembre 2026",
    recherche: "SCI",
    enUnePhrase: "Plusieurs associés réunissent des biens immobiliers dans une société civile : ils détiennent des parts plutôt que les murs, ce qui facilite la gestion à plusieurs et la transmission.",
    chiffres: [
      { valeur: "2", libelle: "associés au minimum (personnes physiques ou sociétés)" },
      { valeur: "1 €", libelle: "de capital minimum, fixé librement par les associés" },
      { valeur: "5 %", libelle: "de droits d'enregistrement sur la vente de parts d'une SCI à prépondérance immobilière" },
      { valeur: "10 %", libelle: "de recettes commerciales au-delà desquelles la SCI bascule à l'impôt sur les sociétés" },
    ],
    essentiel: [
      { titre: "Une société, pas une indivision", texte: "La SCI a la personnalité morale : c'est elle qui achète, emprunte et loue. Les associés détiennent des parts, réparties selon leurs apports (argent ou bien immobilier)." },
      { titre: "Des règles écrites dans les statuts", texte: "Les statuts organisent presque tout : pouvoirs du gérant, majorités, entrée de nouveaux associés. Sans clause contraire, les décisions qui dépassent les pouvoirs du gérant se prennent à l'unanimité." },
      { titre: "L'impôt sur le revenu par défaut", texte: "Les loyers sont imposés chez chaque associé, à proportion de ses parts, en revenus fonciers, même s'ils ne sont pas distribués. La SCI peut opter pour l'impôt sur les sociétés." },
      { titre: "Une activité civile", texte: "Louer des locaux nus est civil. Une activité commerciale (achat-revente, location meublée…) qui dépasse 10 % des recettes fait passer la SCI à l'impôt sur les sociétés." },
      { titre: "Une responsabilité sans plafond", texte: "Chaque associé répond des dettes de la société sans limite, mais seulement à proportion de sa part, et le créancier doit d'abord poursuivre la société." },
    ],
    schema: [
      { titre: "Les associés", texte: "Apportent argent ou biens" },
      { titre: "La SCI", texte: "Achète, emprunte, loue" },
      { titre: "Les loyers", texte: "Imposés chez les associés (IR) ou dans la SCI (IS)" },
      { titre: "La transmission", texte: "Donation de parts, petit à petit" },
    ],
    fiscalite: [
      {
        titre: "SCI à l'impôt sur le revenu ou à l'impôt sur les sociétés",
        colonnes: ["Point", "SCI à l'impôt sur le revenu (par défaut)", "SCI à l'impôt sur les sociétés (option)"],
        lignes: [
          ["Qui paie l'impôt ?", "Chaque associé, sur sa quote-part, même sans distribution", "La SCI elle-même"],
          ["Loyers", "Revenus fonciers (déclaration 2044 de l'associé) ; la SCI dépose la 2072", "Bénéfice de la société (déclaration 2065) : 15 % jusqu'à 42 500 € sous conditions, 25 % au-delà"],
          ["Vente d'un immeuble", "Plus-values des particuliers : 19 % + 17,2 %, abattements pour durée de détention", "Imposée dans le résultat de la société, sans abattement pour durée de détention"],
          ["Revenir en arrière", "—", "Renonciation possible jusqu'au 5e exercice suivant celui de l'option, puis option irrévocable ; après une renonciation, impossible de réopter"],
        ],
        note: "L'option pour l'impôt sur les sociétés doit être notifiée avant la fin du 3e mois de l'exercice concerné (Service-public).",
      },
      {
        titre: "Vendre des parts : les droits d'enregistrement",
        colonnes: ["Type de SCI", "Droits"],
        lignes: [
          ["À prépondérance immobilière (plus de 50 % de l'actif en immobilier non affecté à l'exploitation)", "5 % du prix"],
          ["Autres sociétés civiles", "3 % du prix, après un abattement de 23 000 € au prorata des parts cédées"],
        ],
      },
    ],
    pourQui: ["Des parents qui veulent transmettre un bien locatif progressivement à leurs enfants", "Plusieurs personnes qui achètent ensemble et veulent des règles claires plutôt qu'une indivision", "Un chef d'entreprise qui loge ses locaux professionnels hors de sa société d'exploitation"],
    pasPourQui: ["Un achat-revente rapide de biens (activité commerciale, à faire en société commerciale)", "Une location meublée importante, qui ferait basculer la SCI à l'impôt sur les sociétés", "Une personne seule (il faut au moins 2 associés)"],
    pieges: [
      "Faire de la location meublée au-delà de 10 % des recettes sans le savoir : la SCI passe à l'impôt sur les sociétés.",
      "Opter pour l'impôt sur les sociétés sans mesurer qu'après le 5e exercice on ne peut plus revenir en arrière, et qu'après une renonciation on ne peut plus réopter.",
      "Oublier que les associés paient l'impôt sur les loyers même si la SCI les garde pour rembourser l'emprunt.",
      "Rédiger des statuts types sans réfléchir aux pouvoirs du gérant et à l'agrément des nouveaux associés.",
    ],
    phraseClient: "Avec une SCI, vous ne possédez plus l'appartement directement mais des parts d'une société qui le possède. Vous gardez la main grâce aux statuts, et vous pouvez donner des parts à vos enfants petit à petit.",
    cas: {
      enonce: "Marc vend à sa sœur toutes ses parts d'une SCI qui ne détient que des appartements loués, pour 120 000 €.",
      question: "Combien de droits d'enregistrement ?",
      reponse: "La SCI est à prépondérance immobilière : 5 % du prix, soit 6 000 €. Sa sœur n'étant ni ascendante ni descendante, elle doit aussi être agréée par les associés, sauf clause contraire des statuts.",
    },
    vraiFaux: [
      { texte: "On peut créer une SCI seul.", vrai: false, explication: "Il faut au moins 2 associés." },
      { texte: "Une SCI à l'impôt sur le revenu ne paie pas elle-même l'impôt sur les loyers.", vrai: true, explication: "Ce sont les associés, chacun sur sa quote-part." },
      { texte: "Les associés d'une SCI ne risquent jamais plus que leur apport.", vrai: false, explication: "Leur responsabilité est indéfinie, à proportion de leur part dans le capital (Code civil, art. 1857)." },
      { texte: "Des époux peuvent créer une SCI à deux.", vrai: true, explication: "Quel que soit leur régime matrimonial." },
      { texte: "L'option pour l'impôt sur les sociétés est définitive dès le départ.", vrai: false, explication: "On peut y renoncer jusqu'au 5e exercice suivant celui de l'option ; ensuite elle devient irrévocable." },
    ],
    quiz: [
      { question: "Quel est le capital minimum d'une SCI ?", choix: ["1 €", "1 000 €", "7 500 €", "37 000 €"], bonne: 0, explication: "Le capital est libre, avec un minimum de 1 €." },
      { question: "Comment sont imposés les loyers d'une SCI à l'impôt sur le revenu ?", choix: ["Dans la SCI à 25 %", "Chez les associés, en revenus fonciers", "Ils sont exonérés", "En plus-values"], bonne: 1, explication: "Chaque associé déclare sa quote-part en revenus fonciers." },
      { question: "Au-delà de quelle part de recettes commerciales la SCI passe-t-elle à l'impôt sur les sociétés ?", choix: ["5 %", "10 %", "25 %", "50 %"], bonne: 1, explication: "L'administration tolère une activité commerciale accessoire jusqu'à 10 % du chiffre d'affaires." },
      { question: "Droits sur la vente de parts d'une SCI de location nue ?", choix: ["0,1 %", "3 %", "5 %", "5,80 %"], bonne: 2, explication: "5 % du prix pour une société à prépondérance immobilière." },
      { question: "Sans clause des statuts, comment se prennent les grandes décisions ?", choix: ["À la majorité simple", "À l'unanimité", "Par le gérant seul", "Au tirage au sort"], bonne: 1, explication: "L'unanimité est la règle par défaut, les statuts peuvent prévoir autre chose." },
    ],
    cartes: [
      { recto: "Responsabilité des associés", verso: "Indéfinie, non solidaire, à proportion des parts ; le créancier poursuit d'abord la société." },
      { recto: "Déclaration 2072", verso: "Déclaration annuelle d'une SCI à l'impôt sur le revenu." },
      { recto: "Prépondérance immobilière", verso: "Plus de 50 % de l'actif en immobilier non affecté à l'exploitation : vente de parts taxée à 5 %." },
      { recto: "Option pour l'IS", verso: "Avant la fin du 3e mois de l'exercice ; renonciation possible jusqu'au 5e exercice suivant, puis définitive." },
    ],
    paires: [
      { terme: "Gérant", definition: "Dirige la SCI au quotidien" },
      { terme: "Statuts", definition: "Règles de fonctionnement écrites" },
      { terme: "Agrément", definition: "Accord des associés pour un nouvel entrant" },
      { terme: "2072", definition: "Déclaration d'une SCI à l'IR" },
      { terme: "2065", definition: "Déclaration d'une SCI à l'IS" },
    ],
    liens: [
      { type: "officiel", titre: "SCI : ce qu'il faut savoir (Service-public entreprendre)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F38553" },
      { type: "officiel", titre: "Plus-value d'une SCI à l'impôt sur le revenu (impots.gouv.fr)", url: "https://www.impots.gouv.fr/particulier/questions/la-societe-civile-immobiliere-imposee-limpot-sur-le-revenu-dont-je-suis" },
      { type: "officiel", titre: "Livret fiscal des sociétés civiles (impots.gouv.fr)", url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/1_creation_entreprise/livret_fiscal/nid_12250_sci_livret_fiscal_createur_dentreprise.pdf" },
      { type: "video", titre: "Vidéos : comprendre la SCI", url: YT("SCI société civile immobilière fonctionnement fiscalité explication") },
    ],
  },
);
