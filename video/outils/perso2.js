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
