-- Brief du soir (18 h) : deux éditions par jour, « matin » et « soir ».
CREATE TABLE IF NOT EXISTS briefs_v2 (
  jour    TEXT NOT NULL,                    -- AAAA-MM-JJ (heure de Paris)
  edition TEXT NOT NULL DEFAULT 'matin',    -- 'matin' (7 h) ou 'soir' (18 h)
  contenu TEXT NOT NULL,
  cree_le TEXT NOT NULL,
  PRIMARY KEY (jour, edition)
);
INSERT OR IGNORE INTO briefs_v2 (jour, edition, contenu, cree_le) SELECT jour, 'matin', contenu, cree_le FROM briefs;
DROP TABLE briefs;
ALTER TABLE briefs_v2 RENAME TO briefs;

-- Apprendre : meilleur score de chaque utilisateur à chaque jeu (quiz d'une fiche, quiz de l'actu…).
CREATE TABLE IF NOT EXISTS progression (
  utilisateur_id INTEGER NOT NULL,
  cle            TEXT NOT NULL,     -- ex. « fiche:assurance-vie », « actu:2026-11-10-matin »
  score          INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  essais         INTEGER NOT NULL DEFAULT 1,
  maj_le         TEXT NOT NULL,
  PRIMARY KEY (utilisateur_id, cle)
);
