// version 1.0 — visuels LinkedIn aux couleurs du cabinet (format portrait 1080 × 1350, recommandé par LinkedIn).
// Charte fixe : fond bordeaux, texte blanc, accents rose poudré, filet fin et lettres espacées (comme le logo).
// Les textes viennent uniquement du post et de sa source (vérifiés côté serveur).

const CHARTE = {
  fond: "#6E0B1F", fondBas: "#5C0819", blanc: "#FFFFFF", rose: "#D8919C", filet: "rgba(216,145,156,.55)",
  carte: "rgba(255,255,255,.07)", doux: "rgba(255,255,255,.78)",
  titre: '"Space Grotesk", "Inter", system-ui, sans-serif', texte: '"Inter", system-ui, sans-serif',
};
const L = 1080, H = 1350, M = 96;   // largeur, hauteur, marge

async function chargerPolices() {
  try {
    await Promise.all(["700 120px", "600 64px", "500 40px"].map((f) => document.fonts.load(`${f} "Space Grotesk"`)));
    await Promise.all(["400 40px", "600 40px", "500 30px"].map((f) => document.fonts.load(`${f} "Inter"`)));
  } catch {}
}

// Découpe un texte en lignes qui tiennent dans la largeur donnée.
function lignes(ctx, texte, largeur) {
  const mots = String(texte || "").split(/\s+/).filter(Boolean), res = [];
  let l = "";
  for (const m of mots) {
    const essai = l ? l + " " + m : m;
    if (ctx.measureText(essai).width > largeur && l) { res.push(l); l = m; } else l = essai;
  }
  if (l) res.push(l);
  return res;
}
// Écrit un paragraphe ; réduit la taille si le texte dépasse le nombre de lignes permis. Renvoie la hauteur utilisée.
function paragraphe(ctx, texte, x, y, largeur, { taille, poids = 400, police = CHARTE.texte, couleur = CHARTE.blanc, interligne = 1.25, maxLignes = 4, min = 26, aligne = "left" }) {
  let t = taille, ls;
  do { ctx.font = `${poids} ${t}px ${police}`; ls = lignes(ctx, texte, largeur); t -= 2; } while (ls.length > maxLignes && t >= min);
  if (ls.length > maxLignes) { ls = ls.slice(0, maxLignes); ls[maxLignes - 1] = ls[maxLignes - 1].replace(/\s*\S*$/, "") + "…"; }
  ctx.fillStyle = couleur; ctx.textAlign = aligne; ctx.textBaseline = "top";
  const pas = (t + 2) * interligne;
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * pas));
  ctx.textAlign = "left";
  return ls.length * pas;
}
// Texte en capitales espacées (style du logo).
function espace(ctx, texte, x, y, { taille = 26, couleur = CHARTE.rose, ecart = 7, poids = 500, aligne = "left" } = {}) {
  const t = String(texte || "").toUpperCase();
  ctx.font = `${poids} ${taille}px ${CHARTE.texte}`; ctx.fillStyle = couleur; ctx.textBaseline = "top";
  const largeur = [...t].reduce((s, c) => s + ctx.measureText(c).width + ecart, -ecart);
  let cx = aligne === "center" ? x - largeur / 2 : aligne === "right" ? x - largeur : x;
  for (const c of t) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + ecart; }
  return largeur;
}
const trait = (ctx, x1, y1, x2, y2, couleur = CHARTE.filet, ep = 2) => { ctx.strokeStyle = couleur; ctx.lineWidth = ep; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
function rectArrondi(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// Fond, surtitre et pied de page (signature + source) : identiques sur toutes les images.
function cadre(ctx, v, sig, { page, total } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, CHARTE.fond); g.addColorStop(1, CHARTE.fondBas);
  ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
  espace(ctx, v.surtitre || "Patrimoine", M, M, { taille: 26, ecart: 8 });
  if (total > 1) espace(ctx, `${page} / ${total}`, L - M, M, { taille: 24, ecart: 4, couleur: CHARTE.doux, aligne: "right" });
  trait(ctx, M, M + 54, L - M, M + 54);
  // Pied : filet, nom du conseiller, cabinet, source.
  const yp = H - M - 92;
  trait(ctx, M, yp, L - M, yp);
  ctx.font = `600 34px ${CHARTE.titre}`; ctx.fillStyle = CHARTE.blanc; ctx.textBaseline = "top";
  ctx.fillText(sig.nom || "", M, yp + 26);
  if (sig.cabinet) espace(ctx, sig.cabinet, M, yp + 72, { taille: 22, ecart: 7 });
  if (v.source) { ctx.font = `400 22px ${CHARTE.texte}`; ctx.fillStyle = CHARTE.doux; ctx.textAlign = "right"; ctx.fillText("Source : " + v.source, L - M, yp + 34); ctx.textAlign = "left"; }
  return { haut: M + 100, bas: yp - 40 };
}

// --- Les modèles -------------------------------------------------------------------------------
function dessinerChiffre(ctx, v, z) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3 }) + 70;
  ctx.font = `400 42px ${CHARTE.texte}`;
  const hBloc = 230 + 60 + Math.min(3, lignes(ctx, v.chiffre_legende, L - 2 * M).length) * 55, dispo = z.bas - y - (v.conclusion ? 150 : 0);
  y += Math.max(0, (dispo - hBloc) / 2 - 30);
  let t = 230; ctx.font = `700 ${t}px ${CHARTE.titre}`;
  while (ctx.measureText(v.chiffre).width > L - 2 * M && t > 90) { t -= 10; ctx.font = `700 ${t}px ${CHARTE.titre}`; }
  ctx.fillStyle = CHARTE.blanc; ctx.textBaseline = "top"; ctx.fillText(v.chiffre, M - 6, y); y += t + 20;
  trait(ctx, M, y, M + 140, y, CHARTE.rose, 6); y += 40;
  y += paragraphe(ctx, v.chiffre_legende, M, y, L - 2 * M, { taille: 42, couleur: CHARTE.doux, maxLignes: 3 });
  conclusion(ctx, v, z, y);
}
function dessinerPoints(ctx, v, z, etapes = false) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3 }) + 56;
  const n = v.points.length, dispo = z.bas - y - (v.conclusion ? 150 : 20), pas = Math.min(230, dispo / n);
  y += Math.max(0, (dispo - n * pas) / 2 - 20);   // bloc centré dans l'espace disponible
  v.points.forEach((p, i) => {
    const cy = y + i * pas;
    if (etapes) {
      if (i < n - 1) trait(ctx, M + 30, cy + 64, M + 30, cy + pas, CHARTE.filet, 3);
      ctx.fillStyle = CHARTE.rose; ctx.beginPath(); ctx.arc(M + 30, cy + 30, 30, 0, 7); ctx.fill();
      ctx.fillStyle = CHARTE.fond; ctx.font = `700 30px ${CHARTE.titre}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(i + 1), M + 30, cy + 31); ctx.textAlign = "left";
    } else {
      ctx.font = `700 46px ${CHARTE.titre}`; ctx.fillStyle = CHARTE.rose; ctx.textBaseline = "top"; ctx.fillText(String(i + 1).padStart(2, "0"), M, cy + 2);
      if (i < n - 1) trait(ctx, M + 100, cy + pas - 26, L - M, cy + pas - 26, "rgba(255,255,255,.12)", 2);
    }
    paragraphe(ctx, p, M + 100, cy + 2, L - 2 * M - 100, { taille: 46, maxLignes: 2, interligne: 1.2 });
  });
  conclusion(ctx, v, z, y + n * pas);
}
function dessinerComparaison(ctx, v, z) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3 }) + 56;
  const w = (L - 2 * M - 40) / 2, dispo = z.bas - y - (v.conclusion ? 160 : 20), h = Math.min(560, dispo);
  y += Math.max(0, (dispo - h) / 2 - 20);
  [[v.gauche_titre, v.gauche, M, false], [v.droite_titre, v.droite, M + w + 40, true]].forEach(([t, l, x, accent]) => {
    rectArrondi(ctx, x, y, w, h, 28); ctx.fillStyle = accent ? "rgba(216,145,156,.16)" : CHARTE.carte; ctx.fill();
    if (accent) { ctx.strokeStyle = CHARTE.rose; ctx.lineWidth = 3; ctx.stroke(); }
    espace(ctx, t || "", x + 36, y + 40, { taille: 24, ecart: 5, couleur: accent ? CHARTE.rose : CHARTE.doux });
    let ly = y + 104;
    l.forEach((ligne) => { ly += paragraphe(ctx, ligne, x + 36, ly, w - 72, { taille: 40, maxLignes: 3, interligne: 1.2 }) + 30; });
  });
  ctx.fillStyle = CHARTE.fond; ctx.beginPath(); ctx.arc(L / 2, y + h / 2, 34, 0, 7); ctx.fill();
  ctx.fillStyle = CHARTE.rose; ctx.font = `700 40px ${CHARTE.titre}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("→", L / 2, y + h / 2 + 2); ctx.textAlign = "left";
  conclusion(ctx, v, z, y + h);
}
function dessinerQuestion(ctx, v, z) {
  let y = z.haut + 60;
  ctx.font = `700 260px ${CHARTE.titre}`; ctx.fillStyle = CHARTE.rose; ctx.textBaseline = "top"; ctx.fillText("“", M - 14, y - 70);
  y += 170;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 76, poids: 600, police: CHARTE.titre, maxLignes: 5, interligne: 1.15 });
  conclusion(ctx, v, z, y);
}
function conclusion(ctx, v, z, yMin) {
  if (!v.conclusion) return;
  ctx.font = `500 38px ${CHARTE.texte}`;
  const ls = lignes(ctx, v.conclusion, L - 2 * M - 40).slice(0, 2), h = ls.length * 48;
  const y = Math.max(yMin + 40, z.bas - h);
  trait(ctx, M, y, M, y + h - 6, CHARTE.rose, 6);
  paragraphe(ctx, v.conclusion, M + 34, y, L - 2 * M - 40, { taille: 38, poids: 500, couleur: CHARTE.blanc, maxLignes: 2, interligne: 1.2 });
}

// Une image (le modèle choisi).
async function dessinerVisuel(v, sig) {
  await chargerPolices();
  const c = document.createElement("canvas"); c.width = L; c.height = H;
  const ctx = c.getContext("2d"), z = cadre(ctx, v, sig);
  ({ chiffre: dessinerChiffre, points: dessinerPoints, etapes: (a, b, d) => dessinerPoints(a, b, d, true), comparaison: dessinerComparaison, question: dessinerQuestion }[v.modele] || dessinerQuestion)(ctx, v, z);
  return c;
}

// Carrousel : couverture, une page par idée, page finale.
async function dessinerCarrousel(v, sig) {
  await chargerPolices();
  const pages = [];
  const nouvelle = () => { const c = document.createElement("canvas"); c.width = L; c.height = H; pages.push(c); return c.getContext("2d"); };
  const contenu = [];
  if (v.modele === "chiffre" && v.chiffre) contenu.push({ ...v, modele: "chiffre", conclusion: "" });
  if (v.modele === "comparaison") contenu.push({ ...v, conclusion: "" });
  (v.points || []).forEach((p, i) => contenu.push({ type: "point", n: i + 1, texte: p }));
  const total = contenu.length + 2;
  // 1. Couverture
  let ctx = nouvelle(), z = cadre(ctx, v, sig, { page: 1, total });
  ctx.font = `700 92px ${CHARTE.titre}`;
  let y = z.haut + Math.max(60, (z.bas - z.haut - Math.min(5, lignes(ctx, v.titre, L - 2 * M).length) * 103 - 60) / 2);
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 92, poids: 700, police: CHARTE.titre, maxLignes: 5, interligne: 1.1 }) + 50;
  trait(ctx, M, y, M + 160, y, CHARTE.rose, 6);
  espace(ctx, "Faites défiler  →", M, z.bas - 30, { taille: 26, ecart: 6 });
  // 2. Contenu
  contenu.forEach((c, i) => {
    ctx = nouvelle(); z = cadre(ctx, v, sig, { page: i + 2, total });
    if (c.type === "point") {
      ctx.font = `600 68px ${CHARTE.titre}`;
      const h = 200 + 70 + Math.min(6, lignes(ctx, c.texte, L - 2 * M).length) * 80, y0 = z.haut + Math.max(20, (z.bas - z.haut - h) / 2);
      ctx.font = `700 200px ${CHARTE.titre}`; ctx.fillStyle = CHARTE.rose; ctx.textBaseline = "top"; ctx.fillText(String(c.n).padStart(2, "0"), M - 8, y0);
      paragraphe(ctx, c.texte, M, y0 + 270, L - 2 * M, { taille: 68, poids: 600, police: CHARTE.titre, maxLignes: 6, interligne: 1.15 });
    } else if (c.modele === "chiffre") dessinerChiffre(ctx, c, z);
    else dessinerComparaison(ctx, c, z);
  });
  // 3. Fin
  ctx = nouvelle(); z = cadre(ctx, v, sig, { page: total, total });
  ctx.font = `600 72px ${CHARTE.titre}`;
  y = z.haut + Math.max(60, (z.bas - z.haut - Math.min(5, lignes(ctx, v.conclusion, L - 2 * M).length) * 85 - 160) / 2);
  if (v.conclusion) y += paragraphe(ctx, v.conclusion, M, y, L - 2 * M, { taille: 72, poids: 600, police: CHARTE.titre, maxLignes: 5, interligne: 1.15 }) + 60;
  trait(ctx, M, y, M + 160, y, CHARTE.rose, 6);
  paragraphe(ctx, "Parlons-en en commentaire ou en message.", M, y + 50, L - 2 * M, { taille: 38, couleur: CHARTE.doux, maxLignes: 2 });
  return pages;
}

// PDF minimal (une image JPEG par page) : c'est le format « document » que LinkedIn affiche en carrousel.
async function carrouselPdf(pages) {
  const enc = new TextEncoder(), morceaux = [], decalages = [];
  let taille = 0;
  const ecrire = (x) => { const b = typeof x === "string" ? enc.encode(x) : x; morceaux.push(b); taille += b.length; };
  const objet = (n, corps) => { decalages[n] = taille; ecrire(`${n} 0 obj\n`); corps(); ecrire("\nendobj\n"); };
  const W = 540, Hp = 675;
  ecrire("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const n = pages.length, kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  objet(1, () => ecrire("<< /Type /Catalog /Pages 2 0 R >>"));
  objet(2, () => ecrire(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
  for (let i = 0; i < n; i++) {
    const p = 3 + i * 3;
    const jpeg = Uint8Array.from(atob(pages[i].toDataURL("image/jpeg", 0.9).split(",")[1]), (c) => c.charCodeAt(0));
    const flux = `q ${W} 0 0 ${Hp} 0 0 cm /Im${i} Do Q`;
    objet(p, () => ecrire(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${Hp}] /Resources << /XObject << /Im${i} ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
    objet(p + 1, () => ecrire(`<< /Length ${flux.length} >>\nstream\n${flux}\nendstream`));
    objet(p + 2, () => { ecrire(`<< /Type /XObject /Subtype /Image /Width ${L} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); ecrire(jpeg); ecrire("\nendstream"); });
  }
  const xref = taille, total = 3 + n * 3;
  ecrire(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) ecrire(String(decalages[i]).padStart(10, "0") + " 00000 n \n");
  ecrire(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(morceaux, { type: "application/pdf" });
}

const versBlob = (canvas) => new Promise((ok) => canvas.toBlob(ok, "image/png"));
function telechargerBlob(blob, nom) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
