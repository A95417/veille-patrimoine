"""Musique originale et bruitages synthétisés (numpy) : aucun échantillon externe, donc libres de droits.

Usage : python3 son.py calage.json evenements.json musique.wav bruitages.wav [ambiance]
Ambiances : dynamique (par défaut), calme, inspirante. Même mixage, mêmes règles de bruitages.

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
# Chaque vidéo a son morceau : la graine de la vidéo choisit la tonalité, le tempo, la suite d'accords, la mélodie,
# l'instrument de la mélodie et le motif de batterie, à l'intérieur du caractère de l'ambiance choisie.
AMBIANCE = sys.argv[5] if len(sys.argv) > 5 else "dynamique"
GRAINE = int(sys.argv[6]) if len(sys.argv) > 6 else 7
rm = np.random.default_rng(GRAINE)
MAJ, MIN = [0, 2, 4, 5, 7, 9, 11], [0, 2, 3, 5, 7, 8, 10]
# degrés des accords (0 = I) ; plusieurs suites par ambiance
SUITES = {
    "dynamique": [(MIN, [0, 5, 2, 6]), (MIN, [0, 3, 6, 4]), (MAJ, [5, 3, 0, 4]), (MIN, [0, 6, 5, 6]), (MAJ, [0, 4, 5, 3])],
    "calme": [(MAJ, [3, 0, 1, 6]), (MAJ, [0, 5, 3, 4]), (MAJ, [0, 2, 3, 0]), (MIN, [0, 5, 2, 6]), (MAJ, [3, 4, 2, 5])],
    "inspirante": [(MAJ, [0, 4, 5, 3]), (MAJ, [3, 0, 4, 5]), (MAJ, [0, 5, 3, 4]), (MAJ, [5, 3, 0, 4]), (MAJ, [0, 3, 5, 4])],
}
BASE = {"dynamique": dict(bpm=100, g=(0.42, 0.9, 0.35, 0.18, 0.45, 0.16), saute=3),
        "calme": dict(bpm=76, g=(0.62, 0.45, 0.0, 0.06, 0.32, 0.12), saute=99),
        "inspirante": dict(bpm=92, g=(0.5, 0.75, 0.22, 0.14, 0.4, 0.15), saute=4)}
ST = BASE.get(AMBIANCE, BASE["dynamique"]); AMBIANCE = AMBIANCE if AMBIANCE in BASE else "dynamique"
gamme, degres = SUITES[AMBIANCE][rm.integers(len(SUITES[AMBIANCE]))]
TONIQUE = 57 + int(rm.integers(-4, 5))                       # La ± 4 demi-tons
BPM = ST["bpm"] + int(rm.integers(-8, 9)); BEAT = 60 / BPM; MES = 4 * BEAT
def ton(d, oct=0): return TONIQUE + 12 * (oct + d // 7) + gamme[d % 7]
ACCORDS = [(ton(d, -1), [ton(d), ton(d + 2), ton(d + 4)]) for d in degres]
# deux motifs de 8 croches tirés des notes de l'accord et de la gamme (A A B A), quelques silences
def motif():
    m, d = [], int(rm.integers(0, 5))
    for k in range(8):
        if k and rm.random() < (.35 if AMBIANCE == "calme" else .18): m.append(None); continue
        d = int(np.clip(d + rm.choice([-2, -1, 1, 2, 0], p=[.15, .3, .3, .15, .1]), 0, 9)); m.append(d)
    return m
MOTIFS = [motif(), motif()]
INSTR = ["pluck", "marimba", "piano"][int(rm.integers(3))] if AMBIANCE != "calme" else ["piano", "marimba"][int(rm.integers(2))]
BATTERIE = int(rm.integers(3))          # 0 : temps forts, 1 : quatre temps, 2 : syncopé
G_PAD, G_KICK, G_CAISSE, G_HAT, G_BASSE, G_MEL = ST["g"]
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
DET = float(rm.uniform(.08, .2))
def pad(notes, d):
    t = t_(d); s = np.zeros(len(t))
    for n in notes:
        f = note(n)
        for det in (-DET, DET):
            s += np.sin(2 * np.pi * f * (1 + det / 100) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return s * a / (len(notes) * 4)
def basse(n, d):
    t = t_(d); f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.minimum(1, t / 0.01) * np.exp(-t / 0.5)
def lead(n, d=0.4):
    t = t_(d); f = note(n)
    if INSTR == "marimba":   # bois doux : fondamentale + 4e harmonique très brève
        s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03)
        return s * env(len(t), 0.002, 0.18) * 0.9
    if INSTR == "piano":     # piano électrique doux
        s = sum(g * np.sin(2 * np.pi * k * f * t) * np.exp(-t * k * 1.5) for k, g in ((1, 1), (2, .4), (3, .15)))
        return s * env(len(t), 0.003, 0.45)
    s = (2 * ((f * t) % 1) - 1); s = passe_bas(s, 0.25)
    return s * env(len(t), 0.002, 0.12)

for m in range(int(DUREE / MES) + 1):
    t0 = m * MES
    racine, acc = ACCORDS[m % 4]
    intro, fin = t0 + MES <= INTRO, t0 >= FIN
    ajoute(musique, pad(acc, MES), t0, (G_PAD + 0.08) if intro else G_PAD)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb < INTRO and b not in (0, 2): continue
        frappe = b in (0, 2) if BATTERIE == 0 else True if BATTERIE == 1 else b in (0, 3)
        if AMBIANCE == "calme": frappe = b == 0
        if frappe and (not intro or b in (0, 2)): ajoute(musique, kick(), tb, G_KICK if tb >= INTRO else G_KICK * 0.55)
        if BATTERIE == 2 and b == 1 and tb >= INTRO and AMBIANCE != "calme": ajoute(musique, kick(), tb + BEAT / 2, G_KICK * .6)
        if G_CAISSE and tb >= INTRO and not fin and b in (1, 3): ajoute(musique, snare(), tb, G_CAISSE)
        if tb >= INTRO:
            ajoute(musique, hat(), tb, G_HAT); ajoute(musique, hat(b == 3), tb + BEAT / 2, G_HAT * 0.78)
            ajoute(musique, basse(racine - 12, BEAT * 0.9), tb, G_BASSE if b % 2 == 0 else G_BASSE * 0.67)
    if t0 >= INTRO and not fin:
        mot = MOTIFS[1] if m % 4 == 2 else MOTIFS[0]
        for k, d in enumerate(mot):
            if d is not None and (m + k) % ST["saute"] != ST["saute"] - 1:
                ajoute(musique, lead(ton(d, 1), 0.4 if AMBIANCE != "calme" else 0.9), t0 + k * BEAT / 2, G_MEL)
mont = rng.standard_normal(int(2.0 * SR)); mont = mont - passe_bas(mont, 0.05)
mont *= np.linspace(0, 1, len(mont)) ** 2
ajoute(musique, mont, max(0, INTRO - 2.0), 0.12)
n = len(musique); fade = np.ones(n); fe = int(min(3.4, DUREE / 4) * SR); fade[-fe:] = np.linspace(1, 0, fe) ** 1.5
musique *= fade
musique /= np.max(np.abs(musique)) / 0.8
print(f"morceau : {AMBIANCE}, tonique {TONIQUE}, {BPM} bpm, accords {degres}, mélodie {INSTR}, batterie {BATTERIE}")

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
