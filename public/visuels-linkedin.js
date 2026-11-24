// version 2.0 — visuels LinkedIn aux couleurs du cabinet (format portrait 1080 × 1350, recommandé par LinkedIn).
// Charte fixe : fond bordeaux, texte blanc, accents rose poudré, filet fin et lettres espacées (comme le logo).
// Les textes viennent uniquement du post et de sa source (vérifiés côté serveur).
// Chaque modèle produit une « page » : un fond et une liste d'éléments (textes, traits, formes, images) que l'éditeur
// libre (editeur-visuel.js) sait déplacer, agrandir, modifier ou supprimer. L'image finale est toujours dessinée
// à partir de cette page, si bien que ce que l'on voit dans l'éditeur est exactement ce qui est téléchargé.

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

// --- Enregistrement des éléments ---------------------------------------------------------------
// Pendant qu'un modèle se dessine, chaque élément posé est noté dans REC (la page en cours).
let REC = null, compteurEl = 0;
const nouvelId = () => "e" + Date.now().toString(36) + (compteurEl++).toString(36);
function poser(el) { if (REC) REC.elements.push({ id: nouvelId(), ...el }); }

// Largeur d'un texte, lettres espacées comprises.
function largeurTexte(ctx, s, ecart = 0) {
  if (!ecart) return ctx.measureText(s).width;
  return [...s].reduce((t, c) => t + ctx.measureText(c).width + ecart, -ecart);
}
// Découpe un texte en lignes qui tiennent dans la largeur donnée (les retours à la ligne saisis sont respectés).
function lignes(ctx, texte, largeur, ecart = 0) {
  const res = [];
  for (const para of String(texte || "").split("\n")) {
    if (largeurTexte(ctx, para, ecart) <= largeur) { res.push(para); continue; }   // tient sur une ligne : texte gardé tel quel
    const mots = para.split(/[ \t]+/).filter(Boolean);
    if (!mots.length) { res.push(""); continue; }
    let l = "";
    for (const m of mots) {
      const essai = l ? l + " " + m : m;
      if (largeurTexte(ctx, essai, ecart) > largeur && l) { res.push(l); l = m; } else l = essai;
    }
    res.push(l);
  }
  while (res.length > 1 && res[res.length - 1] === "") res.pop();
  return res;
}
// Écrit un paragraphe ; réduit la taille si le texte dépasse le nombre de lignes permis. Renvoie la hauteur utilisée.
function paragraphe(ctx, texte, x, y, largeur, { taille, poids = 400, police = CHARTE.texte, couleur = CHARTE.blanc, interligne = 1.25, maxLignes = 4, min = 26, aligne = "left", role, lie }) {
  let t = taille, ls;
  do { ctx.font = `${poids} ${t}px ${police}`; ls = lignes(ctx, texte, largeur); t -= 2; } while (ls.length > maxLignes && t >= min);
  if (ls.length > maxLignes) { ls = ls.slice(0, maxLignes); ls[maxLignes - 1] = ls[maxLignes - 1].replace(/\s*\S*$/, "") + "…"; }
  ctx.fillStyle = couleur; ctx.textAlign = aligne; ctx.textBaseline = "top";
  const pas = (t + 2) * interligne;
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * pas));
  ctx.textAlign = "left";
  poser({ type: "texte", role, lie, x: aligne === "center" ? x - largeur / 2 : aligne === "right" ? x - largeur : x, y, w: largeur,
          texte: ls.join(" "), taille: t + 2, poids, police, couleur, interligne, aligne });
  return ls.length * pas;
}
// Texte en capitales espacées (style du logo).
function espace(ctx, texte, x, y, { taille = 26, couleur = CHARTE.rose, ecart = 7, poids = 500, aligne = "left", role, lie } = {}) {
  const t = String(texte || "").toUpperCase();
  ctx.font = `${poids} ${taille}px ${CHARTE.texte}`; ctx.fillStyle = couleur; ctx.textBaseline = "top";
  const largeur = largeurTexte(ctx, t, ecart);
  let cx = aligne === "center" ? x - largeur / 2 : aligne === "right" ? x - largeur : x;
  const gauche = cx;
  for (const c of t) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + ecart; }
  const wb = Math.ceil(largeur) + 4;
  poser({ type: "texte", role, lie, x: aligne === "center" ? x - wb / 2 : aligne === "right" ? x - wb : gauche, y, w: wb, texte: String(texte || ""), maj: true, ecart,
          taille, poids, police: CHARTE.texte, couleur, interligne: 1.2, aligne });
  return largeur;
}
// Une ligne de texte posée à un endroit précis (chiffres, nom, source…).
function ecrire(ctx, texte, x, y, { taille, poids = 400, police = CHARTE.texte, couleur = CHARTE.blanc, aligne = "left", milieu = false, role, lie }) {
  ctx.font = `${poids} ${taille}px ${police}`; ctx.fillStyle = couleur; ctx.textAlign = aligne; ctx.textBaseline = milieu ? "middle" : "top";
  ctx.fillText(texte, x, y); ctx.textAlign = "left"; ctx.textBaseline = "top";
  const w = Math.ceil(ctx.measureText(texte).width) + 4;
  poser({ type: "texte", role, lie, x: aligne === "center" ? x - w / 2 : aligne === "right" ? x - w : x, y: milieu ? y - taille / 2 : y,
          w, texte: String(texte), taille, poids, police, couleur, interligne: 1, aligne, milieu });
}
function trait(ctx, x1, y1, x2, y2, couleur = CHARTE.filet, ep = 2, lie) {
  ctx.strokeStyle = couleur; ctx.lineWidth = ep; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  poser({ type: "ligne", lie, x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), couleur, ep, cap: ctx.lineCap });
}
function rectArrondi(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function boite(ctx, x, y, w, h, r, fond, bord = null, ep = 0) {
  rectArrondi(ctx, x, y, w, h, r); ctx.fillStyle = fond; ctx.fill();
  if (bord) { ctx.strokeStyle = bord; ctx.lineWidth = ep; ctx.stroke(); }
  poser({ type: "boite", x, y, w, h, r, fond, bord, ep });
}
function disque(ctx, cx, cy, r, couleur, lie) {
  ctx.fillStyle = couleur; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  poser({ type: "disque", lie, x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, couleur });
}
function croix(ctx, cx, cy, d, couleur, ep) {
  ctx.strokeStyle = couleur; ctx.lineWidth = ep; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d); ctx.stroke();
  poser({ type: "croix", x: cx - d, y: cy - d, w: 2 * d, h: 2 * d, couleur, ep });
}

// --- Dessin d'une page à partir de ses éléments -------------------------------------------------
const FONDS = {
  bordeaux: { nom: "Bordeaux", c1: CHARTE.fond, c2: CHARTE.fondBas },
  rose: { nom: "Rose poudré", c1: "#F3DDE1", c2: "#EBCBD1" },
  blanc: { nom: "Blanc", c1: "#FFFFFF", c2: "#F6F1F2" },
  nuit: { nom: "Nuit", c1: "#1E2230", c2: "#141722" },
};
function dessinerFond(ctx, fond, l, h) {
  const f = FONDS[fond] || FONDS.bordeaux, g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, f.c1); g.addColorStop(1, f.c2); ctx.fillStyle = g; ctx.fillRect(0, 0, l, h);
}
// Lignes affichées d'un élément texte (avec la police déjà réglée sur ctx).
function lignesElement(ctx, el) {
  ctx.font = `${el.poids || 400} ${el.taille}px ${el.police || CHARTE.texte}`;
  const t = el.maj ? String(el.texte).toUpperCase() : String(el.texte);
  return lignes(ctx, t, Math.max(10, el.w), el.ecart || 0);
}
function hauteurElement(ctx, el) {
  if (el.type !== "texte") return el.h;
  return Math.max(1, lignesElement(ctx, el).length) * el.taille * (el.interligne || 1.25);
}
const IMAGES_CHARGEES = new Map();   // ref → HTMLImageElement
function dessinerElement(ctx, el, { brouillon = false } = {}) {
  ctx.save();
  if (el.opacite != null && el.opacite < 1) ctx.globalAlpha = el.opacite;
  if (el.type === "texte") {
    const ls = lignesElement(ctx, el), pas = el.taille * (el.interligne || 1.25), ecart = el.ecart || 0;
    ctx.fillStyle = el.couleur || CHARTE.blanc; ctx.textBaseline = el.milieu ? "middle" : "top";
    ls.forEach((l, i) => {
      const w = largeurTexte(ctx, l, ecart), y = el.y + i * pas + (el.milieu ? pas / 2 : 0);
      let x = el.aligne === "center" ? el.x + (el.w - w) / 2 : el.aligne === "right" ? el.x + el.w - w : el.x;
      if (!ecart) { ctx.fillText(l, x, y); return; }
      for (const c of l) { ctx.fillText(c, x, y); x += ctx.measureText(c).width + ecart; }
    });
  } else if (el.type === "ligne") {
    ctx.strokeStyle = el.couleur; ctx.lineWidth = el.ep; ctx.lineCap = el.cap || "butt"; ctx.beginPath();
    if (el.w >= el.h) { ctx.moveTo(el.x, el.y + el.h / 2); ctx.lineTo(el.x + el.w, el.y + el.h / 2); }
    else { ctx.moveTo(el.x + el.w / 2, el.y); ctx.lineTo(el.x + el.w / 2, el.y + el.h); }
    ctx.stroke();
  } else if (el.type === "boite") {
    rectArrondi(ctx, el.x, el.y, el.w, el.h, Math.min(el.r || 0, el.w / 2, el.h / 2));
    if (el.fond) { ctx.fillStyle = el.fond; ctx.fill(); }
    if (el.bord && el.ep) { ctx.strokeStyle = el.bord; ctx.lineWidth = el.ep; ctx.stroke(); }
  } else if (el.type === "disque") {
    ctx.fillStyle = el.couleur; ctx.beginPath(); ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, 7); ctx.fill();
  } else if (el.type === "croix") {
    ctx.strokeStyle = el.couleur; ctx.lineWidth = el.ep; ctx.lineCap = "round"; ctx.beginPath();
    ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.w, el.y + el.h); ctx.moveTo(el.x + el.w, el.y); ctx.lineTo(el.x, el.y + el.h); ctx.stroke();
  } else if (el.type === "image") {
    const img = IMAGES_CHARGEES.get(el.ref);
    rectArrondi(ctx, el.x, el.y, el.w, el.h, Math.min(el.r || 0, el.w / 2, el.h / 2));
    if (img) { ctx.clip(); ctx.drawImage(img, el.x, el.y, el.w, el.h); }
    else if (brouillon) {
      ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill(); ctx.setLineDash([14, 10]); ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 3; ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = "#fff"; ctx.font = `500 30px ${CHARTE.texte}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Image à recoller", el.x + el.w / 2, el.y + el.h / 2);
    }
  }
  ctx.restore();
}
// Charge les images (enregistrées sur cet appareil) dont la page a besoin.
async function chargerImagesPage(page) {
  await Promise.all(page.elements.filter((e) => e.type === "image" && !IMAGES_CHARGEES.has(e.ref)).map((e) => new Promise((ok) => {
    let src = null; try { src = localStorage.getItem("lp-img:" + e.ref); } catch {}
    if (!src) return ok();
    const i = new Image(); i.onload = () => { IMAGES_CHARGEES.set(e.ref, i); ok(); }; i.onerror = ok; i.src = src;
  })));
}
// Dessine une page complète sur un canvas (nouveau ou fourni).
async function rendrePage(page, { canvas = null, brouillon = false, cache = null } = {}) {
  await chargerPolices(); await chargerImagesPage(page);
  const c = canvas || document.createElement("canvas"); c.width = page.l || L; c.height = page.h || H;
  const ctx = c.getContext("2d");
  dessinerFond(ctx, page.fond, c.width, c.height);
  for (const el of page.elements) if (!el.masque && el.id !== cache) dessinerElement(ctx, el, { brouillon });
  c.page = page;
  return c;
}
const copiePage = (p) => JSON.parse(JSON.stringify(p));

// Fond, surtitre et pied de page (signature + source) : identiques sur toutes les images.
function cadre(ctx, v, sig, { page, total } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, CHARTE.fond); g.addColorStop(1, CHARTE.fondBas);
  ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
  espace(ctx, v.surtitre || "Patrimoine", M, M, { taille: 26, ecart: 8, role: "surtitre" });
  if (total > 1) espace(ctx, `${page} / ${total}`, L - M, M, { taille: 24, ecart: 4, couleur: CHARTE.doux, aligne: "right", role: "pagination" });
  trait(ctx, M, M + 54, L - M, M + 54);
  // Pied : filet, nom du conseiller, cabinet, source.
  const yp = H - M - 92;
  trait(ctx, M, yp, L - M, yp);
  if (sig.nom) ecrire(ctx, sig.nom, M, yp + 26, { taille: 34, poids: 600, police: CHARTE.titre, role: "sig.nom" });
  if (sig.cabinet) espace(ctx, sig.cabinet, M, yp + 72, { taille: 22, ecart: 7, role: "sig.cabinet" });
  if (v.source) ecrire(ctx, "Source : " + v.source, L - M, yp + 34, { taille: 22, couleur: CHARTE.doux, aligne: "right", role: "source" });
  return { haut: M + 100, bas: yp - 40 };
}

// --- Les modèles -------------------------------------------------------------------------------
function dessinerChiffre(ctx, v, z) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3, role: "titre" }) + 70;
  ctx.font = `400 42px ${CHARTE.texte}`;
  const hBloc = 230 + 60 + Math.min(3, lignes(ctx, v.chiffre_legende, L - 2 * M).length) * 55, dispo = z.bas - y - (v.conclusion ? 150 : 0);
  y += Math.max(0, (dispo - hBloc) / 2 - 30);
  let t = 230; ctx.font = `700 ${t}px ${CHARTE.titre}`;
  while (ctx.measureText(v.chiffre).width > L - 2 * M && t > 90) { t -= 10; ctx.font = `700 ${t}px ${CHARTE.titre}`; }
  ecrire(ctx, v.chiffre, M - 6, y, { taille: t, poids: 700, police: CHARTE.titre, role: "chiffre" }); y += t + 20;
  trait(ctx, M, y, M + 140, y, CHARTE.rose, 6); y += 40;
  y += paragraphe(ctx, v.chiffre_legende, M, y, L - 2 * M, { taille: 42, couleur: CHARTE.doux, maxLignes: 3, role: "chiffre_legende" });
  conclusion(ctx, v, z, y);
}
function dessinerPoints(ctx, v, z, etapes = false) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3, role: "titre" }) + 56;
  const n = v.points.length, dispo = z.bas - y - (v.conclusion ? 150 : 20), pas = Math.min(230, dispo / n);
  y += Math.max(0, (dispo - n * pas) / 2 - 20);   // bloc centré dans l'espace disponible
  v.points.forEach((p, i) => {
    const cy = y + i * pas, lie = "points." + i;
    if (etapes) {
      if (i < n - 1) trait(ctx, M + 30, cy + 64, M + 30, cy + pas, CHARTE.filet, 3, lie);
      disque(ctx, M + 30, cy + 30, 30, CHARTE.rose, lie);
      ecrire(ctx, String(i + 1), M + 30, cy + 31, { taille: 30, poids: 700, police: CHARTE.titre, couleur: CHARTE.fond, aligne: "center", milieu: true, lie });
    } else {
      ecrire(ctx, String(i + 1).padStart(2, "0"), M, cy + 2, { taille: 46, poids: 700, police: CHARTE.titre, couleur: CHARTE.rose, lie });
      if (i < n - 1) trait(ctx, M + 100, cy + pas - 26, L - M, cy + pas - 26, "rgba(255,255,255,.12)", 2, lie);
    }
    paragraphe(ctx, p, M + 100, cy + 2, L - 2 * M - 100, { taille: 46, maxLignes: 2, interligne: 1.2, role: lie, lie });
  });
  conclusion(ctx, v, z, y + n * pas);
}
function dessinerComparaison(ctx, v, z) {
  let y = z.haut + 10;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 58, poids: 600, police: CHARTE.titre, maxLignes: 3, role: "titre" }) + 56;
  const w = (L - 2 * M - 40) / 2, dispo = z.bas - y - (v.conclusion ? 160 : 20), h = Math.min(560, dispo);
  y += Math.max(0, (dispo - h) / 2 - 20);
  [[v.gauche_titre, v.gauche, M, false, "gauche"], [v.droite_titre, v.droite, M + w + 40, true, "droite"]].forEach(([t, l, x, accent, cote]) => {
    boite(ctx, x, y, w, h, 28, accent ? "rgba(216,145,156,.16)" : CHARTE.carte, accent ? CHARTE.rose : null, accent ? 3 : 0);
    espace(ctx, t || "", x + 36, y + 40, { taille: 24, ecart: 5, couleur: accent ? CHARTE.rose : CHARTE.doux, role: cote + "_titre" });
    let ly = y + 104;
    l.forEach((ligne, i) => { ly += paragraphe(ctx, ligne, x + 36, ly, w - 72, { taille: 40, maxLignes: 3, interligne: 1.2, role: `${cote}.${i}`, lie: `${cote}.${i}` }) + 30; });
  });
  disque(ctx, L / 2, y + h / 2, 34, CHARTE.fond);
  ecrire(ctx, "→", L / 2, y + h / 2 + 2, { taille: 40, poids: 700, police: CHARTE.titre, couleur: CHARTE.rose, aligne: "center", milieu: true });
  conclusion(ctx, v, z, y + h);
}
function dessinerQuestion(ctx, v, z) {
  let y = z.haut + 60;
  ecrire(ctx, "“", M - 14, y - 70, { taille: 260, poids: 700, police: CHARTE.titre, couleur: CHARTE.rose });
  y += 170;
  y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 76, poids: 600, police: CHARTE.titre, maxLignes: 5, interligne: 1.15, role: "titre" });
  conclusion(ctx, v, z, y);
}
// Idée reçue barrée, puis la réalité (format « Mythe ou réalité »).
function dessinerMythe(ctx, v, z) {
  let y = z.haut + 10;
  if (v.titre) y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 52, poids: 600, police: CHARTE.titre, maxLignes: 2, role: "titre" }) + 44;
  const w = L - 2 * M, dispo = z.bas - y - (v.conclusion ? 150 : 20);
  const h1 = Math.min(300, dispo * .42), h2 = Math.min(380, dispo * .52), ecart = Math.max(30, dispo - h1 - h2);
  // carte « Idée reçue »
  boite(ctx, M, y, w, h1, 28, CHARTE.carte);
  espace(ctx, "Idée reçue", M + 40, y + 36, { taille: 24, ecart: 6, couleur: CHARTE.doux });
  const hm = paragraphe(ctx, v.mythe, M + 40, y + 90, w - 160, { taille: 46, couleur: CHARTE.doux, maxLignes: 3, interligne: 1.2, role: "mythe" });
  croix(ctx, L - M - 70, y + 70, 28, "#F27C8A", 12);
  trait(ctx, M + 40, y + 90 + hm / 2, M + 40 + Math.min(w - 200, 640), y + 90 + hm / 2, "rgba(242,124,138,.7)", 4);
  y += h1 + ecart / 2;
  // carte « En réalité »
  boite(ctx, M, y, w, h2, 28, "rgba(216,145,156,.16)", CHARTE.rose, 3);
  espace(ctx, "En réalité", M + 40, y + 36, { taille: 24, ecart: 6, couleur: CHARTE.rose });
  paragraphe(ctx, v.realite, M + 40, y + 90, w - 80, { taille: 48, poids: 600, police: CHARTE.titre, maxLignes: 5, interligne: 1.18, role: "realite" });
  conclusion(ctx, v, z, y + h2);
}
function conclusion(ctx, v, z, yMin) {
  if (!v.conclusion) return;
  ctx.font = `500 38px ${CHARTE.texte}`;
  const ls = lignes(ctx, v.conclusion, L - 2 * M - 40).slice(0, 2), h = ls.length * 48;
  const y = Math.max(yMin + 40, z.bas - h);
  trait(ctx, M, y, M, y + h - 6, CHARTE.rose, 6);
  paragraphe(ctx, v.conclusion, M + 34, y, L - 2 * M - 40, { taille: 38, poids: 500, couleur: CHARTE.blanc, maxLignes: 2, interligne: 1.2, role: "conclusion" });
}

// Typographie française : espace fine insécable avant % et € (« 4 % », « 31 865 € »).
const typoTexte = (x) => typeof x === "string" ? x.replace(/(\d)[   ]?(%|€)/g, "$1 $2") : x;
function typo(v) {
  const t = (x) => typeof x === "string" ? typoTexte(x) : Array.isArray(x) ? x.map(t) : x;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "libre" ? x : t(x)]));
}
// Texte alternatif (accessibilité) : décrit fidèlement ce que montre l'image.
function texteAlternatif(v) {
  const w = typo(v), parts = [`Visuel « ${w.titre} »`];
  if (w.modele === "chiffre" && w.chiffre) parts.push(`Chiffre clé : ${w.chiffre}${w.chiffre_legende ? ", " + w.chiffre_legende : ""}`);
  if ((w.modele === "points" || w.modele === "etapes") && w.points.length) parts.push((w.modele === "etapes" ? "Étapes : " : "Points clés : ") + w.points.map((p, i) => `${i + 1}. ${p}`).join(" ; "));
  if (w.modele === "comparaison") parts.push(`${w.gauche_titre} : ${w.gauche.join(", ")}. ${w.droite_titre} : ${w.droite.join(", ")}`);
  if (w.modele === "mythe") parts.push(`Idée reçue : ${w.mythe}. En réalité : ${w.realite}`);
  if (w.conclusion) parts.push(w.conclusion);
  return parts.map((p) => p.replace(/[.\s]+$/, "")).join(". ") + ".";
}

// Enregistre ce que dessine « dessin » dans une nouvelle page.
async function enregistrerPage(dessin) {
  await chargerPolices();
  const c = document.createElement("canvas"); c.width = L; c.height = H;
  REC = { l: L, h: H, fond: "bordeaux", elements: [] };
  try { dessin(c.getContext("2d")); return REC; } finally { REC = null; }
}
// La page du modèle choisi (sans modification libre).
function pageModele(v, sig) {
  v = typo(v);
  return enregistrerPage((ctx) => {
    const z = cadre(ctx, v, sig);
    ({ chiffre: dessinerChiffre, points: dessinerPoints, etapes: (a, b, d) => dessinerPoints(a, b, d, true), comparaison: dessinerComparaison, question: dessinerQuestion, mythe: dessinerMythe }[v.modele] || dessinerQuestion)(ctx, v, z);
  });
}
// Une image : la mise en page libre si elle existe, sinon le modèle choisi.
async function dessinerVisuel(v, sig) {
  return rendrePage(v.libre || await pageModele(v, sig));
}

// Carrousel : couverture, une page par idée, page finale.
async function dessinerCarrousel(v, sig) {
  v = typo(v);
  const contenu = [];
  if (v.modele === "chiffre" && v.chiffre) contenu.push({ ...v, modele: "chiffre", conclusion: "" });
  if (v.modele === "comparaison") contenu.push({ ...v, conclusion: "" });
  (v.points || []).forEach((p, i) => contenu.push({ type: "point", n: i + 1, texte: p }));
  const total = contenu.length + 2, pages = [];
  // 1. Couverture
  pages.push(await enregistrerPage((ctx) => {
    const z = cadre(ctx, v, sig, { page: 1, total });
    ctx.font = `700 92px ${CHARTE.titre}`;
    let y = z.haut + Math.max(60, (z.bas - z.haut - Math.min(5, lignes(ctx, v.titre, L - 2 * M).length) * 103 - 60) / 2);
    y += paragraphe(ctx, v.titre, M, y, L - 2 * M, { taille: 92, poids: 700, police: CHARTE.titre, maxLignes: 5, interligne: 1.1 }) + 50;
    trait(ctx, M, y, M + 160, y, CHARTE.rose, 6);
    espace(ctx, "Faites défiler  →", M, z.bas - 30, { taille: 26, ecart: 6 });
  }));
  // 2. Contenu
  for (const [i, c] of contenu.entries()) pages.push(await enregistrerPage((ctx) => {
    const z = cadre(ctx, v, sig, { page: i + 2, total });
    if (c.type === "point") {
      ctx.font = `600 68px ${CHARTE.titre}`;
      const h = 200 + 70 + Math.min(6, lignes(ctx, c.texte, L - 2 * M).length) * 80, y0 = z.haut + Math.max(20, (z.bas - z.haut - h) / 2);
      ecrire(ctx, String(c.n).padStart(2, "0"), M - 8, y0, { taille: 200, poids: 700, police: CHARTE.titre, couleur: CHARTE.rose });
      paragraphe(ctx, c.texte, M, y0 + 270, L - 2 * M, { taille: 68, poids: 600, police: CHARTE.titre, maxLignes: 6, interligne: 1.15 });
    } else if (c.modele === "chiffre") dessinerChiffre(ctx, c, z);
    else dessinerComparaison(ctx, c, z);
  }));
  // 3. Fin
  pages.push(await enregistrerPage((ctx) => {
    const z = cadre(ctx, v, sig, { page: total, total });
    ctx.font = `600 72px ${CHARTE.titre}`;
    let y = z.haut + Math.max(60, (z.bas - z.haut - Math.min(5, lignes(ctx, v.conclusion, L - 2 * M).length) * 85 - 160) / 2);
    if (v.conclusion) y += paragraphe(ctx, v.conclusion, M, y, L - 2 * M, { taille: 72, poids: 600, police: CHARTE.titre, maxLignes: 5, interligne: 1.15 }) + 60;
    trait(ctx, M, y, M + 160, y, CHARTE.rose, 6);
    paragraphe(ctx, "Parlons-en en commentaire ou en message.", M, y + 50, L - 2 * M, { taille: 38, couleur: CHARTE.doux, maxLignes: 2 });
  }));
  return Promise.all(pages.map((p) => rendrePage(p)));
}

// Page d'une diapositive du carrousel rédigé (couverture, idée ou fin), selon le modèle.
function pageDiapo(meta, x, i, total, sig) {
  const v = typo(meta); x = typo(x);
  return enregistrerPage((ctx) => {
    const z = cadre(ctx, v, sig, { page: i + 1, total });
    if (i === 0) {   // couverture
      ctx.font = `700 92px ${CHARTE.titre}`;
      let y = z.haut + Math.max(50, (z.bas - z.haut - Math.min(5, lignes(ctx, x.titre, L - 2 * M).length) * 103 - 200) / 2);
      y += paragraphe(ctx, x.titre, M, y, L - 2 * M, { taille: 92, poids: 700, police: CHARTE.titre, maxLignes: 5, interligne: 1.1, role: "d.titre" }) + 40;
      trait(ctx, M, y, M + 160, y, CHARTE.rose, 6); y += 40;
      if (x.texte) paragraphe(ctx, x.texte, M, y, L - 2 * M, { taille: 42, couleur: CHARTE.doux, maxLignes: 3, role: "d.texte" });
      espace(ctx, "Faites défiler  →", M, z.bas - 30, { taille: 26, ecart: 6 });
    } else if (i === total - 1) {   // fin
      ctx.font = `600 72px ${CHARTE.titre}`;
      let y = z.haut + Math.max(50, (z.bas - z.haut - 420) / 2);
      y += paragraphe(ctx, x.titre, M, y, L - 2 * M, { taille: 72, poids: 600, police: CHARTE.titre, maxLignes: 4, interligne: 1.15, role: "d.titre" }) + 40;
      trait(ctx, M, y, M + 160, y, CHARTE.rose, 6); y += 44;
      paragraphe(ctx, x.texte || "Parlons-en en commentaire ou en message.", M, y, L - 2 * M, { taille: 40, couleur: CHARTE.doux, maxLignes: 4, role: x.texte ? "d.texte" : undefined });
    } else {   // une idée
      ctx.font = `600 64px ${CHARTE.titre}`;
      const hT = Math.min(3, lignes(ctx, x.titre, L - 2 * M).length) * 76;
      ctx.font = `400 44px ${CHARTE.texte}`;
      const hX = Math.min(6, lignes(ctx, x.texte, L - 2 * M).length) * 58;
      let y = z.haut + Math.max(20, (z.bas - z.haut - (170 + hT + 40 + hX)) / 2);
      ecrire(ctx, String(i).padStart(2, "0"), M - 6, y, { taille: 150, poids: 700, police: CHARTE.titre, couleur: CHARTE.rose }); y += 170;
      y += paragraphe(ctx, x.titre, M, y, L - 2 * M, { taille: 64, poids: 600, police: CHARTE.titre, maxLignes: 3, interligne: 1.15, role: "d.titre" }) + 40;
      paragraphe(ctx, x.texte, M, y, L - 2 * M, { taille: 44, couleur: CHARTE.doux, maxLignes: 6, interligne: 1.3, role: "d.texte" });
    }
  });
}
// Carrousel rédigé diapositive par diapositive (format « Carrousel ») : une diapositive modifiée librement garde sa
// mise en page ; seul son numéro de page est remis à jour.
async function dessinerDiapos(meta, diapos, sig) {
  const total = diapos.length, pages = [];
  for (const [i, d] of diapos.entries()) {
    let p;
    if (d.libre) {
      p = d.libre;
      for (const el of p.elements) if (el.role === "pagination") el.texte = `${i + 1} / ${total}`;
    } else p = await pageDiapo(meta, d, i, total, sig);
    pages.push(await rendrePage(p));
  }
  return pages;
}

// Met à jour les textes liés au post (titre, points, signature…) dans une page modifiée librement, après un
// changement dans le panneau de droite. Un point supprimé retire ses éléments ; un point ajouté reçoit un texte.
function lireChamp(v, role, sig) {
  if (!role) return undefined;
  if (role === "sig.nom") return sig?.nom; if (role === "sig.cabinet") return sig?.cabinet;
  if (role === "source") return v.source ? "Source : " + v.source : "";
  if (role === "surtitre") return v.surtitre || "Patrimoine";
  if (role === "pagination") return undefined;
  if (role.startsWith("d.")) return v[role.slice(2)];
  const [k, i] = role.split(".");
  return i == null ? v[k] : (v[k] || [])[+i];
}
function synchroniserPage(page, v, sig) {
  if (!page) return page;
  const garder = [];
  for (const el of page.elements) {
    if (el.lie && lireChamp(v, el.lie) == null) continue;   // point retiré
    if (el.role && el.type === "texte") { const t = lireChamp(v, el.role, sig); if (t != null) el.texte = typoTexte(t); }
    garder.push(el);
  }
  page.elements = garder;
  // Points ajoutés après une modification libre : posés sous le dernier point.
  for (const cle of ["points", "gauche", "droite"]) (v[cle] || []).forEach((t, i) => {
    const role = `${cle}.${i}`;
    if (page.elements.some((e) => e.role === role)) return;
    const precedents = page.elements.filter((e) => e.role && e.role.startsWith(cle + "."));
    if (!precedents.length) return;
    const dernier = precedents[precedents.length - 1];
    page.elements.push({ ...dernier, id: nouvelId(), role, lie: role, texte: typoTexte(t), y: Math.min(H - 200, dernier.y + dernier.taille * 2.6) });
  });
  return page;
}
// Écrit dans le post un texte modifié directement sur l'image (pour garder le panneau de droite à jour).
function ecrireChamp(v, role, texte) {
  if (!role || /^(sig\.|source$|pagination$)/.test(role)) return false;
  if (role.startsWith("d.")) { v[role.slice(2)] = texte; return true; }
  const [k, i] = role.split(".");
  if (i == null) v[k] = texte; else if (Array.isArray(v[k])) v[k][+i] = texte; else return false;
  return true;
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
