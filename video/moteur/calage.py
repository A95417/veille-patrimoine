"""Calage automatique : date chaque phrase et chaque mot du scénario sur la voix nettoyée.

Usage : python3 calage.py job.json voix_propre.flac calage.json [fin_tenue=3.6]

Méthode (sans reconnaissance vocale) :
1. on repère les segments de parole (silences > 0,18 s à −30 dB) ;
2. on répartit les phrases sur le « temps parlé » au prorata de leurs syllabes ;
3. chaque frontière de phrase est recollée sur la pause la plus proche (les fins de phrase marquent une pause) ;
4. les mots sont répartis dans leur phrase au prorata des syllabes, en sautant les pauses internes.
Une scène commence juste avant sa première phrase et dure jusqu'à la scène suivante ; la dernière est tenue fin_tenue secondes.
"""
import json, re, subprocess, sys

job = json.load(open(sys.argv[1], encoding="utf-8"))
voix, sortie = sys.argv[2], sys.argv[3]
TENUE = float(sys.argv[4]) if len(sys.argv) > 4 else 3.6

# ---------------------------------------------------------------- syllabes (nombres lus en toutes lettres)
UN = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"]
DIZ = {2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante", 8: "quatre-vingt"}
def lettres(n):
    n = int(n)
    if n < 17: return UN[n]
    if n < 20: return "dix-" + UN[n - 10]
    if n < 100:
        d, u = divmod(n, 10)
        if d in (7, 9): return DIZ[d - 1] + "-" + lettres(10 + u)
        return DIZ[d] + ("" if u == 0 else "-et-un" if u == 1 and d != 8 else "-" + UN[u])
    if n < 1000:
        c, r = divmod(n, 100)
        return ("cent" if c == 1 else UN[c] + " cent") + ("" if r == 0 else " " + lettres(r))
    if n < 1_000_000:
        m, r = divmod(n, 1000)
        return ("mille" if m == 1 else lettres(m) + " mille") + ("" if r == 0 else " " + lettres(r))
    m, r = divmod(n, 1_000_000)
    return lettres(m) + " millions" + ("" if r == 0 else " " + lettres(r))
def syllabes(mot):
    m = mot.replace("\u202f", "").replace("\u00a0", "")
    txt = re.sub(r"\d+(?:[.,]\d+)?", lambda x: " " + " virgule ".join(lettres(p) for p in re.split(r"[.,]", x.group())) + " ", m)
    txt = txt.replace("€", " euros ").replace("%", " pour cent ").replace("BSC", " bé esse cé ")
    n = len(re.findall(r"[aeiouyàâéèêëîïôûùœ]+", txt.lower()))
    return max(1, n)

# ---------------------------------------------------------------- phrases du scénario
phrases = []   # {texte, scene, mots}
for i, sc in enumerate(job["scenes"]):
    t = re.sub(r"\s+", " ", sc["texte"]).strip()
    morceaux = [m.strip() for m in re.findall(r"[^.?!…;]+[.?!…;]*", t) if m.strip()]
    # on recolle les ponctuations isolées (« ? » précédé d'une espace fine)
    for m in morceaux:
        if phrases and phrases[-1]["scene"] == i and not re.search(r"[A-Za-zÀ-ÿ0-9]", m): phrases[-1]["texte"] += " " + m; continue
        phrases.append({"texte": m, "scene": i})
for p in phrases:
    # espaces insécables avant ? ! : ; et entre un nombre et son unité, pour des sous-titres propres
    p["texte"] = re.sub(r"\s+([?!:;])", "\u202f\\1", p["texte"])
    p["texte"] = re.sub(r"(\d)\s+(?=\d{3}\b)", "\\1\u202f", p["texte"])
    p["texte"] = re.sub(r"(\d)\s+(€|%|ans\b)", "\\1\u202f\\2", p["texte"])
    p["mots"] = p["texte"].split(" ")
    p["syl"] = sum(syllabes(w) + .3 for w in p["mots"])

# ---------------------------------------------------------------- segments de parole
err = subprocess.run(["ffmpeg", "-i", voix, "-af", "silencedetect=noise=-30dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
v = [float(x) for x in re.findall(r"silence_(?:start|end): ([0-9.]+)", err)]
h, mi, se = re.search(r"Duration: (\d+):(\d+):([0-9.]+)", err).groups()
duree = int(h) * 3600 + int(mi) * 60 + float(se)
segs, prev = [], 0.0
for a, b in zip(v[0::2], v[1::2]):
    if a - prev > .05: segs.append([prev, a])
    prev = b
if len(v) % 2 == 1: pass   # silence jusqu'à la fin
elif duree - prev > .05: segs.append([prev, duree])
if not segs: sys.exit("aucune parole détectée dans la voix")
parle = sum(b - a for a, b in segs)
def reel(x):   # temps parlé → temps réel
    for a, b in segs:
        if x <= b - a: return a + x
        x -= b - a
    return segs[-1][1]
def parle_de(t):   # temps réel → temps parlé
    acc = 0
    for a, b in segs:
        if t <= a: return acc
        if t <= b: return acc + t - a
        acc += b - a
    return acc

# 2-3) choix global des pauses (programmation dynamique) : chaque fin de phrase tombe sur une pause,
# en respectant au mieux la durée attendue de chaque phrase (syllabes × débit moyen). Les pauses longues sont favorisées.
import math
tot = sum(p["syl"] for p in phrases)
debit = parle / tot
pauses = [(segs[k][1], segs[k + 1][0]) for k in range(len(segs) - 1)]
sp = [parle_de(pa) for pa, _ in pauses]          # position (temps parlé) de chaque pause
n, K = len(phrases), len(pauses)
def cout(j, a, b):   # phrase j entre les positions parlées a et b
    reelle = max(b - a, .05); prevue = phrases[j]["syl"] * debit
    return math.log(reelle / prevue) ** 2
choix = None
if n > 1 and K >= n - 1:
    INF = float("inf")
    D = [[INF] * K for _ in range(n)]; R = [[-1] * K for _ in range(n)]
    for k in range(K): D[0][k] = cout(0, 0, sp[k]) - .25 * min(pauses[k][1] - pauses[k][0], .8)
    for j in range(1, n - 1):
        for k in range(j, K):
            bonus = .25 * min(pauses[k][1] - pauses[k][0], .8)
            for kp in range(j - 1, k):
                if D[j - 1][kp] == INF: continue
                c = D[j - 1][kp] + cout(j, sp[kp], sp[k]) - bonus
                if c < D[j][k]: D[j][k], R[j][k] = c, kp
    meilleur, kf = INF, -1
    for k in range(n - 2, K):
        if D[n - 2][k] == INF: continue
        c = D[n - 2][k] + cout(n - 1, sp[k], parle)
        if c < meilleur: meilleur, kf = c, k
    if kf >= 0:
        choix = [kf]
        for j in range(n - 2, 0, -1): choix.append(R[j][choix[-1]])
        choix.reverse()
if choix:
    debut_reel = [segs[0][0]] + [pauses[k][1] for k in choix]
    fin_reel = [pauses[k][0] for k in choix] + [segs[-1][1]]
else:   # trop peu de pauses : répartition au prorata des syllabes
    acc = 0; debut_reel, fin_reel = [], []
    for p in phrases:
        debut_reel.append(reel(acc / tot * parle)); acc += p["syl"]; fin_reel.append(reel(acc / tot * parle))
utilisees = choix or []
for j, p in enumerate(phrases):
    p["debut"], p["fin"] = round(debut_reel[j], 3), round(max(fin_reel[j], debut_reel[j] + .15), 3)

# 4) mots
mots = []
for j, p in enumerate(phrases):
    a, b = parle_de(p["debut"]), parle_de(p["fin"])
    poids = [syllabes(w) + .3 for w in p["mots"]]; T = sum(poids); x = a
    for w, k in zip(p["mots"], poids):
        d = (b - a) * k / T
        mots.append({"mot": w, "debut": round(reel(x), 3), "fin": round(reel(x + d), 3), "groupe": j}); x += d

# scènes
n = len(job["scenes"]); scenes = []
for i in range(n):
    ps = [p for p in phrases if p["scene"] == i]
    if not ps: sys.exit(f"la scène {i + 1} n'a pas de texte lu")
    scenes.append({"P": [p["debut"] for p in ps], "PF": [p["fin"] for p in ps]})
for i, s in enumerate(scenes):
    s["debut"] = 0.0 if i == 0 else round(max(scenes[i - 1]["P"][-1] + .2, s["P"][0] - .25), 3)
for i, s in enumerate(scenes):
    s["fin"] = scenes[i + 1]["debut"] if i + 1 < n else round(segs[-1][1] + TENUE, 3)
json.dump({"scenes": scenes, "mots": mots, "phrases": [{k: p[k] for k in ("texte", "scene", "debut", "fin")} for p in phrases],
           "duree_voix": round(segs[-1][1], 3), "duree_totale": scenes[-1]["fin"]}, open(sortie, "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(phrases)} phrases, {len(mots)} mots, {len(segs)} segments de parole ; {len(utilisees)} frontières recollées sur une pause ; durée {scenes[-1]['fin']:.1f} s")
