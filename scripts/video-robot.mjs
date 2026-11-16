// Robot « Création Post › Vidéo » (GitHub Actions) : fabrique une vidéo demandée depuis le site.
// Étapes : voix Gemini (texte seul, jamais de consigne) → nettoyage → calage → rendu des images → musique et bruitages
// → montage → contrôles automatiques → envoi au site par morceaux. Le site affiche l'avancement et le temps restant.
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { choisirModeleVoix, genererVoix } from "./gemini.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, ""), JETON = process.env.ROBOT_TOKEN || "", ID = process.env.VIDEO_ID || "";
const M = "video/moteur";
const VOIX_OK = new Set(["Sadachbia", "Puck", "Zephyr", "Laomedeia", "Fenrir", "Leda", "Achird", "Kore", "Charon", "Sulafat", "Orus", "Gacrux"]);
const MORCEAU = 524_288;   // 512 Ko par morceau, envoyés en base64 (lecture rapide côté site)
const t0 = Date.now();

// Appel au site, avec 4 essais en cas de coupure réseau ou d'erreur 5xx (connexion fermée, surcharge passagère).
// Mode « essai » (lancement manuel avec video_id = essai) : vidéo d'exemple, rien n'est envoyé au site.
const ESSAI = ID === "essai";
async function site(chemin, corps, methode = "POST", type = "application/json", id = ID) {
  if (ESSAI) return chemin === "" ? { statut: "attente", job: { ...JSON.parse(readFileSync(`${M}/essai.json`, "utf8")), voix: "Sadachbia", duree_estimee: 55 } } : {};
  for (let essai = 1; ; essai++) {
    try {
      const r = await fetch(`${SITE}/api/robot/video/${id}${chemin}`, {
        method: methode, headers: { Authorization: `Bearer ${JETON}`, Connection: "close", ...(corps !== undefined ? { "Content-Type": type } : {}) },
        body: corps === undefined ? undefined : type === "application/json" ? JSON.stringify(corps) : corps,
        signal: AbortSignal.timeout(60000),
      });
      const t = await r.text();
      if (r.status >= 500 && essai < 4) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) throw Object.assign(new Error(`site ${chemin} : HTTP ${r.status} ${t.slice(0, 200)}`), { definitif: true });
      return t ? JSON.parse(t) : {};
    } catch (e) {
      if (e.definitif || essai >= 4) throw e;
      console.log(`nouvel essai (${essai}) ${chemin} : ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 2000 * essai));
    }
  }
}
class Annule extends Error {}
let derniereMaj = 0;
async function etat(etape, progression, eta, force = true) {
  if (!force && Date.now() - derniereMaj < 5000) return;
  derniereMaj = Date.now();
  const r = await site("/etat", { etape, progression: Math.round(progression * 1000) / 1000, eta_s: Math.max(0, Math.round(eta)) });
  if (r.annule) throw new Annule("annulée depuis le site");
}
const py = (...a) => execFileSync("python3", a, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

try {
  if (!ID) throw new Error("identifiant de vidéo manquant");
  const { job, statut } = await site("", undefined, "GET");
  // « en_cours » : l'étape de préparation du workflow a déjà prévenu le site
  if (!["attente", "en_cours"].includes(statut)) { console.log("Vidéo déjà traitée ou annulée :", statut); process.exit(0); }
  const second = job.deux_formats || null;   // 2e format (même voix, aucun quota en plus)
  const nbImages = Math.round(job.duree_estimee * 30) * (second ? 2 : 1);
  let vitesse = 22;   // images par seconde, ajustée pendant le rendu
  const restant = (dejaImages = 0) => 25 + Math.max(0, nbImages - dejaImages) / vitesse + 25;
  await etat("Voix off", .05, 30 + restant());
  writeFileSync("job.json", JSON.stringify(job));

  // 1) Voix : uniquement le texte du scénario (une consigne de ton serait lue à voix haute).
  const texte = job.scenes.map((s) => s.texte.trim()).join("\n");
  const voix = VOIX_OK.has(job.voix) ? job.voix : "Sadachbia";
  const modele = await choisirModeleVoix();
  if (!modele) throw new Error("aucun modèle de voix Gemini disponible");
  await fetch(`${SITE}/api/robot/ia/quota`, { method: "POST", headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" }, body: JSON.stringify({ ajouts: { [modele]: 1 } }) });
  const v = await genererVoix(modele, texte, voix);
  if (v.quota) throw new Error("quota gratuit de la voix Gemini atteint pour aujourd'hui : réessayez demain");
  writeFileSync("voix.pcm", v.pcm);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(v.taux), "-ac", "1", "-i", "voix.pcm", "voix_brute.flac"]);

  // 2) Nettoyage (clic de départ, grésillement de fin) puis calage des phrases et des mots.
  await etat("Nettoyage et calage de la voix", .15, restant());
  const rapport = py(`${M}/nettoyer_voix.py`, "voix_brute.flac", "voix.flac", "1.08");
  console.log(rapport);
  if (!/pics saturés restants : aucun/.test(rapport)) throw new Error("la voix contient encore un grésillement après nettoyage");
  console.log(py(`${M}/calage.py`, "job.json", "voix.flac", "calage.json"));
  const cal = JSON.parse(readFileSync("calage.json", "utf8"));
  const total = Math.round(cal.duree_totale * 30);

  // 3) Rendu des images, avec suivi (deux passes si les deux formats sont demandés).
  const totalImages = total * (second ? 2 : 1);
  await etat("Animation des scènes", .2, 25 + totalImages / vitesse + 20);
  const debutRendu = Date.now();
  const rendre = (jobF, dossier, deja) => new Promise((ok, ko) => {
    const p = spawn("node", [`${M}/rendu.mjs`, jobF, "calage.json", dossier, "4"], { stdio: ["ignore", "pipe", "inherit"] });
    p.stdout.on("data", async (d) => {
      const m = String(d).match(/PROGRESSION (\d+)\/(\d+)/g);
      if (!m) return console.log(String(d).trim());
      const fait = deja + Number(m[m.length - 1].match(/(\d+)\//)[1]);
      const ecoule = (Date.now() - debutRendu) / 1000;
      if (fait > 60 && ecoule > 3) vitesse = fait / ecoule;
      try { await etat(`Animation des scènes${second ? " · format " + (deja ? second : job.format) : ""} · ${Math.round(fait / totalImages * 100)} %`, .2 + .65 * fait / totalImages, (totalImages - fait) / vitesse + 20, false); }
      catch (e) { p.kill(); ko(e); }
    });
    p.on("close", (c) => (c === 0 ? ok() : ko(new Error("le rendu des images a échoué"))));
  });
  await rendre("job.json", "sortie", 0);
  if (second) { writeFileSync("job2.json", JSON.stringify({ ...job, format: second })); await rendre("job2.json", "sortie2", total); }

  // 4) Musique, bruitages, montage.
  await etat("Musique et montage", .88, 18);
  console.log(py(`${M}/son.py`, "calage.json", "sortie/evenements.json", "musique.wav", "bruitages.wav", job.ambiance || "dynamique"));
  execFileSync("bash", [`${M}/monter.sh`, "sortie/video_muette.mp4", "voix.flac", "musique.wav", "bruitages.wav", "video.mp4", String(cal.duree_totale)], { stdio: "inherit" });
  if (second) execFileSync("bash", [`${M}/monter.sh`, "sortie2/video_muette.mp4", "voix.flac", "musique.wav", "bruitages.wav", "video2.mp4", String(cal.duree_totale)], { stdio: "inherit" });

  // 5) Contrôles automatiques : son (pics saturés, clic de départ), textes suspects, durée, poids.
  await etat("Contrôle qualité", .93, 10);
  const audio = py("-c", `
import subprocess, numpy as np, json
a = np.frombuffer(subprocess.run(["ffmpeg","-loglevel","error","-i","video.mp4","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout, np.int16)/32768
sat = sorted(set(np.round(np.where(np.abs(a) > 0.97)[0] / 16000, 1).tolist()))
v = np.frombuffer(subprocess.run(["ffmpeg","-loglevel","error","-i","voix.flac","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout, np.int16)/32768
print(json.dumps({"pics": sat[:20], "debut": round(float(np.abs(v[:240]).max()), 3), "duree": round(len(a) / 16000, 2)}))`);
  const son = JSON.parse(audio.trim().split("\n").pop());
  const alertes = JSON.parse(readFileSync("sortie/alertes.json", "utf8"));
  if (son.pics.length) alertes.push(`son saturé vers ${son.pics.slice(0, 5).join(", ")} s`);
  if (son.debut > .3) alertes.push("clic possible au tout début de la voix");
  // Durée : la vidéo doit correspondre à la durée demandée (± 15 %).
  if (job.duree_cible && Math.abs(son.duree - job.duree_cible) > job.duree_cible * .15)
    alertes.push(`durée ${Math.round(son.duree)} s au lieu de ${job.duree_cible} s demandées : la voix a lu ${son.duree < job.duree_cible ? "plus vite" : "plus lentement"} que prévu`);
  const taille = statSync("video.mp4").size;
  if (taille > 80 * MORCEAU || (second && statSync("video2.mp4").size > 80 * MORCEAU)) throw new Error("vidéo trop lourde pour être stockée sur le site (40 Mo max)");

  // Sous-titres .srt (pour LinkedIn) à partir du calage.
  const hms = (s) => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600e3), m = Math.floor(ms / 60e3) % 60, se = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(se).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`; };
  const srt = cal.phrases.map((p, i) => `${i + 1}\n${hms(p.debut)} --> ${hms(p.fin + .3)}\n${p.texte.replace(/ /g, " ")}\n`).join("\n");

  if (ESSAI) { console.log(`ESSAI RÉUSSI : ${(statSync("video.mp4").size / 1e6).toFixed(1)} Mo, ${son.duree} s, alertes : ${JSON.stringify(alertes)}, fabrication ${Math.round((Date.now() - t0) / 1000)} s`); process.exit(0); }
  // 6) Envoi au site, par morceaux (puis le second format dans une vidéo jumelle).
  const envoyer = async (fichier, dossier, id, part) => {
    const octets = readFileSync(fichier), n = Math.ceil(octets.length / MORCEAU);
    for (let i = 0; i < n; i++) {
      if (id === ID) await etat(`Envoi de la vidéo · ${i + 1}/${n}`, .95 + .04 * (part + i / n) / (second ? 2 : 1), (n - i), false);
      const r = await site(`/morceau/${i}`, Buffer.from(octets.subarray(i * MORCEAU, (i + 1) * MORCEAU)).toString("base64"), "PUT", "text/plain", id);
      if (r.annule) throw new Annule("annulée depuis le site");
    }
    const miniature = existsSync(`${dossier}/miniature.jpg`) ? readFileSync(`${dossier}/miniature.jpg`).toString("base64") : null;
    await site("/fin", { morceaux: n, taille: octets.length, duree: son.duree, srt, miniature, alertes, duree_fabrication: Math.round((Date.now() - t0) / 1000) }, "POST", "application/json", id);
    console.log(`Vidéo envoyée (${id.slice(0, 8)}) : ${(octets.length / 1e6).toFixed(1)} Mo, ${son.duree} s, ${alertes.length} alerte(s).`);
  };
  if (second) {
    // la jumelle est créée tant que la principale est encore « en cours »
    const { id: id2 } = await site("/jumelle", {});
    await envoyer("video.mp4", "sortie", ID, 0);
    await envoyer("video2.mp4", "sortie2", id2, 1);
  } else await envoyer("video.mp4", "sortie", ID, 0);
} catch (e) {
  console.error(e);
  if (!(e instanceof Annule)) {
    try { await site("/etat", { erreur: String(e.message || e).slice(0, 300) }); } catch {}
    process.exit(1);
  }
}
