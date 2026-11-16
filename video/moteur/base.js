// Moteur vidéo BSC : utilitaires, personnages, éléments graphiques et sous-titres (repris de la vidéo « Le bon moment »).
const BX = "#6E0B1F", BX2 = "#4A0614", NUIT = "#2A0A12", ROSE = "#D8919C", ROSE2 = "#F3D3D8", CREME = "#F7F1EE", BLANC = "#FFFFFF";
const ARDOISE = "#55657A", OR = "#E2B45A", OR2 = "#C8963A", PEAU1 = "#F1C7A8", PEAU2 = "#C98E6B", GRIS = "#8E8288", VERT = "#3E8E6B";
let MOTS = [];
// ---------------------------------------------------------------- utilitaires
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t, a, b) => cl((t - a) / (b - a));
const eo = (x) => 1 - Math.pow(1 - cl(x), 3);
const eio = (x) => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x) => { x = cl(x); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const mix = (a, b, k) => a + (b - a) * k;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const nb = (n) => Math.round(n).toLocaleString("fr-FR").replace(/\s/g, " ");
function txt(x, y, s, o = {}) {
  const a = o.anchor || "middle", w = o.w || 800, f = o.f || BLANC, sz = o.size || 60, op = o.op ?? 1;
  const st = o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 10}" stroke-linejoin="round" paint-order="stroke"` : "";
  return `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${sz}" font-weight="${w}" fill="${f}" opacity="${op}" ${st} letter-spacing="${o.ls || 0}" ${o.fam ? `font-family="${o.fam}"` : ""}>${esc(s)}</text>`;
}
const g = (inner, tr = "", op = 1) => `<g transform="${tr}" opacity="${op}">${inner}</g>`;
function pill(cx, cy, w, h, fill, inner, o = {}) {
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${o.r ?? h / 2}" fill="${fill}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 4}"` : ""}/>` + inner;
}
function ombre(cx, cy, rx, op = .14) { return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * .14}" fill="#000" opacity="${op}"/>`; }

// Les personnages sont dans personnages.js (modèle paramétrable : coiffure, tenue, âge, accessoires).
const cligne = (t, ph = 0) => { const c = (t + ph) % 3.7; return c < .12 ? Math.sin(c / .12 * Math.PI) : 0; };

// ---------------------------------------------------------------- éléments
function bocal(cx, by, w, h, niv, coul = OR, label = "") {
  const top = by - h;
  let pieces = "";
  const nivy = by - 14 - (h - 50) * cl(niv);
  pieces += `<clipPath id="cb${cx}"><rect x="${cx - w / 2 + 10}" y="${top + 40}" width="${w - 20}" height="${h - 50}" rx="26"/></clipPath>`;
  let fill = `<rect x="${cx - w / 2}" y="${nivy}" width="${w}" height="${by - nivy}" fill="${coul}"/>`;
  for (let i = 0; i < 6; i++) fill += `<path d="M${cx - w / 2} ${nivy + 18 + i * 34} q${w / 6} -14 ${w / 3} 0 t${w / 3} 0 t${w / 3} 0" stroke="${OR2}" stroke-width="5" fill="none" opacity=".55"/>`;
  pieces += `<g clip-path="url(#cb${cx})">${fill}</g>`;
  pieces += `<rect x="${cx - w / 2 + 6}" y="${top + 34}" width="${w - 12}" height="${h - 40}" rx="32" fill="${BLANC}" fill-opacity=".18" stroke="${BLANC}" stroke-width="7" stroke-opacity=".9"/>`;
  pieces += `<rect x="${cx - w / 2 + 26}" y="${top + 60}" width="14" height="${h * .45}" rx="7" fill="${BLANC}" opacity=".5"/>`;
  pieces += `<rect x="${cx - w / 2 - 6}" y="${top}" width="${w + 12}" height="40" rx="12" fill="${GRIS}"/>`;
  if (label) pieces += txt(cx, by + 70, label, { size: 44, w: 800, f: BLANC });
  return pieces;
}
function piece(cx, cy, r = 30, rot = 0) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="${r}" ry="${r * .92}" fill="${OR}"/><ellipse rx="${r * .7}" ry="${r * .64}" fill="none" stroke="${OR2}" stroke-width="4"/><text y="${r * .32}" text-anchor="middle" font-size="${r * .9}" font-weight="900" fill="${OR2}">€</text></g>`;
}
function notif(cx, cy, k, titre, sous) {
  const s = back(k), w = 760;
  return `<g transform="translate(${cx} ${cy - (1 - eo(k)) * 160}) scale(${0.85 + .15 * s})" opacity="${cl(k * 2)}">
    <rect x="${-w / 2}" y="-70" width="${w}" height="140" rx="34" fill="${BLANC}" opacity=".97"/>
    <rect x="${-w / 2 + 26}" y="-42" width="84" height="84" rx="22" fill="${BX}"/>
    <path d="M${-w / 2 + 50} -2 l14 14 l26 -30" stroke="${BLANC}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${txt(-w / 2 + 136, -10, titre, { anchor: "start", size: 36, w: 800, f: NUIT })}
    ${txt(-w / 2 + 136, 38, sous, { anchor: "start", size: 32, w: 500, f: "#6B5B60" })}
    ${txt(w / 2 - 34, -10, "maint.", { anchor: "end", size: 26, w: 500, f: "#9A8B90" })}
  </g>`;
}
function etiquette(cx, cy, k, s1, s2, fond = BX) {
  const sc = back(k);
  const w = 120 + s1.length * 30 + (s2 ? s2.length * 22 : 0);
  return `<g transform="translate(${cx} ${cy}) scale(${sc})" opacity="${cl(k * 3)}"><rect x="${-w / 2}" y="-44" width="${w}" height="88" rx="44" fill="${fond}"/>${txt(s2 ? -w / 2 + 40 : 0, 16, s1, { anchor: s2 ? "start" : "middle", size: 46, w: 900, f: BLANC })}${s2 ? txt(w / 2 - 40, 16, s2, { anchor: "end", size: 40, w: 600, f: ROSE2 }) : ""}</g>`;
}
function bulle(cx, cy, k, texte, qx, qy) {
  const sc = back(k), w = 560;
  return `<g opacity="${cl(k * 3)}"><circle cx="${qx}" cy="${qy}" r="${14 * sc}" fill="${BLANC}"/><circle cx="${mix(qx, cx, .4)}" cy="${mix(qy, cy + 70, .45)}" r="${22 * sc}" fill="${BLANC}"/>
  <g transform="translate(${cx} ${cy}) scale(${sc})"><path d="M${-w / 2 + 40} 60 Q${-w / 2 - 20} 60 ${-w / 2 + 10} 0 Q${-w / 2 - 10} -80 ${-w / 2 + 90} -78 Q-60 -130 30 -96 Q120 -140 ${w / 2 - 70} -80 Q${w / 2 + 20} -60 ${w / 2 - 6} 10 Q${w / 2 + 10} 74 ${w / 2 - 80} 70 Q0 110 ${-w / 2 + 40} 60Z" fill="${BLANC}"/>${txt(0, 10, texte, { size: 54, w: 800, f: BX, fam: "Inter Display" })}</g></g>`;
}
function horloge(cx, cy, r, t, vitesse = 1, coul = BX) {
  const a = t * 360 * vitesse, b = t * 30 * vitesse;
  let tics = ""; for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; tics += `<line x1="${Math.sin(an) * r * .78}" y1="${-Math.cos(an) * r * .78}" x2="${Math.sin(an) * r * .88}" y2="${-Math.cos(an) * r * .88}" stroke="${coul}" stroke-width="6" stroke-linecap="round"/>`; }
  return `<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="${BLANC}" stroke="${coul}" stroke-width="12"/>${tics}<line x1="0" y1="0" x2="0" y2="${-r * .5}" stroke="${NUIT}" stroke-width="10" stroke-linecap="round" transform="rotate(${b})"/><line x1="0" y1="0" x2="0" y2="${-r * .72}" stroke="${ROSE}" stroke-width="7" stroke-linecap="round" transform="rotate(${a})"/><circle r="10" fill="${NUIT}"/></g>`;
}
function fond(c1, c2) { return `<defs><linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#fd)"/>`; }
function grain(t) { return ""; }
function confettis(t, t0, n = 26) {
  if (t < t0) return ""; let o = ""; const k = t - t0;
  for (let i = 0; i < n; i++) { const a = (i * 137.5) % 360 * Math.PI / 180, v = 380 + (i * 53) % 260; const x = 540 + Math.cos(a) * v * k, y = 640 + Math.sin(a) * v * k + 500 * k * k; o += `<rect x="${x}" y="${y}" width="18" height="10" fill="${[ROSE, OR, BLANC][i % 3]}" transform="rotate(${i * 40 + k * 300} ${x} ${y})" opacity="${cl(1.6 - k)}"/>`; }
  return o;
}

// ---------------------------------------------------------------- sous-titres (mot à mot)
let BLOCS = [];
function preparer() {
  const grp = {};
  MOTS.forEach((m) => (grp[m.groupe] ??= []).push(m));
  for (const k of Object.keys(grp).sort((a, b) => +a - +b)) {
    const ws = grp[k]; let cur = [];
    ws.forEach((m, i) => {
      cur.push(m);
      const lg = cur.map((x) => x.mot.trim()).join(" ").length, suiv = ws[i + 1] ? ws[i + 1].mot.trim().length + 1 : 0;
      const fin = /[,.?…!]$/.test(m.mot.trim()) || lg + suiv > 24 || cur.length >= 4 || i === ws.length - 1;
      if (fin) { BLOCS.push(cur); cur = []; }
    });
  }
  BLOCS.forEach((b, i) => { b.debut = b[0].debut; b.fin = Math.min(b[b.length - 1].fin + .35, i + 1 < BLOCS.length ? BLOCS[i + 1][0].debut : 99); });
}
// Style des sous-titres choisi sur le site : « mot » (mot à mot en couleur), « sobre » (blanc cerné, sans fond), « clair » (encadré clair).
let STYLE_ST = "mot";
function soustitres(t, y = 1480) {
  const b = BLOCS.find((b) => t >= b.debut - .02 && t < b.fin);
  if (!b) return "";
  const k = (t - b.debut) / .14, sc = .88 + .12 * back(k);
  const st = STYLE_ST, sobre = st === "sobre", clair = st === "clair";
  let o = sobre ? "" : `<rect id="stb" rx="26" fill="${clair ? BLANC : NUIT}" fill-opacity="${clair ? .94 : .82}"/>`;
  o += `<text id="st" x="540" y="${y}" text-anchor="middle" font-size="76" font-weight="800" font-family="Inter Display"${sobre ? ` stroke="${NUIT}" stroke-width="12" stroke-linejoin="round" paint-order="stroke" word-spacing="14"` : ""}>`;
  b.forEach((m, j) => {
    const courant = t >= m.debut - .03 && t < m.fin + .05, passe = t >= m.debut - .03;
    const c = sobre ? BLANC : clair ? (courant ? BX : passe ? NUIT : "#9A8B90") : (courant ? "#FFB3C1" : passe ? BLANC : "#CDBFC3");
    o += `<tspan fill="${c}">${j ? " " : ""}${esc(m.mot.trim())}</tspan>`;
  });
  o += `</text>`;
  return `<g id="stg" transform="translate(540 ${y - 26}) scale(${sc}) translate(-540 ${-(y - 26)})" opacity="${cl(k * 2.5)}">${o}</g>`;
}
function caleBoite() {
  const t = document.getElementById("st"), r = document.getElementById("stb");
  if (!t) return;
  let bb = t.getBBox();
  if (bb.width > 940) { t.setAttribute("font-size", String(76 * 940 / bb.width)); bb = t.getBBox(); }
  if (!r) return;
  r.setAttribute("x", bb.x - 30); r.setAttribute("y", bb.y - 12); r.setAttribute("width", bb.width + 60); r.setAttribute("height", bb.height + 24);
}

function icone(type, x, y) {
  if (type === "mail") return `<g transform="translate(${x} ${y})"><circle r="40" fill="${ROSE}"/><rect x="-20" y="-14" width="40" height="28" rx="4" fill="none" stroke="${BX}" stroke-width="5"/><path d="M-18 -11 L0 3 L18 -11" stroke="${BX}" stroke-width="5" fill="none" stroke-linejoin="round"/></g>`;
  return `<g transform="translate(${x} ${y})"><circle r="40" fill="${ROSE}"/><path d="M-14 -20 q-6 0 -6 8 q2 22 20 32 q8 4 14 -2 l4 -6 q2 -4 -2 -6 l-8 -5 q-4 -2 -6 2 l-3 4 q-8 -4 -12 -12 l4 -3 q4 -2 2 -6 l-5 -8 q-2 -3 -6 -2z" fill="${BX}" transform="translate(2 0)"/></g>`;
}
