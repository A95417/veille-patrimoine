// Voix off pour une vidéo (lancement manuel) : texte → WAV, avec la voix Gemini gratuite. Compte dans le quota partagé.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { choisirModeleVoix, genererVoix } from "./gemini.mjs";
const SITE = (process.env.SITE_URL || "").replace(/\/$/, ""), JETON = process.env.ROBOT_TOKEN || "";
const texte = Buffer.from(process.env.TEXTE_B64 || "", "base64").toString("utf8").trim();
const voix = process.env.VOIX || "Puck";
if (!texte) throw new Error("Texte vide.");
const modele = await choisirModeleVoix();
console.log("Modèle :", modele, "· voix :", voix, "·", texte.length, "caractères");
await fetch(`${SITE}/api/robot/ia/quota`, { method: "POST", headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" }, body: JSON.stringify({ ajouts: { [modele]: 1 } }) });
const r = await genererVoix(modele, texte, voix);
if (r.quota) { console.log("Quota de la voix atteint :", r.detail || ""); process.exit(1); }
writeFileSync("voix.pcm", r.pcm);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(r.taux), "-ac", "1", "-i", "voix.pcm", "voix.wav"]);
console.log("Durée :", (r.pcm.length / 2 / r.taux).toFixed(1), "s");
