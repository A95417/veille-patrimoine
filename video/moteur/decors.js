// Décors : 12 lieux, avec des variations tirées de la « graine » de la vidéo (heure du jour, objets, positions, nuances).
// Une même graine redonne exactement la même vidéo ; une nouvelle graine donne une autre mise en scène.
// Zone du personnage principal : x ≈ 220-500, pieds à y ≈ 1590. Les décors restent discrets (arrière-plan).
function alea(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hachage = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
const choisir = (R, l) => l[Math.floor(R() * l.length)];

const MOMENTS = {
  matin: { ciel: ["#F9DCC8", "#CFE3F2"], soleil: "#FFE2A8", lumiere: .10 },
  jour: { ciel: ["#BFDDF5", "#EAF4FB"], soleil: "#FFF3C4", lumiere: 0 },
  couchant: { ciel: ["#F4A77A", "#8E6A9C"], soleil: "#FFC07A", lumiere: .12 },
  soir: { ciel: ["#2B2D4F", "#4E416E"], soleil: "#F1EBD6", lumiere: .25 },
};
const momentVideo = () => choisir(alea(GRAINE * 3 + 11), ["matin", "jour", "jour", "couchant", "soir"]);

let _id = 0;
function degrade(c1, c2, x = 0, y = 0, w = 1080, h = 1920, extra = "") { const id = "dg" + (_id++); return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})" ${extra}/>`; }
function ciel(M, x, y, w, h, t, R) {
  let o = degrade(M.ciel[0], M.ciel[1], x, y, w, h);
  const sx = x + w * (.2 + R() * .6), sy = y + h * (M === MOMENTS.soir ? .25 : .35);
  o += `<circle cx="${sx}" cy="${sy}" r="${Math.min(w, h) * .09}" fill="${M.soleil}" opacity="${M === MOMENTS.jour ? .9 : .95}"/>`;
  if (M === MOMENTS.soir) for (let i = 0; i < 7; i++) o += `<circle cx="${x + R() * w}" cy="${y + R() * h * .6}" r="${1.5 + R() * 2}" fill="#fff" opacity="${.5 + .4 * Math.sin(t * 2 + i)}"/>`;
  else for (let i = 0; i < 2; i++) { const cx = x + ((R() * w + t * 12 * (i + 1)) % (w + 200)) - 100, cy = y + h * (.15 + R() * .3); o += `<g opacity=".85" fill="#fff"><ellipse cx="${cx}" cy="${cy}" rx="${46 + R() * 30}" ry="20"/><ellipse cx="${cx + 34}" cy="${cy - 12}" rx="34" ry="22"/><ellipse cx="${cx - 30}" cy="${cy - 6}" rx="26" ry="16"/></g>`; }
  return o;
}
function plante(x, y, s, R, pot = BX) {
  const v = choisir(R, ["#5E8F70", "#4C7C5E", "#6E9E62", "#3F6E57"]);
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q-20 -120 30 -200 q30 60 10 200z" fill="${v}"/><path d="M25 0 q40 -150 90 -180 q-10 90 -60 180z" fill="${fonce(v, .12)}"/><path d="M10 0 q-60 -90 -80 -140 q50 20 70 140z" fill="${eclaircit(v, .1)}"/><rect x="-30" y="-60" width="120" height="80" rx="14" fill="${pot}"/></g>`;
}
function cadre(x, y, w, h, R) {
  const fondC = choisir(R, ["#F3D3D8", "#DCE7F0", "#F2E6CF", "#E4EDE1"]), forme = choisir(R, ["montagne", "cercle", "lignes"]);
  let d = forme === "montagne" ? `<path d="M${x + 10} ${y + h - 10} l${w * .3} ${-h * .5} l${w * .2} ${h * .25} l${w * .2} ${-h * .35} l${w * .3 - 20} ${h * .6}z" fill="${ROSE}" opacity=".7"/>`
    : forme === "cercle" ? `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) * .28}" fill="${BX}" opacity=".55"/>` : [0, 1, 2].map((i) => `<path d="M${x + 14} ${y + h * (.3 + i * .2)} h${w - 28}" stroke="${BX}" stroke-width="5" opacity=".35"/>`).join("");
  return `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="6" fill="${choisir(R, ["#3B2A2E", "#C8A27A", "#FFFFFF"])}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fondC}"/>` + d;
}
function fenetre(x, y, w, h, M, t, R) {
  return `<g><clipPath id="cf${x}${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/></clipPath><g clip-path="url(#cf${x}${y})">${ciel(M, x, y, w, h, t, R)}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="none" stroke="${BLANC}" stroke-width="18"/><line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${BLANC}" stroke-width="12"/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${BLANC}" stroke-width="12"/></g>`;
}
const voile = (M) => (M.lumiere ? `<rect width="1080" height="1920" fill="${M === MOMENTS.soir ? "#1A1838" : "#F49A6A"}" opacity="${M.lumiere * (M === MOMENTS.soir ? 1 : .5)}"/>` : "");

const DECORS = {
  appartement(t, R, M) {
    const mur = choisir(R, [["#FBF4F1", "#EBD9D6"], ["#F3F0EA", "#E2DAD0"], ["#EEF2F4", "#D9E1E6"]]);
    let o = degrade(mur[0], mur[1]);
    const fx = choisir(R, [620, 660, 700]);
    o += fenetre(fx, 380, 320, 380, M, t, R);
    if (R() < .6) o += cadre(80 + R() * 60, 420, 160, 120, R);
    o += `<rect x="0" y="1560" width="1080" height="360" fill="${choisir(R, ["#E3CFCB", "#D8C8B8", "#CFC6C2"])}"/>`;
    o += plante(choisir(R, [120, 150]), 1560, .9 + R() * .2, R);
    if (R() < .5) o += `<rect x="760" y="1380" width="260" height="180" rx="10" fill="${choisir(R, ["#C8A27A", "#3B2A2E"])}" opacity=".9"/><rect x="780" y="1340" width="70" height="40" rx="4" fill="${ROSE}"/>`;
    return o + voile(M);
  },
  salon(t, R, M) {
    let o = degrade(...choisir(R, [["#F6EEE8", "#E6D6CC"], ["#EFF0EA", "#DDDFD3"], ["#F4ECEF", "#E3D3D9"]]));
    o += cadre(choisir(R, [640, 700]), 420, 260, 170, R);
    if (R() < .7) o += cadre(choisir(R, [640, 720]), 650, 120, 120, R);
    const canap = choisir(R, ["#8E3B46", "#5C6B73", "#C9A66B", "#3E5C6E"]);
    o += `<rect x="560" y="1250" width="520" height="200" rx="40" fill="${canap}"/><rect x="580" y="1180" width="480" height="140" rx="40" fill="${fonce(canap, .12)}"/><rect x="560" y="1440" width="18" height="60" fill="#3B2A2E"/><rect x="1040" y="1440" width="18" height="60" fill="#3B2A2E"/>`;
    o += `<ellipse cx="540" cy="1640" rx="520" ry="70" fill="${choisir(R, ["#E9C46A", "#D8919C", "#C9D6E8"])}" opacity=".45"/>`;
    o += `<path d="M120 1560 v-520" stroke="#3B2A2E" stroke-width="10"/><path d="M60 1040 h120 l-30 -110 h-60z" fill="${choisir(R, ["#F2E6CF", "#F3D3D8"])}"/><circle cx="120" cy="1080" r="${M === MOMENTS.soir ? 160 : 0}" fill="#FFE2A8" opacity=".25"/>`;
    o += `<rect x="0" y="1560" width="1080" height="360" fill="#D8C8B8"/>`;
    return o + voile(M);
  },
  cuisine(t, R, M) {
    let o = degrade("#F7F4EF", "#E7E1D8");
    const meuble = choisir(R, ["#7FA8A3", "#C9D6E8", "#E9C46A", "#D8919C"]);
    o += `<rect x="560" y="360" width="480" height="260" rx="12" fill="${meuble}"/>` + [0, 1, 2].map((i) => `<rect x="${580 + i * 152}" y="380" width="136" height="220" rx="8" fill="${fonce(meuble, .08)}"/><rect x="${640 + i * 152}" y="560" width="20" height="8" rx="4" fill="#fff"/>`).join("");
    o += fenetre(choisir(R, [80, 120]), 400, 260, 300, M, t, R);
    o += `<rect x="540" y="1180" width="540" height="40" fill="#E6DDD3"/><rect x="560" y="1220" width="500" height="340" fill="${fonce(meuble, .1)}"/>` + [0, 1].map((i) => `<rect x="${580 + i * 250}" y="1240" width="230" height="300" rx="8" fill="${meuble}"/>`).join("");
    o += `<rect x="700" y="1120" width="70" height="60" rx="10" fill="#fff"/><path d="M770 1135 q24 4 18 24 q-6 10 -18 6" stroke="#fff" stroke-width="7" fill="none"/>`;
    if (R() < .6) o += plante(940, 1180, .45, R, "#FFFFFF");
    o += `<rect x="0" y="1560" width="1080" height="360" fill="${choisir(R, ["#CFC6C2", "#D8C8B8"])}"/>`;
    return o + voile(M);
  },
  chambre_soir(t, R) {
    const M = MOMENTS.soir;
    let o = degrade(...choisir(R, [["#2E2A44", "#1C1A2E"], ["#3A2433", "#1F1420"], ["#22303F", "#151C26"]]));
    o += fenetre(choisir(R, [640, 700]), 360, 300, 360, M, t, R);
    o += `<circle cx="${choisir(R, [880, 760])}" cy="440" r="34" fill="#F1EBD6"/>`;
    const lit = choisir(R, ["#C9D6E8", "#F3D3D8", "#E9C46A"]);
    o += `<rect x="560" y="1300" width="520" height="160" rx="24" fill="${lit}" opacity=".85"/><rect x="560" y="1220" width="160" height="90" rx="24" fill="#fff" opacity=".85"/><rect x="560" y="1460" width="520" height="40" fill="#3B2A2E"/>`;
    o += `<rect x="90" y="1300" width="160" height="260" rx="10" fill="#3B2A2E"/><path d="M130 1300 h80 l-15 -80 h-50z" fill="#F2E6CF"/><circle cx="170" cy="1260" r="${180 + 6 * Math.sin(t * 2)}" fill="#FFE2A8" opacity=".14"/>`;
    o += `<rect x="0" y="1560" width="1080" height="360" fill="#2A2230"/>`;
    return o;
  },
  bureau(t, R, M) {
    let o = degrade(...choisir(R, [["#F4EEEC", "#E2D3CF"], ["#EEF1F4", "#DCE2E8"], ["#F3EFE7", "#E0D8CB"]]));
    o += `<rect x="90" y="360" width="300" height="200" rx="12" fill="#E9DEDB"/><path d="M120 520 l70 -80 l60 50 l50 -60 l60 90z" fill="${ROSE}" opacity=".6"/>`;
    if (R() < .6) o += fenetre(640, 340, 360, 300, M, t, R); else o += `<rect x="640" y="360" width="360" height="40" rx="6" fill="#C8A27A"/>` + [0, 1, 2, 3].map((i) => `<rect x="${660 + i * 80}" y="${300 - (i % 2) * 20}" width="56" height="${60 + (i % 2) * 20}" rx="4" fill="${choisir(R, [BX, ROSE, "#5C6B73", "#E9C46A"])}"/>`).join("");
    o += `<rect x="0" y="1580" width="1080" height="340" fill="#D8C6C1"/><rect x="560" y="1240" width="460" height="28" rx="12" fill="#3B2A2E"/><rect x="600" y="1268" width="380" height="312" fill="#4A363B"/>`;
    o += `<rect x="700" y="1150" width="200" height="94" rx="8" fill="#2A2629"/><rect x="712" y="1160" width="176" height="74" rx="4" fill="#9FB8CF"/>`;
    if (R() < .5) o += plante(950, 1240, .35, R, "#FFFFFF");
    return o + voile(M);
  },
  coworking(t, R, M) {
    let o = degrade("#F1EFEA", "#DEDAD2");
    o += `<g>${ciel(M, 40, 300, 1000, 520, t, R)}</g>` + [0, 1, 2, 3, 4].map((i) => `<rect x="${40 + i * 250}" y="300" width="12" height="520" fill="#3B3F4A"/>`).join("") + `<rect x="40" y="540" width="1000" height="10" fill="#3B3F4A"/><rect x="40" y="300" width="1000" height="520" fill="none" stroke="#3B3F4A" stroke-width="12"/>`;
    for (const x of [200, 540, 880]) o += `<path d="M${x} 230 v120" stroke="#3B3F4A" stroke-width="4"/><path d="M${x - 50} 390 q50 -60 100 0z" fill="${choisir(R, ["#E9C46A", BX, "#5C6B73"])}"/>`;
    o += `<rect x="520" y="1250" width="560" height="30" rx="10" fill="#C8A27A"/><rect x="560" y="1280" width="16" height="300" fill="#3B3F4A"/><rect x="1020" y="1280" width="16" height="300" fill="#3B3F4A"/>`;
    o += `<rect x="640" y="1170" width="150" height="84" rx="6" fill="#2A2629"/><rect x="860" y="1190" width="70" height="60" rx="8" fill="#fff"/>`;
    o += plante(choisir(R, [80, 980]), 1560, .7, R, "#E6DDD3");
    o += `<rect x="0" y="1580" width="1080" height="340" fill="#CFC9BF"/>`;
    return o + voile(M);
  },
  banque(t, R, M) {
    let o = degrade("#F4F2EF", "#E2DED8");
    o += `<rect x="560" y="330" width="460" height="110" rx="14" fill="${BX}"/><text x="790" y="402" text-anchor="middle" font-size="44" font-weight="800" fill="#fff" letter-spacing="8">AGENCE</text>`;
    o += [0, 1].map((i) => `<rect x="${580 + i * 230}" y="500" width="200" height="560" rx="10" fill="#CFE0EA" opacity=".55" stroke="#9FB8CF" stroke-width="6"/>`).join("");
    o += `<rect x="520" y="1200" width="560" height="380" rx="14" fill="${choisir(R, ["#3B2A2E", "#4A3F3A", "#2E3B52"])}"/><rect x="500" y="1180" width="600" height="34" rx="12" fill="#C8A27A"/>`;
    o += `<rect x="760" y="1110" width="120" height="74" rx="6" fill="#2A2629"/>`;
    o += plante(choisir(R, [90, 140]), 1560, .8, R);
    o += `<rect x="0" y="1580" width="1080" height="340" fill="#D6D0C8"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 200} 1580 l-80 340" stroke="#C6BFB6" stroke-width="3"/>`).join("");
    return o + voile(M);
  },
  rue(t, R, M) {
    let o = ciel(M, 0, 0, 1080, 1200, t, R);
    let x = -20;
    while (x < 1100) {
      const w = 160 + R() * 140, h = 500 + R() * 400, coul = choisir(R, ["#E8D5C4", "#D8C3B0", "#C9B7A8", "#E2CFC0", "#BFAE9F"]);
      o += `<rect x="${x}" y="${1450 - h}" width="${w}" height="${h}" fill="${coul}"/><rect x="${x}" y="${1450 - h}" width="${w}" height="18" fill="${fonce(coul, .15)}"/>`;
      for (let yy = 1450 - h + 60; yy < 1300; yy += 110) for (let xx = x + 24; xx < x + w - 50; xx += 70) o += `<rect x="${xx}" y="${yy}" width="40" height="60" rx="4" fill="${M === MOMENTS.soir && R() < .5 ? "#FFE2A8" : "#9FB8CF"}" opacity=".9"/>`;
      x += w + 8;
    }
    o += `<rect x="0" y="1450" width="1080" height="140" fill="#B8B1AA"/><rect x="0" y="1590" width="1080" height="330" fill="#6E6A70"/>` + [0, 1, 2, 3].map((i) => `<rect x="${i * 300 + 60}" y="1740" width="140" height="14" fill="#E9E4DE"/>`).join("");
    const lx = choisir(R, [700, 880]); o += `<rect x="${lx}" y="1080" width="12" height="440" fill="#3B3F4A"/><path d="M${lx + 6} 1080 q40 0 60 30" stroke="#3B3F4A" stroke-width="10" fill="none"/><circle cx="${lx + 66}" cy="1116" r="16" fill="${M === MOMENTS.soir ? "#FFE2A8" : "#E9E4DE"}"/>`;
    if (R() < .7) { const cx = choisir(R, [620, 780]), cc = choisir(R, [BX, "#2F5D8A", "#E9C46A", "#5C6B73"]); o += `<g transform="translate(${cx} 1560)"><rect x="0" y="-90" width="300" height="80" rx="24" fill="${cc}"/><path d="M50 -90 q30 -60 100 -60 q60 0 90 60z" fill="${fonce(cc, .1)}"/><path d="M80 -90 q20 -40 70 -40 l0 40z" fill="#CFE0EA"/><circle cx="70" cy="-8" r="28" fill="#2A2629"/><circle cx="240" cy="-8" r="28" fill="#2A2629"/></g>`; }
    return o;
  },
  parc(t, R, M) {
    let o = ciel(M, 0, 0, 1080, 1300, t, R);
    o += `<path d="M0 1150 Q270 1080 540 1140 T1080 1120 V1920 H0Z" fill="${choisir(R, ["#9CC28A", "#8DB57E", "#A9C98F"])}"/>`;
    for (let i = 0; i < 4; i++) { const tx = choisir(R, [80, 620, 780, 960, 180]) + R() * 40, ts = .7 + R() * .5, f = choisir(R, ["#5E8F70", "#4C7C5E", "#6E9E62", "#D98C5F"]); o += `<g transform="translate(${tx} 1260) scale(${ts})"><rect x="-14" y="-40" width="28" height="200" fill="#6B4A36"/><circle cx="0" cy="-120" r="110" fill="${f}"/><circle cx="-70" cy="-60" r="70" fill="${fonce(f, .08)}"/><circle cx="70" cy="-70" r="80" fill="${eclaircit(f, .08)}"/></g>`; }
    o += `<path d="M300 1920 Q520 1500 640 1150 L700 1150 Q640 1500 760 1920Z" fill="#E9DCC6"/>`;
    if (R() < .7) o += `<g transform="translate(${choisir(R, [720, 820])} 1520)"><rect x="0" y="-70" width="220" height="16" rx="6" fill="#8C5E3C"/><rect x="0" y="-110" width="220" height="16" rx="6" fill="#8C5E3C"/><rect x="10" y="-54" width="10" height="54" fill="#3B3F4A"/><rect x="200" y="-54" width="10" height="54" fill="#3B3F4A"/></g>`;
    return o;
  },
  cafe(t, R, M) {
    const auvent = choisir(R, [[BX, BLANC], ["#2E4A3F", "#F2E6CF"], ["#2F5D8A", BLANC]]);
    let o = degrade(...choisir(R, [["#EFE6E3", "#D9C8C4"], ["#F2ECE4", "#DDD2C4"]]));
    o += `<rect x="0" y="230" width="1080" height="150" fill="${auvent[0]}"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${i * 135} 380 q67 70 135 0z" fill="${i % 2 ? auvent[0] : auvent[1]}"/>`).join("");
    o += `<rect x="560" y="520" width="440" height="380" rx="10" fill="#CFE0EA" opacity=".6" stroke="#3B2A2E" stroke-width="10"/>`;
    o += `<rect x="0" y="1580" width="1080" height="340" fill="#C9B3AE"/>`;
    o += `<rect x="600" y="1220" width="380" height="26" rx="12" fill="#3B2A2E"/><rect x="780" y="1240" width="20" height="340" fill="#3B2A2E"/><ellipse cx="790" cy="1580" rx="90" ry="14" fill="#3B2A2E"/>`;
    o += `<path d="M820 1170 h70 l-8 50 h-54z" fill="${BLANC}"/><ellipse cx="855" cy="1222" rx="56" ry="9" fill="${BLANC}"/>`;
    if (R() < .6) o += plante(980, 1580, .5, R, auvent[0]);
    return o + voile(M);
  },
  mer(t, R, M) {
    let o = ciel(M, 0, 0, 1080, 1120, t, R);
    const eau = M === MOMENTS.soir ? "#2E4A6E" : M === MOMENTS.couchant ? "#6E7FA8" : "#5FA7C8";
    o += `<rect x="0" y="1060" width="1080" height="330" fill="${eau}"/>`;
    for (let i = 0; i < 6; i++) { const y = 1100 + i * 50, d = (t * 40 + i * 70) % 160; o += `<path d="M${-160 + d} ${y} q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" stroke="#fff" stroke-width="4" fill="none" opacity=".35"/>`; }
    o += `<path d="M0 1360 Q540 1320 1080 1380 V1920 H0Z" fill="${choisir(R, ["#EBD6B0", "#F0DDB8", "#E6CFA4"])}"/>`;
    const px = choisir(R, [760, 860]), pc = choisir(R, [[BX, BLANC], ["#E9C46A", "#fff"], ["#2F5D8A", "#fff"]]);
    o += `<rect x="${px - 4}" y="1180" width="8" height="380" fill="#6B4A36"/><path d="M${px - 180} 1220 Q${px} 1080 ${px + 180} 1220z" fill="${pc[0]}"/><path d="M${px - 60} 1220 Q${px} 1100 ${px + 60} 1220z" fill="${pc[1]}"/>`;
    o += `<rect x="${px - 150}" y="1520" width="220" height="60" rx="10" fill="${choisir(R, ["#F3D3D8", "#C9D6E8"])}"/>`;
    return o;
  },
  maison_vente(t, R, M) {
    let o = ciel(M, 0, 0, 1080, 1300, t, R);
    o += `<rect x="0" y="1300" width="1080" height="620" fill="${choisir(R, ["#9CC28A", "#A9C98F"])}"/>`;
    const mur = choisir(R, ["#F2E6CF", "#E8D5C4", "#EDEAE4"]), toit = choisir(R, [BX, "#5C4033", "#3B3F4A"]);
    o += `<g transform="translate(${choisir(R, [560, 600])} 0)"><rect x="0" y="880" width="440" height="440" fill="${mur}"/><path d="M-40 900 L220 690 L480 900z" fill="${toit}"/><rect x="170" y="1110" width="100" height="210" rx="6" fill="${fonce(toit, .1)}"/><rect x="40" y="980" width="100" height="90" rx="6" fill="#CFE0EA" stroke="#fff" stroke-width="8"/><rect x="300" y="980" width="100" height="90" rx="6" fill="#CFE0EA" stroke="#fff" stroke-width="8"/></g>`;
    o += [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${520 + i * 62}" y="1400" width="16" height="120" rx="6" fill="#fff"/>`).join("") + `<rect x="510" y="1430" width="560" height="14" fill="#fff"/><rect x="510" y="1480" width="560" height="14" fill="#fff"/>`;
    const sx = choisir(R, [880, 940]);
    o += `<rect x="${sx}" y="1320" width="12" height="220" fill="#6B4A36"/><rect x="${sx - 110}" y="1260" width="230" height="110" rx="8" fill="${BLANC}" stroke="${BX}" stroke-width="8"/><text x="${sx + 6}" y="1330" text-anchor="middle" font-size="40" font-weight="900" fill="${BX}">À VENDRE</text>`;
    return o;
  },
};
const LIEUX = Object.keys(DECORS);
// Décor d'une scène : la graine de la vidéo + le numéro de scène fixent toutes les variations.
function decor(nom, t, i = 0) {
  const f = DECORS[nom] || DECORS.appartement, R = alea(GRAINE * 7919 + i * 101 + hachage(nom));
  _id = i * 1000;
  return f(t, R, MOMENTS[momentVideo()]);
}

// Fonds des scènes graphiques (chiffres, listes…) : teintes BSC et motif discret, variés selon la graine.
function fondMarque(ton, i, t) {
  const R = alea(GRAINE * 131 + i * 17 + (ton === "sombre" ? 5 : 9));
  const g = ton === "sombre" ? choisir(R, [["#3A0915", "#16050A"], ["#4A0614", "#1A060B"], ["#2A0A12", "#140408"], ["#3B0C1C", "#1C0710"]])
    : choisir(R, [["#FBF4F1", "#EBD9D6"], ["#FAF6F2", "#EFE3DA"], ["#F8F1F3", "#E9D6DC"], ["#F6F3EE", "#E6DCD0"]]);
  _id = i * 1000 + 500;
  let o = degrade(g[0], g[1]);
  const c = ton === "sombre" ? "#FFFFFF" : BX, op = ton === "sombre" ? .05 : .05;
  const motif = choisir(R, ["cercles", "points", "diagonales", "bulles", "aucun"]);
  if (motif === "cercles") { const cx = 200 + R() * 680, cy = 500 + R() * 900; for (let k = 0; k < 5; k++) o += `<circle cx="${cx}" cy="${cy}" r="${180 + k * 120 + (t * 10) % 120}" fill="none" stroke="${c}" stroke-opacity="${op}" stroke-width="3"/>`; }
  else if (motif === "points") for (let x = 60; x < 1080; x += 90) for (let y = 330; y < 1640; y += 90) o += `<circle cx="${x}" cy="${y}" r="3" fill="${c}" opacity="${op * 1.6}"/>`;
  else if (motif === "diagonales") for (let k = -10; k < 20; k++) o += `<path d="M${k * 120} 0 l700 1920" stroke="${c}" stroke-opacity="${op * .8}" stroke-width="22"/>`;
  else if (motif === "bulles") for (let k = 0; k < 6; k++) { const r = 60 + R() * 140; o += `<circle cx="${R() * 1080}" cy="${(((R() * 1920 - t * 15 * (k + 1)) % 1920) + 1920) % 1920}" r="${r}" fill="${ROSE}" opacity="${ton === "sombre" ? .06 : .12}"/>`; }
  return o;
}
