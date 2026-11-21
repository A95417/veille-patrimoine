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
      s += txt(cx, base - h - 40, k > .12 ? "≈ " + nb(k > .985 ? Math.round(v / 1000) * 1000 : v * k) + " " + court(p.unite || "€", 4) : "", { size: 62, w: 900, f: BLANC, fam: "Inter Display" });
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

// 13) Carte de fin professionnelle (coordonnées du cabinet, mentions légales), en 6 mises en scène choisies selon le sujet.
// Toutes gardent le logo, la phrase d'appel, l'offre, les coordonnées et les mentions, aux mêmes places (lisibles en 9:16 et 4:5).
const FIN_STYLES = {
  cercles: {
    c: { q: ROSE2, pill: BLANC, pillT: BX, boite: "#000", boiteOp: .22, txt: BLANC, ment: ROSE2, trait: ROSE },
    fond(t) { let o = fond("#7A0F24", "#3E0611"); for (let i = 0; i < 5; i++) o += `<circle cx="540" cy="900" r="${220 + i * 120 + (t * 12) % 120}" fill="none" stroke="${BLANC}" stroke-opacity="${.05 - i * .008}" stroke-width="2"/>`; return o; },
  },
  clair: {
    c: { q: NUIT, pill: BX, pillT: BLANC, boite: BLANC, boiteOp: .9, txt: NUIT, ment: "#6E5F64", trait: BX },
    fond(t, S) {
      const k = eo(lin(t, S.debut, S.debut + 1.2)), L = 2 * (900 + 1440);
      let o = fond(CREME, "#EFE2DE");
      o += `<rect x="90" y="330" width="900" height="1340" rx="40" fill="none" stroke="${BX}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - k)}"/>`;
      for (let i = 0; i < 18; i++) o += `<circle cx="${120 + (i * 211) % 840}" cy="${360 + (i * 337) % 1280}" r="3" fill="${BX}" opacity="${.12 * k}"/>`;
      return o;
    },
  },
  horizon: {
    c: { q: "#FFE7D6", pill: BLANC, pillT: BX, boite: "#000", boiteOp: .25, txt: BLANC, ment: "#FFE7D6", trait: OR },
    fond(t, S) {
      const k = eo(lin(t, S.debut, S.fin - .5)), cy = mix(1150, 820, k);
      let o = `<defs><linearGradient id="fh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E0510"/><stop offset=".55" stop-color="#7A1A2E"/><stop offset="1" stop-color="#C2604A"/></linearGradient>
        <radialGradient id="fs"><stop offset="0" stop-color="${OR}" stop-opacity=".75"/><stop offset=".45" stop-color="${OR}" stop-opacity=".22"/><stop offset="1" stop-color="${OR}" stop-opacity="0"/></radialGradient></defs>
        <rect width="1080" height="1920" fill="url(#fh)"/><circle cx="540" cy="${cy}" r="620" fill="url(#fs)"/>`;
      for (let i = 0; i < 12; i++) { const a = -Math.PI + (i + .5) * Math.PI / 12; o += `<line x1="${540 + Math.cos(a) * 330}" y1="${cy + Math.sin(a) * 330}" x2="${540 + Math.cos(a) * 520}" y2="${cy + Math.sin(a) * 520}" stroke="${OR}" stroke-opacity="${.10 + .05 * Math.sin(t * 2 + i)}" stroke-width="6" stroke-linecap="round"/>`; }
      o += `<rect x="0" y="1660" width="1080" height="260" fill="#3A0715" opacity=".55"/>`;
      for (let i = 0; i < 6; i++) o += `<line x1="${180 + i * 30}" y1="${1700 + i * 34}" x2="${900 - i * 30}" y2="${1700 + i * 34}" stroke="${OR}" stroke-opacity="${.18 - i * .025}" stroke-width="4"/>`;
      return o;
    },
  },
  courbe: {
    c: { q: ROSE2, pill: BLANC, pillT: BX, boite: "#000", boiteOp: .28, txt: BLANC, ment: ROSE2, trait: VERT },
    fond(t, S) {
      let o = fond("#2A0A12", "#4A0614");
      for (let i = 0; i < 9; i++) o += `<line x1="0" y1="${400 + i * 150}" x2="1080" y2="${400 + i * 150}" stroke="${BLANC}" stroke-opacity=".05" stroke-width="2"/>`;
      const k = eo(lin(t, S.debut + .1, S.debut + 2.2)), n = 50, pts = [];
      for (let i = 0; i <= n; i++) { const x = -20 + i * 22.4, y = 1640 - Math.pow(i / n, 1.8) * 1180 + Math.sin(i * 1.3) * 18; pts.push([x, y]); }
      const m = Math.max(2, Math.round(k * (n + 1))), vis = pts.slice(0, m);
      const d = vis.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" ");
      o += `<path d="${d} L${vis[vis.length - 1][0]} 1920 L-20 1920Z" fill="${VERT}" opacity=".10"/><path d="${d}" stroke="${VERT}" stroke-opacity=".55" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const e = vis[vis.length - 1]; o += `<circle cx="${e[0]}" cy="${e[1]}" r="16" fill="${VERT}" opacity=".8"/>`;
      return o;
    },
  },
  maison: {
    c: { q: ROSE2, pill: BLANC, pillT: BX, boite: "#000", boiteOp: .25, txt: BLANC, ment: ROSE2, trait: OR },
    fond(t, S) {
      let o = fond("#4A0614", "#22050C");
      for (let i = 0; i < 22; i++) o += `<circle cx="${(i * 197) % 1080}" cy="${320 + (i * 131) % 380}" r="${2 + i % 3}" fill="${BLANC}" opacity="${.15 + .15 * Math.sin(t * 2 + i)}"/>`;
      const k = lin(t, S.debut + .1, S.debut + 2), L = 4200;
      const maison = "M140 1640 L140 1060 L540 700 L940 1060 L940 1640 Z M760 860 L760 720 L840 720 L840 935 M440 1640 L440 1380 L640 1380 L640 1640";
      o += `<path d="${maison}" fill="none" stroke="${ROSE}" stroke-opacity=".28" stroke-width="10" stroke-linejoin="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - eo(k))}"/>`;
      const kf = lin(t, S.debut + 1.8, S.debut + 2.4);
      o += `<rect x="455" y="1395" width="170" height="230" rx="6" fill="${OR}" opacity="${.18 * kf}"/>`;
      return o;
    },
  },
  bandes: {
    c: { q: BLANC, pill: BLANC, pillT: BX, boite: "#000", boiteOp: .25, txt: BLANC, ment: ROSE2, trait: BLANC },
    fond(t) {
      let o = fond("#8A1029", "#4A0614");
      const dec = (t * 60) % 240;
      for (let i = -6; i < 14; i++) o += `<rect x="${i * 240 + dec}" y="-200" width="90" height="2600" fill="${BLANC}" opacity=".05" transform="rotate(20 540 960)"/>`;
      return o;
    },
  },
};
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
    const ment = (C.mentions || []).slice(0, 4).flatMap((m) => lignes(court(m, 130), 66, 2)).slice(0, 5);
    if (ment.length && p.style && p.style !== "clair" && p.style !== "cercles") o += `<rect x="70" y="1468" width="940" height="${ment.length * 34 + 26}" rx="20" fill="#000" opacity=".28"/>`;
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
