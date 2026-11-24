// Personnages BSC : style « illustration éditoriale », proportions adultes, ombres douces.
// Modèle paramétrable : genre, coiffure, tenue, barbe, lunettes, rides, couleurs. Origine = pieds ; hauteur ≈ 660 px à s = 1.
// bras:[g,d] en degrés depuis la verticale (vers l'extérieur), coudes:[g,d] pliage. humeur : sourire | neutre | souci | surpris.
function fonce(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 - k)))); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join(""); }
function eclaircit(hex, k) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v + (255 - v) * k); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, "0")).join(""); }

// ---------------------------------------------------------------- coiffures (arrière = derrière la tête, avant = par-dessus)
const COIFFURES = {
  longs: {
    arriere: (hy, ch) => `<path d="M-56 ${hy - 20} Q-70 ${hy + 60} -66 ${hy + 104} Q-60 ${hy + 128} -36 ${hy + 132} L36 ${hy + 132} Q60 ${hy + 128} 66 ${hy + 104} Q70 ${hy + 60} 56 ${hy - 20} Q50 ${hy - 74} 0 ${hy - 76} Q-50 ${hy - 74} -56 ${hy - 20}Z" fill="${ch}"/>`,
    avant: (hy, ch, chC) => `<path d="M-50 ${hy + 10} Q-56 ${hy - 56} -6 ${hy - 70} Q46 ${hy - 76} 54 ${hy - 20} Q56 ${hy + 6} 50 ${hy + 24} Q44 ${hy - 30} 10 ${hy - 40} Q-20 ${hy - 44} -38 ${hy - 20} Q-46 ${hy - 6} -50 ${hy + 10}Z" fill="${ch}"/><path d="M-30 ${hy - 50} Q0 ${hy - 70} 34 ${hy - 54}" stroke="${chC}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-60 ${hy + 40} Q-62 ${hy + 80} -56 ${hy + 110}" stroke="${chC}" stroke-width="4" fill="none" opacity=".6"/>`,
  },
  boucles: {
    arriere: (hy, ch) => { let o = ""; const pts = [[-62, -30], [-70, 10], [-66, 50], [-56, 84], [62, -30], [70, 10], [66, 50], [56, 84], [-44, -66], [44, -66], [0, -80], [-24, -78], [24, -78]]; for (const [x, y] of pts) o += `<circle cx="${x}" cy="${hy + y}" r="26" fill="${ch}"/>`; return o + `<path d="M-70 ${hy - 20} L70 ${hy - 20} L66 ${hy + 90} L-66 ${hy + 90}Z" fill="${ch}"/>`; },
    avant: (hy, ch, chC) => { let o = ""; for (const [x, y, r] of [[-38, -52, 22], [-14, -62, 22], [12, -62, 22], [36, -52, 22], [50, -30, 16], [-50, -30, 16]]) o += `<circle cx="${x}" cy="${hy + y}" r="${r}" fill="${ch}"/>`; for (const [x, y] of [[-30, -58], [6, -68], [34, -56]]) o += `<path d="M${x - 8} ${hy + y} q8 -8 16 0" stroke="${chC}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`; return o; },
  },
  carre: {
    arriere: (hy, ch) => `<path d="M-58 ${hy - 24} Q-66 ${hy + 30} -62 ${hy + 56} Q-50 ${hy + 66} -34 ${hy + 60} L34 ${hy + 60} Q50 ${hy + 66} 62 ${hy + 56} Q66 ${hy + 30} 58 ${hy - 24} Q52 ${hy - 76} 0 ${hy - 78} Q-52 ${hy - 76} -58 ${hy - 24}Z" fill="${ch}"/>`,
    avant: (hy, ch, chC) => `<path d="M-52 ${hy + 30} Q-58 ${hy - 50} -4 ${hy - 72} Q50 ${hy - 76} 56 ${hy - 10} Q58 ${hy + 20} 54 ${hy + 34} Q46 ${hy - 18} 30 ${hy - 36} Q-6 ${hy - 20} -36 ${hy - 40} Q-46 ${hy - 10} -52 ${hy + 30}Z" fill="${ch}"/><path d="M-20 ${hy - 60} Q16 ${hy - 72} 40 ${hy - 50}" stroke="${chC}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`,
  },
  chignon: {
    arriere: (hy, ch) => `<circle cx="18" cy="${hy - 78}" r="26" fill="${ch}"/><circle cx="18" cy="${hy - 78}" r="12" fill="${fonce(ch, .1)}" opacity=".5"/>`,
    avant: (hy, ch, chC) => `<path d="M-50 ${hy + 4} Q-56 ${hy - 58} -2 ${hy - 68} Q50 ${hy - 70} 52 ${hy} Q46 ${hy - 36} 26 ${hy - 46} Q0 ${hy - 40} -24 ${hy - 48} Q-44 ${hy - 34} -50 ${hy + 4}Z" fill="${ch}"/><path d="M-36 ${hy - 50} Q-10 ${hy - 64} 14 ${hy - 56} M4 ${hy - 62} Q28 ${hy - 66} 44 ${hy - 46}" stroke="${chC}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  },
  degarni: {
    arriere: () => "",
    avant: (hy, ch, chC) => `<path d="M-50 ${hy - 2} Q-52 ${hy - 34} -40 ${hy - 46} L-36 ${hy - 20} Q-42 ${hy - 10} -46 ${hy + 6}Z" fill="${ch}"/><path d="M50 ${hy - 2} Q52 ${hy - 34} 40 ${hy - 46} L36 ${hy - 20} Q42 ${hy - 10} 46 ${hy + 6}Z" fill="${ch}"/><path d="M-20 ${hy - 62} q20 -6 40 0" stroke="${ch}" stroke-width="3" fill="none" opacity=".7"/>`,
  },
  casquette: {
    arriere: () => "",
    avant: (hy, ch, chC, p) => { const c = p.casquette || "#2E3A4F"; return `<path d="M-48 ${hy - 2} L-48 ${hy - 26} L-40 ${hy - 18} Z" fill="${ch}"/><path d="M48 ${hy - 2} L48 ${hy - 26} L40 ${hy - 18} Z" fill="${ch}"/>` +
      `<path d="M-50 ${hy - 26} Q-50 ${hy - 82} 0 ${hy - 84} Q50 ${hy - 82} 50 ${hy - 26}Z" fill="${c}"/><path d="M-6 ${hy - 26} Q40 ${hy - 36} 86 ${hy - 22} Q66 ${hy - 10} -6 ${hy - 16}Z" fill="${fonce(c, .25)}"/><circle cx="0" cy="${hy - 82}" r="5" fill="${fonce(c, .3)}"/><path d="M-30 ${hy - 70} Q0 ${hy - 80} 30 ${hy - 70}" stroke="${eclaircit(c, .3)}" stroke-width="3" fill="none"/>`; },
  },
  lisse: {
    arriere: () => "",
    avant: (hy, ch, chC, p) => `<path d="M-48 ${hy - 4} Q-52 ${hy - 60} -4 ${hy - 70} Q46 ${hy - 72} 50 ${hy - 16} L48 ${hy - 4} Q46 ${hy - 36} 28 ${hy - 44} L-30 ${hy - 40} Q-44 ${hy - 30} -48 ${hy - 4}Z" fill="${ch}"/><path d="M-30 ${hy - 56} Q0 ${hy - 70} 30 ${hy - 58}" stroke="${p.tempes || GRIS}" stroke-width="4" fill="none" opacity=".7"/>`,
  },
  // Longs cheveux ondulés sous une casquette (Léa, d'après la photo du cabinet).
  ondules_casquette: {
    // masse de cheveux derrière le corps (jusqu'au milieu du dos)
    dos: (hy, ch, chC) => `<path d="M-60 ${hy - 30} Q-86 ${hy + 40} -78 ${hy + 110} Q-96 ${hy + 170} -84 ${hy + 230} Q-70 ${hy + 262} -40 ${hy + 250} L40 ${hy + 250} Q70 ${hy + 262} 84 ${hy + 230} Q96 ${hy + 170} 78 ${hy + 110} Q86 ${hy + 40} 60 ${hy - 30} Q50 ${hy - 84} 0 ${hy - 86} Q-50 ${hy - 84} -60 ${hy - 30}Z" fill="${fonce(ch, .1)}"/>`,
    arriere: (hy, ch) => `<path d="M-58 ${hy - 30} Q-70 ${hy + 30} -64 ${hy + 70} L64 ${hy + 70} Q70 ${hy + 30} 58 ${hy - 30} Q50 ${hy - 84} 0 ${hy - 86} Q-50 ${hy - 84} -58 ${hy - 30}Z" fill="${ch}"/>`,
    avant: (hy, ch, chC, p) => {
      const c = p.casquette || "#2F6B3A", cO = fonce(c, .22), cC = eclaircit(c, .18);
      // mèches qui encadrent le visage, sous la casquette
      // deux mèches ondulées qui tombent devant les épaules
      const meche = (sg) => `<path d="M${sg * 30} ${hy - 32} Q${sg * 60} ${hy - 20} ${sg * 60} ${hy + 30} Q${sg * 74} ${hy + 80} ${sg * 64} ${hy + 120} Q${sg * 82} ${hy + 170} ${sg * 74} ${hy + 214} Q${sg * 86} ${hy + 250} ${sg * 66} ${hy + 282} Q${sg * 58} ${hy + 250} ${sg * 54} ${hy + 214} Q${sg * 64} ${hy + 168} ${sg * 48} ${hy + 124} Q${sg * 54} ${hy + 78} ${sg * 42} ${hy + 36} Q${sg * 40} ${hy - 6} ${sg * 30} ${hy - 32}Z" fill="${ch}"/>` +
        `<path d="M${sg * 56} ${hy + 20} q${sg * 10} 40 ${sg * 0} 82 q${sg * 10} 46 ${sg * 4} 96 q${sg * 8} 30 ${sg * 0} 60" stroke="${chC}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
      let o = meche(-1) + meche(1);
      // casquette : calotte en 6 panneaux, bouton, visière tournée vers l'avant droit
      o += `<path d="M-54 ${hy - 24} Q-56 ${hy - 92} 0 ${hy - 96} Q56 ${hy - 92} 54 ${hy - 24} Q0 ${hy - 36} -54 ${hy - 24}Z" fill="${c}"/>`;
      o += `<path d="M0 ${hy - 95} Q-6 ${hy - 60} -2 ${hy - 30} M-30 ${hy - 86} Q-40 ${hy - 56} -38 ${hy - 28} M30 ${hy - 86} Q40 ${hy - 56} 38 ${hy - 28}" stroke="${cO}" stroke-width="2.5" fill="none" opacity=".7"/>`;
      o += `<path d="M-40 ${hy - 80} Q-10 ${hy - 96} 22 ${hy - 90}" stroke="${cC}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="0" cy="${hy - 95}" r="5" fill="${cO}"/>`;
      o += `<path d="M-50 ${hy - 26} Q-4 ${hy - 42} 46 ${hy - 30} Q92 ${hy - 26} 104 ${hy - 10} Q70 ${hy - 4} 30 ${hy - 14} Q-16 ${hy - 20} -50 ${hy - 16}Z" fill="${cO}"/><path d="M-50 ${hy - 26} Q-4 ${hy - 42} 46 ${hy - 30}" stroke="${fonce(c, .35)}" stroke-width="3" fill="none"/>`;
      return o;
    },
  },
  // Cheveux bruns bouclés, volume sur le dessus (Théo, d'après la photo du cabinet).
  boucles_courtes: {
    arriere: (hy, ch) => `<path d="M-52 ${hy - 10} Q-58 ${hy - 60} -20 ${hy - 84} L20 ${hy - 84} Q58 ${hy - 60} 52 ${hy - 10}Z" fill="${ch}"/>`,
    avant: (hy, ch, chC) => {
      let o = `<path d="M-50 ${hy - 2} Q-56 ${hy - 40} -46 ${hy - 58} L-36 ${hy - 30} Q-44 ${hy - 18} -46 ${hy + 2}Z" fill="${ch}"/><path d="M50 ${hy - 2} Q56 ${hy - 40} 46 ${hy - 58} L36 ${hy - 30} Q44 ${hy - 18} 46 ${hy + 2}Z" fill="${ch}"/>`;
      for (const [x, y, r] of [[-40, -52, 17], [-24, -68, 19], [-4, -76, 20], [18, -74, 20], [36, -62, 18], [46, -44, 14], [-46, -38, 13], [-12, -58, 16], [10, -60, 16], [28, -48, 14], [-30, -44, 13]]) o += `<circle cx="${x}" cy="${hy + y}" r="${r}" fill="${ch}"/>`;
      for (const [x, y] of [[-34, -60], [-10, -80], [14, -78], [34, -66], [-20, -50], [4, -64], [24, -54]]) o += `<path d="M${x - 7} ${hy + y + 2} q7 -9 14 0" stroke="${chC}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".85"/>`;
      return o;
    },
  },
  courts: {
    arriere: () => "",
    avant: (hy, ch, chC) => `<path d="M-48 ${hy - 4} Q-54 ${hy - 50} -30 ${hy - 66} Q-10 ${hy - 82} 14 ${hy - 76} Q44 ${hy - 72} 50 ${hy - 40} Q52 ${hy - 20} 48 ${hy - 4} Q44 ${hy - 30} 30 ${hy - 38} Q8 ${hy - 30} -14 ${hy - 40} Q-36 ${hy - 34} -44 ${hy - 20}Z" fill="${ch}"/><path d="M-24 ${hy - 66} q8 -6 16 0 M2 ${hy - 72} q8 -6 16 0 M22 ${hy - 64} q8 -4 14 2" stroke="${chC}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`,
  },
};

// ---------------------------------------------------------------- tenues (détails du torse)
function tenue(p, r, peau) {
  const haut = p.haut, hautO = fonce(haut, .16), dessous = p.dessous || "#F7EFEA", y = (v) => v + r;
  const revers = (ouv = 30, bas = 26) => `<path d="M-${ouv} ${y(-506)} L-6 ${y(-408)} L-${bas} -296 L-${bas + 8} -296 L-${ouv + 16} ${y(-470)}Z" fill="${hautO}"/><path d="M${ouv} ${y(-506)} L6 ${y(-408)} L${bas} -296 L${bas + 8} -296 L${ouv + 16} ${y(-470)}Z" fill="${hautO}"/>`;
  const ouvert = (c) => `<path d="M-30 ${y(-506)} L30 ${y(-506)} L24 -296 L-24 -296Z" fill="${c}"/>`;
  switch (p.tenue) {
    case "blazer": return ouvert(dessous) + revers() + (p.collier ? `<path d="M-22 ${y(-504)} Q0 ${y(-478)} 22 ${y(-504)}" fill="${peau}"/><circle cx="0" cy="${y(-478)}" r="5" fill="${OR}"/><path d="M-18 ${y(-500)} Q0 ${y(-480)} 18 ${y(-500)}" stroke="${OR}" stroke-width="2.5" fill="none"/>` : `<path d="M-22 ${y(-504)} Q0 ${y(-482)} 22 ${y(-504)}" fill="${peau}"/>`);
    case "veste": return `<path d="M-28 ${y(-506)} L28 ${y(-506)} L24 -296 L-24 -296Z" fill="${dessous}"/><path d="M-24 ${y(-504)} Q0 ${y(-486)} 24 ${y(-504)}" fill="${peau}"/>` + revers(28, 22);
    case "chemise_veste": return `<path d="M-28 ${y(-506)} L28 ${y(-506)} L24 -296 L-24 -296Z" fill="${dessous}"/><path d="M-20 ${y(-508)} L0 ${y(-478)} L20 ${y(-508)} L12 ${y(-512)} L0 ${y(-494)} L-12 ${y(-512)}Z" fill="${eclaircit(dessous, .4)}" stroke="${fonce(dessous, .15)}" stroke-width="2"/><path d="M0 ${y(-478)} L0 -300" stroke="${fonce(dessous, .2)}" stroke-width="2"/>` + revers(28, 22);
    case "costume": return `<path d="M-26 ${y(-506)} L26 ${y(-506)} L0 ${y(-410)}Z" fill="${BLANC}"/><path d="M-6 ${y(-492)} L6 ${y(-492)} L9 ${y(-380)} L0 ${y(-366)} L-9 ${y(-380)}Z" fill="${p.cravate || BX}"/><path d="M-26 ${y(-506)} L0 ${y(-410)} L-20 -296 L-60 -296 L-44 ${y(-470)}Z" fill="${hautO}"/><path d="M26 ${y(-506)} L0 ${y(-410)} L20 -296 L60 -296 L44 ${y(-470)}Z" fill="${hautO}"/>`;
    case "tailleur": return `<path d="M-22 ${y(-506)} L22 ${y(-506)} L0 ${y(-430)}Z" fill="${dessous}"/><path d="M-22 ${y(-506)} L0 ${y(-430)} L-8 ${y(-424)} L-36 ${y(-480)}Z" fill="${hautO}"/><path d="M22 ${y(-506)} L0 ${y(-430)} L8 ${y(-424)} L36 ${y(-480)}Z" fill="${hautO}"/><circle cx="0" cy="${y(-400)}" r="6" fill="${fonce(haut, .35)}"/><path d="M0 ${y(-430)} L0 -300" stroke="${hautO}" stroke-width="3"/>` + (p.collier ? `<circle cx="0" cy="${y(-488)}" r="4" fill="${OR}"/>` : "");
    case "pull": return `<path d="M-30 ${y(-508)} Q0 ${y(-486)} 30 ${y(-508)} L22 ${y(-512)} Q0 ${y(-496)} -22 ${y(-512)}Z" fill="${dessous}"/><path d="M-30 ${y(-506)} Q0 ${y(-482)} 30 ${y(-506)}" stroke="${hautO}" stroke-width="6" fill="none"/><rect x="-74" y="-322" width="148" height="22" rx="8" fill="${hautO}"/>` + Array.from({ length: 4 }, (_, i) => `<path d="M-60 ${y(-460 + i * 34)} h120" stroke="${hautO}" stroke-width="2" opacity=".35"/>`).join("");
    case "cardigan": return ouvert(dessous) + `<path d="M-22 ${y(-504)} Q0 ${y(-484)} 22 ${y(-504)}" fill="${peau}"/><path d="M-30 ${y(-506)} L-12 ${y(-420)} L-14 -296 L-26 -296 L-40 ${y(-470)}Z" fill="${hautO}" opacity=".6"/><path d="M30 ${y(-506)} L12 ${y(-420)} L14 -296 L26 -296 L40 ${y(-470)}Z" fill="${hautO}" opacity=".6"/>` + [0, 1, 2].map((i) => `<circle cx="-18" cy="${y(-430 + i * 40)}" r="4" fill="${eclaircit(haut, .5)}"/>`).join("");
    case "doudoune": return `<path d="M-40 ${y(-520)} Q0 ${y(-500)} 40 ${y(-520)} L36 ${y(-496)} Q0 ${y(-480)} -36 ${y(-496)}Z" fill="${hautO}"/><path d="M0 ${y(-490)} L0 -300" stroke="${fonce(haut, .3)}" stroke-width="3"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M-86 ${y(-462 + i * 34)} Q0 ${y(-450 + i * 34)} 86 ${y(-462 + i * 34)}" stroke="${hautO}" stroke-width="4" fill="none" opacity=".8"/>`).join("");
    case "polo": return `<path d="M-24 ${y(-506)} Q0 ${y(-474)} 24 ${y(-506)}" fill="${peau}"/><path d="M-26 ${y(-508)} L-4 ${y(-462)} L-34 ${y(-470)} L-46 ${y(-502)}Z" fill="${hautO}"/><path d="M26 ${y(-508)} L4 ${y(-462)} L34 ${y(-470)} L46 ${y(-502)}Z" fill="${hautO}"/>` +
      `<path d="M0 ${y(-472)} L0 ${y(-400)}" stroke="${hautO}" stroke-width="3"/><circle cx="0" cy="${y(-450)}" r="4" fill="${eclaircit(haut, .35)}"/><circle cx="0" cy="${y(-420)}" r="4" fill="${eclaircit(haut, .35)}"/>`;
    case "zip": return `<path d="M-40 ${y(-536)} Q0 ${y(-546)} 40 ${y(-536)} L44 ${y(-498)} Q0 ${y(-486)} -44 ${y(-498)}Z" fill="${hautO}"/><path d="M-40 ${y(-528)} Q0 ${y(-538)} 40 ${y(-528)}" stroke="${fonce(haut, .3)}" stroke-width="2" fill="none" opacity=".6"/>` +
      `<path d="M0 ${y(-540)} L0 ${y(-400)}" stroke="${fonce(haut, .35)}" stroke-width="4"/><rect x="-5" y="${y(-520)}" width="10" height="26" rx="3" fill="#C9CDD2"/><rect x="-3" y="${y(-498)}" width="6" height="12" rx="2" fill="#9EA3A8"/>` +
      `<rect x="-74" y="-322" width="148" height="22" rx="8" fill="${hautO}"/>`;
    case "sweat":
    default: return `<path d="M-50 ${y(-506)} Q0 ${y(-470)} 50 ${y(-506)} Q30 ${y(-528)} 0 ${y(-526)} Q-30 ${y(-528)} -50 ${y(-506)}Z" fill="${hautO}"/>` +
      `<path d="M-14 ${y(-494)} l-4 70 M14 ${y(-494)} l4 70" stroke="${eclaircit(haut, .6)}" stroke-width="4" stroke-linecap="round"/><circle cx="-18" cy="${y(-422)}" r="4" fill="${eclaircit(haut, .6)}"/><circle cx="18" cy="${y(-422)}" r="4" fill="${eclaircit(haut, .6)}"/>` +
      `<path d="M-54 -386 L54 -386 L62 -320 L-62 -320Z" fill="${hautO}" opacity=".55"/><rect x="-74" y="-322" width="148" height="26" rx="10" fill="${hautO}"/>`;
  }
}

function perso(p0, t) {
  const p = { ...(PRESETS[p0.type] || {}), ...p0 };
  const S = p.s || 1, r = Math.sin(t * 2.4 + (p.ph || 0)) * 2.5;
  const peau = p.peau, peauO = fonce(peau, .12), haut = p.haut, bas = p.bas, basO = fonce(bas, .2);
  const ch = p.cheveux, chC = eclaircit(ch, .22), f = p.genre === "f";
  const coiffure = COIFFURES[p.coiffure] || COIFFURES.courts;
  let o = ombre(p.x, p.y + 4 * S, 130 * S, .16);
  let c = coiffure.dos ? coiffure.dos(-592 + r * 1.2, ch, chC, p) : "";   // cheveux longs : derrière le corps
  // ---- jambes et chaussures
  const chaus = p.chaussure || "#F4F1EE", chausO = fonce(chaus, .25);
  c += `<path d="M-60 -312 L-6 -312 L-10 -24 L-48 -24 Z" fill="${bas}"/><path d="M6 -312 L60 -312 L48 -24 L10 -24 Z" fill="${bas}"/>`;
  c += `<path d="M-6 -312 L-10 -24 L-22 -24 L-14 -300Z" fill="${basO}" opacity=".5"/><path d="M60 -312 L48 -24 L36 -24 L46 -300Z" fill="${basO}" opacity=".6"/>`;
  c += `<path d="M-54 -28 h46 q6 0 8 10 l2 12 q0 8 -8 8 h-62 q-8 0 -6 -10 q4 -16 20 -20z" fill="${chaus}"/><path d="M-70 -4 h70" stroke="${chausO}" stroke-width="6"/>`;
  c += `<path d="M8 -28 h46 q16 4 20 20 q2 10 -6 10 h-62 q-8 0 -8 -8 l2 -12 q2 -10 8 -10z" fill="${chaus}"/><path d="M2 -4 h70" stroke="${chausO}" stroke-width="6"/>`;
  // ---- bras
  const bras = (sx, a1, a2) => {
    const L1 = 132, L2 = 122, sy = -488 + r;
    const ra = a1 * Math.PI / 180, rb = a2 * Math.PI / 180;
    const ex = sx + Math.sin(ra) * L1, ey = sy + Math.cos(ra) * L1, hx = ex + Math.sin(rb) * L2, hy = ey + Math.cos(rb) * L2;
    const ep = p.tenue === "doudoune" ? 46 : 40;
    const manche = `<path d="M${sx} ${sy} L${ex} ${ey}" stroke="${haut}" stroke-width="${ep}" stroke-linecap="round"/><path d="M${ex} ${ey} L${mix(ex, hx, .82)} ${mix(ey, hy, .82)}" stroke="${haut}" stroke-width="${ep - 6}" stroke-linecap="round"/>`;
    const main = `<g transform="translate(${hx} ${hy}) rotate(${-a2})"><path d="M-14 -8 Q-16 14 -6 20 Q4 24 12 16 Q16 6 14 -8Z" fill="${peau}"/><path d="M12 -6 Q22 2 18 12" stroke="${peau}" stroke-width="9" stroke-linecap="round" fill="none"/></g>`;
    return { d: manche + main, hx, hy, ex, ey };
  };
  const bg = p.bras || [6, 6], cd = p.coudes || [0, 0];
  const BG = bras(-80, -(bg[0] + 4), -(bg[0] + 4) - cd[0]);
  const BD = bras(80, bg[1] + 4, bg[1] + 4 + cd[1]);
  // ---- torse
  const larg = p.tenue === "doudoune" ? 8 : 0;
  const torse = `M${-74 - larg} ${-500 + r} Q${-96 - larg} ${-494 + r} ${-96 - larg} ${-466 + r} L${-74 - larg} -322 Q-70 -300 -60 -296 L60 -296 Q70 -300 ${74 + larg} -322 L${96 + larg} ${-466 + r} Q${96 + larg} ${-494 + r} ${74 + larg} ${-500 + r} Q40 ${-512 + r} 0 ${-510 + r} Q-40 ${-512 + r} ${-74 - larg} ${-500 + r}Z`;
  let corps = `<path d="${torse}" fill="${haut}"/>`;
  corps += `<path d="M40 ${-508 + r} Q96 ${-494 + r} 96 ${-466 + r} L74 -322 Q70 -300 60 -296 L30 -296 Q60 -380 40 ${-508 + r}Z" fill="#000" opacity=".08"/>`;
  corps += tenue(p, r, peau);
  corps += `<path d="M-60 -296 L60 -296 L60 -312 L-60 -312Z" fill="#000" opacity=".1"/>`;
  // ---- tête
  const hy = -592 + r * 1.2, rg = (p.regard || 0) * 6, h = p.humeur || "neutre";
  let tete = coiffure.arriere(hy, ch, chC, p);
  tete += `<path d="M-15 ${hy + 40} L-15 ${hy + 86} L15 ${hy + 86} L15 ${hy + 40}Z" fill="${peau}"/><path d="M-15 ${hy + 40} L15 ${hy + 40} L15 ${hy + 66} Q0 ${hy + 74} -15 ${hy + 62}Z" fill="${peauO}"/>`;
  if (p.tenue === "zip") tete += `<path d="M-30 ${hy + 52} Q0 ${hy + 60} 30 ${hy + 52} L38 ${hy + 92} Q0 ${hy + 104} -38 ${hy + 92}Z" fill="${fonce(p.haut, .16)}"/><path d="M-30 ${hy + 60} Q0 ${hy + 68} 30 ${hy + 60}" stroke="${fonce(p.haut, .32)}" stroke-width="2" fill="none" opacity=".6"/><path d="M0 ${hy + 64} L0 ${hy + 100}" stroke="${fonce(p.haut, .35)}" stroke-width="4"/><rect x="-5" y="${hy + 70}" width="10" height="26" rx="3" fill="#C9CDD2"/><rect x="-3" y="${hy + 92}" width="6" height="12" rx="2" fill="#9EA3A8"/>`;   // col montant zippé autour du cou
  tete += `<ellipse cx="-47" cy="${hy + 4}" rx="9" ry="14" fill="${peauO}"/><ellipse cx="47" cy="${hy + 4}" rx="9" ry="14" fill="${peauO}"/>`;
  tete += `<path d="M-47 ${hy - 6} Q-50 ${hy + 34} -28 ${hy + 52} Q-12 ${hy + 64} 0 ${hy + 64} Q12 ${hy + 64} 28 ${hy + 52} Q50 ${hy + 34} 47 ${hy - 6} Q46 ${hy - 62} 0 ${hy - 62} Q-46 ${hy - 62} -47 ${hy - 6}Z" fill="${peau}"/>`;
  tete += `<path d="M20 ${hy - 58} Q46 ${hy - 50} 47 ${hy - 6} Q50 ${hy + 34} 28 ${hy + 52} Q34 ${hy + 10} 20 ${hy - 58}Z" fill="${peauO}" opacity=".45"/>`;
  if (p.boucles_oreilles) tete += `<circle cx="-46" cy="${hy + 20}" r="4" fill="${OR}"/><circle cx="46" cy="${hy + 20}" r="4" fill="${OR}"/>`;
  if (p.barbe === "pleine" || p.barbe === true) tete += `<path d="M-46 ${hy + 4} Q-46 ${hy + 40} -26 ${hy + 56} Q-10 ${hy + 70} 0 ${hy + 70} Q10 ${hy + 70} 26 ${hy + 56} Q46 ${hy + 40} 46 ${hy + 4} Q40 ${hy + 30} 22 ${hy + 34} Q0 ${hy + 26} -22 ${hy + 34} Q-40 ${hy + 30} -46 ${hy + 4}Z" fill="${p.couleur_barbe || ch}" opacity=".9"/><path d="M-12 ${hy + 46} Q0 ${hy + 52} 12 ${hy + 46}" stroke="${peauO}" stroke-width="6" fill="none"/>`;
  else if (p.barbe === "courte") tete += `<path d="M-44 ${hy + 10} Q-42 ${hy + 44} -24 ${hy + 56} Q-10 ${hy + 66} 0 ${hy + 66} Q10 ${hy + 66} 24 ${hy + 56} Q42 ${hy + 44} 44 ${hy + 10} Q36 ${hy + 34} 16 ${hy + 34} Q0 ${hy + 30} -16 ${hy + 34} Q-36 ${hy + 34} -44 ${hy + 10}Z" fill="${p.couleur_barbe || ch}" opacity=".55"/>`;
  // yeux
  const cli = 1 - (p.cligne || 0) * .92;
  const oeil = (ex) => `<ellipse cx="${ex + rg}" cy="${hy + 2}" rx="5.5" ry="${6.5 * cli}" fill="#22171A"/><circle cx="${ex + rg + 2}" cy="${hy}" r="${1.8 * cli}" fill="#fff"/><path d="M${ex - 9} ${hy - 5} Q${ex} ${hy - 11} ${ex + 9} ${hy - 5}" stroke="#22171A" stroke-width="${f ? 3.5 : 2.5}" fill="none" stroke-linecap="round"/>`;
  tete += oeil(-18) + oeil(18);
  if (f) tete += `<path d="M-28 ${hy - 7} l-5 -4 M28 ${hy - 7} l5 -4" stroke="#22171A" stroke-width="2.5" stroke-linecap="round"/>`;
  if (p.rides) tete += `<path d="M-36 ${hy + 4} l-6 3 M-36 ${hy + 9} l-6 1 M36 ${hy + 4} l6 3 M36 ${hy + 9} l6 1 M-16 ${hy - 36} q16 -5 32 0 M-12 ${hy - 44} q12 -4 24 0" stroke="${fonce(peau, .3)}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-18 ${hy + 30} q-6 6 -4 12 M18 ${hy + 30} q6 6 4 12" stroke="${fonce(peau, .25)}" stroke-width="2.4" fill="none" opacity=".6"/>`;
  const bs = h === "souci" ? 1 : 0, bsur = h === "surpris" ? -5 : 0, sc = p.sourcil || fonce(ch, .1);
  tete += `<path d="M-30 ${hy - 16 + bsur + bs * 2} Q-18 ${hy - 24 + bsur + bs * 6} -7 ${hy - 18 + bsur - bs * 4}" stroke="${sc}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  tete += `<path d="M30 ${hy - 16 + bsur + bs * 2} Q18 ${hy - 24 + bsur + bs * 6} 7 ${hy - 18 + bsur - bs * 4}" stroke="${sc}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  tete += `<path d="M-1 ${hy + 4} Q-7 ${hy + 22} -1 ${hy + 25} Q4 ${hy + 27} 7 ${hy + 23}" stroke="${fonce(peau, .35)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const levre = f ? (p.levres || "#B4505E") : fonce(peau, .45);
  if ((p.parle || 0) > .05) {   // bouche qui parle (ouverture suivant la voix)
    const ob = p.parle, lg = h === "sourire" ? 15 : 12;
    tete += `<path d="M-${lg} ${hy + 38} Q0 ${hy + 40 + 12 * ob + (h === "sourire" ? 4 : 0)} ${lg} ${hy + 38} Q0 ${hy + 34} -${lg} ${hy + 38}Z" fill="#6E1E2A"/><path d="M-${lg - 4} ${hy + 38} Q0 ${hy + 41} ${lg - 4} ${hy + 38}" stroke="#fff" stroke-width="${2 + ob * 2}" fill="none" opacity="${h === "sourire" ? .95 : .7}"/>` + (h === "sourire" ? `<ellipse cx="-30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/><ellipse cx="30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/>` : "");
  } else if (h === "sourire" && p.grand_sourire) tete += `<path d="M-20 ${hy + 33} Q0 ${hy + 58} 20 ${hy + 33} Q0 ${hy + 39} -20 ${hy + 33}Z" fill="#6E1E2A"/><path d="M-16 ${hy + 36} Q0 ${hy + 41} 16 ${hy + 36} L15 ${hy + 41} Q0 ${hy + 46} -15 ${hy + 41}Z" fill="#fff"/><path d="M-21 ${hy + 32} q-3 -2 -4 -5 M21 ${hy + 32} q3 -2 4 -5" stroke="${fonce(peau, .3)}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-30" cy="${hy + 24}" rx="9" ry="5.5" fill="${ROSE}" opacity=".4"/><ellipse cx="30" cy="${hy + 24}" rx="9" ry="5.5" fill="${ROSE}" opacity=".4"/>`;
  else if (h === "sourire") tete += `<path d="M-15 ${hy + 36} Q0 ${hy + 52} 15 ${hy + 36} Q0 ${hy + 41} -15 ${hy + 36}Z" fill="#6E1E2A"/><path d="M-11 ${hy + 39} Q0 ${hy + 43} 11 ${hy + 39} L10 ${hy + 41} Q0 ${hy + 44} -10 ${hy + 41}Z" fill="#fff"/><ellipse cx="-30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/><ellipse cx="30" cy="${hy + 26}" rx="8" ry="5" fill="${ROSE}" opacity=".35"/>`;
  else if (h === "souci") tete += `<path d="M-11 ${hy + 43} Q0 ${hy + 36} 11 ${hy + 43}" stroke="${levre}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  else if (h === "surpris") tete += `<ellipse cx="0" cy="${hy + 41}" rx="7" ry="9" fill="#6E1E2A"/>`;
  else tete += `<path d="M-11 ${hy + 39} Q0 ${hy + 44} 11 ${hy + 39}" stroke="${levre}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  if (p.taches) for (const [x, y] of [[-30, 14], [-24, 20], [-34, 22], [-20, 12], [30, 14], [24, 20], [34, 22], [20, 12], [-6, 12], [6, 13], [-28, 28], [28, 28]]) tete += `<circle cx="${x}" cy="${hy + y}" r="1.7" fill="${fonce(peau, .32)}" opacity=".55"/>`;
  tete += coiffure.avant(hy, ch, chC, p);
  if (p.casque) {   // casque audio sur les oreilles, arceau par-dessus les cheveux
    const k = p.casque === true ? "#1D1B1E" : p.casque;
    tete += `<path d="M-56 ${hy - 6} Q-66 ${hy - 104} 0 ${hy - 108} Q66 ${hy - 104} 56 ${hy - 6}" stroke="${k}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M-50 ${hy - 50} Q-40 ${hy - 96} 0 ${hy - 100}" stroke="${eclaircit(k, .25)}" stroke-width="3" fill="none" opacity=".6"/>`;
    for (const sg of [-1, 1]) tete += `<rect x="${sg * 56 - 16}" y="${hy - 22}" width="32" height="56" rx="14" fill="${k}"/><rect x="${sg * 56 - (sg > 0 ? 16 : -6)}" y="${hy - 14}" width="10" height="40" rx="5" fill="${eclaircit(k, .2)}" opacity=".7"/>`;
  }
  if (p.lunettes_rondes) {
    const m = p.lunettes_rondes === true ? "#A9AEB4" : p.lunettes_rondes;
    tete += `<circle cx="-18" cy="${hy + 1}" r="16" fill="#fff" fill-opacity=".14" stroke="${m}" stroke-width="2.6"/><circle cx="18" cy="${hy + 1}" r="16" fill="#fff" fill-opacity=".14" stroke="${m}" stroke-width="2.6"/><path d="M-2 ${hy - 2} q2 -3 4 0 M-34 ${hy - 2} l-14 -4 M34 ${hy - 2} l14 -4" stroke="${m}" stroke-width="2.4" fill="none"/><path d="M-27 ${hy - 8} l6 -4 M9 ${hy - 8} l6 -4" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  }
  if (p.lunettes) { const m = p.lunettes === true ? "#2A2326" : p.lunettes; tete += `<rect x="-33" y="${hy - 10}" width="26" height="20" rx="7" fill="#fff" fill-opacity=".12" stroke="${m}" stroke-width="3.5"/><rect x="7" y="${hy - 10}" width="26" height="20" rx="7" fill="#fff" fill-opacity=".12" stroke="${m}" stroke-width="3.5"/><path d="M-7 ${hy - 2} q7 -4 14 0 M-33 ${hy - 4} l-12 -2 M33 ${hy - 4} l12 -2" stroke="${m}" stroke-width="3" fill="none"/>`; }
  // téléphone
  let tel = "";
  if (p.tel) tel = `<g transform="translate(${BD.hx} ${BD.hy - 46}) rotate(-10)"><rect x="-24" y="-44" width="48" height="88" rx="10" fill="#1C1719"/><rect x="-20" y="-38" width="40" height="74" rx="6" fill="${p.ecran || "#8FB3D9"}"/></g>` +
    `<g transform="translate(${BD.hx} ${BD.hy}) rotate(${-(bg[1] + 4 + cd[1])})"><path d="M-14 -8 Q-16 14 -6 20 Q4 24 12 16 Q16 6 14 -8Z" fill="${peau}"/></g>`;
  const acc = p.accessoire ? p.accessoire(BG, BD) : "";
  return o + `<g transform="translate(${p.x} ${p.y}) scale(${S})">${c + BG.d + corps + tete + BD.d + tel + acc}</g>`;
}

// ---------------------------------------------------------------- distribution (10 personnages) et variantes de tenue
// Chaque personnage a 3 variantes de couleurs : la « graine » de la vidéo en choisit une (jamais les mêmes tenues partout).
const PRESETS = {
  lea: { nom: "Léa", age: "25 ans", genre: "f", peau: "#F2C9AE", cheveux: "#3E2219", coiffure: "longs", tenue: "blazer", collier: true, boucles_oreilles: true, chaussure: "#F4F1EE",
    variantes: [[ROSE, "#2F3448", "#F7EFEA"], ["#C9D6E8", "#2F3448", "#FFFFFF"], ["#E9C46A", "#3B3F52", "#FFFFFF"]] },
  tom: { nom: "Tom", age: "25 ans", genre: "h", peau: "#C48A66", cheveux: "#1F1513", coiffure: "courts", tenue: "sweat", chaussure: "#ECE7E3",
    variantes: [["#4F6075", "#3B4A63"], ["#6B7F5A", "#2F3540"], ["#8E3B46", "#3B4A63"]] },
  tom_age: { nom: "Tom", age: "35 ans", genre: "h", peau: "#C48A66", cheveux: "#1F1513", coiffure: "courts", tenue: "veste", barbe: "pleine", chaussure: "#ECE7E3",
    variantes: [["#2C3345", "#3B4A63", "#EDE6E2"], ["#4A3B33", "#2F3540", "#F1ECE6"], ["#3D4A3E", "#2B2F38", "#EDE6E2"]] },
  conseil: { nom: "Conseiller", age: "", genre: "h", peau: "#E7B694", cheveux: "#33241F", coiffure: "lisse", tenue: "costume", chaussure: "#1E1A1C",
    variantes: [["#262A36", "#262A36"], ["#2E3B52", "#2E3B52"], ["#3A3A3E", "#3A3A3E"]] },
  ines: { nom: "Inès", age: "22 ans", genre: "f", peau: "#8D5A3B", cheveux: "#1B1110", coiffure: "boucles", tenue: "sweat", boucles_oreilles: true, levres: "#7E3A40", chaussure: "#F4F1EE",
    variantes: [["#E9A23B", "#3A4256"], ["#7FA8A3", "#2F3448"], ["#D8919C", "#3A4256"]] },
  hugo: { nom: "Hugo", age: "23 ans", genre: "h", peau: "#F0C8A8", cheveux: "#7A4A2A", coiffure: "casquette", tenue: "doudoune", chaussure: "#F4F1EE",
    variantes: [["#2F5D8A", "#3B3F4A", "", "#C8423A"], ["#3E7D5A", "#2B2F38", "", "#2E3A4F"], ["#C8423A", "#3B3F4A", "", "#1F2633"]] },
  sarah: { nom: "Sarah", age: "40 ans", genre: "f", peau: "#E8B48F", cheveux: "#5A2E1E", coiffure: "carre", tenue: "tailleur", collier: true, boucles_oreilles: true, chaussure: "#2A2326",
    variantes: [["#3A3F58", "#3A3F58", "#F7EFEA"], [BX, "#2A2326", "#F7EFEA"], ["#5C6B73", "#5C6B73", "#FFFFFF"]] },
  isaac: { nom: "Isaac", age: "38 ans", genre: "h", peau: "#6E4530", cheveux: "#151010", coiffure: "lisse", tempes: "#151010", tenue: "chemise_veste", barbe: "courte", chaussure: "#3A2A22",
    variantes: [["#4B5563", "#2B2F38", "#DCE6F2"], ["#7A5C45", "#2F3540", "#FFFFFF"], ["#2E4A3F", "#2B2F38", "#F1ECE6"]] },
  michel: { nom: "Michel", age: "66 ans", genre: "h", peau: "#F1C4A3", cheveux: "#B9B4B0", coiffure: "degarni", tenue: "pull", lunettes: true, rides: true, chaussure: "#5A4636",
    variantes: [["#7A8F6A", "#4A4F5A", "#FFFFFF"], ["#8C5E58", "#3F4550", "#E8EEF5"], ["#4F6C8C", "#5A5048", "#FFFFFF"]] },
  // Léa et Théo, d'après la photo du cabinet (novembre 2026) : tenues fixes, comme sur la photo.
  lea_bsc: { nom: "Léa", age: "", genre: "f", peau: "#F3C8AC", cheveux: "#8A4A26", coiffure: "ondules_casquette", tenue: "polo", taches: true, grand_sourire: true, levres: "#B65A5E", chaussure: "#F4F1EE", sourcil: "#5A2E1A",
    variantes: [["#1E2740", "#2A3042", "", "#2F6B3A"]] },
  theo: { nom: "Théo", age: "", genre: "h", peau: "#C98F6C", cheveux: "#24181A", coiffure: "boucles_courtes", tenue: "zip", barbe: "pleine", couleur_barbe: "#1E1416", lunettes_rondes: true, casque: true, chaussure: "#2A2326", sourcil: "#1E1416",
    variantes: [["#1F2740", "#2B2F38"]] },
  francoise: { nom: "Françoise", age: "63 ans", genre: "f", peau: "#EBC0A0", cheveux: "#CFCAC6", coiffure: "chignon", tenue: "cardigan", lunettes: "#8E3B46", rides: true, boucles_oreilles: true, levres: "#A4505C", chaussure: "#5A4636",
    variantes: [["#B5838D", "#4A4F5A", "#F7EFEA"], ["#6D8BA6", "#3F4550", "#FFFFFF"], ["#C9A66B", "#4A4F5A", "#F7EFEA"]] },
};
const PERSONNAGES = Object.keys(PRESETS);
let GRAINE = 1;
// Tenue du personnage pour cette vidéo (variante choisie par la graine, stable pendant toute la vidéo).
function habille(nom) {
  const P = PRESETS[nom] || PRESETS.tom, v = P.variantes[(GRAINE + nom.length * 7) % P.variantes.length];
  return { type: nom in PRESETS ? nom : "tom", haut: v[0], bas: v[1], ...(v[2] ? { dessous: v[2] } : {}), ...(v[3] ? { casquette: v[3] } : {}), ph: (nom.length * 1.3) % 6 };
}
const LEA = habille("lea"), TOM = habille("tom"), CONS = habille("conseil");
