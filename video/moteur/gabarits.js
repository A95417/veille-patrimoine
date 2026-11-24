// Gabarits de scènes réutilisables. Chaque scène reçoit S = { i, type, debut, fin, P (débuts des phrases), PF (fins), p (paramètres) }.
// Zone utile commune aux formats 9:16 et 4:5 : y de 300 à 1600 (le 4:5 recadre l'image entre 285 et 1635).
// Chaque gabarit a aussi une fonction « sons » qui liste ses bruitages (type, instant, volume) : le son suit l'image.

const ph = (S, k) => S.P[Math.max(0, Math.min(k, S.P.length - 1))];
const phf = (S, k) => S.PF[Math.max(0, Math.min(k, S.PF.length - 1))];
const nbP = (S) => S.P.length;
const court = (s, n) => String(s ?? "").slice(0, n);
// Personnage habillé pour cette vidéo (variante de tenue tirée de la graine).
function personnage(nom) { return habille(PRESETS[nom] ? nom : "tom"); }
const HUMEURS = new Set(["sourire", "neutre", "souci", "surpris"]);
const humeur = (h, defaut = "sourire") => (HUMEURS.has(h) ? h : defaut);
// Valeur numérique contenue dans un texte (« − 49 000 € » → 49000), pour animer un compteur.
function nombreDans(s) {
  const m = String(s).replace(/[\s  ]/g, "").match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}
function compteurTexte(s, k) {   // remplace le nombre du texte par sa valeur animée
  const v = nombreDans(s);
  if (v == null || k >= 1) return s;
  const decim = /\d[.,]\d/.test(s);
  const cur = v * eo(k);
  const f = decim ? cur.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }).replace(/\s/g, " ") : nb(cur);
  return String(s).replace(/\d[\d\s  ]*(?:[.,]\d+)?/, f);
}
// Coupe un texte en lignes de max caractères, sans couper les mots.
function lignes(s, max, n = 2) {
  const r = [""];
  for (const m of String(s).split(/\s+/)) { const l = r[r.length - 1]; if ((l + " " + m).trim().length > max && l) { if (r.length === n) { r[n - 1] += "…"; break; } r.push(m); } else r[r.length - 1] = (l + " " + m).trim(); }
  return r;
}
const slam = (k) => `scale(${.6 + .4 * back(k)})`;

const GAB = {};

// 1) Accroche : un personnage sur son téléphone, un gros chiffre ou mot qui claque.
GAB.accroche = {
  dessin(S, t) {
    const p = S.p, kT = ph(S, 1) > S.debut ? ph(S, 1) : S.debut + (S.fin - S.debut) * .55;
    let o = p.decor ? decor(p.decor, t, S.i) + `<rect width="1080" height="1920" fill="#16050A" opacity=".55"/>` : fondMarque("sombre", S.i, t);
    const zoom = 1 + (t - S.debut) * .012;
    o += `<g transform="translate(540 960) scale(${zoom}) translate(-540 -960)"><circle cx="540" cy="820" r="420" fill="${BX}" opacity=".45"/>`;
    o += `<ellipse cx="560" cy="800" rx="260" ry="220" fill="#8FB3D9" opacity="${.10 + .04 * Math.sin(t * 7)}"/>`;
    o += perso({ ...personnage(p.personnage), x: 540, y: 1580, s: 1.4, humeur: t > kT ? "surpris" : "souci", tel: true, bras: [10, 25], coudes: [0, 175], ecran: "#BBD2EA", regard: .3, cligne: cligne(t) }, t) + `</g>`;
    if (p.bandeau) o += pill(540, 340, Math.max(420, court(p.bandeau, 28).length * 26 + 120), 84, ROSE, txt(540, 356, court(p.bandeau, 28).toUpperCase(), { size: 40, w: 900, f: BX, ls: 3 }));
    const k = lin(t, kT, kT + .25);
    if (p.gros_texte && t > kT - .05) {
      const sh = t < kT + .6 ? Math.sin(t * 90) * 14 * (1 - lin(t, kT + .1, kT + .6)) : 0;
      const gt = compteurTexte(court(p.gros_texte, 16), lin(t, kT, kT + .8));
      o += `<rect width="1080" height="1920" fill="${BLANC}" opacity="${(1 - lin(t, kT, kT + .2)) * .5}"/>`;
      o += g(`<rect x="90" y="-130" width="900" height="${p.petit_texte ? 250 : 210}" rx="40" fill="${BLANC}"/>` + txt(540, 30, gt, { size: gt.length > 11 ? 120 : 150, w: 900, f: BX, fam: "Inter Display" }) + (p.petit_texte ? txt(540, 92, court(p.petit_texte, 34), { size: 32, w: 600, f: "#9A8B90" }) : ""),
        `translate(${sh} 560) rotate(${-3 * (1 - back(k))}) translate(540 0) ${slam(k)} translate(-540 0)`, cl(k * 3));
    }
    return o;
  },
  sons(S) { const kT = ph(S, 1) > S.debut ? ph(S, 1) : S.debut + (S.fin - S.debut) * .55; return S.p.gros_texte ? [["pop", kT, .6], ...Array.from({ length: 6 }, (_, i) => ["tic", kT + .1 + i * .11, .3])] : []; },
};

// 2) Personnage en situation : décor, étiquette (nom/âge), notification, bocal qui se remplit, puces, bulle de pensée.
GAB.personnage = {
  dessin(S, t) {
    const p = S.p, perso0 = personnage(p.personnage), dec = DECORS[p.decor] ? p.decor : choisir(alea(GRAINE + S.i * 13), ["appartement", "salon", "cuisine", "bureau", "rue", "parc"]);
    let o = decor(dec, t, S.i);
    const ke = eo(lin(t, S.debut, S.debut + .5));
    const avecTel = !!p.notification_titre;
    const bulleK = p.bulle ? lin(t, ph(S, nbP(S) - 1), ph(S, nbP(S) - 1) + .35) : 0;
    const tasse = dec === "cafe" && !avecTel;
    const pr = { ...perso0, x: 360, y: 1590, s: 1.32, humeur: humeur(p.humeur), regard: bulleK > 0 ? -.5 : .3, cligne: cligne(t, S.i) };
    if (avecTel) Object.assign(pr, { tel: true, bras: [8, 25], coudes: [0, 175], ecran: "#F3D3D8", regard: .4 });
    else if (tasse) Object.assign(pr, { bras: [14, 25], coudes: [0, 150], accessoire: (BG, BD) => `<path d="M${BD.hx - 30} ${BD.hy - 70} h64 l-8 70 h-48z" fill="${BLANC}"/><rect x="${BD.hx - 32}" y="${BD.hy - 46}" width="68" height="22" fill="${BX}"/><circle cx="${BD.hx}" cy="${BD.hy}" r="21" fill="${perso0.peau}"/>` });
    const cote = S.i % 2 ? 1 : -1;
    o += g(perso(pr, t), `translate(${(1 - ke) * 900 * cote} 0)`);
    if (p.nom && bulleK === 0) o += etiquette(360, 530, lin(t, S.debut + .3, S.debut + .65), court(p.nom, 16), court(p.sous_nom, 16), perso0.type === "lea" ? BX : ARDOISE);
    if (avecTel) o += notif(540, 380, lin(t, ph(S, 1), ph(S, 1) + .4), court(p.notification_titre, 26), court(p.notification_texte, 36));
    if (p.bocal) {
      const d0 = ph(S, 1) + .3, kb = lin(t, d0 - .3, d0 + .1);
      o += g(bocal(800, 1420, 260, 360, .05 + .55 * eo(lin(t, d0, S.fin - .2)), OR, ""), `translate(0 ${(1 - eo(kb)) * 600})`, cl(kb * 2));
      for (let i = 0; i < 8; i++) { const d = d0 + i * (S.fin - d0 - .5) / 8, k = lin(t, d, d + .45); if (k > 0 && k < 1) o += piece(800 + ((i % 3) - 1) * 40, mix(960, 1330 - i * 20, k * k), 30, k * 400); }
    }
    const puces = (p.puces || []).slice(0, 2);
    if (!p.bocal && bulleK === 0) puces.forEach((s, j) => {
      const k = lin(t, ph(S, j + 1), ph(S, j + 1) + .3);
      o += g(`<rect x="-230" y="-48" width="460" height="96" rx="48" fill="${BLANC}"/><circle cx="-180" cy="0" r="30" fill="${VERT}"/><path d="M-194 0 l10 10 l20 -22" stroke="${BLANC}" stroke-width="7" fill="none" stroke-linecap="round"/>` + txt(20, 16, court(s, 16), { size: 42, w: 800, f: NUIT }), `translate(760 ${560 + j * 120}) scale(${back(k)})`, cl(k * 3));
    });
    if (bulleK > 0) o += bulle(640, 640, bulleK, court(p.bulle, 18), 500, 880) + horloge(640, 460, 56 * back(bulleK), t, .6);
    return o;
  },
  sons(S) {
    const p = S.p, r = [];
    if (p.nom) r.push(["pop", S.debut + .3, .45]);
    if (p.notification_titre) r.push(["ping", ph(S, 1), .5]);
    if (p.bocal) { const d0 = ph(S, 1) + .3; for (let i = 0; i < 3; i++) r.push(["piece", d0 + i * (S.fin - d0 - .5) / 8, .5]); }
    if (!p.bocal) (p.puces || []).slice(0, 2).forEach((_, j) => r.push(["pop", ph(S, j + 1), .35]));
    if (p.bulle) r.push(["pop", ph(S, nbP(S) - 1), .45]);
    return r;
  },
};

// 3) Marchés qui montent puis baissent, avec deux tampons.
GAB.marche = {
  dessin(S, t) {
    const p = S.p;
    let o = fondMarque("sombre", S.i, t);
    const pts = []; for (let i = 0; i <= 60; i++) { const x = 90 + i * 15; const y = 900 - Math.sin(i / 7) * 140 - (i < 25 ? i * 7 : 175 - (i - 25) * 9) + Math.sin(i * 1.9) * 22; pts.push([x, y]); }
    const kp = lin(t, S.debut + .1, S.fin - .4), n = Math.max(2, Math.floor(kp * pts.length));
    const d = pts.slice(0, n).map((q, i) => (i ? "L" : "M") + q[0] + " " + q[1]).join(" ");
    for (let i = 0; i < 6; i++) o += `<line x1="90" y1="${560 + i * 110}" x2="990" y2="${560 + i * 110}" stroke="${BLANC}" stroke-opacity=".08" stroke-width="3"/>`;
    const up = n < 26, c = up ? "#6FCF97" : "#F27C8A";
    o += `<path d="${d}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const last = pts[n - 1]; o += `<circle cx="${last[0]}" cy="${last[1]}" r="20" fill="${c}"/><circle cx="${last[0]}" cy="${last[1]}" r="${20 + (t * 40 % 30)}" fill="none" stroke="${c}" opacity="${1 - (t * 40 % 30) / 30}" stroke-width="4"/>`;
    o += txt(540, 380, up ? court(p.titre_hausse || "Les marchés montent ↗", 30) : court(p.titre_baisse || "Les marchés baissent ↘", 30), { size: 62, w: 900, f: BLANC, fam: "Inter Display" });
    o += perso({ ...personnage(p.personnage), x: 540, y: 2230, s: .95, humeur: "souci", bras: [10, 10], regard: Math.sin(t * 3) * .8, cligne: cligne(t, .4) }, t);
    const tampon = (k, s) => g(`<rect x="-320" y="-80" width="640" height="160" rx="24" fill="none" stroke="#F27C8A" stroke-width="14"/>` + txt(0, 28, court(s, 14).toUpperCase(), { size: 80, w: 900, f: "#F27C8A", fam: "Inter Display" }), `translate(540 1060) rotate(-8) scale(${1.6 - .6 * eo(k)})`, cl(k * 4));
    const t1 = ph(S, 1), t2 = ph(S, 3);
    if (p.tampon1 && t < (p.tampon2 ? ph(S, 2) : 1e9)) o += tampon(lin(t, t1, t1 + .16), p.tampon1);
    if (p.tampon2 && t >= t2) o += tampon(lin(t, t2, t2 + .16), p.tampon2);
    return o;
  },
  sons(S) { const r = []; if (S.p.tampon1) r.push(["tampon", ph(S, 1), .45]); if (S.p.tampon2) r.push(["tampon", ph(S, 3), .45]); return r; },
};

// 4) Calendrier qui défile (âge, années…), puis un personnage se lance avec un bocal.
GAB.calendrier = {
  dessin(S, t) {
    const p = S.p, de = Number(p.de) || 0, a = Number(p.a) || 0;
    let o = DECORS[p.decor] ? decor(p.decor, t, S.i) + `<rect width="1080" height="1920" fill="#FFFFFF" opacity=".35"/>` : fondMarque("clair", S.i, t);
    const k = eio(lin(t, S.debut + .2, S.debut + 1.5)), v = Math.round(de + (a - de) * k);
    o += `<g transform="translate(540 640)"><rect x="-260" y="-230" width="520" height="470" rx="40" fill="${BLANC}"/><rect x="-260" y="-230" width="520" height="130" rx="40" fill="${BX}"/><rect x="-260" y="-140" width="520" height="40" fill="${BX}"/>`;
    o += `<circle cx="-150" cy="-230" r="20" fill="${NUIT}"/><circle cx="150" cy="-230" r="20" fill="${NUIT}"/>`;
    o += txt(0, -140, court(p.libelle || "", 18).toUpperCase(), { size: 44, w: 900, f: BLANC, ls: 3 });
    const bump = 1 + .08 * Math.max(0, Math.sin(((de + (a - de) * k) % 1) * Math.PI)) * (k < 1 ? 1 : 0);
    o += `<g transform="translate(0 50) scale(${bump}) translate(0 -50)">` + txt(0, 130, String(v), { size: 230, w: 900, f: NUIT, fam: "Inter Display" }) + `</g>`;
    o += txt(0, 205, court(p.unite || "", 12), { size: 48, w: 700, f: GRIS }) + `</g>`;
    if (p.personnage) {
      const kt = lin(t, ph(S, 1), ph(S, 1) + .4);
      o += g(perso({ ...personnage(p.personnage), x: 340, y: 1600, s: 1.05, humeur: "sourire", tel: true, bras: [8, 25], coudes: [0, 175], ecran: "#F3D3D8", regard: .4, cligne: cligne(t, 2.3) }, t), `translate(${(1 - eo(kt)) * -800} 0)`, cl(kt * 4));
    }
    if (p.montant) {
      const d0 = ph(S, 2), kb = lin(t, d0, d0 + .4);
      o += g(bocal(800, 1380, 220, 300, .05 + .1 * lin(t, d0, S.fin), OR), `translate(0 ${(1 - eo(kb)) * 500})`, cl(kb * 2));
      [d0 + .1, d0 + .8].forEach((d) => { const kk = lin(t, d, d + .45); if (kk > 0 && kk < 1) o += piece(800, mix(960, 1310, kk * kk), 28, kk * 300); });
      o += etiquette(800, 980, kb, court(p.montant, 16), "", ARDOISE);
    }
    return o;
  },
  sons(S) {
    const r = Array.from({ length: 10 }, (_, i) => ["tic", S.debut + .2 + i * .13, .45]);
    if (S.p.montant) r.push(["piece", ph(S, 2) + .1, .5], ["piece", ph(S, 2) + .8, .45]);
    return r;
  },
};

// 5) Comparaison chiffrée : deux colonnes (versé / intérêts), compteurs animés. Les valeurs viennent du calcul, jamais de l'IA.
GAB.comparaison = {
  dessin(S, t) {
    const p = S.p, G = p.gauche || {}, D = p.droite || {};
    let o = fondMarque("sombre", S.i, t);
    if (p.bandeau) o += pill(540, 340, Math.max(420, court(p.bandeau, 24).length * 26 + 120), 84, ROSE, txt(540, 356, court(p.bandeau, 24).toUpperCase(), { size: 44, w: 900, f: BX, ls: 3 }));
    const base = 1080, H = 540, max = Math.max(Number(G.valeur) || 1, Number(D.valeur) || 1);
    const tg = ph(S, 0) + (phf(S, 0) - ph(S, 0)) * .4, td = nbP(S) > 1 ? ph(S, 1) : tg + 1.8;
    const kl = eo(lin(t, tg, tg + 1.6)), kr = eo(lin(t, td, td + 1.6));
    const col = (cx, X, k, coul) => {
      const v = Number(X.valeur) || 0, h = H * v / max * k, hv = H * (Number(X.verse) || 0) / max * k;
      let s = `<rect x="${cx - 150}" y="${base - H}" width="300" height="${H}" rx="30" fill="${BLANC}" opacity=".06"/>`;
      s += `<rect x="${cx - 150}" y="${base - h}" width="300" height="${h}" rx="30" fill="${coul}"/>`;
      if (hv > 0) s += `<rect x="${cx - 150}" y="${base - hv}" width="300" height="${hv}" rx="30" fill="#000" opacity=".22"/>`;
      s += txt(cx, base - h - 40, k > .12 ? "≈ " + nb(k > .985 ? (v >= 10000 ? Math.round(v / 1000) * 1000 : Math.round(v / 100) * 100) : v * k) + " " + court(p.unite || "€", 4) : "", { size: 62, w: 900, f: BLANC, fam: "Inter Display" });
      s += txt(cx, 1140, court(X.nom, 22), { size: 40, w: 800, f: BLANC });
      return s;
    };
    o += col(300, G, kl, ROSE) + col(780, D, kr, "#8B9BB0");
    if (G.verse || D.verse) {
      o += `<rect x="150" y="1190" width="34" height="34" rx="8" fill="#9E5A66"/>` + txt(200, 1218, "versé", { anchor: "start", size: 32, w: 600, f: ROSE2 });
      o += `<rect x="360" y="1190" width="34" height="34" rx="8" fill="${ROSE}"/>` + txt(410, 1218, "intérêts accumulés", { anchor: "start", size: 32, w: 600, f: ROSE2 });
    }
    if (p.note) o += txt(540, 1280, court(p.note, 60), { size: 30, w: 500, f: ROSE2, op: .9 });
    const pg = personnage(G.personnage), pd = personnage(D.personnage);
    if (G.personnage) o += perso({ ...pg, x: 300, y: 1930, s: .5, humeur: "sourire", cligne: cligne(t) }, t);
    if (D.personnage) o += perso({ ...pd, x: 780, y: 1930, s: .5, humeur: t > td + 1.6 ? "souci" : "neutre", cligne: cligne(t, 1) }, t);
    return o;
  },
  sons(S) {
    const tg = ph(S, 0) + (phf(S, 0) - ph(S, 0)) * .4, td = nbP(S) > 1 ? ph(S, 1) : tg + 1.8, r = [];
    for (const d of [tg, td]) { for (let i = 0; i < 8; i++) r.push(["tic", d + i * .19, .3]); r.push(["kaching", d + 1.6, .45]); }
    return r;
  },
};

// 6) Égalité : deux personnages, même effort, puis une question.
GAB.egalite = {
  dessin(S, t) {
    const p = S.p;
    let o = DECORS[p.decor] ? decor(p.decor, t, S.i) + `<rect width="1080" height="1920" fill="#FFFFFF" opacity=".35"/>` : fondMarque("clair", S.i, t);
    const k1 = lin(t, S.debut + .05, S.debut + .4);
    let s = perso({ ...personnage(p.personnage_gauche || "lea"), x: 290, y: 1340, s: .95, humeur: "sourire", cligne: cligne(t) }, t) + perso({ ...personnage(p.personnage_droite || "tom_age"), x: 790, y: 1340, s: .95, humeur: "neutre", cligne: cligne(t, 1.3) }, t);
    s += pill(290, 570, 340, 100, ROSE, txt(290, 588, court(p.gauche, 14), { size: 44, w: 900, f: BX })) + pill(790, 570, 340, 100, "#8B9BB0", txt(790, 588, court(p.droite, 14), { size: 44, w: 900, f: BLANC })) + txt(540, 604, p.signe === "≠" ? "≠" : "=", { size: 100, w: 900, f: BX });
    o += g(s, `translate(540 900) scale(${.85 + .15 * back(k1)}) translate(-540 -900)`, cl(k1 * 3));
    if (p.question) { const kq = lin(t, ph(S, 1), ph(S, 1) + .3); o += txt(540, 400, court(p.question, 26), { size: 66, w: 900, f: NUIT, fam: "Inter Display", op: cl(kq * 3) }); }
    return o;
  },
  sons(S) { return [["pop", S.debut + .1, .4], ...(S.p.question ? [["pop", ph(S, 1), .35]] : [])]; },
};

// 7) Grand mot qui claque (« 10 ANS »), puis boule de neige « intérêts sur intérêts ».
GAB.grand_mot = {
  dessin(S, t) {
    const p = S.p, k10 = lin(t, S.debut + .05, S.debut + .3), tb = nbP(S) > 1 ? ph(S, 1) : S.debut + 1.2;
    let o = fondMarque("clair", S.i, t);
    const mot = court(p.texte, 12).toUpperCase(), monte = p.boule ? eo(lin(t, tb - .2, tb + .4)) : 0;
    o += g(txt(0, 0, mot, { size: mot.length > 7 ? 170 : 230, w: 900, f: BX, fam: "Inter Display" }), `translate(540 ${mix(800, 500, monte)}) scale(${mix(1.25 - .25 * back(k10), .7, monte)})`, cl(k10 * 4));
    if (p.boule && t > tb - .2) {
      const kk = lin(t, tb, S.fin - .1);
      o += `<path d="M-20 900 L1100 1380 L1100 1920 L-20 1920Z" fill="#F6E6E8"/><path d="M-20 900 L1100 1380" stroke="${ROSE}" stroke-width="8"/>`;
      for (let i = 0; i < 14; i++) { const xx = 1100 - ((i * 97 + t * 260) % 1180), yy = 900 + (xx + 20) * 480 / 1120 + 30 + (i % 4) * 40; o += `<circle cx="${xx}" cy="${yy}" r="${4 + i % 3}" fill="${ROSE}" opacity=".35"/>`; }
      const x = mix(150, 760, eio(kk)), y = 900 + (x + 20) * 480 / 1120, r = mix(50, 185, eio(kk));
      o += `<g transform="translate(${x} ${y - r})"><circle r="${r}" fill="${ROSE}"/><circle r="${r}" fill="none" stroke="${BX}" stroke-width="8"/><g transform="rotate(${kk * 900})"><path d="M${-r * .6} ${-r * .2} q${r * .3} ${-r * .3} ${r * .6} 0" stroke="${BX}" stroke-width="7" fill="none" opacity=".5"/><path d="M${-r * .1} ${r * .4} q${r * .3} ${-r * .2} ${r * .6} 0" stroke="${BX}" stroke-width="7" fill="none" opacity=".5"/></g>` + (r > 90 ? txt(0, r * .12, "€", { size: r * .8, w: 900, f: BX }) : "") + `</g>`;
      if (p.legende) o += txt(540, 770, court(p.legende, 26), { size: 62, w: 900, f: NUIT, fam: "Inter Display", op: cl(lin(t, tb + .4, tb + .7) * 3) });
    } else if (p.legende && !p.boule) o += txt(540, 1020, court(p.legende, 30), { size: 58, w: 800, f: NUIT, op: cl(lin(t, tb, tb + .3) * 3) });
    return o;
  },
  sons(S) { return [["pop", S.debut + .05, .55]]; },
};

// 8) Bocaux de tailles différentes (« chaque situation est unique »), puce horloge, courbe qui monte.
GAB.bocaux = {
  dessin(S, t) {
    const p = S.p;
    let o = fondMarque("clair", S.i, t);
    const k0 = lin(t, S.debut + .05, S.debut + .35);
    if (p.titre) o += g(pill(540, 340, Math.max(500, court(p.titre, 30).length * 24 + 120), 96, BX, txt(540, 358, court(p.titre, 30), { size: 44, w: 900, f: BLANC })), `translate(540 340) scale(${back(k0)}) translate(-540 -340)`, cl(k0 * 3));
    const cols = (p.colonnes || []).slice(0, 3), xs = cols.length === 2 ? [330, 750] : [200, 540, 880];
    const kr = eo(lin(t, ph(S, 1), ph(S, 1) + 1.3));
    cols.forEach((c, i) => {
      const ki = lin(t, S.debut + .4 + i * .25, S.debut + .8 + i * .25), cx = xs[i], niv = cl(Number(c.niveau) || .5, .1, .95);
      o += g(bocal(cx, 1230, 270, 400, .06 + (niv - .06) * kr, OR) + pill(cx, 1300, 250, 72, i === cols.length - 1 ? BX : BLANC, txt(cx, 1324, court(c.libelle, 12), { size: 38, w: 800, f: i === cols.length - 1 ? BLANC : BX })), `translate(0 ${(1 - eo(ki)) * 120})`, cl(ki * 2.5));
      for (let j = 0; j < 1 + i; j++) { const d = ph(S, 1) + j * .3 + i * .08, k = lin(t, d, d + .4); if (k > 0 && k < 1) o += piece(cx, mix(760, 1100, k * k), 30, k * 300); }
    });
    if (p.puce) { const kt = lin(t, ph(S, 2), ph(S, 2) + .34); if (kt > 0) o += g(horloge(0, 0, 60, t, .5) + txt(90, 18, court(p.puce, 18), { anchor: "start", size: 44, w: 900, f: BX }), `translate(300 470) scale(${back(kt) * 1.1})`, cl(kt * 3)); }
    if (p.courbe) {
      const kc = lin(t, ph(S, 3), ph(S, 3) + 1.2);
      if (kc > 0) {
        const n = 40, pts = []; for (let i = 0; i <= n; i++) pts.push(`${i ? "L" : "M"}${150 + i * 19} ${760 - Math.pow(i / n, 2.2) * 150}`);
        o += `<path d="${pts.slice(0, Math.max(2, Math.round(kc * (n + 1)))).join(" ")}" stroke="${VERT}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (kc > .9) o += g(txt(0, 0, court(p.courbe, 14), { size: 48, w: 900, f: VERT }), `translate(900 570) scale(${back(lin(t, ph(S, 3) + 1.1, ph(S, 3) + 1.4))})`);
      }
    }
    return o;
  },
  sons(S) { const r = [["pop", S.debut + .1, .45], ["piece", ph(S, 1) + .05, .5], ["piece", ph(S, 1) + .35, .45], ["piece", ph(S, 1) + .65, .45]]; if (S.p.puce) r.push(["ping", ph(S, 2), .45]); if (S.p.courbe) r.push(["kaching", ph(S, 3) + 1.0, .35]); return r; },
};

// 9) Chiffre clé (taux, inflation, plafond…) avec sa source.
GAB.chiffre = {
  dessin(S, t) {
    const p = S.p, k = lin(t, S.debut + .1, S.debut + .4);
    let o = fondMarque("sombre", S.i, t);
    if (p.bandeau) o += pill(540, 380, Math.max(420, court(p.bandeau, 26).length * 26 + 120), 84, ROSE, txt(540, 396, court(p.bandeau, 26).toUpperCase(), { size: 40, w: 900, f: BX, ls: 3 }));
    const v = compteurTexte(court(p.valeur, 14), lin(t, S.debut + .1, S.debut + 1.1));
    o += g(`<rect x="90" y="-200" width="900" height="400" rx="48" fill="${BLANC}"/>` + txt(540, 40, v, { size: court(p.valeur, 14).length > 9 ? 120 : court(p.valeur, 14).length > 6 ? 150 : 200, w: 900, f: BX, fam: "Inter Display" }) + txt(540, 130, court(p.libelle, 34), { size: 42, w: 700, f: NUIT }),
      `translate(0 820) translate(540 0) ${slam(k)} translate(-540 0)`, cl(k * 3));
    if (p.source) o += txt(540, 1110, "Source : " + court(p.source, 50), { size: 30, w: 500, f: ROSE2, op: cl(lin(t, S.debut + .8, S.debut + 1.1)) });
    if (p.comparaison) { const kc = lin(t, ph(S, 1), ph(S, 1) + .3); o += g(pill(540, 1240, Math.max(460, court(p.comparaison, 34).length * 22 + 100), 84, "#5A1322", txt(540, 1255, court(p.comparaison, 34), { size: 38, w: 700, f: ROSE2 })), "", cl(kc * 3)); }
    return o;
  },
  sons(S) { return [["pop", S.debut + .1, .5], ...Array.from({ length: 7 }, (_, i) => ["tic", S.debut + .15 + i * .13, .3]), ...(S.p.comparaison ? [["pop", ph(S, 1), .35]] : [])]; },
};

// 10) Liste de 2 ou 3 points (réflexes, étapes, pièges).
GAB.liste = {
  dessin(S, t) {
    const p = S.p, pts = (p.points || []).slice(0, 3);
    let o = fondMarque("clair", S.i, t);
    const k0 = lin(t, S.debut + .05, S.debut + .35);
    o += g(txt(540, 420, court(p.titre, 28), { size: 64, w: 900, f: BX, fam: "Inter Display" }), "", cl(k0 * 3));
    pts.forEach((s, i) => {
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .7 + i * .7, k = lin(t, d, d + .3), y = 620 + i * 230;
      o += g(`<rect x="-440" y="-90" width="880" height="180" rx="36" fill="${BLANC}"/><circle cx="-350" cy="0" r="52" fill="${BX}"/>` + txt(-350, 20, String(i + 1), { size: 56, w: 900, f: BLANC }) + txt(-270, 16, court(s, 30), { anchor: "start", size: 44, w: 800, f: NUIT }),
        `translate(${540 + (1 - eo(k)) * 300} ${y})`, cl(k * 3));
    });
    return o;
  },
  sons(S) { return (S.p.points || []).slice(0, 3).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .7 + i * .7, .4]); },
};

// 11) Idée reçue / réalité.
GAB.mythe = {
  dessin(S, t) {
    const p = S.p, tr = nbP(S) > 1 ? ph(S, 1) : S.debut + (S.fin - S.debut) / 2;
    let o = fondMarque("clair", S.i, t);
    const k1 = lin(t, S.debut + .05, S.debut + .35), kx = lin(t, tr, tr + .2), k2 = lin(t, tr + .25, tr + .55);
    const carte = (lib, texte, fondC, coulT, coulL) => { const L = lignes(court(texte, 70), 28); return `<rect x="-440" y="-160" width="880" height="320" rx="40" fill="${fondC}"/>` + txt(0, -80, lib, { size: 36, w: 900, f: coulL, ls: 4 }) + L.map((l, i) => txt(0, (L.length === 1 ? 30 : 0) + i * 66, l, { size: 50, w: 800, f: coulT })).join(""); };
    o += g(carte("IDÉE REÇUE", p.mythe, BLANC, NUIT, "#B0475A"), `translate(540 ${560 - eo(kx) * 40}) scale(${1 - .08 * eo(kx)})`, cl(k1 * 3) * (1 - .45 * kx));
    if (kx > 0) o += g(`<path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke="#D2455A" stroke-width="26" stroke-linecap="round"/>`, `translate(900 470) scale(${back(kx)})`);
    o += g(carte("EN RÉALITÉ", p.realite, BX, BLANC, ROSE2), `translate(540 ${960 + (1 - eo(k2)) * 200})`, cl(k2 * 3));
    return o;
  },
  sons(S) { const tr = nbP(S) > 1 ? ph(S, 1) : S.debut + (S.fin - S.debut) / 2; return [["pop", S.debut + .05, .4], ["tampon", tr, .4], ["ping", tr + .25, .4]]; },
};

// 12) Sablier : le temps qui passe, gros message final.
GAB.sablier = {
  dessin(S, t) {
    const p = S.p;
    let o = fondMarque("sombre", S.i, t);
    const k = lin(t, S.debut, S.fin), ks = eo(lin(t, S.debut, S.debut + .4));
    let s = `<rect x="-200" y="-330" width="400" height="40" rx="14" fill="${ROSE}"/><rect x="-200" y="290" width="400" height="40" rx="14" fill="${ROSE}"/>`;
    s += `<path d="M-160 -290 Q-160 -40 -20 0 Q-160 40 -160 290 L160 290 Q160 40 20 0 Q160 -40 160 -290Z" fill="${BLANC}" fill-opacity=".12" stroke="${BLANC}" stroke-width="8"/>`;
    const top = mix(.95, .1, k), bot = mix(.08, .9, k);
    s += `<clipPath id="ch"><path d="M-160 -290 Q-160 -40 -20 0 Q-160 40 -160 290 L160 290 Q160 40 20 0 Q160 -40 160 -290Z"/></clipPath>`;
    s += `<g clip-path="url(#ch)"><rect x="-170" y="${-290 * top}" width="340" height="${290 * top}" fill="${OR}"/><path d="M-170 290 L-170 ${290 - 220 * bot} Q0 ${290 - 300 * bot} 170 ${290 - 220 * bot} L170 290Z" fill="${OR}"/><rect x="-5" y="0" width="10" height="290" fill="${OR}"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${Math.sin(i * 2.1) * 3}" cy="${((t * 400 + i * 48) % 280)}" r="5" fill="${OR2}"/>`).join("")}</g>`;
    o += g(s, `translate(540 720) scale(${.6 + .4 * back(ks)}) rotate(${Math.sin(t * 1.2) * 2})`);
    const tq = ph(S, 1), tf = ph(S, nbP(S) - 1);
    if (p.questions && nbP(S) > 2 && t > tq && t < tf) for (let i = 0; i < 3; i++) { const kk = lin(t, tq + .1 + i * .15, tq + .5 + i * .15); o += txt(260 + i * 280, 440 - kk * 40, "?", { size: 120, w: 900, f: ROSE, op: cl(kk * 3) * (1 - lin(t, tf - .3, tf)) }); }
    const kf = lin(t, tf, tf + .37);
    if (p.gros) o += g((p.haut ? txt(540, 0, court(p.haut, 30), { size: 56, w: 700, f: ROSE2 }) : "") + txt(540, 120, court(p.gros, 12).toUpperCase(), { size: 140, w: 900, f: BLANC, fam: "Inter Display" }), `translate(0 ${1110 + (1 - eo(kf)) * 60})`, kf);
    return o;
  },
  sons(S) { return Array.from({ length: Math.max(1, Math.floor((S.fin - S.debut) / .6)) }, (_, i) => ["tic", S.debut + .1 + i * .6, .3]); },
  // pas de sous-titre quand le gros message est affiché (évite le doublon)
  masqueSousTitres(S, t) { return !!S.p.gros && t >= ph(S, nbP(S) - 1); },
};

// ---------------------------------------------------------------- Nouvelles scènes (variété) : barres, icônes, citation, questions-réponses, photo
// Pictogrammes au trait (64 px, centrés sur 0,0), dessinés par le code : aucune image externe, aucune marque.
const PICTOS = {
  maison: "M-28 6 L0 -22 L28 6 M-20 0 V26 H20 V0 M-6 26 V10 H6 V26",
  piece: "M0 -26 A26 26 0 1 0 0.01 -26 M-8 -10 Q0 -16 8 -10 M-10 0 H6 M-10 7 H6 M8 10 Q0 16 -8 10",
  calendrier: "M-24 -16 H24 V26 H-24 Z M-24 -4 H24 M-12 -24 V-10 M12 -24 V-10 M-12 8 H-4 M4 8 H12",
  bouclier: "M0 -26 L22 -16 V2 Q22 20 0 28 Q-22 20 -22 2 V-16 Z M-9 2 L-2 9 L11 -5",
  cadeau: "M-24 -6 H24 V4 H-24 Z M-20 4 V26 H20 V4 M0 -6 V26 M0 -6 Q-14 -24 -18 -12 Q-16 -6 0 -6 Q14 -24 18 -12 Q16 -6 0 -6",
  famille: "M-14 -14 A7 7 0 1 0 -13.99 -14 M14 -14 A7 7 0 1 0 14.01 -14 M-24 22 Q-24 0 -14 0 Q-4 0 -4 22 M4 22 Q4 0 14 0 Q24 0 24 22",
  graphique: "M-26 24 H26 M-18 24 V8 M-6 24 V-4 M6 24 V2 M18 24 V-16 M-20 -2 L-6 -14 L6 -8 L20 -24",
  cle: "M-14 -6 A10 10 0 1 0 -13.99 -6 M-4 -6 H26 M18 -6 V4 M10 -6 V2",
  document: "M-18 -26 H8 L18 -16 V26 H-18 Z M8 -26 V-16 H18 M-10 -4 H10 M-10 6 H10 M-10 16 H4",
  balance: "M0 -24 V24 M-14 24 H14 M-24 -14 H24 M-24 -14 L-32 6 H-16 Z M24 -14 L16 6 H32 Z",
  sablier: "M-16 -26 H16 M-16 26 H16 M-12 -26 Q-12 -6 0 0 Q12 -6 12 -26 M-12 26 Q-12 6 0 0 Q12 6 12 26",
  cible: "M0 -26 A26 26 0 1 0 0.01 -26 M0 -14 A14 14 0 1 0 0.01 -14 M0 -4 A4 4 0 1 0 0.01 -4 M0 0 L22 -22",
  tirelire: "M-24 2 Q-24 -18 0 -18 Q22 -18 24 0 Q24 16 12 20 V26 H4 V22 H-6 V26 H-14 V18 Q-24 14 -24 2 M-4 -18 V-24 M14 -6 A2 2 0 1 0 14.01 -6",
  entreprise: "M-24 26 V-10 H-4 V26 M-4 26 V-24 H24 V26 M-28 26 H28 M4 -14 H14 M4 -4 H14 M4 6 H14 M-16 0 H-10 M-16 10 H-10",
  retraite: "M-14 -24 A6 6 0 1 0 -13.99 -24 M-14 -12 V10 H8 L14 26 M-14 0 H6 M-22 26 Q-28 6 -14 -4",
  pourcent: "M-18 22 L18 -22 M-12 -16 A6 6 0 1 0 -11.99 -16 M12 16 A6 6 0 1 0 12.01 16",
  coeur: "M0 24 Q-28 4 -24 -12 Q-18 -26 0 -12 Q18 -26 24 -12 Q28 4 0 24",
  horloge: "M0 -26 A26 26 0 1 0 0.01 -26 M0 -14 V0 L12 8",
  valise: "M-26 -10 H26 V24 H-26 Z M-10 -10 V-20 H10 V-10 M-26 4 H26",
  ampoule: "M-14 -4 Q-20 -26 0 -28 Q20 -26 14 -4 Q8 4 8 12 H-8 Q-8 4 -14 -4 M-8 18 H8 M-5 24 H5",
};
function picto(nom, x, y, taille = 1, coul = BX) {
  const d = PICTOS[nom] || PICTOS.ampoule;
  return `<g transform="translate(${x} ${y}) scale(${taille})"><path d="${d}" fill="none" stroke="${coul}" stroke-width="${4.5 / taille}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

// Graphique en barres : 2 à 5 valeurs de la source, une barre par phrase (après la phrase d'introduction).
GAB.barres = {
  dessin(S, t) {
    const p = S.p, br = (p.barres || []).slice(0, 5), n = Math.max(1, br.length);
    let o = fondMarque("clair", S.i, t);
    if (p.titre) o += txt(540, 400, court(p.titre, 34), { size: 58, w: 900, f: BX, fam: "Inter Display", op: cl(lin(t, S.debut, S.debut + .3) * 3) });
    const vals = br.map((b) => nombreDans(b.valeur) || 0), max = Math.max(1e-9, ...vals);
    const x0 = 120, L = 840, w = Math.min(150, L / n - 30), base = 1420, hmax = 780;
    o += `<line x1="${x0 - 20}" y1="${base}" x2="${x0 + L + 20}" y2="${base}" stroke="${BX}" stroke-opacity=".25" stroke-width="4"/>`;
    br.forEach((b, i) => {
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * (S.fin - S.debut - .6) / n, k = eo(lin(t, d, d + .6));
      const cx = x0 + (i + .5) * L / n, h = Math.max(24, hmax * vals[i] / max) * k;
      o += `<rect x="${cx - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="14" fill="${i === n - 1 ? BX : ROSE}"/>`;
      if (k > .05) o += txt(cx, base - h - 26, compteurTexte(court(b.valeur, 14), k), { size: 40, w: 900, f: NUIT, op: cl(k * 2) });
      lignes(court(b.libelle, 30), 12, 2).forEach((l, m) => { o += txt(cx, base + 56 + m * 40, l, { size: 32, w: 600, f: GRIS, op: cl(k * 3) }); });
    });
    if (p.source) o += txt(540, 1590, "Source : " + court(p.source, 50), { size: 28, w: 500, f: GRIS, op: .9 });
    return o;
  },
  sons(S) { return (S.p.barres || []).slice(0, 5).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * .7, .3]); },
};

// Grille d'icônes : 2 à 6 éléments (pictogramme + libellé) qui apparaissent ensemble ou au fil des phrases.
GAB.icones = {
  dessin(S, t) {
    const p = S.p, it = (p.items || []).slice(0, 6), n = Math.max(1, it.length), cols = n <= 2 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols);
    let o = fondMarque(S.i % 2 ? "sombre" : "clair", S.i, t);
    const sombre = S.i % 2 === 1;
    if (p.titre) o += txt(540, 420, court(p.titre, 34), { size: 58, w: 900, f: sombre ? BLANC : BX, fam: "Inter Display", op: cl(lin(t, S.debut, S.debut + .3) * 3) });
    const cw = 900 / cols, ch = Math.min(380, 1000 / rows);
    it.forEach((e, i) => {
      const r = Math.floor(i / cols), c = i % cols, cx = 90 + cw * (c + .5), cy = 600 + ch * r + ch / 2 - 60;
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .3 + i * .25, k = lin(t, d, d + .35);
      o += g(`<circle cx="${cx}" cy="${cy}" r="92" fill="${sombre ? ROSE2 : BLANC}"/>` + picto(e.icone, cx, cy, 2) +
        lignes(court(e.libelle, 36), 16, 2).map((l, m) => txt(cx, cy + 150 + m * 44, l, { size: 38, w: 800, f: sombre ? BLANC : NUIT })).join(""),
        `translate(${cx} ${cy}) scale(${.7 + .3 * back(k)}) translate(${-cx} ${-cy})`, cl(k * 3));
    });
    return o;
  },
  sons(S) { return (S.p.items || []).slice(0, 6).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .3 + i * .25, .3]); },
};

// Citation d'un texte officiel (mots exacts de la source), avec sa référence.
GAB.citation = {
  dessin(S, t) {
    const p = S.p, k = lin(t, S.debut + .1, S.debut + .6), k2 = lin(t, S.debut + .6, S.debut + 1);
    let o = fondMarque("sombre", S.i, t);
    o += txt(540, 680, "“", { size: 300, w: 700, f: ROSE, op: cl(k * 2), fam: "Georgia, serif" });
    const L = lignes(court(p.citation, 170), 24, 6);
    L.forEach((l, i) => { o += g(txt(540, 760 + i * 84, l, { size: 60, w: 700, f: BLANC }), `translate(0 ${(1 - eo(k)) * 30})`, cl(k * 2)); });
    const y = 760 + L.length * 84 + 40;
    if (p.auteur) o += g(`<rect x="440" y="${y}" width="200" height="6" rx="3" fill="${ROSE}"/>` + txt(540, y + 70, court(p.auteur, 44), { size: 38, w: 700, f: ROSE2 }), "", k2);
    return o;
  },
  sons(S) { return [["pop", S.debut + .15, .35]]; },
  masqueSousTitres() { return true; },   // la citation est écrite à l'écran
};

// Carte question puis réponse (la question avec la 1re phrase, la réponse avec la suivante).
GAB.questions = {
  dessin(S, t) {
    const p = S.p, tr = nbP(S) > 1 ? ph(S, 1) : S.debut + (S.fin - S.debut) * .45, k = lin(t, S.debut, S.debut + .35), kr = lin(t, tr, tr + .4);
    let o = fondMarque("clair", S.i, t);
    o += g(pill(540, 470, 300, 84, BX, txt(540, 486, "QUESTION", { size: 38, w: 900, f: BLANC, ls: 6 })), "", cl(k * 3));
    const Q = lignes(court(p.question, 90), 22, 4);
    o += g(`<rect x="90" y="560" width="900" height="${Q.length * 74 + 80}" rx="36" fill="${BLANC}"/>` + Q.map((l, i) => txt(540, 640 + i * 74, l, { size: 58, w: 800, f: NUIT })).join(""), `translate(0 ${(1 - eo(k)) * 40})`, cl(k * 3));
    const y = 560 + Q.length * 74 + 140, R = lignes(court(p.reponse, 130), 28, 4);
    o += g(`<rect x="90" y="${y}" width="900" height="${R.length * 64 + 120}" rx="36" fill="${BX}"/>` + txt(150, y + 70, "RÉPONSE", { anchor: "start", size: 30, w: 900, f: ROSE2, ls: 4 })
      + R.map((l, i) => txt(150, y + 130 + i * 64, l, { anchor: "start", size: 46, w: 700, f: BLANC })).join(""), `translate(0 ${(1 - eo(kr)) * 60})`, cl(kr * 3));
    return o;
  },
  sons(S) { return [["pop", S.debut + .1, .35], ["ping", nbP(S) > 1 ? ph(S, 1) : S.debut + 1.5, .3]]; },
  masqueSousTitres() { return true; },   // question et réponse sont écrites
};

// Photo plein écran libre de droits (domaine public ou CC0), léger mouvement de caméra, légende courte.
GAB.photo = {
  dessin(S, t) {
    const p = S.p, src = p.image_src, k = lin(t, S.debut, S.fin), kl = lin(t, S.debut + .3, S.debut + .8);
    let o = "";
    if (src) {
      const z = 1.06 + .08 * k, dx = (GRAINE % 2 ? -1 : 1) * 30 * k;
      o += `<rect width="1080" height="1920" fill="#000"/><image href="${src}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice" transform="translate(540 960) scale(${z}) translate(${-540 + dx} -960)"/>`;
      // voile sombre en haut (légende) et en bas (sous-titres)
      o += `<defs><linearGradient id="ph${S.i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A0509" stop-opacity=".85"/><stop offset=".32" stop-color="#000" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1A0509" stop-opacity=".8"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#ph${S.i})"/>`;
    } else o += fondMarque("sombre", S.i, t);
    if (p.legende) {
      const L = lignes(court(p.legende, 60), 22, 2);
      o += g(`<rect x="440" y="350" width="200" height="8" rx="4" fill="${ROSE}"/>` + L.map((l, i) => txt(540, 450 + i * 76, l, { size: 64, w: 900, f: BLANC, fam: "Inter Display" })).join(""), `translate(0 ${(1 - eo(kl)) * -30})`, cl(kl * 2));
    }
    if (src) o += txt(540, 1600, "Photo libre de droits" + (p.image_credit ? " · " + court(p.image_credit, 40) : ""), { size: 24, w: 500, f: BLANC, op: .7 });
    return o;
  },
  sons(S) { return []; },
};

// 13) Carte de fin professionnelle (coordonnées du cabinet, mentions légales), sur fond uni bordeaux ou clair.
// Toutes gardent le logo, la phrase d'appel, l'offre, les coordonnées et les mentions, aux mêmes places (lisibles en 9:16 et 4:5).
const FIN_STYLES = {
  // fond uni bordeaux, très légère lumière derrière le logo (aucun motif)
  bordeaux: {
    c: { q: ROSE2, pill: BLANC, pillT: BX, boite: "#000", boiteOp: .22, txt: BLANC, ment: ROSE2, trait: ROSE },
    fond() { return `<defs><radialGradient id="fb" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#6E0E22"/><stop offset="1" stop-color="#3A0611"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#fb)"/>`; },
  },
  // fond uni clair
  clair: {
    c: { q: NUIT, pill: BX, pillT: BLANC, boite: BLANC, boiteOp: .9, txt: NUIT, ment: "#6E5F64", trait: BX },
    fond() { return fond(CREME, "#F1E6E2"); },
  },
};
// anciennes mises en scène : la claire reste claire, toutes les autres deviennent bordeaux unies
FIN_STYLES.cercles = FIN_STYLES.horizon = FIN_STYLES.courbe = FIN_STYLES.maison = FIN_STYLES.bandes = FIN_STYLES.bordeaux;
GAB.fin = {
  dessin(S, t) {
    const p = S.p, C = CONFIG, st = FIN_STYLES[p.style] || FIN_STYLES.cercles, c = st.c;
    let o = st.fond(t, S);
    // fins courtes : logo et coordonnées (« courte ») ou logo et mentions seulement (« sans » appel commercial)
    const bref = p.mode === "courte" || p.mode === "sans";
    const q = bref ? "" : court(p.question || "Et si on prenait le temps d'en parler ?", 60), cut = q.length > 26 ? q.lastIndexOf(" ", Math.min(q.length - 1, Math.max(26, Math.ceil(q.length / 2)))) : -1;
    const k1 = lin(t, S.debut + .15, S.debut + .6), tq = q.length > 40 ? 54 : 62;
    if (q) o += g(txt(540, 470, cut > 0 ? q.slice(0, cut) : q, { size: tq, w: 700, f: c.q }) + (cut > 0 ? txt(540, 548, q.slice(cut + 1), { size: tq, w: 700, f: c.q }) : ""), `translate(0 ${(1 - eo(k1)) * 40})`, k1);
    // le logo arrive avec le nom du cabinet (avant-dernière phrase), l'offre avec la dernière phrase
    const t2 = bref ? S.debut + .1 : nbP(S) > 2 ? ph(S, nbP(S) - 2) : nbP(S) > 1 ? ph(S, 1) : S.debut + 1.2, k2 = lin(t, t2, t2 + .5);
    const nomCab = court(C.cabinet || "BSC PATRIMOINE", 30).toUpperCase(), [m1, ...m2] = nomCab.split(" ");
    // Logo officiel du cabinet B-S-C Patrimoine (image fournie par le cabinet) ; un autre cabinet garde son nom en texte.
    const logo = /\bB-?S-?C\b/.test(nomCab)
      ? `<line x1="400" y1="640" x2="680" y2="640" stroke="${c.trait}" stroke-width="4"/>` +
        `<rect x="114" y="684" width="852" height="252" rx="10" fill="#000" opacity=".28"/>` +
        `<image href="logo-bsc.png" x="120" y="678" width="840" height="236" preserveAspectRatio="xMidYMid meet"/>` +
        `<rect x="120" y="678" width="840" height="236" fill="none" stroke="${BLANC}" stroke-opacity=".35" stroke-width="2"/>`
      : `<line x1="400" y1="640" x2="680" y2="640" stroke="${c.trait}" stroke-width="4"/>` + txt(540, 800, m1, { size: m1.length > 6 ? 120 : 180, w: 900, f: c.txt, fam: "Inter Display", ls: 16 }) + (m2.length ? txt(540, 890, m2.join(" "), { size: 66, w: 600, f: c.txt, ls: 24 }) : "") + txt(540, 955, court(C.activite || "Conseil en gestion de patrimoine", 44), { size: 34, w: 500, f: c.ment, ls: 1 });
    o += g(logo, `translate(540 780) scale(${.92 + .08 * eo(k2)}) translate(-540 -780)`, k2);
    const t3 = nbP(S) > 2 ? ph(S, nbP(S) - 1) : t2 + 1, k3 = lin(t, t3, t3 + .34);
    if (!bref) o += g(pill(540, 1080, 840, 104, c.pill, txt(540, 1098, court(p.offre || "Premier échange offert · sans engagement", 44), { size: 36, w: 800, f: c.pillT })), `translate(540 1080) scale(${back(k3)}) translate(-540 -1080)`, cl(k3 * 3));
    const t4 = bref ? S.debut + .6 : phf(S, nbP(S) - 1) - .4, k4 = lin(t, t4, t4 + .4), k5 = lin(t, t4 + .3, t4 + .7);
    const contacts = p.mode === "sans" ? [] : [C.mail && ["mail", C.mail], C.telephone && ["tel", C.telephone]].filter(Boolean);
    if (contacts.length) {
      o += g(`<rect x="150" y="1180" width="780" height="${contacts.length * 120 + 40}" rx="36" fill="${c.boite}" opacity="${c.boiteOp}"/>`, "", k4);
      contacts.forEach(([ic, v], i) => { o += g(icone(ic, 240, 1260 + i * 120) + txt(305, 1276 + i * 120, court(v, 34), { anchor: "start", size: 46, w: 800, f: c.txt, ls: 1 }), `translate(${(1 - eo(i ? k5 : k4)) * -60} 0)`, i ? k5 : k4); });
    }
    // mentions sur 1 ou 2 lignes chacune (jamais coupées), avec un bandeau discret pour la lisibilité
    const ment = (C.mentions || []).slice(0, 4).flatMap((m) => lignes(court(m, 140), 74, 2)).slice(0, 6);
    if (ment.length && p.style && p.style !== "clair" && p.style !== "bordeaux" && p.style !== "cercles") o += `<rect x="70" y="1468" width="940" height="${ment.length * 34 + 26}" rx="20" fill="#000" opacity=".28"/>`;
    ment.forEach((m, i) => { o += txt(540, 1496 + i * 34, m, { size: 25, w: 500, f: c.ment, op: .9 }); });
    return o;
  },
  sons(S) { if (S.p.mode === "courte" || S.p.mode === "sans") return [["pop", S.debut + .15, .35]]; const t3 = nbP(S) > 2 ? ph(S, nbP(S) - 1) : (nbP(S) > 1 ? ph(S, 1) : S.debut + 1.2) + 1; return [["pop", t3, .4]]; },   // rien après la dernière phrase
  masqueSousTitres() { return true; },
};

// ---------------------------------------------------------------- Vidéos de cours (rubrique « Apprendre ») : visuels pédagogiques
// Textes très courts à l'écran, la voix explique ; rien n'est affiché qui ne vienne de la fiche vérifiée.

// Carte de chapitre : numéro, titre, progression dans le cours.
// Ouverture d'un cours : le titre de la fiche (sert aussi de miniature).
GAB.titre_cours = {
  dessin(S, t) {
    const p = S.p;
    let o = fondMarque("sombre", S.i, t);
    const k = lin(t, S.debut + .05, S.debut + .45), k2 = lin(t, S.debut + .25, S.debut + .75), k3 = lin(t, S.debut + .6, S.debut + 1.1);
    o += g(pill(540, 560, 420, 90, ROSE, txt(540, 577, "COURS VIDÉO", { size: 42, w: 900, f: BX, ls: 7 })), `translate(540 560) scale(${back(k)}) translate(-540 -560)`, cl(k * 3));
    const L = lignes(court(p.titre, 70), 16, 3);
    L.forEach((l, i) => { o += g(txt(540, 790 + i * 124, l, { size: 108, w: 900, f: BLANC, fam: "Inter Display" }), `translate(0 ${(1 - eo(k2)) * 50})`, k2); });
    const y = 790 + L.length * 124;
    o += `<rect x="440" y="${y - 40}" width="${200 * eo(k3)}" height="10" rx="5" fill="${ROSE}"/>`;
    lignes(court(p.sous_titre, 100), 34, 3).forEach((l, i) => { o += txt(540, y + 50 + i * 54, l, { size: 42, w: 500, f: ROSE2, op: k3 }); });
    o += txt(540, 1400, "APPRENDRE · L'ESSENTIEL EN VIDÉO", { size: 30, w: 700, f: ROSE2, ls: 4, op: k3 * .8 });
    return o;
  },
  sons(S) { return [["pop", S.debut + .1, .45]]; },
  masqueSousTitres() { return true; },
};

GAB.chapitre = {
  dessin(S, t) {
    const p = S.p, n = Number(p.numero) || 1, tot = Math.max(n, Number(p.total) || n);
    let o = fondMarque("sombre", S.i, t);
    const k = lin(t, S.debut + .05, S.debut + .45), k2 = lin(t, S.debut + .3, S.debut + .8);
    o += g(pill(540, 640, 360, 86, ROSE, txt(540, 656, `CHAPITRE ${n}`, { size: 40, w: 900, f: BX, ls: 6 })), `translate(540 640) scale(${back(k)}) translate(-540 -640)`, cl(k * 3));
    const L = lignes(court(p.titre, 60), 18, 3);
    L.forEach((l, i) => { o += g(txt(540, 860 + i * 112, l, { size: 96, w: 900, f: BLANC, fam: "Inter Display" }), `translate(0 ${(1 - eo(k2)) * 40})`, k2); });
    if (p.sous_titre) o += txt(540, 860 + L.length * 112 + 30, court(p.sous_titre, 50), { size: 40, w: 500, f: ROSE2, op: cl(lin(t, S.debut + .6, S.debut + 1)) });
    for (let i = 0; i < tot; i++) { const x = 540 + (i - (tot - 1) / 2) * 56; o += `<circle cx="${x}" cy="1360" r="${i + 1 === n ? 16 : 11}" fill="${i + 1 <= n ? ROSE : BLANC}" opacity="${i + 1 <= n ? 1 : .25}"/>`; }
    return o;
  },
  sons(S) { return [["pop", S.debut + .1, .45]]; },
};

// Frise : 2 à 4 étapes qui apparaissent l'une après l'autre (une phrase par étape).
GAB.frise = {
  dessin(S, t) {
    const p = S.p, et = (p.etapes || []).slice(0, 4), n = Math.max(1, et.length);
    let o = fondMarque("clair", S.i, t);
    if (p.titre) o += txt(540, 400, court(p.titre, 30), { size: 62, w: 900, f: BX, fam: "Inter Display", op: cl(lin(t, S.debut, S.debut + .3) * 3) });
    const y0 = 520, pas = Math.min(250, 1000 / n);
    o += `<line x1="170" y1="${y0 + 40}" x2="170" y2="${y0 + 40 + (n - 1) * pas * eo(lin(t, S.debut + .2, S.fin - .5))}" stroke="${ROSE}" stroke-width="8" stroke-linecap="round"/>`;
    et.forEach((e, i) => {
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * (S.fin - S.debut - .6) / n, k = lin(t, d, d + .35), y = y0 + i * pas;
      o += g(`<circle cx="170" cy="${y + 40}" r="44" fill="${BX}"/>` + txt(170, y + 58, String(i + 1), { size: 50, w: 900, f: BLANC })
        + `<rect x="250" y="${y - 30}" width="720" height="${Math.min(200, pas - 30)}" rx="28" fill="${BLANC}"/>`
        + txt(285, y + 30, court(e.titre, 26), { anchor: "start", size: 48, w: 900, f: NUIT })
        + (e.texte ? lignes(court(e.texte, 60), 34, 2).map((l, m) => txt(285, y + 88 + m * 44, l, { anchor: "start", size: 37, w: 500, f: GRIS })).join("") : ""),
        `translate(${(1 - eo(k)) * 260} 0)`, cl(k * 3));
    });
    return o;
  },
  sons(S) { return (S.p.etapes || []).slice(0, 4).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * (S.fin - S.debut - .6) / Math.max(1, (S.p.etapes || []).length), .35]); },
};

// Tableau simple : 2 ou 3 colonnes, 2 à 4 lignes qui apparaissent une à une.
GAB.tableau = {
  dessin(S, t) {
    const p = S.p, cols = (p.colonnes || []).slice(0, 3), lignesT = (p.lignes || []).slice(0, 4), nc = Math.max(2, cols.length);
    let o = fondMarque("clair", S.i, t);
    if (p.titre) o += txt(540, 400, court(p.titre, 30), { size: 60, w: 900, f: BX, fam: "Inter Display", op: cl(lin(t, S.debut, S.debut + .3) * 3) });
    const x0 = 80, L = 920, w = L / nc, y0 = 500, hl = 170;
    o += `<rect x="${x0}" y="${y0}" width="${L}" height="${110 + lignesT.length * hl}" rx="30" fill="${BLANC}"/>`;
    o += `<path d="M${x0} ${y0 + 30} q0 -30 30 -30 h${L - 60} q30 0 30 30 v80 h-${L} z" fill="${BX}"/>`;
    cols.forEach((c, j) => { const T = lignes(court(c, 24).toUpperCase(), nc === 3 ? 13 : 20, 2); T.forEach((l, m) => { o += txt(x0 + w * j + w / 2, y0 + (T.length === 1 ? 68 : 50 + m * 36), l, { size: T.length === 1 ? 32 : 28, w: 800, f: BLANC, ls: 1 }); }); });
    lignesT.forEach((l, i) => {
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .5 + i * .8, k = lin(t, d, d + .3), y = y0 + 110 + i * hl;
      let r = i ? `<line x1="${x0 + 30}" y1="${y}" x2="${x0 + L - 30}" y2="${y}" stroke="${CREME}" stroke-width="4"/>` : "";
      (Array.isArray(l) ? l : []).slice(0, nc).forEach((c, j) => {
        const T = lignes(court(c, 36), 15, 2);
        T.forEach((ligne, m) => { r += txt(x0 + w * j + w / 2, y + (T.length === 1 ? 100 : 72 + m * 52), ligne, { size: j ? 42 : 44, w: j ? 600 : 900, f: j ? NUIT : BX }); });
      });
      o += g(r, "", cl(k * 3));
    });
    return o;
  },
  sons(S) { return (S.p.lignes || []).slice(0, 4).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .5 + i * .8, .3]); },
};

// Quiz : la question, un compte à rebours (2e phrase), puis la bonne réponse s'allume (3e phrase).
GAB.quiz = {
  dessin(S, t) {
    const p = S.p, ch = (p.choix || []).slice(0, 4), bonne = Number(p.bonne) || 0;
    const ic = Number(S.p.i_compte) || 1, tCompte = nbP(S) > ic ? ph(S, ic) : S.debut + (S.fin - S.debut) * .4, tRep = nbP(S) > ic + 1 ? ph(S, ic + 1) : S.debut + (S.fin - S.debut) * .7;
    let o = fondMarque("sombre", S.i, t);
    const k0 = lin(t, S.debut, S.debut + .3);
    o += g(pill(540, 360, 260, 80, OR, txt(540, 376, "QUIZ", { size: 44, w: 900, f: NUIT, ls: 8 })), `translate(540 360) scale(${back(k0)}) translate(-540 -360)`);
    const Q = lignes(court(p.question, 110), 26, 4);
    Q.forEach((l, i) => { o += txt(540, 500 + i * 70, l, { size: 56, w: 800, f: BLANC, op: cl(k0 * 3) }); });
    const yc = 520 + Q.length * 70 + 40, revele = t >= tRep;
    ch.forEach((c, i) => {
      const k = lin(t, S.debut + .4 + i * .15, S.debut + .7 + i * .15), y = yc + i * 150, ok = i === bonne;
      const fond = revele ? (ok ? VERT : BLANC) : BLANC, coul = revele ? (ok ? BLANC : NUIT) : NUIT, op = revele && !ok ? .45 : 1;
      o += g(`<rect x="110" y="${y}" width="860" height="120" rx="60" fill="${fond}"/>` + `<circle cx="180" cy="${y + 60}" r="38" fill="${revele && ok ? BLANC : BX}"/>`
        + txt(180, y + 76, revele && ok ? "✓" : "ABCD"[i], { size: 44, w: 900, f: revele && ok ? VERT : BLANC })
        + txt(245, y + 76, court(c, 34), { anchor: "start", size: 42, w: 700, f: coul }), `translate(${(1 - eo(k)) * -200} 0)`, cl(k * 3) * op);
    });
    if (t >= tCompte && t < tRep) {   // compte à rebours
      const r = Math.max(1, 3 - Math.floor((t - tCompte) / Math.max(.4, (tRep - tCompte) / 3)));
      o += `<circle cx="540" cy="${yc + ch.length * 150 + 110}" r="70" fill="${ROSE}"/>` + txt(540, yc + ch.length * 150 + 140, String(r), { size: 90, w: 900, f: BX });
    }
    return o;
  },
  sons(S) {
    const ic = Number(S.p.i_compte) || 1, tCompte = nbP(S) > ic ? ph(S, ic) : S.debut + (S.fin - S.debut) * .4, tRep = nbP(S) > ic + 1 ? ph(S, ic + 1) : S.debut + (S.fin - S.debut) * .7;
    return [["pop", S.debut + .05, .4], ...[0, 1, 2].map((i) => ["tic", tCompte + i * (tRep - tCompte) / 3, .35]), ["ping", tRep, .45]];
  },
  masqueSousTitres() { return true; },   // question et réponses déjà à l'écran
};

// Récapitulatif : 3 à 5 points cochés l'un après l'autre.
GAB.recap = {
  dessin(S, t) {
    const p = S.p, pts = (p.points || []).slice(0, 5), n = Math.max(1, pts.length);
    let o = fondMarque("clair", S.i, t);
    o += g(pill(540, 380, 420, 90, BX, txt(540, 397, court(p.titre || "À retenir", 22).toUpperCase(), { size: 42, w: 900, f: BLANC, ls: 4 })), "", cl(lin(t, S.debut, S.debut + .3) * 3));
    const pas = Math.min(190, 1050 / n);
    pts.forEach((s, i) => {
      const d = nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * (S.fin - S.debut - .6) / n, k = lin(t, d, d + .3), y = 500 + i * pas;
      const T = lignes(court(s, 60), 30, 2);
      o += g(`<rect x="90" y="${y}" width="900" height="${pas - 30}" rx="30" fill="${BLANC}"/>` + `<circle cx="160" cy="${y + (pas - 30) / 2}" r="38" fill="${k >= 1 ? VERT : CREME}"/>`
        + (k > .5 ? `<path d="M${142} ${y + (pas - 30) / 2} l12 12 l24 -26" stroke="${BLANC}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "")
        + T.map((l, m) => txt(225, y + (pas - 30) / 2 + 14 + (m - (T.length - 1) / 2) * 50, l, { anchor: "start", size: 42, w: 700, f: NUIT })).join(""), "", cl(k * 3));
    });
    return o;
  },
  sons(S) { return (S.p.points || []).slice(0, 5).map((_, i) => ["pop", nbP(S) > i + 1 ? ph(S, i + 1) : S.debut + .4 + i * (S.fin - S.debut - .6) / Math.max(1, (S.p.points || []).length), .3]); },
  masqueSousTitres() { return true; },   // les points sont déjà écrits
};

// Fin d'un cours : pas de publicité, une invitation à se tester et la date de vérification de la fiche.
GAB.fin_cours = {
  dessin(S, t) {
    const p = S.p;
    let o = fond("#4A0614", "#22050C");
    for (let i = 0; i < 26; i++) { const k = lin(t, S.debut + i * .04, S.debut + 1.2 + i * .04); o += `<circle cx="${80 + (i * 167) % 920}" cy="${360 + (i * 97) % 300 - k * 60}" r="${4 + i % 4}" fill="${[ROSE, OR, BLANC][i % 3]}" opacity="${.5 * (1 - k)}"/>`; }
    const k1 = lin(t, S.debut + .1, S.debut + .5), k2 = lin(t, S.debut + .6, S.debut + 1);
    o += g(txt(540, 560, "Cours terminé", { size: 92, w: 900, f: BLANC, fam: "Inter Display" }), `translate(0 ${(1 - eo(k1)) * 40})`, k1);
    const L = lignes(court(p.titre_fiche, 60), 24, 2);
    L.forEach((l, i) => { o += txt(540, 660 + i * 66, l, { size: 54, w: 600, f: ROSE2, op: k1 }); });
    o += g(pill(540, 900, 720, 120, BLANC, txt(540, 920, "Testez-vous sur la fiche", { size: 50, w: 900, f: BX })), `translate(540 900) scale(${back(k2)}) translate(-540 -900)`, cl(k2 * 3));
    o += txt(540, 1060, "Quiz · Vrai ou faux · Cartes mémo", { size: 36, w: 500, f: ROSE2, op: k2 });
    if (p.verifie) o += txt(540, 1300, `Fiche vérifiée le ${court(p.verifie, 30)} sur des sources officielles`, { size: 30, w: 500, f: ROSE2, op: .9 });
    o += txt(540, 1350, "Contenu pédagogique, ne constitue pas un conseil.", { size: 30, w: 500, f: ROSE2, op: .9 });
    o += txt(540, 1420, "VEILLE PATRIMOINE · APPRENDRE", { size: 28, w: 700, f: BLANC, ls: 6, op: .6 });
    return o;
  },
  sons(S) { return [["pop", S.debut + .6, .4]]; },
  masqueSousTitres() { return true; },
};

// ---------------------------------------------------------------- Dialogue à deux personnages (vidéo « Le Livret A augmente… et alors ? »)
// Une scène = une réplique. p : a, b (personnages, a à gauche), parle ("a" | "b"), decor, enchaine (même tableau que la
// réplique précédente : ni volet ni nouvelle entrée), humeur_a, humeur_b, pose_a, pose_b, panneau { type, … }, carte_fin.
// La bouche de celui qui parle s'ouvre au rythme des mots ; l'autre le regarde.
let LOCUTEUR = "";
const POSES = {
  repos: { bras: [6, 6], coudes: [0, 0] },
  explique: { bras: [10, 40], coudes: [0, 70] },
  mains: { bras: [30, 30], coudes: [60, 60] },
  telephone: { bras: [8, 25], coudes: [0, 175], tel: true, ecran: "#F3D3D8" },
  pensive: { bras: [8, 30], coudes: [0, 150] },
  table: { bras: [24, 24], coudes: [40, 40] },
  carte: { bras: [8, 60], coudes: [0, 40] },
  surprise: { bras: [40, 40], coudes: [70, 70] },
};
function ouvertureBouche(S, t) {   // 0 à 1, suivant les mots de la scène
  const m = MOTS.find((w) => w.scene === S.i && t >= w.debut && t < w.fin);
  if (!m) return 0;
  const k = (t - m.debut) / Math.max(.08, m.fin - m.debut);
  return .35 + .65 * Math.abs(Math.sin(k * Math.PI * Math.max(1, Math.round((m.fin - m.debut) / .14))));
}
// Premier instant du tableau (réplique non enchaînée) : les personnages n'entrent qu'une fois par tableau.
function debutTableau(S) { let i = S.i; while (i > 0 && SCENES[i].p.enchaine) i--; return SCENES[i].debut; }
// Instant où un mot est prononcé dans la scène (le n-ième s'il revient plusieurs fois), sinon « defaut ».
function motT(S, cle, defaut, n = 0) {
  const re = new RegExp("^(?:[«“(]|[a-z]+['’])?" + cle, "i"), l = MOTS.filter((w) => w.scene === S.i && re.test(w.mot.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  return l[Math.min(n, l.length - 1)]?.debut ?? defaut;
}
function panneauDialogue(P, S, t) {
  const k0 = lin(t, S.debut + .15, S.debut + .55), apres = (x) => lin(t, x - .05, x + .35);
  const K = (cle, i = 0) => apres(motT(S, cle, S.debut + .6 + i * .5));
  let o = "";
  if (P.type === "plafond") {
    o += g(`<rect x="-430" y="-190" width="860" height="380" rx="44" fill="${BLANC}"/>` + txt(0, -110, "Plafond du Livret A", { size: 44, w: 800, f: GRIS }) +
      txt(-200, 20, "22 950 €", { size: 72, w: 900, f: NUIT }) + `<path d="M-40 0 h70 m-22 -22 l22 22 l-22 22" stroke="${ROSE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      txt(220, 4, "25 000 €", { size: 60, w: 900, f: BX }) + txt(220, 64, "à 30 000 €", { size: 44, w: 800, f: BX }) +
      `<rect x="-380" y="100" width="760" height="62" rx="31" fill="${ROSE2}"/>` + txt(0, 142, "1er février 2027 · annoncé, montant à fixer", { size: 31, w: 700, f: BX }),
      `translate(540 560) scale(${.85 + .15 * back(k0)})`, cl(k0 * 3));
  } else if (P.type === "puces") {
    (P.items || []).forEach((s, i) => { const k = K((P.cles || [])[i] || "zz", i); o += g(`<rect x="-250" y="-50" width="500" height="100" rx="50" fill="${BLANC}"/><circle cx="-196" cy="0" r="32" fill="${VERT}"/><path d="M-211 0 l11 11 l22 -24" stroke="${BLANC}" stroke-width="7" fill="none" stroke-linecap="round"/>` + txt(24, 16, s, { size: 44, w: 800, f: NUIT }), `translate(540 ${440 + i * 125}) scale(${back(k)})`, cl(k * 3)); });
  } else if (P.type === "precaution") {
    const kp = K("parfait");   // le cadre arrive avec « parfait pour une chose »
    o += g(`<rect x="-440" y="-250" width="880" height="470" rx="44" fill="${BLANC}" opacity=".96"/>` + txt(0, -175, "Épargne de précaution", { size: 50, w: 900, f: BX }), `translate(540 580) scale(${.9 + .1 * back(kp)})`, cl(kp * 3));
    [["Panne de voiture", "cle", "voiture"], ["Facture imprévue", "document", "facture"], ["Perte d'emploi", "valise", "emploi"]].forEach(([n, ic, cle], i) => { const k = K(cle, i); o += g(picto(ic, 0, -20, 1.7, BX) + txt(0, 70, n, { size: 30, w: 700, f: NUIT }), `translate(${250 + i * 290} 570) scale(${back(k)})`, cl(k * 3)); });
    const k = K("trois", 4); o += g(pill(540, 730, 640, 84, BX, txt(540, 746, "3 à 6 mois de dépenses", { size: 42, w: 800, f: BLANC })), `translate(540 730) scale(${back(k)}) translate(-540 -730)`, cl(k * 3));
  } else if (P.type === "taux") {
    const dejaVu = !!S.p.enchaine, kr = dejaVu ? 1 : K("regarde");   // le cadre arrive avec « Regarde »
    o += g(`<rect x="-440" y="-250" width="880" height="500" rx="44" fill="${BLANC}" opacity=".97"/>`, `translate(540 530) scale(${.9 + .1 * back(kr)})`, cl(kr * 3));
    const barre = (x, v, max, coul, lib, val, n1, n2, k) => { const h = 210 * v / max * eo(k); return `<rect x="${x - 90}" y="${660 - h}" width="180" height="${h}" rx="18" fill="${coul}"/>` + txt(x, 640 - h, val, { size: 56, w: 900, f: coul === ROSE ? BX : coul, op: cl(k * 3) }) + g(txt(x, 708, lib, { size: 38, w: 800, f: NUIT }) + txt(x, 712 + 34, n1, { size: 26, w: 600, f: GRIS }) + txt(x, 712 + 66, n2, { size: 26, w: 600, f: GRIS }), "", cl(kr * 3)); };   // réplique suivante : les barres restent affichées
    o += barre(345, 2.5, 3.4, ROSE, "Livret A", "≈ 2,5 %", "estimation", "février 2027", dejaVu ? 1 : K("2,5")) + barre(735, 3.4, 3.4, BX, "Inflation", "3,4 %", "Insee, provisoire", "octobre 2026", dejaVu ? 1 : K("3,4"));
  } else if (P.type === "pouvoir") {
    const k = K("papier"), k2 = K("recule"), n = 6, rest = Math.round(n - 2 * eo(k2));
    let pan = ""; for (let i = 0; i < n; i++) pan += `<g opacity="${i < rest ? 1 : .18}">${picto("cadeau", -250 + i * 100, 0, 1.3, BX)}</g>`;
    o += g(`<rect x="-440" y="-170" width="880" height="340" rx="44" fill="${BLANC}" opacity=".97"/>` + txt(0, -95, "Avec les mêmes euros…", { size: 42, w: 800, f: NUIT }) + pan + g(pill(0, 110, 560, 76, BX, txt(0, 124, "Pouvoir d'achat ↓", { size: 40, w: 900, f: BLANC })), `scale(${back(k2)})`, cl(k2 * 3)), "translate(540 600)", cl(k * 3 + k0));
  } else if (P.type === "profils") {
    [["Prudent", "prudent"], ["Équilibré", "equilibre"], ["Dynamique", "dynamique"]].forEach(([s, cle], i) => { const k = K(cle, i); o += g(pill(0, 0, 300, 96, [ROSE2, ROSE, BX][i], txt(0, 15, s, { size: 42, w: 800, f: i === 2 ? BLANC : BX })), `translate(${220 + i * 320} 470) scale(${back(k)})`, cl(k * 3)); });
    [["Un projet", "projet"], ["Ta retraite", "retraite"], ["Protéger ton argent", "proteger"]].forEach(([s, cle], i) => { const k = K(cle, i + 3); o += g(`<rect x="-150" y="-36" width="300" height="72" rx="36" fill="${BLANC}"/>` + txt(0, 12, s, { size: 30, w: 700, f: NUIT }), `translate(${220 + i * 320} 590) scale(${back(k)})`, cl(k * 3)); });
  } else if (P.type === "etapes") {
    (P.items || []).forEach((s, i) => { const k = K((P.cles || [])[i] || "zz", i); o += g(`<rect x="-300" y="-46" width="600" height="92" rx="46" fill="${BLANC}"/><circle cx="-250" cy="0" r="30" fill="${BX}"/>` + txt(-250, 12, String(i + 1), { size: 36, w: 900, f: BLANC }) + txt(20, 14, s, { size: 40, w: 800, f: NUIT }), `translate(540 ${420 + i * 118}) scale(${back(k)})`, cl(k * 3)); });
  } else if (P.type === "titre") {
    o += g(pill(540, 420, 900, 120, BX, txt(540, 442, P.texte, { size: 54, w: 900, f: BLANC })), `translate(540 420) scale(${back(k0)}) translate(-540 -420)`, cl(k0 * 3));
  }
  return o;
}
// Cartes posées sur la table ; « prise » : la carte du milieu monte vers la main de Léa.
function cartesTable(t, S, prise) {
  let o = `<rect x="120" y="1296" width="840" height="44" rx="18" fill="#7A5236"/><rect x="120" y="1334" width="840" height="14" fill="#5E3E28"/><rect x="160" y="1346" width="28" height="394" fill="#5E3E28"/><rect x="892" y="1346" width="28" height="394" fill="#5E3E28"/>`;
  const noms = ["Prudent", "Équilibré", "Dynamique"];
  noms.forEach((n, i) => {
    const t0 = debutTableau(S), k = lin(t, t0 + .2 + i * .25, t0 + .55 + i * .25);
    let x = 340 + i * 200, y = 1262, r = (i - 1) * 6, sc = 1;
    if (prise && i === 0) { const kp = eio(lin(t, prise, prise + .9)); x = mix(x, 430, kp); y = mix(y, 1150, kp); r = mix(r, -12, kp); sc = mix(1, 1.15, kp); }
    o += g(`<rect x="-80" y="-56" width="160" height="112" rx="14" fill="${BLANC}" stroke="${[ROSE, BX, NUIT][i]}" stroke-width="6"/><rect x="-80" y="-56" width="160" height="30" rx="14" fill="${[ROSE, BX, NUIT][i]}"/>` + txt(0, 26, n, { size: 28, w: 800, f: NUIT }),
      `translate(${x} ${y - (1 - eo(k)) * 60}) rotate(${r}) scale(${sc})`, cl(k * 3));
  });
  return o;
}
GAB.dialogue = {
  dessin(S, t) {
    const p = S.p, t0 = debutTableau(S);
    let o = decor(p.decor || "salon", t, SCENES.findIndex((x) => x.debut === t0));
    const ke = eo(lin(t, t0, t0 + .55)), ouv = ouvertureBouche(S, t);
    const A = { ...personnage(p.a || "lea_bsc"), ...(POSES[p.pose_a] || POSES.repos), x: 300, y: 1730, s: 1.26, humeur: humeur(p.humeur_a, "sourire"), cligne: cligne(t, 0) };
    const B = { ...personnage(p.b || "theo"), ...(POSES[p.pose_b] || POSES.repos), x: 790, y: 1730, s: 1.3, humeur: humeur(p.humeur_b, "neutre"), cligne: cligne(t, 1.3) };
    if (POSES[p.pose_b]?.bras) B.bras = [...POSES[p.pose_b].bras].reverse(), B.coudes = [...POSES[p.pose_b].coudes].reverse();   // Théo : geste de la main côté Léa
    A.regard = p.parle === "b" ? .6 : .3; B.regard = p.parle === "a" ? -.6 : -.3;
    if (p.parle === "a") A.parle = ouv; else B.parle = ouv;
    const saut = (qui) => (p.parle === qui && ouv > 0 ? -Math.abs(Math.sin(t * 7)) * 5 : 0);
    o += g(perso(A, t), `translate(${-(1 - ke) * 700} ${saut("a")})`);
    o += g(perso(B, t), `translate(${(1 - ke) * 700} ${saut("b")})`);
    if (p.cartes) o += cartesTable(t, S, p.prise ? ph(S, 0) + .2 : p.pris ? -99 : null);   // « pris » : la carte est déjà dans la main
    if (p.panneau) o += panneauDialogue(p.panneau, S, t);
    if (p.bandeau) o += g(pill(540, 300, 900, 100, NUIT, txt(540, 318, p.bandeau, { size: 44, w: 800, f: BLANC })), "", cl(lin(t, t0 + .1, t0 + .4) * 2));
    LOCUTEUR = p.parle === "a" ? A.nom || "Léa" : B.nom || "Théo";
    // Carte de fin : après la dernière réplique, sur la tenue de la dernière scène.
    if (p.carte_fin) {
      const tf = phf(S, nbP(S) - 1) + .35;
      if (t >= tf) {
        const Sf = { ...S, debut: tf, P: [tf, tf + .5, tf + 1.1], PF: [tf + .4, tf + 1.0, tf + 2.4], p: { style: "bordeaux", ...p.carte_fin } };
        const k = eo(lin(t, tf, tf + .35));
        o += `<g transform="translate(${(1 - k) * 1080} 0)">${GAB.fin.dessin(Sf, t)}</g>`;
      }
    }
    return o;
  },
  masqueSousTitres(S, t) { return S.p.carte_fin && t >= phf(S, nbP(S) - 1) + .3; },
  sons(S) {
    const r = [], p = S.p;
    if (p.panneau) r.push(["pop", S.debut + .2, .35]);
    if (p.cartes && !p.enchaine) r.push(["pop", S.debut + .3, .3], ["pop", S.debut + .55, .3], ["pop", S.debut + .8, .3]);
    return r;
  },
};
