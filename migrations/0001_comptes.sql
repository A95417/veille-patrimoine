-- Étape 2 : comptes utilisateurs, sessions de connexion, tentatives ratées.

CREATE TABLE IF NOT EXISTS utilisateurs (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  email              TEXT NOT NULL UNIQUE,
  nom                TEXT NOT NULL,
  hash               TEXT NOT NULL,              -- mot de passe haché, jamais en clair
  role               TEXT NOT NULL DEFAULT 'collegue',  -- 'admin' ou 'collegue'
  actif              INTEGER NOT NULL DEFAULT 1,
  cree_le            TEXT NOT NULL,
  derniere_connexion TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id_hash        TEXT PRIMARY KEY,               -- empreinte du jeton, le jeton lui-même reste dans le navigateur
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  expire_le      INTEGER NOT NULL,               -- horodatage en millisecondes
  cree_le        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_utilisateur ON sessions(utilisateur_id);

CREATE TABLE IF NOT EXISTS tentatives (
  email      TEXT NOT NULL,
  horodatage INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tentatives_email ON tentatives(email, horodatage);
