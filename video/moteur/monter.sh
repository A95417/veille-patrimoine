#!/usr/bin/env bash
# Montage final : vidéo muette + voix nettoyée + musique (baissée sous la voix) + bruitages.
# Usage : ./monter.sh video_muette.mp4 voix_propre.flac musique.wav bruitages.wav sortie.mp4 DUREE
set -euo pipefail
ffmpeg -y -loglevel error -i "$1" -i "$2" -i "$3" -i "$4" -filter_complex \
"[1:a]aresample=44100,aformat=channel_layouts=stereo,apad,asplit=2[v][vsc];[2:a]volume=0.32[m];[m][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[3:a]volume=0.5[b];[v][md][b]amix=inputs=3:normalize=0:duration=shortest,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t "$6" -movflags +faststart "$5"
