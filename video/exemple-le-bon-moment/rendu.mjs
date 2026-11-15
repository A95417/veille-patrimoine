// node rendu.mjs stills t1 t2 ...   |   node rendu.mjs scene i
import { createRequire } from "module"; const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "fs"; import { spawn } from "child_process";
const mots = JSON.parse(fs.readFileSync("timing.json", "utf8")).mots; const ancres = JSON.parse(fs.readFileSync("ancres.json", "utf8"));
const SC = [[0,4.45],[4.45,9.75],[9.75,14.35],[14.35,17.95],[17.95,22.9],[22.9,28.6],[28.6,35.0],[35.0,41.25],[41.25,45.15],[45.15,53.6]];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto("file://" + process.cwd() + "/scene.html"); await p.evaluate(([m, a]) => window.init(m, a), [mots, ancres]);
await p.evaluate(() => document.fonts.ready);
const mode = process.argv[2];
if (mode === "stills") {
  for (const t of process.argv.slice(3)) { await p.evaluate((t) => window.draw(t), +t); await p.screenshot({ path: `controle/t${t}.jpg`, type: "jpeg", quality: 80 }); }
} else {
  for (const i of process.argv.slice(3).map(Number)) {
    const [a, z] = SC[i], n = Math.round((z - a) * 30), tmp = `scenes/s${i}.tmp.mp4`;
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", tmp]);
    for (let f = 0; f < n; f++) {
      await p.evaluate((t) => window.draw(t), a + f / 30);
      const buf = await p.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    }
    ff.stdin.end(); const code = await new Promise((r) => ff.on("close", r));
    if (code === 0) fs.renameSync(tmp, `scenes/s${i}.mp4`); console.log("scène", i, n, "images", code);
  }
}
await b.close();
