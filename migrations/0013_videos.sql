-- Création Post › Vidéo : vidéos courtes fabriquées par le robot GitHub, stockées en morceaux de 512 Ko encodés en base64 (lecture rapide côté serveur).
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL,
  cree_le TEXT NOT NULL,
  maj_le TEXT NOT NULL,
  statut TEXT NOT NULL,            -- brouillon, file, attente, en_cours, pret, a_verifier, erreur, annule
  modele TEXT,
  sujet TEXT,
  format TEXT NOT NULL DEFAULT '9:16',
  voix TEXT NOT NULL DEFAULT 'Sadachbia',
  duree_cible INTEGER,
  storyboard TEXT,                 -- JSON : scènes (type, texte lu, paramètres)
  donnees TEXT,                    -- JSON : chiffres autorisés et leur origine (simulation, BCE, impots.gouv)
  a_verifier TEXT,                 -- JSON : chiffres à vérifier signalés dans le scénario
  texte_post TEXT,
  etape TEXT,
  progression REAL,
  eta_s INTEGER,
  lance_le TEXT,
  demarre_le TEXT,
  termine_le TEXT,
  erreur TEXT,
  alertes TEXT,
  duree REAL,
  taille INTEGER,
  morceaux INTEGER,
  srt TEXT,
  miniature TEXT,                  -- JPEG encodé en base64
  duree_fabrication INTEGER
);
CREATE INDEX IF NOT EXISTS videos_statut ON videos (statut, lance_le);
CREATE TABLE IF NOT EXISTS video_morceaux (
  video_id TEXT NOT NULL,
  n INTEGER NOT NULL,
  donnees TEXT NOT NULL,           -- base64
  PRIMARY KEY (video_id, n)
);
