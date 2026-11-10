-- Images fournies par les flux RSS des éditeurs (adresse seulement : l'image reste chez l'éditeur).
ALTER TABLE articles ADD COLUMN image TEXT;

-- « Ma sélection » : sujets mis de côté par chaque utilisateur (pour préparer un rendez-vous, relire plus tard…).
CREATE TABLE IF NOT EXISTS favoris (
  utilisateur_id INTEGER NOT NULL,
  sujet_id       TEXT NOT NULL,
  cree_le        TEXT NOT NULL,
  PRIMARY KEY (utilisateur_id, sujet_id)
);
