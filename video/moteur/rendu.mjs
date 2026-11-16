// Rendu des images : une vidéo par scène (Chromium sans écran), puis assemblage sans réencodage.
// Usage : node rendu.mjs job.json calage.json dossier [processus=3]       (vidéo complète)
//         node rendu.mjs job.json calage.json dossier stills 1.2 5 9.5   (images de contrôle)
// Sorties : dossier/video_muette.mp4, evenements.json, alertes.json, miniature.jpg ; lignes « PROGRESSION n/total » pour le suivi.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { spawn, execFileSync } from "child_process";
const { chromium } = createRequire(import.meta.url)("playwright");

const [jobF, calF, dossier, mode, ...reste] = process.argv.slice(2);
const job = JSON.parse(fs.readFileSync(jobF, "utf8")), cal = JSON.parse(fs.readFileSync(calF, "utf8"));
const ICI = path.dirname(new URL(import.meta.url).pathname);
const H = job.format === "4:5" ? 1350 : 1920, FPS = 30;
fs.mkdirSync(dossier, { recursive: true });

const navigateur = await chromium.launch();
async function page() {
  const p = await navigateur.newPage({ viewport: { width: 1080, height: H } });
  await p.goto("file://" + path.join(ICI, "moteur.html"));
  await p.evaluate(([j, c]) => window.init(j, c), [job, cal]);
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.imagesPretes && window.imagesPretes());
  return p;
}

if (mode === "stills") {
  const p = await page();
  for (const t of reste) { await p.evaluate((x) => window.draw(x), +t); await p.screenshot({ path: path.join(dossier, `t${t}.jpg`), type: "jpeg", quality: 85 }); }
  console.log(JSON.stringify(await p.evaluate(() => window.alertes())));
  await navigateur.close(); process.exit(0);
}

const N = Math.max(1, Math.min(4, Number(mode) || 3));
const scenes = cal.scenes.map((s, i) => ({ i, a: Math.round(s.debut * FPS) / FPS, z: s.fin, n: Math.round(s.fin * FPS) - Math.round(s.debut * FPS) }));
const total = scenes.reduce((x, s) => x + s.n, 0);
let fait = 0, dernier = 0;
const alertes = new Set();
const file = [...scenes].sort((x, y) => y.n - x.n);   // les plus longues d'abord
async function ouvrier() {
  const p = await page();
  while (file.length) {
    const s = file.shift(), tmp = path.join(dossier, `s${s.i}.tmp.mp4`);
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-r", String(FPS), tmp]);
    for (let f = 0; f < s.n; f++) {
      await p.evaluate((t) => window.draw(t), s.a + f / FPS);
      const buf = await p.screenshot({ type: "jpeg", quality: 90 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      fait++;
      if (fait - dernier >= 30) { dernier = fait; console.log(`PROGRESSION ${fait}/${total}`); }
    }
    ff.stdin.end();
    const code = await new Promise((r) => ff.on("close", r));
    if (code !== 0) throw new Error(`encodage de la scène ${s.i + 1} en échec`);
    fs.renameSync(tmp, path.join(dossier, `s${s.i}.mp4`));
  }
  (await p.evaluate(() => window.alertes())).forEach((a) => alertes.add(a));
}
await Promise.all(Array.from({ length: Math.min(N, scenes.length) }, ouvrier));

// Miniature : au moment où le gros chiffre de l'accroche est affiché, sinon à 1,5 s.
const p = await page();
const s0 = cal.scenes[0], tMini = s0.P.length > 1 ? Math.min(s0.fin - .1, s0.P[1] + 1.0) : Math.min(s0.fin - .1, 1.5);
await p.evaluate((t) => window.draw(t), tMini);
await p.screenshot({ path: path.join(dossier, "miniature.jpg"), type: "jpeg", quality: 82 });
fs.writeFileSync(path.join(dossier, "evenements.json"), JSON.stringify(await p.evaluate(() => window.evenements())));
(await p.evaluate(() => window.alertes())).forEach((a) => alertes.add(a));
fs.writeFileSync(path.join(dossier, "alertes.json"), JSON.stringify([...alertes]));
await navigateur.close();

fs.writeFileSync(path.join(dossier, "liste.txt"), scenes.map((s) => `file 's${s.i}.mp4'`).join("\n"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(dossier, "liste.txt"), "-c", "copy", path.join(dossier, "video_muette.mp4")]);
console.log(`PROGRESSION ${total}/${total}`);
console.log(`rendu terminé : ${scenes.length} scènes, ${total} images, ${alertes.size} alerte(s)`);
