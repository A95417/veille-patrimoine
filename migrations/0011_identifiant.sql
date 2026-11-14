-- Identifiant de connexion court, du type « a.shehram » (initiale du nom de famille + « . » + prénom).
ALTER TABLE utilisateurs ADD COLUMN identifiant TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateurs_identifiant ON utilisateurs (identifiant);
