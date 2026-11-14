// version 1.0 — mots difficiles du brief, expliqués en une phrase (définitions générales, sans chiffres susceptibles de changer).
// Chaque entrée : [variantes reconnues dans le texte], définition.
const GLOSSAIRE = [
  [["BCE", "Banque centrale européenne"], "La banque centrale de la zone euro : elle fixe les taux directeurs pour maintenir la stabilité des prix."],
  [["Fed", "Réserve fédérale"], "La banque centrale des États-Unis : elle fixe les taux directeurs américains."],
  [["taux directeurs", "taux directeur"], "Les taux auxquels la banque centrale prête aux banques ou rémunère leurs dépôts ; ils influencent tous les taux d'intérêt de l'économie."],
  [["taux de dépôt"], "Le taux auquel la BCE rémunère l'argent que les banques déposent chez elle : c'est aujourd'hui son principal taux directeur."],
  [["inflation"], "La hausse générale et durable des prix : avec la même somme, on achète moins qu'avant."],
  [["désinflation"], "Le ralentissement de l'inflation : les prix montent encore, mais moins vite."],
  [["déflation"], "La baisse générale et durable des prix."],
  [["IPC", "indice des prix à la consommation"], "L'indicateur qui mesure l'évolution des prix payés par les ménages : c'est la mesure habituelle de l'inflation."],
  [["IPP", "prix à la production"], "L'indice des prix à la production : l'évolution des prix de vente des entreprises, souvent un signal avancé de l'inflation."],
  [["PIB", "produit intérieur brut"], "La valeur de tout ce qui est produit dans un pays sur une période : la mesure habituelle de la croissance."],
  [["récession"], "Un recul de l'activité économique (le PIB baisse), généralement sur au moins deux trimestres de suite."],
  [["OAT"], "Les obligations émises par l'État français pour financer sa dette."],
  [["obligation", "obligations"], "Un titre de dette : l'acheteur prête de l'argent à un État ou une entreprise, qui lui verse des intérêts puis le rembourse."],
  [["spread"], "L'écart entre deux taux d'intérêt, par exemple entre les taux français et allemands : il mesure le risque perçu par les marchés."],
  [["dette publique"], "L'ensemble des emprunts de l'État, des collectivités et de la Sécurité sociale."],
  [["déficit public"], "Quand les dépenses publiques d'une année dépassent les recettes : l'écart est financé par l'emprunt."],
  [["loi de finances", "PLF", "projet de loi de finances"], "Le texte voté chaque année par le Parlement qui fixe les impôts et les dépenses de l'État pour l'année suivante."],
  [["PLFSS"], "Le projet de loi de financement de la Sécurité sociale : le budget annuel de la Sécu (santé, retraites, famille…)."],
  [["CSG"], "La contribution sociale généralisée : un prélèvement sur les revenus qui finance la Sécurité sociale."],
  [["prélèvements sociaux"], "Les contributions (dont la CSG) prélevées sur les revenus du patrimoine et des placements, en plus de l'impôt sur le revenu."],
  [["PFU", "flat tax", "prélèvement forfaitaire unique"], "Le prélèvement forfaitaire unique : une imposition à taux fixe des revenus financiers (impôt + prélèvements sociaux), sauf option pour le barème."],
  [["TMI", "tranche marginale"], "La tranche marginale d'imposition : le taux du barème de l'impôt sur le revenu qui s'applique au dernier euro gagné."],
  [["abattement"], "Une somme déduite avant le calcul de l'impôt : seule la part au-delà de l'abattement est taxée."],
  [["plus-value", "plus-values"], "Le gain réalisé quand on revend un bien plus cher qu'on ne l'a acheté."],
  [["IFI"], "L'impôt sur la fortune immobilière : il touche les foyers dont le patrimoine immobilier net dépasse un certain seuil."],
  [["démembrement"], "La séparation de la propriété d'un bien en deux : l'usufruit (l'utiliser, en percevoir les revenus) et la nue-propriété (le posséder sans en profiter)."],
  [["usufruit", "usufruitier"], "Le droit d'utiliser un bien ou d'en percevoir les revenus, sans en être le plein propriétaire."],
  [["nue-propriété", "nu-propriétaire"], "La propriété d'un bien sans le droit d'en profiter ; elle devient pleine propriété à la fin de l'usufruit."],
  [["assurance-vie"], "Un contrat d'épargne souple, avec une fiscalité avantageuse après 8 ans et un cadre favorable pour la transmission."],
  [["fonds euros", "fonds en euros"], "Le support sécurisé de l'assurance-vie : le capital est garanti par l'assureur (hors frais), le rendement varie chaque année."],
  [["unités de compte", "UC"], "Les supports d'assurance-vie investis en actions, obligations, immobilier… : potentiel plus élevé, mais capital non garanti."],
  [["PER", "plan d'épargne retraite"], "Le plan d'épargne retraite : les versements peuvent être déduits du revenu imposable, l'épargne est en principe bloquée jusqu'à la retraite."],
  [["PEA", "plan d'épargne en actions"], "Le plan d'épargne en actions : il investit en actions européennes, avec une fiscalité allégée après 5 ans."],
  [["SCPI"], "Les sociétés civiles de placement immobilier : on achète des parts d'un parc immobilier géré par des professionnels et on perçoit des loyers."],
  [["LMNP", "loueur en meublé non professionnel"], "Le statut fiscal des particuliers qui louent des logements meublés sans en faire leur activité principale."],
  [["Livret A"], "Le livret d'épargne réglementé, sans impôt ni prélèvements sociaux, disponible à tout moment ; son taux est fixé par l'État."],
  [["LEP", "livret d'épargne populaire"], "Un livret réglementé réservé aux foyers aux revenus modestes, mieux rémunéré que le Livret A."],
  [["ETF", "tracker", "fonds indiciel"], "Un fonds coté en Bourse qui reproduit un indice (CAC 40, S&P 500…), généralement à faibles frais."],
  [["CAC 40"], "L'indice des 40 principales sociétés cotées à la Bourse de Paris."],
  [["Euro Stoxx 50"], "L'indice des 50 plus grandes sociétés cotées de la zone euro."],
  [["S&P 500"], "L'indice des 500 plus grandes sociétés cotées aux États-Unis."],
  [["dividende", "dividendes"], "La part des bénéfices qu'une entreprise verse à ses actionnaires."],
  [["produit structuré", "produits structurés", "autocall"], "Un placement dont le gain dépend de règles fixées à l'avance (souvent l'évolution d'un indice), avec un risque de perte en capital."],
  [["donation"], "Le fait de transmettre de son vivant un bien ou une somme à quelqu'un, avec des abattements fiscaux renouvelables."],
  [["succession"], "La transmission du patrimoine d'une personne décédée à ses héritiers."],
  [["Smic"], "Le salaire minimum légal en France, revalorisé au moins une fois par an."],
  [["quotient familial"], "Le mécanisme qui adapte l'impôt sur le revenu à la taille du foyer, via un nombre de parts."],
];

// Ajoute un mot cliquable (première occurrence de chaque terme) dans les zones de texte du brief.
function activerGlossaire(racine) {
  if (!racine) return;
  const vus = new Set();
  const entrees = GLOSSAIRE.flatMap(([variantes, def], k) => variantes.map((v) => ({ v, k, def }))).sort((a, b) => b.v.length - a.v.length);
  const echap = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${entrees.map((e) => echap(e.v)).join("|")})(?=$|[^\\p{L}\\p{N}])`, "iu");
  const cibles = racine.querySelectorAll(".essentiel li span:last-child, .actu > p, .compacte-detail p, .retenir li > span:not(.retenir-num), #b-marches > p, .schema li span:last-child, .sch-legende");
  for (const el of cibles) {
    const marche = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const noeuds = []; while (marche.nextNode()) noeuds.push(marche.currentNode);
    for (const n of noeuds) {
      let texte = n.nodeValue, m, morceaux = [], fait = false;
      while ((m = texte.match(re))) {
        const mot = m[2], e = entrees.find((x) => x.v.toLowerCase() === mot.toLowerCase());
        const debut = m.index + m[1].length;
        if (!e || vus.has(e.k)) { morceaux.push(document.createTextNode(texte.slice(0, debut + mot.length))); texte = texte.slice(debut + mot.length); continue; }
        vus.add(e.k); fait = true;
        morceaux.push(document.createTextNode(texte.slice(0, debut)));
        const b = document.createElement("button"); b.type = "button"; b.className = "terme"; b.textContent = mot; b.dataset.def = e.def;
        morceaux.push(b);
        texte = texte.slice(debut + mot.length);
      }
      if (!fait) continue;
      morceaux.push(document.createTextNode(texte));
      n.replaceWith(...morceaux);
    }
  }
}

// Bulle de définition (un seul exemplaire, repositionné à chaque clic).
document.addEventListener("click", (e) => {
  const b = e.target.closest(".terme");
  document.querySelector(".bulle-terme")?.remove();
  if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const bulle = document.createElement("div");
  bulle.className = "bulle-terme"; bulle.setAttribute("role", "tooltip");
  bulle.innerHTML = `<strong>${echapper(b.textContent)}</strong><span>${echapper(b.dataset.def)}</span>`;
  document.body.appendChild(bulle);
  const r = b.getBoundingClientRect(), l = Math.min(innerWidth - bulle.offsetWidth - 12, Math.max(12, r.left + r.width / 2 - bulle.offsetWidth / 2));
  const haut = r.top - bulle.offsetHeight - 10 > 8;
  bulle.style.left = l + "px";
  bulle.style.top = (scrollY + (haut ? r.top - bulle.offsetHeight - 10 : r.bottom + 10)) + "px";
});
