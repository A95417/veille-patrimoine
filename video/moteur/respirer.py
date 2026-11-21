"""Respiration entre les scènes d'une vidéo (après le calage de la voix).
Usage : python3 respirer.py job.json voix.flac calage.json
- rythme « posé » (carte de fin : p.rythme = "pose") : un silence de PAUSE_POSE s entre deux scènes ;
- toute scène (hors carte de fin) dure au moins SCENE_MIN s : le temps de lire l'écran.
Le silence est inséré dans la voix au milieu du blanc entre deux scènes, et tous les temps du calage sont décalés.
Mêmes valeurs que le site (src/video.js) et l'aperçu (public/video-apercu.js)."""
import json, subprocess, sys
import numpy as np

PAUSE_POSE, SCENE_MIN, TAUX = .7, 2.4, 48000
job = json.load(open(sys.argv[1], encoding="utf-8"))
voix, calf = sys.argv[2], sys.argv[3]
cal = json.load(open(calf, encoding="utf-8"))
scenes_job = job["scenes"]
fin = next((s for s in scenes_job if s.get("type") == "fin"), None)
pose = bool(fin and (fin.get("p") or {}).get("rythme") == "pose")
S = cal["scenes"]; n = len(S)

# silences à insérer : (instant de coupe dans la voix d'origine, durée)
coupes = []
for i in range(n - 1):
    if scenes_job[i].get("type") == "fin": continue
    duree = S[i]["fin"] - S[i]["debut"]
    ajout = (PAUSE_POSE if pose else 0) + max(0.0, SCENE_MIN - duree)
    if ajout < .05: continue
    a, b = S[i]["PF"][-1], S[i + 1]["P"][0]
    coupes.append(((a + b) / 2 if b > a else a, round(ajout, 3), i + 1))
if not coupes:
    print("respiration : aucune pause ajoutée"); sys.exit(0)

brut = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", voix, "-ac", "1", "-ar", str(TAUX), "-f", "s16le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(brut, np.int16)
morceaux, prec = [], 0
for t, d, _ in coupes:
    k = min(len(a), max(prec, int(round(t * TAUX))))
    morceaux += [a[prec:k], np.zeros(int(round(d * TAUX)), np.int16)]; prec = k
morceaux.append(a[prec:])
sortie = np.concatenate(morceaux)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(TAUX), "-ac", "1", "-i", "-", voix], input=sortie.tobytes(), check=True)

def decale(x):
    return round(x + sum(d for t, d, _ in coupes if x >= t), 3)
for s in S:
    s["P"] = [decale(x) for x in s["P"]]; s["PF"] = [decale(x) for x in s["PF"]]
# débuts et fins de scènes : la scène i garde le silence ajouté après elle (la scène suivante commence après ce silence)
debut_min = {k: round(t + sum(dd for tt, dd, _ in coupes if tt <= t), 3) for t, d, k in coupes}
for i, s in enumerate(S):
    s["debut"] = 0.0 if i == 0 else max(decale(s["debut"]), debut_min.get(i, 0))
for i, s in enumerate(S):
    if i + 1 < n: s["fin"] = S[i + 1]["debut"]
S[-1]["fin"] = decale(S[-1]["fin"])
for m in cal["mots"]: m["debut"], m["fin"] = decale(m["debut"]), decale(m["fin"])
for p in cal["phrases"]: p["debut"], p["fin"] = decale(p["debut"]), decale(p["fin"])
total = sum(d for _, d, _ in coupes)
cal["duree_voix"] = round(cal["duree_voix"] + total, 3); cal["duree_totale"] = S[-1]["fin"]
cal["pauses_ajoutees"] = round(total, 3)   # à retirer pour mesurer le vrai débit de la voix
json.dump(cal, open(calf, "w", encoding="utf-8"), ensure_ascii=False)
print(f"respiration : {len(coupes)} pause(s), {total:.1f} s ajoutées ({'rythme posé' if pose else 'durée minimale des scènes'}) ; durée {cal['duree_totale']:.1f} s")
