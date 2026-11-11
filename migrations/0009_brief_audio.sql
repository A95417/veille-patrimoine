-- Version audio des briefs, lue par une voix de synthèse naturelle (Gemini, offre gratuite), au format MP3.
CREATE TABLE IF NOT EXISTS brief_audio (
  jour    TEXT NOT NULL,
  edition TEXT NOT NULL,
  mime    TEXT NOT NULL,
  donnees TEXT NOT NULL,     -- fichier audio encodé en base64
  duree   REAL,
  cree_le TEXT NOT NULL,
  PRIMARY KEY (jour, edition)
);
