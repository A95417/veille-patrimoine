// Simulations chiffrées des vidéos (exemples fictifs, calculés par le site, jamais par l'IA).
// Fichier partagé : chargé par la page (Création Post › Vidéo) et importé par le serveur (src/video.js).
(function () {
  const nb = (x, d) => (x !== "" && x != null && Number.isFinite(Number(x)) ? Number(x) : d);
  const borne = (x, a, b) => Math.max(a, Math.min(b, x));
  const fr = (n) => Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");
  const pc = (n) => String(+(+n).toFixed(2)).replace(".", ",");
  // valeur future de versements mensuels m pendant k mois, taux annuel t ; et d'un capital c placé n années
  const fvMensuel = (m, t, k) => { const i = t / 12; return i ? m * ((1 + i) ** k - 1) / i : m * k; };
  const fvCapital = (c, t, n) => c * (1 + t) ** n;

  const S = {
    tot: {
      nom: "Commencer tôt ou attendre", desc: "Deux profils épargnent la même somme chaque mois, l'un commence plus tard.",
      champs: [["mensuel", "Épargne par mois (€)", 10, 5000, 10, 100], ["taux", "Rendement fictif (%/an)", 0, 10, .5, 4], ["age1", "Profil 1 commence à", 16, 80, 1, 25], ["age2", "Profil 2 commence à", 17, 85, 1, 35], ["age_fin", "Jusqu'à l'âge de", 20, 90, 1, 65]],
      calcul(s) {
        const m = borne(nb(s.mensuel, 100), 10, 5000), taux = borne(nb(s.taux, 4), 0, 10) / 100;
        const a1 = borne(nb(s.age1, 25), 16, 80), a2 = borne(nb(s.age2, 35), a1 + 1, 85), fin = borne(nb(s.age_fin, 65), a2 + 1, 90);
        const A = { versements: m * 12 * (fin - a1), capital: fvMensuel(m, taux, 12 * (fin - a1)) }, B = { versements: m * 12 * (fin - a2), capital: fvMensuel(m, taux, 12 * (fin - a2)) };
        const ecart = A.capital - B.capital;
        return { mensuel: m, taux: taux * 100, age1: a1, age2: a2, age_fin: fin, A, B, ecart, attente: a2 - a1,
          titre: "Commencer tôt ou attendre : le temps est le meilleur allié", unite: "€",
          gauche: { nom: `Dès ${a1} ans`, valeur: A.capital, verse: A.versements, personnage: "lea" }, droite: { nom: `Dès ${a2} ans`, valeur: B.capital, verse: B.versements, personnage: "tom_age" },
          note: `Exemple fictif : ${m} €/mois, ${pc(taux * 100)} %/an, non garanti`,
          lignes: [`${m} € par mois, rendement fictif de ${pc(taux * 100)} % par an.`,
            `Profil 1 commence à ${a1} ans : à ${fin} ans il a versé ${fr(A.versements)} € et dispose d'environ ${fr(A.capital)} €.`,
            `Profil 2 commence à ${a2} ans (il attend ${a2 - a1} ans) : à ${fin} ans il a versé ${fr(B.versements)} € et dispose d'environ ${fr(B.capital)} €.`,
            `Écart : environ ${fr(ecart)} €.`],
          resume: `≈ ${fr(A.capital)} € contre ≈ ${fr(B.capital)} € : ${fr(ecart)} € d'écart pour ${fr(A.versements - B.versements)} € versés en plus.`,
          nombres: [m, taux * 100, a1, a2, fin, a2 - a1, A.versements, A.capital, B.versements, B.capital, ecart, A.capital - A.versements, B.capital - B.versements, A.versements - B.versements, m * .5, m * 1.5, m * 2, m * 3] };
      },
    },
    unique: {
      nom: "Placer d'un coup ou chaque mois", desc: "La même somme placée dès aujourd'hui, ou étalée en versements mensuels.",
      champs: [["montant", "Somme à placer (€)", 1000, 500000, 1000, 12000], ["annees", "Versements étalés sur (ans)", 1, 10, 1, 2], ["horizon", "Durée du placement (ans)", 2, 40, 1, 10], ["taux", "Rendement fictif (%/an)", 0, 10, .5, 4]],
      calcul(s) {
        const c = borne(nb(s.montant, 12000), 1000, 500000), n = borne(nb(s.annees, 2), 1, 10), h = borne(nb(s.horizon, 10), n + 1, 40), t = borne(nb(s.taux, 4), 0, 10) / 100;
        const m = c / (12 * n), A = fvCapital(c, t, h), B = fvCapital(fvMensuel(m, t, 12 * n), t, h - n), ecart = A - B;
        return { titre: "Placer d'un coup ou étaler chaque mois ?", unite: "€",
          gauche: { nom: "D'un coup", valeur: A, verse: c, personnage: "lea" }, droite: { nom: "Chaque mois", valeur: B, verse: c, personnage: "tom" },
          note: `Exemple fictif : ${fr(c)} € sur ${h} ans, ${pc(t * 100)} %/an, non garanti`,
          lignes: [`Somme de ${fr(c)} €, rendement fictif de ${pc(t * 100)} % par an, sur ${h} ans.`,
            `Placée d'un coup aujourd'hui : environ ${fr(A)} € au bout de ${h} ans.`,
            `Étalée en ${12 * n} versements de ${fr(m)} € par mois pendant ${n} an${n > 1 ? "s" : ""} : environ ${fr(B)} € au bout de ${h} ans.`,
            `Écart : environ ${fr(ecart)} €, pour la même somme versée. Étaler limite en revanche le risque d'entrer au mauvais moment sur un placement qui fluctue.`],
          resume: `≈ ${fr(A)} € d'un coup contre ≈ ${fr(B)} € en ${12 * n} mensualités de ${fr(m)} € : ${fr(ecart)} € d'écart.`,
          nombres: [c, n, h, t * 100, m, 12 * n, A, B, ecart, A - c, B - c] };
      },
    },
    frais: {
      nom: "L'effet des frais", desc: "Le même placement avec des frais annuels faibles ou élevés.",
      champs: [["capital", "Capital de départ (€)", 0, 1000000, 1000, 10000], ["mensuel", "Plus par mois (€)", 0, 5000, 10, 100], ["annees", "Durée (ans)", 1, 40, 1, 20], ["taux", "Rendement brut fictif (%/an)", 0, 12, .5, 5], ["frais1", "Frais faibles (%/an)", 0, 3, .1, .5], ["frais2", "Frais élevés (%/an)", 0, 5, .1, 2]],
      calcul(s) {
        const c = borne(nb(s.capital, 10000), 0, 1e6), m = borne(nb(s.mensuel, 100), 0, 5000), n = borne(nb(s.annees, 20), 1, 40), t = borne(nb(s.taux, 5), 0, 12) / 100;
        const f1 = borne(nb(s.frais1, .5), 0, 3) / 100, f2 = borne(nb(s.frais2, 2), f1 * 100 + .1, 5) / 100;
        const val = (f) => fvCapital(c, t - f, n) + fvMensuel(m, t - f, 12 * n), A = val(f1), B = val(f2), verse = c + m * 12 * n, ecart = A - B;
        return { titre: "Les frais : un détail qui coûte cher", unite: "€",
          gauche: { nom: `Frais ${pc(f1 * 100)} %`, valeur: A, verse, personnage: "lea" }, droite: { nom: `Frais ${pc(f2 * 100)} %`, valeur: B, verse, personnage: "tom" },
          note: `Exemple fictif : ${pc(t * 100)} %/an brut sur ${n} ans, non garanti`,
          lignes: [`Capital de départ de ${fr(c)} € et ${fr(m)} € par mois pendant ${n} ans, soit ${fr(verse)} € versés ; rendement brut fictif de ${pc(t * 100)} % par an.`,
            `Avec ${pc(f1 * 100)} % de frais par an : environ ${fr(A)} €.`, `Avec ${pc(f2 * 100)} % de frais par an : environ ${fr(B)} €.`, `Écart dû aux frais : environ ${fr(ecart)} €.`],
          resume: `≈ ${fr(A)} € avec ${pc(f1 * 100)} % de frais contre ≈ ${fr(B)} € avec ${pc(f2 * 100)} % : ${fr(ecart)} € d'écart.`,
          nombres: [c, m, n, t * 100, f1 * 100, f2 * 100, verse, A, B, ecart, (f2 - f1) * 100, A - verse, B - verse] };
      },
    },
    inflation: {
      nom: "L'inflation et le pouvoir d'achat", desc: "Ce que vaut une somme, en pouvoir d'achat, si elle ne rapporte rien.",
      champs: [["montant", "Somme (€)", 100, 1000000, 100, 10000], ["inflation", "Inflation supposée (%/an)", 0, 10, .1, 2], ["annees", "Dans combien d'années", 1, 40, 1, 10]],
      calcul(s) {
        const c = borne(nb(s.montant, 10000), 100, 1e6), i = borne(nb(s.inflation, 2), 0, 10) / 100, n = borne(nb(s.annees, 10), 1, 40);
        const B = c / (1 + i) ** n, perte = c - B, pct = (perte / c) * 100;
        return { titre: "L'inflation grignote votre épargne", unite: "€",
          gauche: { nom: "Aujourd'hui", valeur: c, personnage: "lea" }, droite: { nom: `Dans ${n} ans`, valeur: B, personnage: "michel" },
          note: `Exemple fictif : inflation supposée de ${pc(i * 100)} %/an`,
          lignes: [`Une somme de ${fr(c)} € qui ne rapporte rien, avec une inflation supposée de ${pc(i * 100)} % par an.`,
            `Dans ${n} ans, elle n'aura plus que le pouvoir d'achat d'environ ${fr(B)} € d'aujourd'hui.`, `Perte de pouvoir d'achat : environ ${fr(perte)} €, soit environ ${pc(Math.round(pct))} %.`],
          resume: `${fr(c)} € aujourd'hui ≈ ${fr(B)} € de pouvoir d'achat dans ${n} ans (−${fr(perte)} €).`,
          nombres: [c, i * 100, n, B, perte, Math.round(pct)] };
      },
    },
    per: {
      nom: "L'économie d'impôt d'un versement PER", desc: "Versement déductible × taux marginal d'imposition, dans la limite du plafond.",
      champs: [["versement", "Versement sur le PER (€)", 100, 100000, 100, 5000], ["tmi", "Tranche d'imposition (%)", 0, 45, 0, 30, [0, 11, 30, 41, 45]]],
      calcul(s) {
        const v = borne(nb(s.versement, 5000), 100, 100000), t = [0, 11, 30, 41, 45].includes(nb(s.tmi, 30)) ? nb(s.tmi, 30) : 30;
        const eco = v * t / 100, effort = v - eco;
        return { titre: "PER : ce que coûte vraiment un versement", unite: "€",
          gauche: { nom: "Versement", valeur: v, personnage: "lea" }, droite: { nom: "Effort réel", valeur: effort, personnage: "sarah" },
          note: `Exemple fictif : tranche à ${t} %, dans la limite du plafond`,
          lignes: [`Un versement de ${fr(v)} € sur un PER, déduit du revenu imposable (dans la limite du plafond de déduction), pour une personne dans la tranche à ${t} %.`,
            `Économie d'impôt : environ ${fr(eco)} € (${fr(v)} € × ${t} %).`, `Effort d'épargne réel : environ ${fr(effort)} €.`,
            "À la sortie, les sommes issues de versements déduits sont imposées : c'est un report d'imposition, pas une exonération."],
          resume: `${fr(v)} € versés, ≈ ${fr(eco)} € d'impôt en moins : effort réel ≈ ${fr(effort)} €.`,
          nombres: [v, t, eco, effort] };
      },
    },
  };
  function simuler(s = {}) {
    const type = S[s.type] ? s.type : "tot";
    return { type, nom: S[type].nom, ...S[type].calcul(s) };
  }
  globalThis.VideoSimulations = { TYPES: S, simuler, fr };
})();
