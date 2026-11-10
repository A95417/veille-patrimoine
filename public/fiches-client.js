// version 1.0 — « Présenter le sujet au client » : déroulé de présentation et questions fréquentes des clients.
// Les réponses reprennent uniquement les règles déjà vérifiées dans chaque fiche (sources officielles, 10 novembre 2026).
// Elles restent générales : le conseil personnalisé suppose de connaître la situation complète du client.

const FICHES_CLIENT = {
  "assurance-vie": {
    presenter: [
      "Partir de l'objectif du client : épargner, se créer des revenus plus tard, ou transmettre.",
      "Expliquer les deux types de supports : le fonds en euros garanti et les unités de compte, sans garantie du capital.",
      "Montrer que l'argent reste disponible et que seuls les gains sont taxés lors d'un retrait, avec une fiscalité plus douce après 8 ans.",
      "Terminer par la clause bénéficiaire : c'est elle qui organise la transmission, à vérifier ensemble.",
    ],
    faq: [
      { q: "Mon argent est-il bloqué ?", r: "Non. Vous pouvez retirer tout ou partie de votre épargne à tout moment. Seule la fiscalité des gains dépend de l'âge du contrat : elle est plus douce après 8 ans." },
      { q: "Est-ce que je peux perdre de l'argent ?", r: "Sur le fonds en euros, le capital est garanti par l'assureur, selon les conditions du contrat. Sur les unités de compte, la valeur peut monter ou baisser : le capital n'est pas garanti." },
      { q: "Combien d'impôts vais-je payer si je retire ?", r: "Seuls les gains contenus dans le retrait sont imposés. Après 8 ans, vous bénéficiez d'un abattement annuel de 4 600 € de gains (9 200 € pour un couple), puis d'un taux de 7,5 % (12,8 % pour la part des versements au-delà de 150 000 €), plus 17,2 % de prélèvements sociaux." },
      { q: "Qu'est-ce qui se passe à mon décès ?", r: "Le capital va aux bénéficiaires que vous avez désignés, en dehors de la succession. Pour les versements faits avant 70 ans, chaque bénéficiaire profite d'un abattement de 152 500 € ; votre conjoint ou partenaire de PACS est totalement exonéré." },
      { q: "J'ai plus de 70 ans, est-ce encore intéressant ?", r: "Les versements après 70 ans ont un abattement global de 30 500 €, mais tous les gains produits sont exonérés de droits de succession. Les contrats déjà alimentés avant 70 ans gardent leur régime de 152 500 € par bénéficiaire." },
    ],
  },
  "per": {
    presenter: [
      "Vérifier d'abord la tranche marginale d'imposition et le plafond disponible indiqué sur l'avis d'impôt.",
      "Chiffrer l'économie d'impôt : versement × taux marginal.",
      "Être clair sur la contrepartie : l'épargne est bloquée jusqu'à la retraite, sauf cas de déblocage prévus.",
      "Expliquer la sortie : capital ou rente, et l'imposition à ce moment-là.",
    ],
    faq: [
      { q: "Combien vais-je économiser ?", r: "L'économie est égale à votre versement multiplié par votre taux marginal d'imposition, dans la limite de votre plafond : avec une tranche à 30 %, 1 000 € versés réduisent l'impôt de 300 €." },
      { q: "Puis-je récupérer mon argent avant la retraite ?", r: "Oui dans certains cas : achat de la résidence principale (sauf compartiment des versements obligatoires), et accidents de la vie : décès du conjoint ou partenaire, invalidité, surendettement, fin des droits au chômage, liquidation judiciaire." },
      { q: "Est-ce que je paierai des impôts à la sortie ?", r: "Oui si vous avez déduit vos versements : en capital, les versements sont imposés au barème de l'impôt sur le revenu et les gains à 12,8 % plus les prélèvements sociaux. L'avantage fiscal est donc surtout un report d'imposition." },
      { q: "Quel montant puis-je déduire ?", r: "Pour un salarié en 2026 : 10 % des revenus professionnels, entre 4 710 € et 37 680 €. Votre plafond exact figure sur votre avis d'impôt." },
      { q: "J'ai 70 ans, puis-je encore verser ?", r: "Vous pouvez verser, mais depuis le 1er janvier 2026, les versements faits à partir de 70 ans ne sont plus déductibles." },
    ],
  },
  "scpi": {
    presenter: [
      "Présenter le principe : une part d'un grand parc immobilier géré par une société de gestion agréée par l'AMF.",
      "Annoncer d'emblée les deux risques : ni le capital ni les revenus ne sont garantis, et la revente n'est pas immédiate.",
      "Insister sur l'horizon long (8 à 10 ans au minimum) à cause des frais d'entrée.",
      "Comparer les modes de détention : en direct (revenus fonciers) ou dans une assurance-vie.",
    ],
    faq: [
      { q: "Combien ça rapporte ?", r: "La SCPI reverse une partie des loyers, après frais. Le taux de distribution indique les revenus versés, mais pas l'évolution du prix de la part : les revenus passés ne préjugent pas des revenus futurs, et ils ne sont pas garantis." },
      { q: "Puis-je revendre quand je veux ?", r: "La revente dépend de la présence d'acheteurs : elle peut prendre du temps, parfois plusieurs mois. C'est pourquoi c'est un placement de long terme." },
      { q: "Le prix des parts peut-il baisser ?", r: "Oui : le capital n'est pas garanti, et plusieurs SCPI ont baissé le prix de leurs parts en 2023-2024." },
      { q: "Comment sont imposés les loyers ?", r: "En direct, ce sont des revenus fonciers imposés au barème, plus 17,2 % de prélèvements sociaux (micro-foncier avec 30 % d'abattement si vos revenus fonciers bruts ne dépassent pas 15 000 €). Dans une assurance-vie, c'est la fiscalité de l'assurance-vie qui s'applique." },
      { q: "Pourquoi ne pas acheter un appartement à la place ?", r: "La SCPI évite la gestion locative et permet d'investir avec un petit montant dans de nombreux immeubles. En contrepartie, il y a des frais d'entrée élevés et vous ne choisissez pas les immeubles." },
    ],
  },
  "produits-structures": {
    presenter: [
      "Expliquer que c'est une formule : les règles sont connues à l'avance, pas le résultat.",
      "Montrer les scénarios avec le simulateur : remboursement anticipé, capital rendu, perte au-delà de la barrière.",
      "Dire clairement que « protégé » ne veut pas dire « garanti », et parler du risque de la banque émettrice.",
      "Remettre et commenter le document d'informations clés, notamment les scénarios défavorables.",
    ],
    faq: [
      { q: "Mon capital est-il garanti ?", r: "Non, il est protégé sous condition : à l'échéance, vous le récupérez si l'indice n'a pas baissé au-delà de la barrière. Au-delà, la perte suit toute la baisse de l'indice. Le remboursement dépend aussi de la solidité de la banque émettrice." },
      { q: "Combien de temps mon argent est-il placé ?", r: "Seule la durée maximale est connue. Le produit peut être remboursé plus tôt, automatiquement, si l'indice est au-dessus du niveau prévu à une date de constatation." },
      { q: "Le coupon est-il sûr ?", r: "Non, il est conditionnel : il n'est versé (ou mis en mémoire) que si l'indice est au-dessus d'un seuil aux dates de constatation." },
      { q: "Puis-je sortir avant la fin ?", r: "Une revente avant l'échéance est possible mais peut se faire avec une perte : ces produits sont conçus pour être conservés jusqu'au remboursement." },
      { q: "Où trouver les risques par écrit ?", r: "Dans le document d'informations clés (DIC), qui présente la durée, les risques, les coûts et les scénarios, y compris défavorables. L'AMF recommande aussi que les brochures affichent ces informations dès la première page." },
    ],
  },
  "girardin-industriel": {
    presenter: [
      "Vérifier d'abord le montant de l'impôt payé chaque année et les autres réductions déjà utilisées.",
      "Expliquer sans détour que l'apport n'est jamais récupéré : on « achète » une réduction d'impôt plus élevée.",
      "Présenter le calendrier : souscription avant le 31 décembre, réduction sur l'impôt de l'année suivante.",
      "Parler du risque de reprise par le fisc et du rôle du monteur et des garanties.",
    ],
    faq: [
      { q: "Est-ce que je récupère mon argent ?", r: "Non. L'apport est versé à fonds perdus ; votre gain est l'écart entre la réduction d'impôt obtenue l'année suivante et la somme versée." },
      { q: "Quand vais-je profiter de la réduction ?", r: "Sur l'impôt de l'année qui suit votre souscription : souscription avant le 31 décembre N, réduction sur l'impôt de N+1." },
      { q: "Quel est le risque ?", r: "Si le matériel n'est pas exploité 5 ans dans les conditions prévues, le fisc peut reprendre la réduction. Le sérieux du monteur et les garanties proposées sont donc essentiels." },
      { q: "Combien puis-je investir ?", r: "La réduction ne doit pas dépasser votre impôt, et elle entre dans le plafonnement des niches fiscales, porté à 18 000 € par an en cas d'investissement outre-mer. Le monteur calcule le montant adapté." },
      { q: "Le dispositif va-t-il durer ?", r: "Il est ouvert aux investissements réalisés jusqu'au 31 décembre 2029." },
    ],
  },
  "regimes-matrimoniaux": {
    presenter: [
      "Commencer par la question : « Êtes-vous mariés, pacsés, avec ou sans contrat ? »",
      "Expliquer avec un exemple concret ce qui est commun et ce qui est propre dans leur situation.",
      "Montrer les conséquences en cas de décès ou de séparation.",
      "Orienter vers le notaire si un changement de régime ou un testament semble utile.",
    ],
    faq: [
      { q: "Nous nous sommes mariés sans contrat : quel est notre régime ?", r: "Celui de la communauté réduite aux acquêts : ce que vous possédiez avant le mariage et ce que vous recevez par donation ou succession reste propre ; ce que vous achetez pendant le mariage est commun, pour moitié chacun." },
      { q: "L'héritage de mes parents appartient-il aussi à mon conjoint ?", r: "Non, sous le régime légal il reste à vous. Si vous achetez un bien avec cet argent, faites-le préciser dans l'acte d'achat pour que le bien reste propre." },
      { q: "Pouvons-nous changer de régime ?", r: "Oui, devant notaire et dans l'intérêt de la famille. Vos enfants majeurs et vos créanciers en sont informés et ont 3 mois pour s'opposer ; le juge n'intervient qu'en cas d'opposition." },
      { q: "Nous sommes pacsés : mon partenaire héritera-t-il de moi ?", r: "Pas sans testament : le PACS ne rend pas héritier. Avec un testament, votre partenaire est exonéré de droits de succession, comme un conjoint." },
      { q: "La communauté universelle, c'est mieux pour protéger mon conjoint ?", r: "Avec une clause d'attribution intégrale, votre conjoint reçoit tout et vos enfants héritent au second décès. Mais en présence d'enfants d'une autre union, ceux-ci peuvent agir pour protéger leur part : c'est à étudier avec le notaire." },
    ],
  },
  "demembrement": {
    presenter: [
      "Partir du souhait du client : transmettre aux enfants tout en gardant l'usage ou les revenus du bien.",
      "Expliquer usufruit et nue-propriété avec le schéma, puis qui paie quoi.",
      "Chiffrer avec le calculateur : la donation ne porte que sur la nue-propriété.",
      "Préciser qu'au décès, les enfants deviennent pleinement propriétaires sans droits supplémentaires.",
    ],
    faq: [
      { q: "Pourrai-je continuer à habiter ma maison ?", r: "Oui : en gardant l'usufruit, vous conservez le droit d'habiter le bien ou de le louer et d'en percevoir les loyers jusqu'à la fin de l'usufruit." },
      { q: "Mes enfants paieront-ils des droits à mon décès ?", r: "Non pour ce bien : quand l'usufruit s'éteint au décès de l'usufruitier, le nu-propriétaire devient plein propriétaire sans payer de droits (article 1133 du CGI). Les droits ont été payés lors de la donation, sur la seule nue-propriété." },
      { q: "Combien coûte la donation ?", r: "Les droits sont calculés sur la valeur de la nue-propriété, qui dépend de votre âge : à 65 ans, elle représente 60 % de la valeur du bien. Les abattements de 100 000 € par parent et par enfant s'appliquent ensuite." },
      { q: "Qui paie la taxe foncière et les travaux ?", r: "L'usufruitier paie l'entretien, les charges courantes et la taxe foncière ; le nu-propriétaire paie les grosses réparations, sauf si elles viennent d'un défaut d'entretien." },
      { q: "Pourrai-je vendre le bien plus tard ?", r: "La vente du bien entier nécessite l'accord de l'usufruitier et du nu-propriétaire." },
    ],
  },
  "apport-cession": {
    presenter: [
      "Rappeler que c'est un outil pour le dirigeant qui vend son entreprise et veut réinvestir dans l'économie.",
      "Expliquer le report d'imposition : l'impôt n'est pas supprimé, il est décalé.",
      "Présenter les contraintes depuis 2026 : 70 % à réinvestir en 3 ans si la holding vend dans les 3 ans, conservation 5 ans.",
      "Orienter vers un avocat fiscaliste pour valider le montage.",
    ],
    faq: [
      { q: "Est-ce que j'évite l'impôt sur ma plus-value ?", r: "Non, il est reporté : la plus-value est calculée lors de l'apport et devient imposable si le report prend fin, par exemple en cas de cession des titres de la holding." },
      { q: "Combien dois-je réinvestir ?", r: "Si votre holding vend les titres apportés dans les 3 ans de l'apport, elle doit réinvestir au moins 70 % du prix dans un délai de 3 ans, dans des activités éligibles (cessions depuis le 21 février 2026)." },
      { q: "Puis-je placer l'argent en immobilier locatif ou en placements financiers ?", r: "La loi de finances 2026 a resserré la liste des activités éligibles au réinvestissement. Le choix doit être validé avec un avocat fiscaliste, à partir des commentaires du BOFiP." },
      { q: "Combien de temps garder les réinvestissements ?", r: "5 ans pour les biens ou titres acquis en remploi direct, contre 1 an auparavant." },
      { q: "Et si la holding vend après 3 ans ?", r: "L'obligation de réinvestir ne concerne que les cessions réalisées dans les 3 ans suivant l'apport." },
    ],
  },
  "donations": {
    presenter: [
      "Demander les donations déjà faites ces 15 dernières années.",
      "Présenter les abattements selon le lien de parenté, et leur renouvellement tous les 15 ans.",
      "Montrer le cumul possible avec le don familial de sommes d'argent.",
      "Rappeler qu'une donation est irrévocable et qu'elle doit être déclarée.",
    ],
    faq: [
      { q: "Combien puis-je donner à mes enfants sans payer ?", r: "100 000 € par parent et par enfant, renouvelables tous les 15 ans. Pour une somme d'argent, vous pouvez y ajouter le don familial de 31 865 € si vous avez moins de 80 ans et que votre enfant est majeur." },
      { q: "Et à mes petits-enfants ?", r: "31 865 € par grand-parent et par petit-enfant tous les 15 ans, plus, pour une somme d'argent, 31 865 € de don familial si vous avez moins de 80 ans et qu'il est majeur." },
      { q: "Je veux aider mon enfant à acheter un logement neuf, y a-t-il un avantage ?", r: "Les dons d'argent faits jusqu'au 31 décembre 2026 pour acheter un logement neuf ou financer une rénovation énergétique sont exonérés jusqu'à 100 000 € par donateur, sous conditions d'utilisation des fonds et d'occupation du logement pendant 5 ans." },
      { q: "Faut-il déclarer un don d'argent ?", r: "Oui, un don manuel doit être déclaré à l'administration fiscale, même lorsqu'aucun droit n'est dû." },
      { q: "Et si je donne plus que l'abattement ?", r: "La part qui dépasse est taxée selon le barème en ligne directe, de 5 % à 45 % ; la tranche la plus courante, de 15 932 € à 552 324 €, est taxée à 20 %." },
    ],
  },
  "succession": {
    presenter: [
      "Identifier la famille : conjoint ou partenaire, enfants communs ou non, régime matrimonial.",
      "Expliquer la réserve des enfants et la part que l'on peut transmettre librement.",
      "Présenter les droits : exonération du conjoint, abattement de 100 000 € par enfant, barème.",
      "Proposer les outils : donation au dernier vivant, testament, assurance-vie, donations de son vivant.",
    ],
    faq: [
      { q: "Mon conjoint devra-t-il payer des droits ?", r: "Non, le conjoint survivant et le partenaire de PACS sont exonérés de droits de succession." },
      { q: "Puis-je laisser tout mon patrimoine à une seule personne ?", r: "Pas si vous avez des enfants : ils ont une part réservée, la moitié avec un enfant, les deux tiers avec deux, les trois quarts avec trois ou plus. Le reste peut être transmis librement." },
      { q: "Combien paieront mes enfants ?", r: "Chaque enfant bénéficie d'un abattement de 100 000 € sur la part reçue de chaque parent, puis le barème s'applique de 5 % à 45 %, en tenant compte des donations de moins de 15 ans." },
      { q: "Ma compagne, avec qui je ne suis ni marié ni pacsé, héritera-t-elle ?", r: "Pas sans testament ; et même avec un testament, un concubin est taxé à 60 %. Le PACS ou le mariage changent fortement la situation." },
      { q: "Comment mieux protéger mon conjoint ?", r: "Sans disposition particulière, avec des enfants tous communs, il choisit entre l'usufruit de la totalité et un quart en pleine propriété. Une donation au dernier vivant, faite chez le notaire, élargit ses options." },
    ],
  },
  "ifi": {
    presenter: [
      "Faire l'inventaire de l'immobilier, y compris les SCPI et les unités de compte immobilières.",
      "Appliquer l'abattement de 30 % sur la résidence principale et retirer les dettes déductibles.",
      "Comparer au seuil de 1,3 M€ avec le calculateur.",
      "Rappeler le plafonnement à 75 % des revenus si l'IFI est élevé.",
    ],
    faq: [
      { q: "Suis-je concerné par l'IFI ?", r: "Seulement si votre patrimoine immobilier net taxable dépasse 1,3 million d'euros au 1er janvier, après 30 % d'abattement sur votre résidence principale et déduction des dettes admises." },
      { q: "Mes placements financiers sont-ils taxés ?", r: "Non, l'IFI ne vise que l'immobilier, détenu directement ou indirectement : SCI, SCPI, part immobilière des unités de compte d'assurance-vie." },
      { q: "Mon emprunt immobilier compte-t-il ?", r: "Oui, certaines dettes, dont les emprunts immobiliers, sont déductibles, sous conditions." },
      { q: "L'IFI a-t-il changé en 2026 ?", r: "Non. Le projet de le remplacer par un impôt sur la fortune improductive n'a pas été retenu dans la loi de finances 2026." },
      { q: "Combien vais-je payer ?", r: "Le barème va de 0,5 % à 1,5 % selon les tranches, avec une décote entre 1,3 et 1,4 M€. Par exemple, pour 1 374 000 € de patrimoine net taxable, l'IFI est de 2 693 €." },
    ],
  },
  "pea": {
    presenter: [
      "Vérifier que le client a déjà une épargne de précaution et un horizon d'au moins 5 ans.",
      "Expliquer ce qu'on y place : des actions européennes et des fonds éligibles, sans garantie du capital.",
      "Présenter la règle des 5 ans et la fiscalité.",
      "Conseiller d'ouvrir tôt pour faire démarrer le compteur.",
    ],
    faq: [
      { q: "Mon argent est-il bloqué 5 ans ?", r: "Avant 5 ans, un retrait entraîne en principe la clôture du plan, sauf licenciement, invalidité ou mise à la retraite anticipée. Après 5 ans, vous pouvez retirer sans clôturer et continuer à verser." },
      { q: "Combien d'impôts sur mes gains ?", r: "Après 5 ans, les gains sont exonérés d'impôt sur le revenu : seuls les prélèvements sociaux restent dus, 18,6 % en 2026. Avant 5 ans, le prélèvement forfaitaire s'applique (31,4 % en 2026)." },
      { q: "Combien puis-je verser ?", r: "Jusqu'à 150 000 € sur un PEA, et 225 000 € au total avec un PEA-PME. Un PEA jeune, pour un enfant rattaché à votre foyer fiscal, est limité à 20 000 €." },
      { q: "Puis-je perdre de l'argent ?", r: "Oui, le capital n'est pas garanti : c'est un placement en actions, à envisager sur le long terme." },
      { q: "Puis-je ouvrir un PEA pour mon conjoint aussi ?", r: "Oui : un PEA par personne, donc deux pour un couple." },
    ],
  },
  "pacte-dutreil": {
    presenter: [
      "Partir du projet de transmission de l'entreprise à la famille.",
      "Présenter l'avantage : les droits ne portent que sur 25 % de la valeur des titres.",
      "Détailler les engagements : 2 ans collectif, 6 ans individuel, 3 ans de direction.",
      "Signaler les changements de 2026 et orienter vers un notaire ou un avocat pour le montage.",
    ],
    faq: [
      { q: "Combien mes enfants économiseront-ils ?", r: "75 % de la valeur des titres est exonérée : les droits ne sont calculés que sur 25 %. Si vous donnez en pleine propriété avant 70 ans, les droits sont en plus réduits de moitié." },
      { q: "Mes enfants pourront-ils revendre ?", r: "Ils doivent conserver les titres reçus pendant 6 ans après la fin de l'engagement collectif (transmissions depuis le 21 février 2026). Une cession anticipée remet en cause l'avantage." },
      { q: "Faut-il que l'un d'eux dirige l'entreprise ?", r: "Oui, pendant 3 ans après la fin de l'engagement collectif, l'un des signataires ou des bénéficiaires doit exercer l'activité principale ou une fonction de direction." },
      { q: "Tout le patrimoine de la société est-il concerné ?", r: "Non : depuis 2026, les biens non affectés à l'activité (véhicules de tourisme, yachts, objets d'art, bijoux, vins, logements non professionnels…) sont exclus de l'exonération." },
      { q: "Mon entreprise est-elle éligible ?", r: "Le dispositif vise les sociétés exerçant une activité industrielle, commerciale, artisanale, agricole ou libérale, pas les sociétés de pure gestion de patrimoine." },
    ],
  },
};
