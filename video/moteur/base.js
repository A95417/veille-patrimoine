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

// ---------------------------------------------------------------- personnage (style plat, adulte)
// p: {x,y,s, peau, cheveux, haut, bas, type:'lea'|'tom'|'conseil', bras:[angG,angD] (deg, 0 = vers le bas), humeur:'sourire'|'neutre'|'souci'|'surpris', regard:-1..1, cligne:0..1, tel:bool, barbe}
// Personnages v2 : style « illustration éditoriale », proportions adultes, ombres douces.
// Origine = pieds. Hauteur ≈ 660 px à s = 1. bras:[g,d] en degrés depuis la verticale (vers l'extérieur), coudes:[g,d] pliage.
function fonce(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - k)))); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join(""); }
function eclaircit(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v + (255 - v) * k); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join(""); }
function perso(p, t) {
  const S = p.s || 1, r = Math.sin(t * 2.4 + (p.ph || 0)) * 2.5;
  const peau = p.peau, peauO = fonce(peau, .12), haut = p.haut, hautO = fonce(haut, .16), bas = p.bas, basO = fonce(bas, .2);
  const ch = p.cheveux, chC = eclaircit(ch, .22);
  let o = ombre(p.x, p.y + 4 * S, 130 * S, .16);
  let c = "";
  // ---- jambes et chaussures
  const chaus = p.chaussure || "#F4F1EE", chausO = fonce(chaus, .25);
  c += `<path d="M-60 -312 L-6 -312 L-10 -24 L-48 -24 Z" fill="${bas}"/><path d="M6 -312 L60 -312 L48 -24 L10 -24 Z" fill="${bas}"/>`;
  c += `<path d="M-6 -312 L-10 -24 L-22 -24 L-14 -300Z" fill="${basO}" opacity=".5"/><path d="M60 -312 L48 -24 L36 -24 L46 -300Z" fill="${basO}" opacity=".6"/>`;
  c += `<path d="M-54 -28 h46 q6 0 8 10 l2 12 q0 8 -8 8 h-62 q-8 0 -6 -10 q4 -16 20 -20z" fill="${chaus}"/><path d="M-70 -4 h70" stroke="${chausO}" stroke-width="6"/>`;
  c += `<path d="M8 -28 h46 q16 4 20 20 q2 10 -6 10 h-62 q-8 0 -8 -8 l2 -12 q2 -10 8 -10z" fill="${chaus}"/><path d="M2 -4 h70" stroke="${chausO}" stroke-width="6"/>`;
  // ---- bras (géométrie)
  const bras = (sx, a1, a2) => {
    const L1 = 132, L2 = 122, sy = -488 + r;
    const ra = a1 * Math.PI / 180, rb = a2 * Math.PI / 180;
    const ex = sx + Math.sin(ra) * L1, ey = sy + Math.cos(ra) * L1, hx = ex + Math.sin(rb) * L2, hy = ey + Math.cos(rb) * L2;
    const manche = `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="${haut}" stroke-width="40" stroke-linecap="round"/><path d="M${ex} ${ey} L${mix(ex, hx, .82)} ${mix(ey, hy, .82)}" stroke="${haut}" stroke-width="34" stroke-linecap="round"/>` +
      `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="#000" stroke-opacity=".07" stroke-width="16" stroke-linecap="round" transform="translate(8 0)"/>`;
    const main = `<g transform="translate(${hx} ${hy}) rotate(${-a2})"><path d="M-14 -8 Q-16 14 -6 20 Q4 24 12 16 Q16 6 14 -8Z" fill="${peau}"/><path d="M12 -6 Q22 2 18 12" stroke="${peau}" stroke-width="9" stroke-linecap="round" fill="none"/></g>`;
    return { d: manche + main, hx, hy, ex, ey };
  };
  const bg = p.bras || [6, 6], cd = p.coudes || [0, 0];
  const BG = bras(-80, -(bg[0] + 4), -(bg[0] + 4) - cd[0]);
  const BD = bras(80, bg[1] + 4, bg[1] + 4 + cd[1]);
  // ---- torse
  const torse = `M-74 ${-500 + r} Q-96 ${-494 + r} -96 ${-466 + r} L-74 -322 Q-70 -300 -60 -296 L60 -296 Q70 -300 74 -322 L96 ${-466 + r} Q96 ${-494 + r} 74 ${-500 + r} Q40 ${-512 + r} 0 ${-510 + r} Q-40 ${-512 + r} -74 ${-500 + r}Z`;
  let corps = `<path d="${torse}" fill="${haut}"/>`;
  corps += `<path d="M40 ${-508 + r} Q96 ${-494 + r} 96 ${-466 + r} L74 -322 Q70 -300 60 -296 L30 -296 Q60 -380 40 ${-508 + r}Z" fill="#000" opacity=".08"/>`;
  if (p.type === "lea") {
    corps += `<path d="M-30 ${-506 + r} L30 ${-506 + r} L24 -296 L-24 -296Z" fill="${p.dessous || "#F7EFEA"}"/>`;
    corps += `<path d="M-30 ${-506 + r} L-6 ${-408 + r} L-26 -296 L-34 -296 L-46 ${-470 + r}Z" fill="${hautO}"/><path d="M30 ${-506 + r} L6 ${-408 + r} L26 -296 L34 -296 L46 ${-470 + r}Z" fill="${hautO}"/>`;
    corps += `<path d="M-22 ${-504 + r} Q0 ${-478 + r} 22 ${-504 + r}" fill="${peau}"/><circle cx="0" cy="${-478 + r}" r="5" fill="${OR}"/><path d="M-18 ${-500 + r} Q0 ${-480 + r} 18 ${-500 + r}" stroke="${OR}" stroke-width="2.5" fill="none"/>`;
  } else if (p.type === "tom" && p.veste) {
    corps += `<path d="M-28 ${-506 + r} L28 ${-506 + r} L24 -296 L-24 -296Z" fill="#EDE6E2"/><path d="M-24 ${-504 + r} Q0 ${-486 + r} 24 ${-504 + r}" fill="${peau}"/>`;
    corps += `<path d="M-28 ${-506 + r} L-4 ${-420 + r} L-22 -296 L-30 -296 L-42 ${-470 + r}Z" fill="${hautO}"/><path d="M28 ${-506 + r} L4 ${-420 + r} L22 -296 L30 -296 L42 ${-470 + r}Z" fill="${hautO}"/>`;
  } else if (p.type === "tom") {
    corps += `<path d="M-50 ${-506 + r} Q0 ${-470 + r} 50 ${-506 + r} Q30 ${-528 + r} 0 ${-526 + r} Q-30 ${-528 + r} -50 ${-506 + r}Z" fill="${hautO}"/>`;
    corps += `<path d="M-14 ${-494 + r} l-4 70 M14 ${-494 + r} l4 70" stroke="${eclaircit(haut, .6)}" stroke-width="4" stroke-linecap="round"/><circle cx="-18" cy="${-422 + r}" r="4" fill="${eclaircit(haut, .6)}"/><circle cx="18" cy="${-422 + r}" r="4" fill="${eclaircit(haut, .6)}"/>`;
    corps += `<path d="M-54 -386 L54 -386 L62 -320 L-62 -320Z" fill="${hautO}" opacity=".55"/><rect x="-74" y="-322" width="148" height="26" rx="10" fill="${hautO}"/>`;
  } else {
    corps += `<path d="M-26 ${-506 + r} L26 ${-506 + r} L0 ${-410 + r}Z" fill="${BLANC}"/><path d="M-6 ${-492 + r} L6 ${-492 + r} L9 ${-380 + r} L0 ${-366 + r} L-9 ${-380 + r}Z" fill="${BX}"/>`;
    corps += `<path d="M-26 ${-506 + r} L0 ${-410 + r} L-20 -296 L-60 -296 L-44 ${-470 + r}Z" fill="${hautO}"/><path d="M26 ${-506 + r} L0 ${-410 + r} L20 -296 L60 -296 L44 ${-470 + r}Z" fill="${hautO}"/>`;
  }
  // ceinture / bas du haut
  corps += `<path d="M-60 -296 L60 -296 L60 -312 L-60 -312Z" fill="#000" opacity=".1"/>`;
  // ---- tête
  const hy = -592 + r * 1.2, rg = (p.regard || 0) * 6, h = p.humeur || "neutre";
  let tete = "";
  if (p.type === "lea") tete += `<path d="M-56 ${hy - 20} Q-70 ${hy + 60} -66 ${hy + 104} Q-60 ${hy + 128} -36 ${hy + 132} L36 ${hy + 132} Q60 ${hy + 128} 66 ${hy + 104} Q70 ${hy + 60} 56 ${hy - 20} Q50 ${hy - 74} 0 ${hy - 76} Q-50 ${hy - 74} -56 ${hy - 20}Z" fill="${ch}"/>`;
  tete += `<path d="M-15 ${hy + 40} L-15 ${hy + 86} L15 ${hy + 86} L15 ${hy + 40}Z" fill="${peau}"/><path d="M-15 ${hy + 40} L15 ${hy + 40} L15 ${hy + 66} Q0 ${hy + 74} -15 ${hy + 62}Z" fill="${peauO}"/>`;
  tete += `<ellipse cx="-47" cy="${hy + 4}" rx="9" ry="14" fill="${peauO}"/><ellipse cx="47" cy="${hy + 4}" rx="9" ry="14" fill="${peauO}"/>`;
  tete += `<path d="M-47 ${hy - 6} Q-50 ${hy + 34} -28 ${hy + 52} Q-12 ${hy + 64} 0 ${hy + 64} Q12 ${hy + 64} 28 ${hy + 52} Q50 ${hy + 34} 47 ${hy - 6} Q46 ${hy - 62} 0 ${hy - 62} Q-46 ${hy - 62} -47 ${hy - 6}Z" fill="${peau}"/>`;
  tete += `<path d="M20 ${hy - 58} Q46 ${hy - 50} 47 ${hy - 6} Q50 ${hy + 34} 28 ${hy + 52} Q34 ${hy + 10} 20 ${hy - 58}Z" fill="${peauO}" opacity=".45"/>`;
  if (p.type === "lea") tete += `<circle cx="-46" cy="${hy + 20}" r="4" fill="${OR}"/><circle cx="46" cy="${hy + 20}" r="4" fill="${OR}"/>`;
  if (p.barbe) tete += `<path d="M-46 ${hy + 4} Q-46 ${hy + 40} -26 ${hy + 56} Q-10 ${hy + 70} 0 ${hy + 70} Q10 ${hy + 70} 26 ${hy + 56} Q46 ${hy + 40} 46 ${hy + 4} Q40 ${hy + 30} 22 ${hy + 34} Q0 ${hy + 26} -22 ${hy + 34} Q-40 ${hy + 30} -46 ${hy + 4}Z" fill="${ch}" opacity=".9"/><path d="M-12 ${hy + 46} Q0 ${hy + 52} 12 ${hy + 46}" stroke="${peauO}" stroke-width="6" fill="none"/>`;
  // yeux
  const cli = 1 - (p.cligne || 0) * .92;
  const oeil = (ex) => `<ellipse cx="${ex + rg}" cy="${hy + 2}" rx="5.5" ry="${6.5 * cli}" fill="#22171A"/><circle cx="${ex + rg + 2}" cy="${hy}" r="${1.8 * cli}" fill="#fff"/><path d="M${ex - 9} ${hy - 5} Q${ex} ${hy - 11} ${ex + 9} ${hy - 5}" stroke="#22171A" stroke-width="${p.type === "lea" ? 3.5 : 2.5}" fill="none" stroke-linecap="round"/>`;
  tete += oeil(-18) + oeil(18);
  if (p.type === "lea") tete += `<path d="M-28 ${hy - 7} l-5 -4 M28 ${hy - 7} l5 -4" stroke="#22171A" stroke-width="2.5" stroke-linecap="round"/>`;
  const bs = h === "souci" ? 1 : 0, bsur = h === "surpris" ? -5 : 0;
  tete += `<path d="M-30 ${hy - 16 + bsur + bs * 2} Q-18 ${hy - 24 + bsur + bs * 6} -7 ${hy - 18 + bsur - bs * 4}" stroke="${p.sourcil || fonce(ch, .1)}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  tete += `<path d="M30 ${hy - 16 + bsur + bs * 2} Q18 ${hy - 24 + bsur + bs * 6} 7 ${hy - 18 + bsur - bs * 4}" stroke="${p.sourcil || fonce(ch, .1)}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  tete += `<path d="M-1 ${hy + 4} Q-7 ${hy + 22} -1 ${hy + 25} Q4 ${hy + 27} 7 ${hy + 23}" stroke="${fonce(peau, .35)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const levre = p.type === "lea" ? "#B4505E" : fonce(peau, .45);
  if (h === "sourire") tete += `<path d="M-15 ${hy + 36} Q0 ${hy + 52} 15 ${hy + 36} Q0 ${hy + 41} -15 ${hy + 36}Z" fill="#6E1E2A"/><path d="M-11 ${hy + 39} Q0 ${hy + 43} 11 ${hy + 39} L10 ${hy + 41} Q0 ${hy + 44} -10 ${hy + 41}Z" fill="#fff"/><ellipse cx="-30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/><ellipse cx="30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/>`;
  else if (h === "souci") tete += `<path d="M-11 ${hy + 43} Q0 ${hy + 36} 11 ${hy + 43}" stroke="${levre}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  else if (h === "surpris") tete += `<ellipse cx="0" cy="${hy + 41}" rx="7" ry="9" fill="#6E1E2A"/>`;
  else tete += `<path d="M-11 ${hy + 39} Q0 ${hy + 44} 11 ${hy + 39}" stroke="${levre}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  // cheveux (devant)
  if (p.type === "lea") {
    tete += `<path d="M-50 ${hy + 10} Q-56 ${hy - 56} -6 ${hy - 70} Q46 ${hy - 76} 54 ${hy - 20} Q56 ${hy + 6} 50 ${hy + 24} Q44 ${hy - 30} 10 ${hy - 40} Q-20 ${hy - 44} -38 ${hy - 20} Q-46 ${hy - 6} -50 ${hy + 10}Z" fill="${ch}"/>`;
    tete += `<path d="M-30 ${hy - 50} Q0 ${hy - 70} 34 ${hy - 54}" stroke="${chC}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-60 ${hy + 40} Q-62 ${hy + 80} -56 ${hy + 110}" stroke="${chC}" stroke-width="4" fill="none" opacity=".6"/>`;
  } else if (p.type === "tom") {
    tete += `<path d="M-48 ${hy - 4} Q-54 ${hy - 50} -30 ${hy - 66} Q-10 ${hy - 82} 14 ${hy - 76} Q44 ${hy - 72} 50 ${hy - 40} Q52 ${hy - 20} 48 ${hy - 4} Q44 ${hy - 30} 30 ${hy - 38} Q8 ${hy - 30} -14 ${hy - 40} Q-36 ${hy - 34} -44 ${hy - 20}Z" fill="${ch}"/>`;
    tete += `<path d="M-24 ${hy - 66} q8 -6 16 0 M2 ${hy - 72} q8 -6 16 0 M22 ${hy - 64} q8 -4 14 2" stroke="${chC}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  } else {
    tete += `<path d="M-48 ${hy - 4} Q-52 ${hy - 60} -4 ${hy - 70} Q46 ${hy - 72} 50 ${hy - 16} L48 ${hy - 4} Q46 ${hy - 36} 28 ${hy - 44} L-30 ${hy - 40} Q-44 ${hy - 30} -48 ${hy - 4}Z" fill="${ch}"/><path d="M-30 ${hy - 56} Q0 ${hy - 70} 30 ${hy - 58}" stroke="${GRIS}" stroke-width="4" fill="none" opacity=".7"/>`;
  }
  // téléphone
  let tel = "";
  if (p.tel) tel = `<g transform="translate(${BD.hx} ${BD.hy - 46}) rotate(-10)"><rect x="-24" y="-44" width="48" height="88" rx="10" fill="#1C1719"/><rect x="-20" y="-38" width="40" height="74" rx="6" fill="${p.ecran || "#8FB3D9"}"/></g>` +
    `<g transform="translate(${BD.hx} ${BD.hy}) rotate(${-(bg[1] + 4 + cd[1])})"><path d="M-14 -8 Q-16 14 -6 20 Q4 24 12 16 Q16 6 14 -8Z" fill="${peau}"/></g>`;
  const acc = p.accessoire ? p.accessoire(BG, BD) : "";
  const tout = c + BG.d + corps + tete + BD.d + tel + acc;
  return o + `<g transform="translate(${p.x} ${p.y}) scale(${S})">${tout}</g>`;
}
const LEA = { type: "lea", peau: "#F2C9AE", cheveux: "#3E2219", haut: ROSE, bas: "#2F3448", chaussure: "#F4F1EE", ph: 0 };
const TOM = { type: "tom", peau: "#C48A66", cheveux: "#1F1513", haut: "#4F6075", bas: "#3B4A63", chaussure: "#ECE7E3", ph: 1.3 };
const CONS = { type: "conseil", peau: "#E7B694", cheveux: "#33241F", haut: "#262A36", bas: "#262A36", chaussure: "#1E1A1C", ph: 2.1 };
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
function soustitres(t, y = 1480) {
  const b = BLOCS.find((b) => t >= b.debut - .02 && t < b.fin);
  if (!b) return "";
  const k = (t - b.debut) / .14, sc = .88 + .12 * back(k);
  let o = `<rect id="stb" rx="26" fill="${NUIT}" fill-opacity=".82"/><text id="st" x="540" y="${y}" text-anchor="middle" font-size="76" font-weight="800" font-family="Inter Display">`;
  b.forEach((m, j) => {
    const courant = t >= m.debut - .03 && t < m.fin + .05, passe = t >= m.debut - .03;
    o += `<tspan fill="${courant ? "#FFB3C1" : passe ? BLANC : "#CDBFC3"}">${j ? " " : ""}${esc(m.mot.trim())}</tspan>`;
  });
  o += `</text>`;
  return `<g id="stg" transform="translate(540 ${y - 26}) scale(${sc}) translate(-540 ${-(y - 26)})" opacity="${cl(k * 2.5)}">${o}</g>`;
}
function caleBoite() {
  const t = document.getElementById("st"), r = document.getElementById("stb");
  if (!t || !r) return;
  let bb = t.getBBox();
  if (bb.width > 940) { t.setAttribute("font-size", String(76 * 940 / bb.width)); bb = t.getBBox(); }
  r.setAttribute("x", bb.x - 30); r.setAttribute("y", bb.y - 12); r.setAttribute("width", bb.width + 60); r.setAttribute("height", bb.height + 24);
}

function icone(type, x, y) {
  if (type === "mail") return `<g transform="translate(${x} ${y})"><circle r="40" fill="${ROSE}"/><rect x="-20" y="-14" width="40" height="28" rx="4" fill="none" stroke="${BX}" stroke-width="5"/><path d="M-18 -11 L0 3 L18 -11" stroke="${BX}" stroke-width="5" fill="none" stroke-linejoin="round"/></g>`;
  return `<g transform="translate(${x} ${y})"><circle r="40" fill="${ROSE}"/><path d="M-14 -20 q-6 0 -6 8 q2 22 20 32 q8 4 14 -2 l4 -6 q2 -4 -2 -6 l-8 -5 q-4 -2 -6 2 l-3 4 q-8 -4 -12 -12 l4 -3 q4 -2 2 -6 l-5 -8 q-2 -3 -6 -2z" fill="${BX}" transform="translate(2 0)"/></g>`;
}
