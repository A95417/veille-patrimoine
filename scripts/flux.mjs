// Outils de lecture des flux RSS / Atom, sans dépendance externe.
// Utilisé par le robot de vérification et, plus tard, par le robot de collecte.

export const USER_AGENT = "VeillePatrimoineBot/1.0 (site privé de veille ; lecture des flux RSS publics)";

// Téléchargement avec délai maximal ; une seconde tentative après une coupure réseau passagère
// (certains sites publics, comme le Sénat, refusent parfois la connexion pendant quelques secondes).
export async function telecharger(url, delaiMs = 15000) {
  const r = await telechargerUneFois(url, delaiMs);
  if (r.statut === 0 && r.erreur !== "délai dépassé") {
    await new Promise((ok) => setTimeout(ok, 4000));
    return telechargerUneFois(url, delaiMs);
  }
  return r;
}

async function telechargerUneFois(url, delaiMs) {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), delaiMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });
    const texte = await r.text();
    return { ok: r.ok, statut: r.status, url: r.url, type: r.headers.get("content-type") || "", texte };
  } catch (e) {
    return { ok: false, statut: 0, url, type: "", texte: "", erreur: e.name === "AbortError" ? "délai dépassé" : e.cause?.code ? `${e.message} : ${e.cause.code}` : e.message };
  } finally {
    clearTimeout(minuteur);
  }
}

const ENTITES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", hellip: "…",
  eacute: "é", egrave: "è", ecirc: "ê", agrave: "à", acirc: "â", ccedil: "ç", ocirc: "ô", ucirc: "û", icirc: "î",
  ugrave: "ù", euml: "ë", iuml: "ï", laquo: "«", raquo: "»", ndash: "–", mdash: "—", euro: "€", Eacute: "É" };

export function decoderEntites(t) {
  return String(t)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n] ?? m);
}

// Texte brut : enlève CDATA, balises HTML, espaces en trop.
export function texteBrut(t) {
  if (!t) return "";
  let s = String(t).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  s = decoderEntites(s);                       // les flux encodent souvent le HTML (&lt;p&gt;)
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");
  return decoderEntites(s).replace(/\s+/g, " ").trim();
}

function balise(bloc, ...noms) {
  for (const nom of noms) {
    const m = bloc.match(new RegExp(`<${nom}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${nom}>`, "i"));
    if (m && m[1].trim()) return m[1];
  }
  return "";
}

function lienAtom(bloc) {
  const liens = [...bloc.matchAll(/<link\b([^>]*?)\/?>/gi)].map((m) => m[1]);
  const attr = (a, n) => (a.match(new RegExp(`${n}\\s*=\\s*["']([^"']*)["']`, "i")) || [])[1];
  const alt = liens.find((a) => !attr(a, "rel") || attr(a, "rel") === "alternate");
  return alt ? decoderEntites(attr(alt, "href") || "") : "";
}

export function dateIso(t) {
  const s = texteBrut(t);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
}

// Analyse un document RSS 2.0, RSS 1.0 (RDF) ou Atom. Renvoie null si ce n'est pas un flux.
export function analyserFlux(xml) {
  if (!xml || !/<(rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 5000))) return null;
  const atom = /<feed\b/i.test(xml.slice(0, 5000));
  const blocs = atom
    ? [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((m) => m[0])
    : [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  const pos = xml.search(atom ? /<entry\b/i : /<item\b/i);
  const entete = pos > 0 ? xml.slice(0, pos) : xml.slice(0, 3000);
  const articles = blocs.map((b) => {
    const lien = atom ? lienAtom(b) : texteBrut(balise(b, "link")) || texteBrut(balise(b, "guid"));
    return {
      titre: texteBrut(balise(b, "title")),
      lien: lien.trim(),
      date: dateIso(balise(b, "pubDate", "published", "updated", "dc:date")),
      resume: texteBrut(balise(b, "description", "summary", "content:encoded", "content")),
      guid: texteBrut(balise(b, "guid", "id")) || lien.trim(),
    };
  });
  return { titre: texteBrut(balise(entete, "title")), format: atom ? "Atom" : "RSS", articles };
}

// Cherche les flux annoncés dans une page HTML (<link rel="alternate" type="application/rss+xml">).
export function decouvrirFlux(html, urlPage) {
  const trouves = new Set();
  for (const m of String(html).matchAll(/<link\b[^>]*>/gi)) {
    const t = m[0];
    if (!/rel\s*=\s*["']?alternate/i.test(t)) continue;
    if (!/type\s*=\s*["']application\/(rss|atom)\+xml/i.test(t)) continue;
    const href = (t.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (href) {
      try { trouves.add(new URL(decoderEntites(href), urlPage).href); } catch {}
    }
  }
  return [...trouves];
}
