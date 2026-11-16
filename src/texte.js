// Codes HTML (&#233;, &eacute;, &amp;#39;…) laissés dans un texte par un flux ou par l'IA : on les remplace par les vrais caractères.
// Par prudence, « < » et « > » ne sont jamais décodés (ils restent sous forme de code, donc sans effet sur la page).
const NOMMES = { amp: "&", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", laquo: "«", raquo: "»",
  ndash: "–", mdash: "—", euro: "€", deg: "°", eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â", auml: "ä", ccedil: "ç",
  ocirc: "ô", ouml: "ö", ucirc: "û", ugrave: "ù", uuml: "ü", icirc: "î", iuml: "ï", oelig: "œ", aelig: "æ",
  Eacute: "É", Egrave: "È", Ecirc: "Ê", Agrave: "À", Acirc: "Â", Ccedil: "Ç", Ocirc: "Ô", Icirc: "Î", Ucirc: "Û", OElig: "Œ" };
const car = (n) => (n === 60 || n === 62 || n < 9 || n > 0x10ffff ? null : String.fromCodePoint(n));

export function propre(t) {
  if (typeof t !== "string" || !t.includes("&")) return t;
  let s = t;
  for (let i = 0; i < 4; i++) {   // certains flux encodent plusieurs fois (&amp;amp;#233;)
    const avant = s;
    s = s.replace(/&#x([0-9a-f]{1,6});/gi, (m, h) => car(parseInt(h, 16)) ?? m)
         .replace(/&#(\d{1,7});/g, (m, d) => car(Number(d)) ?? m)
         .replace(/&([a-z]{2,8});/gi, (m, n) => NOMMES[n] ?? m);
    if (s === avant) break;
  }
  return s;
}

// Nettoie toutes les chaînes d'un objet (réponse de l'IA, réponse d'API).
export function nettoyerTout(x) {
  if (typeof x === "string") return propre(x);
  if (Array.isArray(x)) return x.map(nettoyerTout);
  if (x && typeof x === "object") { for (const k of Object.keys(x)) x[k] = nettoyerTout(x[k]); return x; }
  return x;
}

// Repère des informations personnelles dans un texte avant de l'envoyer à l'IA (aucune donnée client ne doit partir).
// Renvoie la nature de ce qui a été trouvé, ou null.
// noms = false pour un extrait de presse (les noms de personnalités publiques y sont normaux).
export function donneesPerso(t, noms = true) {
  const s = String(t || "");
  const motifs = [
    [/[\w.+-]+@[\w-]+\.[\w.-]+/, "une adresse e-mail"],
    [/(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}\b/, "un numéro de téléphone"],
    [/\bFR\d{2}[\s]?(?:\d{4}[\s]?){5}\d{3}\b/i, "un IBAN"],
    [/\b[12][\s]?\d{2}[\s]?(?:0[1-9]|1[0-2])[\s]?\d{2}[\s]?\d{3}[\s]?\d{3}(?:[\s]?\d{2})?\b/, "un numéro de sécurité sociale"],
    [/\b(?:M\.|Mme|Mlle|Monsieur|Madame)\s+[A-ZÉÈ][a-zéèêëïîôûç-]+/, "le nom d'une personne"],
    [/\b(?:mon|ma|mes|notre|nos) client(?:e|s|es)?\s+[A-ZÉÈ][a-zéèêëïîôûç-]+/, "le nom d'un client"],
  ];
  for (const [re, nom] of motifs.slice(0, noms ? motifs.length : 4)) if (re.test(s)) return nom;
  return null;
}
