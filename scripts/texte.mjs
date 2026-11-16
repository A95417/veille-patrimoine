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
