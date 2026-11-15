"""Musique originale et bruitages synthétisés (numpy) : aucun échantillon externe, donc libres de droits.

Usage : python3 son.py calage.json evenements.json musique.wav bruitages.wav

Règles fixées avec Shehram : pas de « whoosh », pas d'impact grave, pas de cloche ; transitions = glissement feutré
très discret ; aucun bruitage après la dernière phrase ; la musique s'éteint seule en fondu.
"""
import numpy as np, wave, json, sys

SR = 44100
cal = json.load(open(sys.argv[1], encoding="utf-8")); EV = json.load(open(sys.argv[2], encoding="utf-8"))
DUREE = cal["duree_totale"]
INTRO = cal["scenes"][1]["debut"] if len(cal["scenes"]) > 1 else 3.0     # le rythme entre avec la 2e scène
FIN = cal["scenes"][-1]["debut"]                                          # carte de fin : rythme allégé
rng = np.random.default_rng(7)

def ecrire(nom, x):
    x = np.clip(x, -1, 1)
    st = (np.stack([x, x], 1) if x.ndim == 1 else x)
    with wave.open(nom, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)
def note(f): return 440 * 2 ** ((f - 69) / 12)
def passe_bas(x, alpha):
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += alpha * (x[i] - acc); y[i] = acc
    return y
def ajoute(piste, son, debut, gain=1.0):
    i = int(debut * SR); j = min(len(piste), i + len(son))
    if j > i: piste[i:j] += son[:j - i] * gain

# ---------------------------------------------------------------- Musique
BPM = 100; BEAT = 60 / BPM; MES = 4 * BEAT
musique = np.zeros(int(DUREE * SR))
def kick():
    t = t_(0.35); f = 120 * np.exp(-t * 22) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.18)
def snare():
    t = t_(0.25); bruit = rng.standard_normal(len(t)) * env(len(t), 0.001, 0.07)
    return 0.55 * bruit + 0.35 * np.sin(2 * np.pi * 190 * t) * env(len(t), 0.001, 0.05)
def hat(ouvert=False):
    t = t_(0.12 if not ouvert else 0.3); b = rng.standard_normal(len(t))
    b = b - passe_bas(b, 0.35)
    return b * env(len(t), 0.001, 0.025 if not ouvert else 0.09)
def pad(notes, d):
    t = t_(d); s = np.zeros(len(t))
    for n in notes:
        f = note(n)
        for det in (-0.12, 0.12):
            s += np.sin(2 * np.pi * f * (1 + det / 100) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return s * a / (len(notes) * 4)
def basse(n, d):
    t = t_(d); f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.minimum(1, t / 0.01) * np.exp(-t / 0.5)
def pluck(n, d=0.4):
    t = t_(d); f = note(n)
    s = (2 * ((f * t) % 1) - 1); s = passe_bas(s, 0.25)
    return s * env(len(t), 0.002, 0.12)


ACCORDS = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]   # La m, Fa, Do, Sol
MELODIE = [76, 72, 74, 72, 69, 72, 71, 67]
for m in range(int(DUREE / MES) + 1):
    t0 = m * MES
    racine, acc = ACCORDS[m % 4]
    intro, fin = t0 + MES <= INTRO, t0 >= FIN
    ajoute(musique, pad(acc, MES), t0, 0.5 if intro else 0.42)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb < INTRO and b not in (0, 2): continue
        if not intro or b in (0, 2): ajoute(musique, kick(), tb, 0.9 if tb >= INTRO else 0.5)
        if tb >= INTRO and not fin and b in (1, 3): ajoute(musique, snare(), tb, 0.35)
        if tb >= INTRO:
            ajoute(musique, hat(), tb, 0.18); ajoute(musique, hat(b == 3), tb + BEAT / 2, 0.14)
            ajoute(musique, basse(racine - 12, BEAT * 0.9), tb, 0.45 if b % 2 == 0 else 0.3)
    if t0 >= INTRO and not fin:
        for k, n in enumerate(MELODIE):
            if (m + k) % 3 != 2: ajoute(musique, pluck(n), t0 + k * BEAT / 2, 0.16)
mont = rng.standard_normal(int(2.0 * SR)); mont = mont - passe_bas(mont, 0.05)
mont *= np.linspace(0, 1, len(mont)) ** 2
ajoute(musique, mont, max(0, INTRO - 2.0), 0.12)
n = len(musique); fade = np.ones(n); fe = int(min(3.4, DUREE / 4) * SR); fade[-fe:] = np.linspace(1, 0, fe) ** 1.5
musique *= fade
musique /= np.max(np.abs(musique)) / 0.8

# ---------------------------------------------------------------- Bruitages
def glissement(d=0.4):
    # glissement feutré : bande de bruit douce (pas d'aigus), enveloppe progressive, très discret
    t = t_(d); b = rng.standard_normal(len(t))
    bande = passe_bas(b, 0.05) - passe_bas(b, 0.008)
    bande = passe_bas(bande, 0.12)
    a = np.sin(np.pi * np.linspace(0, 1, len(t)) ** 0.7) ** 2
    return bande * a * 2.2 * 0.5

def pop():
    t = t_(0.09); f = 900 * np.exp(-t * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.03)
def piece():
    t = t_(0.5); s = np.zeros(len(t))
    for f, g in ((2637, 1), (3520, .6), (5274, .3)): s += g * np.sin(2 * np.pi * f * t)
    return s * env(len(t), 0.001, 0.12) * 0.4
def ping():
    t = t_(0.7); s = np.sin(2 * np.pi * 1318.5 * t) * env(len(t), 0.002, 0.25)
    t2 = t_(0.6); s2 = np.sin(2 * np.pi * 1760 * t2) * env(len(t2), 0.002, 0.25)
    out = np.zeros(int(0.85 * SR)); out[:len(s)] += s; out[int(.12 * SR):int(.12 * SR) + len(s2)] += s2
    return out * 0.5
def buzzer():
    t = t_(0.35); s = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.5
    return passe_bas(s, 0.2) * env(len(t), 0.005, 0.3) * 0.5

def tic():
    t = t_(0.05); b = rng.standard_normal(len(t)); b = b - passe_bas(b, 0.5)
    return b * env(len(t), 0.0005, 0.008) * 0.8
def kaching():
    out = np.zeros(int(1.0 * SR))
    for k, f in enumerate((1568, 2093, 2637)):
        t = t_(0.8); ajoute(out, np.sin(2 * np.pi * f * t) * env(len(t), 0.001, 0.2) * 0.35, k * 0.06)
    b = rng.standard_normal(int(.15 * SR)); ajoute(out, (b - passe_bas(b, .4)) * env(len(b), .001, .03) * .5, 0)
    return out

def tampon():
    return buzzer()
SONS = {"transition": glissement, "pop": pop, "piece": piece, "ping": ping, "tampon": tampon, "tic": tic, "kaching": kaching}
bruit = np.zeros(int(DUREE * SR))
fin_voix = cal["duree_voix"]
for typ, t, gain in EV:
    if typ in SONS and 0 <= t < fin_voix: ajoute(bruit, SONS[typ](), t, gain)
bruit /= max(1e-9, np.max(np.abs(bruit))) / 0.9
ecrire(sys.argv[3], musique)
ecrire(sys.argv[4], bruit)
print(f"musique et bruitages : {DUREE:.1f} s, {len(EV)} bruitages")
