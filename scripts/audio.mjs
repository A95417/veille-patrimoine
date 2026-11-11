// Version audio des briefs : le texte du brief est lu par une voix de synthèse naturelle (Gemini, offre gratuite,
// environ 10 lectures par jour : on en utilise au plus 4), puis compressé en MP3 et enregistré sur le site.
// Lancement autonome : node scripts/audio.mjs  → produit l'audio du brief le plus récent s'il n'en a pas encore.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { choisirModeleVoix, genererVoix } from "./gemini.mjs";

const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");
const JETON = process.env.ROBOT_TOKEN || "";
const MAX_PAR_JOUR = 4;

async function appelSite(chemin, methode = "GET", corps) {
  const r = await fetch(SITE + chemin, {
    method: methode,
    headers: { Authorization: `Bearer ${JETON}`, "Content-Type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${chemin} → HTTP ${r.status} ${t.slice(0, 200)}`);
  return JSON.parse(t);
}

// Texte lu : le même que sur le site (synthèse, chiffre du jour, points à retenir, titres, marchés).
export function texteOral(b) {
  const jour = new Date(b.jour + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const parts = [b.edition === "soir" ? `Bonsoir. Voici le point de la journée, ${jour}.` : `Bonjour. Voici le brief du matin, ${jour}.`];
  if (b.synthese) parts.push(b.synthese);
  if (b.chiffre_du_jour) parts.push(`Le chiffre du jour : ${b.chiffre_du_jour.valeur}. ${b.chiffre_du_jour.libelle}.`);
  if ((b.a_retenir || []).length) parts.push(b.edition === "soir" ? "À garder en tête pour demain." : "À retenir pour vos rendez-vous.", ...b.a_retenir.map((p) => p.texte));
  if ((b.actualites || []).length) parts.push("Les principales actualités.", ...b.actualites.slice(0, 6).map((a) => a.titre + "."));
  if (b.commentaire_marches) parts.push("Côté marchés.", b.commentaire_marches);
  parts.push(b.edition === "soir" ? "Bonne soirée." : "Bonne journée.");
  return parts.join(" ");
}

function ffmpegDisponible() {
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; } catch {}
  try {   // runner GitHub : installation à la demande (une vingtaine de secondes)
    execFileSync("sudo", ["apt-get", "update", "-qq"], { stdio: "ignore", timeout: 180000 });
    execFileSync("sudo", ["apt-get", "install", "-y", "-qq", "ffmpeg"], { stdio: "ignore", timeout: 300000 });
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch { return false; }
}

// Produit et enregistre l'audio d'un brief. Renvoie true si c'est fait.
export async function produireAudio(brief) {
  if (!process.env.GEMINI_API_KEY || !brief) return false;
  const quota = await appelSite("/api/robot/ia/quota");
  const modele = await choisirModeleVoix();
  if (!modele) { console.log("Audio : aucun modèle de voix disponible avec cette clé."); return false; }
  if ((quota.compteurs?.[modele] || 0) >= MAX_PAR_JOUR) { console.log("Audio : quota du jour déjà utilisé."); return false; }
  if (!ffmpegDisponible()) { console.log("Audio : ffmpeg indisponible, version audio non produite."); return false; }

  // On n'envoie que le texte du brief : toute consigne ajoutée risquerait d'être lue à voix haute.
  await appelSite("/api/robot/ia/quota", "POST", { ajouts: { [modele]: 1 } });
  const r = await genererVoix(modele, texteOral(brief));
  if (r.quota) { console.log("Audio : quota de la voix atteint.", r.detail || ""); return false; }

  const dossier = mkdtempSync(join(tmpdir(), "brief-audio-"));
  try {
    writeFileSync(join(dossier, "voix.pcm"), r.pcm);
    // MP3 mono 32 kbit/s : très lisible pour la voix, et léger (environ 1 Mo pour 4 minutes).
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(r.taux), "-ac", "1", "-i", join(dossier, "voix.pcm"),
      "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "32k", join(dossier, "voix.mp3")]);
    let mp3 = readFileSync(join(dossier, "voix.mp3"));
    if (mp3.length > 1350000) {   // brief très long : on compresse davantage pour rester sous la limite de la base
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", String(r.taux), "-ac", "1", "-i", join(dossier, "voix.pcm"),
        "-ar", "16000", "-codec:a", "libmp3lame", "-b:a", "24k", join(dossier, "voix.mp3")]);
      mp3 = readFileSync(join(dossier, "voix.mp3"));
    }
    const duree = r.pcm.length / 2 / r.taux;
    await appelSite("/api/robot/brief/audio", "POST", { jour: brief.jour, edition: brief.edition || "matin", mime: "audio/mpeg",
      donnees: mp3.toString("base64"), duree: Math.round(duree) });
    console.log(`Audio du brief ${brief.jour} (${brief.edition}) enregistré : ${Math.round(duree)} s, ${Math.round(mp3.length / 1024)} Ko, voix ${modele}.`);
    return true;
  } finally {
    rmSync(dossier, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const { brief, audio } = await appelSite("/api/robot/brief/dernier");
    if (!brief) { console.log("Audio : aucun brief."); return; }
    if (audio && !/^(oui|1|true)$/i.test(process.env.AUDIO_FORCER || "")) return;   // déjà produit : rien à faire
    await produireAudio(brief);
  })().catch((e) => { console.error("Échec de l'audio :", e.message); process.exit(1); });
}
