// version 1.0 — images de couverture des fiches « Apprendre ».
// Illustrations originales (dessinées en SVG, sans droits d'auteur), animées en douceur.
// couvertureFiche(f) renvoie une image pleine largeur, pensée pour donner envie d'ouvrir la fiche.

(() => {
  // Petits éléments réutilisables -------------------------------------------------------
  const piece = (x, y, r = 9, c = "#f6c445", b = "#c98a12") =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/><circle cx="${x}" cy="${y - 1.5}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y - 1.5}" r="${r * .62}" fill="none" stroke="${b}" stroke-width="1.4" opacity=".6"/>`;
  const pile = (x, y, n, c, b) => Array.from({ length: n }, (_, i) =>
    `<ellipse cx="${x}" cy="${y - i * 6 + 3}" rx="16" ry="5" fill="${b}"/><ellipse cx="${x}" cy="${y - i * 6}" rx="16" ry="5" fill="${c}"/>`).join("");
  const etoile = (x, y, r, c, cl = "") =>
    `<path class="${cl}" d="M${x} ${y - r}L${x + r * .28} ${y - r * .28}L${x + r} ${y}L${x + r * .28} ${y + r * .28}L${x} ${y + r}L${x - r * .28} ${y + r * .28}L${x - r} ${y}L${x - r * .28} ${y - r * .28}z" fill="${c}"/>`;
  const fenetres = (x, y, cols, rangs, w, h, gx, gy, c, alt) => {
    let s = "";
    for (let i = 0; i < cols; i++) for (let j = 0; j < rangs; j++)
      s += `<rect x="${x + i * gx}" y="${y + j * gy}" width="${w}" height="${h}" rx="1" fill="${(i * 7 + j * 3) % 5 === 0 && alt ? alt : c}"/>`;
    return s;
  };
  const personne = (x, y, e, c, tete = c) =>   // silhouette simple : e = échelle
    `<g transform="translate(${x} ${y}) scale(${e})"><circle cx="0" cy="-34" r="9" fill="${tete}"/><path d="M-13 0v-16a13 13 0 0126 0V0z" fill="${c}"/></g>`;
  const ciel = (id, h, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const halo = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

  // Les scènes (cadre 400 × 220) --------------------------------------------------------
  const SCENES = {
    "assurance-vie": (p) => `<defs>${ciel(p + "c", "#0d5c63", "#1f9e89")}${halo(p + "h", "#ffe59a")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <circle cx="320" cy="52" r="70" fill="url(#${p}h)" class="anim-pulse"/>
      <path d="M0 178q100-30 200 0t200-6v48H0z" fill="#16816f"/><path d="M0 196q120-22 240 0t160-4v28H0z" fill="#0f6656"/>
      <g class="anim-flotte">
        <path d="M112 92a88 62 0 01176 0z" fill="#f6c445"/><path d="M112 92q22-16 44 0q22-16 44 0q22-16 44 0q22-16 44 0" fill="#e3a91f"/>
        <path d="M156 92a44 62 0 0188 0" fill="#ffd970" opacity=".55"/>
        <path d="M200 30v-6" stroke="#c98a12" stroke-width="4" stroke-linecap="round"/>
      </g>
      <path d="M200 92v74a9 9 0 01-18 0" fill="none" stroke="#7a4b0a" stroke-width="4.5" stroke-linecap="round"/>
      ${personne(160, 190, 1, "#ffffff", "#fde6c8")}${personne(236, 190, 1.05, "#ffe9a8", "#f3c9a0")}${personne(198, 190, .7, "#ffd0b5", "#fde6c8")}
      <g class="anim-flotte-2">${piece(70, 60)}${piece(46, 108, 7)}${piece(352, 132, 8)}</g>
      ${etoile(92, 34, 6, "#fff6cf", "anim-pulse")}${etoile(330, 160, 5, "#fff6cf", "anim-pulse")}`,

    per: (p) => `<defs>${ciel(p + "c", "#3b1d60", "#f2785c")}${halo(p + "h", "#ffd27a")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <circle cx="200" cy="140" r="110" fill="url(#${p}h)"/><circle cx="200" cy="146" r="44" fill="#ffc861" class="anim-pulse"/>
      <rect y="146" width="400" height="74" fill="#2b2f6b"/>
      <g class="anim-vague" fill="none" stroke="#7d86d9" stroke-width="2.5" stroke-linecap="round" opacity=".7">
        <path d="M30 166h50M120 176h80M250 164h60M320 186h60M60 196h70M210 202h50"/></g>
      <path d="M150 150h100" stroke="#ffc861" stroke-width="3" opacity=".5"/><path d="M168 158h64" stroke="#ffc861" stroke-width="3" opacity=".35"/>
      <g class="anim-flotte"><path d="M300 150h56l-8 12h-40z" fill="#14163a"/><path d="M326 148V96l26 50z" fill="#fff4e0"/><path d="M322 148v-40l-18 40z" fill="#ffd9c2"/></g>
      <g transform="translate(64 66)"><path d="M0 0h44l-16 34 16 34H0l16-34z" fill="#fff4e0" opacity=".95"/>
        <path d="M7 6h30l-15 24z" fill="#f6b34a" class="anim-sable"/><path d="M8 64h28l-14-14z" fill="#f6b34a"/><rect x="-4" y="-6" width="52" height="7" rx="3" fill="#ffd9a0"/><rect x="-4" y="67" width="52" height="7" rx="3" fill="#ffd9a0"/></g>
      ${etoile(330, 40, 4, "#fff", "anim-pulse")}${etoile(110, 26, 3, "#fff", "anim-pulse")}${etoile(260, 30, 3, "#fff")}`,

    pea: (p) => `<defs>${ciel(p + "c", "#0b1f5c", "#2f5bd3")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <g transform="translate(300 62)">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return etoile(Math.round(Math.cos(a) * 340) / 10, Math.round(Math.sin(a) * 340) / 10, 5, "#ffd23f"); }).join("")}</g>
      <path d="M0 220V150h22v-20h18v20h14V112h26v38h12v-24h20v94z" fill="#173a8f"/>
      <path d="M120 220V98h34v122zM160 220v-84h24v-26h22v110zM214 220v-70h30v70zM250 220v-104l20-18 20 18v104zM296 220v-60h40v60zM342 220v-90h26v90zM372 220v-50h28v50z" fill="#1d4bb2"/>
      ${fenetres(126, 108, 3, 8, 5, 6, 10, 13, "#7aa2ff", "#ffe27a")}${fenetres(256, 124, 3, 6, 5, 6, 11, 14, "#7aa2ff", "#ffe27a")}${fenetres(348, 140, 2, 5, 5, 6, 10, 14, "#7aa2ff")}
      <path class="anim-trace" d="M20 178L80 150L130 162L190 112L240 126L300 70L360 44" fill="none" stroke="#5ef2b0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M346 34l22 6-12 18z" fill="#5ef2b0"/>`,

    scpi: (p) => `<defs>${ciel(p + "c", "#8fd3ff", "#ffe2c4")}${halo(p + "h", "#fff3c4")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="72" cy="50" r="60" fill="url(#${p}h)"/><circle cx="72" cy="50" r="20" fill="#ffd45e" class="anim-pulse"/>
      <g class="anim-flotte-2" fill="#fff" opacity=".9"><ellipse cx="190" cy="40" rx="30" ry="10"/><ellipse cx="210" cy="32" rx="18" ry="12"/><ellipse cx="330" cy="58" rx="26" ry="8"/></g>
      <rect x="40" y="96" width="70" height="104" fill="#e0723b"/>${fenetres(50, 106, 4, 6, 9, 9, 14, 15, "#ffe7cf")}
      <rect x="120" y="60" width="86" height="140" fill="#2c6e91"/>${fenetres(130, 70, 5, 8, 9, 10, 15, 16, "#bfe6ff", "#ffe27a")}
      <path d="M216 120h96v80h-96z" fill="#f2b53a"/><path d="M210 120l54-30 54 30z" fill="#d9822b"/>${fenetres(228, 136, 4, 2, 14, 16, 20, 26, "#fff4d6")}
      <rect x="248" y="176" width="32" height="24" fill="#8a4b14"/>
      <path d="M322 150h68v50h-68z" fill="#5b6b86"/><path d="M322 150l17-14 17 14 17-14 17 14" fill="#7d8dab"/><rect x="334" y="172" width="44" height="28" fill="#3d4a61"/>
      <rect y="198" width="400" height="22" fill="#6fae5a"/>
      <g class="anim-flotte">${piece(180, 34 + 0, 9)}</g><g class="anim-flotte-2">${piece(296, 92, 8)}</g>`,

    "produits-structures": (p) => `<defs>${ciel(p + "c", "#2a1457", "#6b3fc1")}${halo(p + "h", "#c7b2ff")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="330" cy="40" r="80" fill="url(#${p}h)" opacity=".5"/>
      <path d="M0 190l70-60 50 30 70-80 60 50 60-60 90 70v80H0z" fill="#4a2a92"/><path d="M0 220v-24l90-30 80 22 90-34 140 30v36z" fill="#371f73"/>
      <path d="M0 150h400" stroke="#ff8fa3" stroke-width="2.5" stroke-dasharray="8 7"/><text x="392" y="144" text-anchor="end" font-size="11" font-family="Inter,sans-serif" font-weight="600" fill="#ffc2cd">barrière de protection</text>
      <path class="anim-trace" d="M14 120C60 90 90 140 130 116S200 70 240 104S300 140 330 92S370 60 392 70" fill="none" stroke="#7af0c9" stroke-width="4.5" stroke-linecap="round"/>
      <g class="anim-flotte"><path d="M70 40l26 10v20c0 18-12 28-26 34-14-6-26-16-26-34V50z" fill="#7af0c9"/><path d="M60 72l8 8 16-18" fill="none" stroke="#1b5e4c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
      ${[130, 240, 330].map((x, i) => `<circle cx="${x}" cy="${[116, 104, 92][i]}" r="6" fill="#fff" stroke="#7af0c9" stroke-width="3"/>`).join("")}`,

    "regimes-matrimoniaux": (p) => `<defs>${ciel(p + "c", "#ffd6e2", "#ff9fb8")}${halo(p + "h", "#fff")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="200" cy="96" r="110" fill="url(#${p}h)" opacity=".55"/>
      <path d="M0 196q200-40 400 0v24H0z" fill="#f47a9a"/>
      <g transform="translate(270 104)"><path d="M0 40l50-38 50 38v60H0z" fill="#fff4f7"/><path d="M-10 44L50-6l60 50" fill="none" stroke="#c2185b" stroke-width="7" stroke-linejoin="round"/>
        <rect x="38" y="60" width="24" height="40" rx="3" fill="#c2185b"/><rect x="12" y="50" width="18" height="16" rx="2" fill="#ffc1d3"/><rect x="70" y="50" width="18" height="16" rx="2" fill="#ffc1d3"/></g>
      <g class="anim-balance"><circle cx="118" cy="108" r="40" fill="none" stroke="#f2b632" stroke-width="12"/><circle cx="166" cy="108" r="40" fill="none" stroke="#d6d9e6" stroke-width="12"/>
        <path d="M150 72a40 40 0 010 72" fill="none" stroke="#f2b632" stroke-width="12"/>
        <path d="M100 82a28 28 0 0110-6" stroke="#fff6cf" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      ${["M56 40c-6-8-20-2-14 8l14 12 14-12c6-10-8-16-14-8z", "M228 30c-4-6-14-1-10 6l10 9 10-9c4-7-6-12-10-6z", "M360 60c-4-6-14-1-10 6l10 9 10-9c4-7-6-12-10-6z"].map((d, i) => `<path class="${i % 2 ? "anim-flotte" : "anim-flotte-2"}" d="${d}" fill="#e91e63" opacity=".85"/>`).join("")}`,

    demembrement: (p) => `<defs>${ciel(p + "c", "#d9f2e6", "#9fdcc0")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <path d="M0 192q200-26 400 0v28H0z" fill="#3f8f5f"/>
      <path d="M192 196V120q0-20-24-34M208 196V124q0-22 26-38M200 140V90" stroke="#7a4a22" stroke-width="16" stroke-linecap="round" fill="none"/>
      <g class="anim-balance"><circle cx="150" cy="78" r="46" fill="#2f9e5b"/><circle cx="250" cy="74" r="50" fill="#2a8a50"/><circle cx="200" cy="50" r="52" fill="#36b169"/>
        ${[[150, 70], [176, 40], [220, 36], [252, 70], [128, 96], [270, 100], [204, 82], [236, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#ff5a4f"/><path d="M${x} ${y - 8}l3-4" stroke="#5a3b17" stroke-width="2"/>`).join("")}</g>
      <path d="M200 0v220" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 6" opacity=".9"/>
      <g font-family="Inter,sans-serif" font-weight="700" font-size="13"><rect x="22" y="22" width="112" height="26" rx="13" fill="#fff" opacity=".9"/><text x="78" y="40" text-anchor="middle" fill="#c2392f">Usufruit = fruits</text>
        <rect x="22" y="54" width="150" height="26" rx="13" fill="#fff" opacity=".9"/><text x="97" y="72" text-anchor="middle" fill="#2a6b45">Nue-propriété = arbre</text></g>
      <g transform="translate(70 168)"><g class="anim-flotte"><path d="M-22 0h44l-6 24h-32z" fill="#c98a3a"/><path d="M-22 0h44" stroke="#8a5a20" stroke-width="4"/><circle cx="-8" cy="-4" r="7" fill="#ff5a4f"/><circle cx="6" cy="-6" r="7" fill="#ff7a5f"/></g></g>`,

    donations: (p) => `<defs>${ciel(p + "c", "#3d1e6d", "#8b5cf6")}${halo(p + "h", "#f5d0fe")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="200" cy="100" r="120" fill="url(#${p}h)" opacity=".45"/>
      <path d="M40 210c20-40 50-60 100-64h50v20h-44" fill="#f3c9a0"/><path d="M360 210c-20-40-50-60-100-64h-50v20h44" fill="#d9a77c"/>
      <g class="anim-flotte"><rect x="150" y="76" width="100" height="74" rx="6" fill="#ff5d8f"/><rect x="142" y="62" width="116" height="22" rx="6" fill="#ff86ad"/>
        <rect x="192" y="62" width="16" height="88" fill="#ffd23f"/><path d="M200 62c-24-30-50-12-30 2zM200 62c24-30 50-12 30 2z" fill="#ffd23f"/></g>
      ${[[60, 40, "#ffd23f"], [110, 24, "#5ef2b0"], [300, 30, "#ffd23f"], [340, 70, "#ff86ad"], [80, 90, "#ff86ad"], [330, 120, "#5ef2b0"], [250, 22, "#fff"]].map(([x, y, c], i) =>
        `<rect class="${i % 2 ? "anim-flotte" : "anim-flotte-2"}" x="${x}" y="${y}" width="9" height="9" rx="2" fill="${c}" transform="rotate(${i * 25} ${x} ${y})"/>`).join("")}
      ${etoile(150, 40, 6, "#fff", "anim-pulse")}${etoile(270, 52, 5, "#fff", "anim-pulse")}`,

    succession: (p) => `<defs>${ciel(p + "c", "#073b4c", "#118ab2")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <g stroke="#9fe3ff" stroke-width="3" fill="none" opacity=".9"><path d="M200 58v26M110 84h180M110 84v26M200 84v26M290 84v26M110 136v18M80 154h60M290 136v18M260 154h60M80 154v14M140 154v14M260 154v14M320 154v14"/></g>
      ${[[200, 42, 18, "#ffd166"], [110, 120, 15, "#06d6a0"], [200, 120, 15, "#06d6a0"], [290, 120, 15, "#06d6a0"], [80, 178, 11, "#ef476f"], [140, 178, 11, "#ef476f"], [260, 178, 11, "#ef476f"], [320, 178, 11, "#ef476f"]].map(([x, y, r, c], i) =>
        `<g class="${i === 0 ? "anim-pulse" : ""}"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y - r * .25}" r="${r * .36}" fill="#fff" opacity=".85"/><path d="M${x - r * .55} ${y + r * .6}a${r * .55} ${r * .45} 0 01${r * 1.1} 0" fill="#fff" opacity=".85"/></g>`).join("")}
      <g transform="translate(330 26)"><g class="anim-flotte"><rect width="46" height="58" rx="4" fill="#fdf6e3"/><path d="M8 14h30M8 24h30M8 34h22M8 44h26" stroke="#b7a57a" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="50" r="8" fill="#ef476f"/></g></g>`,

    ifi: (p) => `<defs>${ciel(p + "c", "#141b3d", "#2e3a7a")}${halo(p + "h", "#ffd77a")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="90" cy="70" r="90" fill="url(#${p}h)" opacity=".35"/>
      ${etoile(40, 30, 3, "#fff")}${etoile(170, 20, 3, "#fff", "anim-pulse")}${etoile(360, 34, 4, "#fff", "anim-pulse")}
      <rect y="190" width="400" height="30" fill="#0e1430"/>
      <g transform="translate(40 80)"><rect x="0" y="40" width="180" height="70" fill="#e9e4d8"/><path d="M-10 44L90-6l100 50z" fill="#b5463a"/>
        <rect x="70" y="10" width="40" height="34" fill="#e9e4d8"/><path d="M64 14l26-18 26 18z" fill="#b5463a"/>
        ${fenetres(14, 52, 6, 2, 14, 16, 28, 26, "#ffd77a", "#fff1c2")}<rect x="78" y="80" width="24" height="30" fill="#6b3b2a"/><circle cx="90" cy="26" r="6" fill="#ffd77a"/></g>
      <g transform="translate(300 70)"><path d="M0 0v110" stroke="#ffd77a" stroke-width="5"/><path d="M-30 110h60" stroke="#ffd77a" stroke-width="6" stroke-linecap="round"/>
        <g class="anim-balance"><path d="M-52 8h104" stroke="#ffd77a" stroke-width="5" stroke-linecap="round"/>
          <path d="M-52 8l-16 36h32zM52 8l-16 36h32z" fill="none" stroke="#ffd77a" stroke-width="2.5"/><path d="M-70 44a18 8 0 0036 0z" fill="#ffd77a"/><path d="M34 44a18 8 0 0036 0z" fill="#ffd77a"/>
          <path d="M-60 36l8-8 8 8v8h-16z" fill="#fff"/><text x="52" y="38" text-anchor="middle" font-size="16" font-weight="700" font-family="Inter,sans-serif" fill="#141b3d">%</text></g></g>`,

    "girardin-industriel": (p) => `<defs>${ciel(p + "c", "#36c5f0", "#bff1ff")}${halo(p + "h", "#fff7b0")}<linearGradient id="${p}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8c4"/><stop offset="1" stop-color="#0a6f94"/></linearGradient></defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="330" cy="46" r="70" fill="url(#${p}h)"/><circle cx="330" cy="46" r="22" fill="#ffe14d" class="anim-pulse"/>
      <rect y="150" width="400" height="70" fill="url(#${p}m)"/>
      <g class="anim-vague" stroke="#bff1ff" stroke-width="2.5" stroke-linecap="round" opacity=".8"><path d="M20 172h40M140 186h60M260 170h44M330 196h50M80 204h40"/></g>
      <path d="M20 156q70-26 150 0z" fill="#f2d79b"/><path d="M60 154c0-30 6-60 14-84" stroke="#7a4a22" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g transform="translate(74 70)"><g class="anim-balance"><path d="M0 0c-20-14-44-10-56 4 20-6 38-2 56-4zM0 0c18-18 44-16 58-2-20-4-40 0-58 2zM0 0c-8-22-30-30-46-24 18 4 34 12 46 24zM0 0c12-20 34-24 50-14-18 0-34 4-50 14z" fill="#1f9e5b"/></g></g>
      <g class="anim-flotte"><path d="M206 148h120l-12 18H218z" fill="#24324f"/><rect x="226" y="122" width="26" height="26" fill="#ff7a45"/><rect x="254" y="122" width="26" height="26" fill="#ffd23f"/><rect x="240" y="98" width="26" height="24" fill="#2bb673"/><rect x="282" y="112" width="20" height="36" fill="#f4f6fb"/><rect x="286" y="116" width="12" height="8" fill="#9fdcff"/></g>
      <g transform="translate(150 60)"><path d="M0 90V0h6v90M-4 0h70" stroke="#ffb020" stroke-width="5" fill="none"/><path d="M60 0v26" stroke="#24324f" stroke-width="2"/><rect x="52" y="26" width="16" height="12" fill="#24324f"/></g>`,

    "apport-cession": (p) => `<defs>${ciel(p + "c", "#1e1b4b", "#4338ca")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/>
      <g transform="translate(30 92)"><rect y="20" width="90" height="80" fill="#c7d2fe"/><path d="M0 20l22-16v16l22-16v16l22-16v16h24V-20h-14v40" fill="#a5b4fc"/>${fenetres(10, 34, 4, 3, 12, 12, 20, 20, "#4338ca", "#fde68a")}</g>
      <path d="M134 150h44" stroke="#fde68a" stroke-width="5" stroke-linecap="round" class="anim-ecarte"/><path d="M172 140l14 10-14 10z" fill="#fde68a" class="anim-ecarte"/>
      <g transform="translate(196 64)"><rect width="70" height="130" rx="6" fill="#6366f1"/><rect x="8" y="10" width="54" height="22" rx="4" fill="#312e81"/>
        <text x="35" y="26" text-anchor="middle" font-size="11" font-weight="700" font-family="Inter,sans-serif" fill="#e0e7ff">HOLDING</text>${fenetres(12, 44, 3, 5, 10, 10, 18, 16, "#c7d2fe", "#fde68a")}</g>
      <g stroke="#a5b4fc" stroke-width="3" fill="none" stroke-dasharray="5 5"><path d="M268 100q40-30 70-40M268 128h70M268 156q40 30 70 40"/></g>
      <g class="anim-flotte">${pile(356, 64, 3, "#fde68a", "#d97706")}</g><g class="anim-flotte-2">${pile(356, 130, 4, "#86efac", "#16a34a")}</g><g class="anim-flotte">${pile(356, 198, 2, "#fda4af", "#e11d48")}</g>`,

    "pacte-dutreil": (p) => `<defs>${ciel(p + "c", "#fef3c7", "#a7f3d0")}${halo(p + "h", "#fff")}</defs>
      <rect width="400" height="220" fill="url(#${p}c)"/><circle cx="200" cy="80" r="110" fill="url(#${p}h)" opacity=".6"/>
      <rect y="196" width="400" height="24" fill="#4d9a6b"/>
      <g transform="translate(130 62)"><rect y="40" width="140" height="94" fill="#fff"/><path d="M-10 44h160l-14-34H4z" fill="#0f766e"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${-10 + i * 23} 44h23v10a11.5 11.5 0 01-23 0z" fill="${i % 2 ? "#fff" : "#14b8a6"}"/>`).join("")}
        <rect x="14" y="74" width="44" height="60" fill="#0f766e"/><rect x="74" y="72" width="52" height="34" fill="#ccfbf1" stroke="#0f766e" stroke-width="3"/>
        <rect x="40" y="18" width="60" height="18" rx="4" fill="#fff" stroke="#0f766e" stroke-width="2"/><text x="70" y="31" text-anchor="middle" font-size="10" font-weight="700" font-family="Inter,sans-serif" fill="#0f766e">DEPUIS 1978</text></g>
      ${personne(78, 196, 1.15, "#64748b", "#e8c4a0")}${personne(322, 196, 1.05, "#0ea5e9", "#f3d2b3")}
      <g class="anim-flotte"><circle cx="200" cy="28" r="12" fill="none" stroke="#d97706" stroke-width="5"/><path d="M210 34l26 18M228 46l-5 7M234 50l-5 7" stroke="#d97706" stroke-width="5" stroke-linecap="round"/></g>
      <path d="M100 150q100-60 200 0" fill="none" stroke="#d97706" stroke-width="3" stroke-dasharray="6 6"/><path d="M296 140l8 12-14 2z" fill="#d97706"/>`,
  };

  let compteur = 0;
  window.couvertureFiche = function (f, classe = "") {
    const scene = SCENES[f.id];
    if (!scene) return typeof illustrationFiche === "function" ? illustrationFiche(f, 160) : "";
    const p = "cv" + (++compteur) + "-";   // identifiants uniques (plusieurs couvertures sur une page)
    return `<svg class="couverture anime ${classe}" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration : ${f.titre.replace(/"/g, "")}" focusable="false">${scene(p)}</svg>`;
  };
})();
