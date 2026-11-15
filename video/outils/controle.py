"""Contrôle d'une vidéo finie avant envoi.

Usage : python3 controle.py video.mp4 [dossier_sortie=controle_final]
- extrait une image toutes les 0,25 s et fait des planches de 24 images (à regarder TOUTES) ;
- analyse le son : pics saturés, bruit avant la première parole, bruit après la fin.
"""
import subprocess, sys, os, glob, numpy as np
from PIL import Image, ImageDraw
v = sys.argv[1]; d = sys.argv[2] if len(sys.argv) > 2 else "controle_final"
os.makedirs(d, exist_ok=True)
for f in glob.glob(f"{d}/f*.jpg"): os.remove(f)
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", v, "-vf", "fps=4,scale=270:480", f"{d}/f%03d.jpg"], check=True)
fs = sorted(glob.glob(f"{d}/f*.jpg"))
for k in range(0, len(fs), 24):
    im = Image.new("RGB", (270 * 8, 500 * 3), "white"); dr = ImageDraw.Draw(im)
    for i, f in enumerate(fs[k:k + 24]):
        x, y = (i % 8) * 270, (i // 8) * 500
        im.paste(Image.open(f), (x, y + 20)); n = int(f[-7:-4]); dr.text((x + 5, y + 3), f"{(n - 1) / 4:.2f}s", fill="black")
    im.save(f"{d}/planche{k // 24:02d}.jpg")
print(f"{len(fs)} images, {(len(fs) + 23) // 24} planches dans {d}/")
SR = 16000
a = np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", v, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout, np.int16) / 32768
sat = np.where(np.abs(a) > 0.97)[0]
print("pics saturés :", "aucun" if len(sat) == 0 else sorted(set(np.round(sat / SR, 1))))
print("crête des 0,15 premières secondes :", round(float(np.abs(a[:int(.15 * SR)]).max()), 3), "(doit rester faible : pas de clic)")
print("crête après la dernière parole :", "à vérifier dans la voix nettoyée ; la fin ne doit contenir que la musique en fondu")
