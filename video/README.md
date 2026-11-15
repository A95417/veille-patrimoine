# Vidéos courtes BSC Patrimoine (TikTok / Reels / LinkedIn)

Outils pour fabriquer des vidéos verticales 9:16 (1080×1920, 30 i/s) : personnages illustrés animés, voix off gratuite (Gemini), sous-titres mot à mot, musique et bruitages composés par code, donc libres de droits.
Ce dossier ne fait pas partie du site : il n'est pas déployé, car seul `public/` l'est.

## Depuis le site : Création Post › Vidéo

La vidéo se fabrique maintenant directement depuis le site, dans **Création Post**, onglet **Vidéo**.

1. On choisit un modèle (deux profils, chiffre de la semaine, échéance fiscale, mythe ou sujet libre), une durée, un format (9:16 ou 4:5) et une voix.
2. Gemini propose un **scénario** sous forme de scènes typées avec le texte lu. On le relit et on le modifie. Les chiffres qui ne viennent ni du calcul du site ni de ses données officielles sont **signalés « à vérifier »**.
3. Le site lance le robot GitHub `video.yml` (gratuit). Celui-ci exécute `scripts/video-robot.mjs` avec le moteur générique `moteur/`. Le site affiche l'étape en cours et le **temps restant**.
4. La vidéo est renvoyée au site par morceaux de 512 Ko (base de données D1). On peut la lire, la télécharger, récupérer la miniature et les sous-titres `.srt`, et copier le texte de publication.

Précautions :
- 3 vidéos par jour.
- Une seule fabrication à la fois, les autres en file d'attente.
- 25 minutes au maximum, avec un bouton Annuler.
- 10 vidéos gardées.
- Contrôle automatique du son et des textes avant livraison.

### Moteur générique (`moteur/`)

| Fichier | Rôle |
|---|---|
| `moteur.html`, `base.js`, `gabarits.js` | 13 gabarits de scènes : accroche, personnage, marche, calendrier, comparaison, egalite, grand_mot, bocaux, chiffre, liste, mythe, sablier, fin. Chaque gabarit gère aussi ses bruitages. |
| `calage.py` | Calage automatique sans reconnaissance vocale : choix global des pauses par programmation dynamique. Il donne 0 s d'écart sur « Le bon moment ». |
| `rendu.mjs` | Rendu Playwright en parallèle, une vidéo par scène, miniature, liste des bruitages et alertes. |
| `son.py` | Musique et bruitages qui suivent la vidéo. Aucun bruitage après la dernière phrase. |
| `nettoyer_voix.py`, `monter.sh` | Copies des outils ci-dessous. |

## Contenu

| Fichier | Rôle |
|---|---|
| `outils/nettoyer_voix.py` | Accélère la voix (×1,08) et supprime les parasites de Gemini : clic au tout début, grésillement « radio » saturé à la fin. Coupe avant le premier mot et après le dernier, avec des fondus, puis vérifie qu'il ne reste aucun pic saturé. |
| `outils/segments.py` | Liste les segments de parole d'une voix nettoyée, pour caler les mots du scénario (et donc les sous-titres). |
| `outils/monter.sh` | Montage final : vidéo muette, voix, musique baissée sous la voix, bruitages, puis normalisation à −14 LUFS. |
| `outils/controle.py` | Contrôle avant envoi. Extrait une image toutes les 0,25 s en planches à regarder **toutes**, puis vérifie les pics saturés et le clic de départ. |
| `outils/perso2.js` | Personnages v2 (Léa, Tom, conseiller) : style éditorial, proportions adultes. |
| `exemple-le-bon-moment/` | La vidéo « Le bon moment » complète (novembre 2026) : `scene.html` (animations), `rendu.mjs` (rendu Playwright, une vidéo par scène), `son.py` (musique et bruitages), `timing.json` (mots calés), `ancres.json` (correspondance des temps), `scenario.txt`. |

## Étapes

1. **Scénario.** Il est écrit en français, avec chaque chiffre accompagné de « exemple fictif ». Il est relu et validé avant de lancer.
2. **Voix.** Elle passe par le workflow GitHub `voix-video.yml`, avec la voix **Sadachbia**. On envoie **uniquement le texte du scénario**, jamais une consigne de ton : sinon Gemini la lit à voix haute.
3. **Nettoyage.** `python3 outils/nettoyer_voix.py voix.flac voix_propre.flac`. Le rapport doit afficher « pics saturés restants : aucun ».
4. **Calage.** `python3 outils/segments.py voix_propre.flac`, puis on associe chaque segment à une phrase et on génère `timing.json`.
5. **Rendu.** On contrôle quelques images fixes avant le rendu complet (`node rendu.mjs stills 3.2 12 …`), puis `node rendu.mjs scene 0 1 2 …`, puis on assemble les scènes (`concat` avec `-c copy`).
6. **Son.** `python3 son.py`, puis `outils/monter.sh`.
7. **Contrôle.** `python3 outils/controle.py video.mp4`. On regarde toutes les planches et on corrige avant d'envoyer.

## Règles fixées avec Shehram (novembre 2026)

**Son**
- Voix : Sadachbia ×1,08, nettoyée au début et à la fin. Aucun clic ni grésillement n'est accepté.
- Pas de « whoosh ». Les transitions de scène se font avec un glissement feutré très discret.
- Pas d'impact grave, pas de cloche. **Aucun bruitage après la dernière phrase** : la musique s'éteint seule, en fondu.
- Bruitages permis : pièces, ping de notification, tampons, « pop » discrets.

**Image**
- Sous-titres : texte blanc sur une boîte sombre arrondie, une seule ligne, coupés à la ponctuation, le mot prononcé en rose. Ils sont placés en bas (y ≈ 1480) et ne doivent jamais couvrir un visage.
- Pas de doublon entre un titre à l'écran et le sous-titre.
- Transitions : volet bordeaux qui glisse vers la gauche, sans flash.
- Les personnages entrent depuis l'extérieur de l'image.
- Couleurs BSC : bordeaux #6E0B1F, rose #D8919C, blanc. Le nom « BSC PATRIMOINE » est écrit en texte : le logo n'est jamais reproduit.
- Carte de fin sobre : question, nom, « Premier échange offert · sans engagement », mail et téléphone, puis mentions légales.

**Mentions obligatoires**
- « Exemple fictif à visée pédagogique, rendement non garanti. »
- « Investir comporte un risque de perte en capital. »

**Coordonnées provisoires (fictives)**
- Mail : contact@example.com (domaine réservé aux exemples).
- Téléphone : 06 39 98 12 34 (tranche réservée par l'Arcep aux œuvres audiovisuelles).
- À remplacer par les vraies coordonnées dès qu'elles sont fournies.

## Pré-requis

Python 3 avec numpy et Pillow, ffmpeg, Node.js avec Playwright et Chromium, et la police Inter installée.
