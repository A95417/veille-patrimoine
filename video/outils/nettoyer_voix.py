"""Nettoie une voix Gemini TTS avant montage.

Usage : python3 nettoyer_voix.py entree.flac sortie.flac [tempo=1.08]

- accélère sans changer la hauteur (atempo) ;
- repère la parole (énergie par fenêtres de 20 ms) ;
- supprime les « parasites » : segments très courts au début ou à la fin, ou tout segment court contenant
  un pic saturé (clic de départ, grésillement « radio » de fin, comme sur les voix de novembre 2026) ;
- coupe avant le premier mot et après le dernier, avec fondus courts ;
- vérifie qu'il ne reste aucun pic saturé et affiche un rapport.
"""
import subprocess, sys, numpy as np

ent, sor = sys.argv[1], sys.argv[2]
tempo = float(sys.argv[3]) if len(sys.argv) > 3 else 1.08
SR = 24000

def lire(f, filtre=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", f] + (["-af", filtre] if filtre else []) + ["-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768

x = lire(ent, f"atempo={tempo}" if tempo != 1 else None)
W = int(0.02 * SR)
n = len(x) // W
rms = np.sqrt((x[: n * W].reshape(n, W) ** 2).mean(1))
pic = np.abs(x[: n * W].reshape(n, W)).max(1)
parle = rms > 0.01

# segments de parole (fusion des trous < 0,12 s)
segs, i = [], 0
while i < n:
    if parle[i]:
        j = i
        while j < n and (parle[j] or (j + 6 < n and parle[j:j + 6].any())): j += 1
        segs.append([i, j]); i = j
    else:
        i += 1
garde = []
for k, (a, b) in enumerate(segs):
    duree = (b - a) * W / SR
    sature = pic[a:b].max() > 0.95
    bord = k == 0 or k == len(segs) - 1
    if (sature and duree < 0.4) or (bord and duree < 0.12):
        print(f"parasite supprimé : {a * W / SR:.2f}–{b * W / SR:.2f} s (durée {duree:.2f} s, crête {pic[a:b].max():.2f})")
        x[a * W:b * W] = 0
    else:
        garde.append((a, b))
if not garde: sys.exit("aucune parole détectée")
debut = max(0, garde[0][0] * W / SR - 0.04)
fin = garde[-1][1] * W / SR + 0.10
y = x[int(debut * SR):int(fin * SR)].copy()
f1, f2 = int(0.03 * SR), int(0.08 * SR)
y[:f1] *= np.linspace(0, 1, f1); y[-f2:] *= np.linspace(1, 0, f2)
reste = np.where(np.abs(y) > 0.95)[0]
print(f"parole conservée : {debut:.2f} → {fin:.2f} s de la prise accélérée ; durée finale {len(y) / SR:.2f} s")
print("pics saturés restants :", "aucun" if len(reste) == 0 else sorted(set(np.round(reste / SR, 2))))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "flac", sor],
               input=(np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes(), check=True)
