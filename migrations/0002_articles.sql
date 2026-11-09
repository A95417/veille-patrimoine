-- Étape 3 : articles collectés et sujets (un sujet regroupe les articles qui parlent de la même chose).

CREATE TABLE IF NOT EXISTS sujets (
  id            TEXT PRIMARY KEY,          -- identifiant aléatoire
  titre         TEXT NOT NULL,             -- titre du premier article reçu
  cree_le       TEXT NOT NULL,
  derniere_pub  TEXT NOT NULL,             -- date de publication la plus récente parmi ses articles
  nb_articles   INTEGER NOT NULL DEFAULT 0,
  importance    INTEGER,                   -- 1 à 5, rempli par l'IA (étape 4)
  categories    TEXT,                      -- liste JSON, remplie par l'IA (étape 4)
  resume_court  TEXT,                      -- étape 4
  resume_detail TEXT,                      -- étape 4 (JSON structuré)
  ia_statut     TEXT NOT NULL DEFAULT 'a_faire'   -- a_faire / court / detail / erreur
);
CREATE INDEX IF NOT EXISTS idx_sujets_pub ON sujets(derniere_pub DESC);
CREATE INDEX IF NOT EXISTS idx_sujets_ia ON sujets(ia_statut);

CREATE TABLE IF NOT EXISTS articles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  empreinte   TEXT NOT NULL UNIQUE,        -- empreinte du lien : évite de stocker deux fois le même article
  sujet_id    TEXT NOT NULL REFERENCES sujets(id) ON DELETE CASCADE,
  source_id   TEXT NOT NULL,
  source_nom  TEXT NOT NULL,
  groupe      TEXT NOT NULL,               -- officielle / presse / international / crypto
  langue      TEXT NOT NULL DEFAULT 'fr',
  titre       TEXT NOT NULL,
  lien        TEXT NOT NULL,
  extrait     TEXT,                        -- chapô fourni par le flux RSS (partie gratuite)
  publie_le   TEXT NOT NULL,
  collecte_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_sujet ON articles(sujet_id);
CREATE INDEX IF NOT EXISTS idx_articles_pub ON articles(publie_le);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);

-- Petites informations d'état (dernière collecte, compteurs…)
CREATE TABLE IF NOT EXISTS etat (
  cle    TEXT PRIMARY KEY,
  valeur TEXT NOT NULL,
  maj_le TEXT NOT NULL
);
