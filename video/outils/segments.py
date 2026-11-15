"""Liste les segments de parole d'une voix nettoyée (pour caler les mots du scénario).
Usage : python3 segments.py voix.flac"""
import subprocess, sys, re
out = subprocess.run(["ffmpeg", "-i", sys.argv[1], "-af", "silencedetect=noise=-30dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
v = [float(x) for x in re.findall(r"silence_(?:start|end): ([0-9.]+)", out)]
dur = float(re.search(r"Duration: (\d+):(\d+):([0-9.]+)", out).group(3)) + 60 * int(re.search(r"Duration: (\d+):(\d+)", out).group(2))
prev, i = 0.0, 0
for a, b in zip(v[0::2], v[1::2]):
    if a - prev > .05: print(i, round(prev, 3), round(a, 3), f"{a - prev:.2f}s"); i += 1
    prev = b
if dur - prev > .05: print(i, round(prev, 3), round(dur, 3), f"{dur - prev:.2f}s")
