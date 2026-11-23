-- Rubrique « Allocation » : assureurs partenaires, leurs contrats (assurance-vie, PER), les portefeuilles types
-- proposés dans chaque contrat et leurs fonds (nom, ISIN, part). Données du cabinet, partagées entre les utilisateurs.
-- Aucune donnée client n'est enregistrée ici.
CREATE TABLE IF NOT EXISTS alloc_assureurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  cree_par TEXT, cree_le TEXT NOT NULL,
  maj_par TEXT, maj_le TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS alloc_contrats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assureur_id INTEGER NOT NULL REFERENCES alloc_assureurs(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,              -- av (assurance-vie) ou per
  cree_par TEXT, cree_le TEXT NOT NULL,
  maj_par TEXT, maj_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS alloc_contrats_assureur ON alloc_contrats (assureur_id);
CREATE TABLE IF NOT EXISTS alloc_portefeuilles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contrat_id INTEGER NOT NULL REFERENCES alloc_contrats(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  profil TEXT,                     -- prudent, equilibre, dynamique, offensif (facultatif)
  cree_par TEXT, cree_le TEXT NOT NULL,
  maj_par TEXT, maj_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS alloc_portefeuilles_contrat ON alloc_portefeuilles (contrat_id);
CREATE TABLE IF NOT EXISTS alloc_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portefeuille_id INTEGER NOT NULL REFERENCES alloc_portefeuilles(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL,
  nom TEXT NOT NULL,
  isin TEXT,                       -- vide pour un fonds en euros
  part REAL                        -- en %, facultatif
);
CREATE INDEX IF NOT EXISTS alloc_lignes_portefeuille ON alloc_lignes (portefeuille_id, ordre);
CREATE INDEX IF NOT EXISTS alloc_lignes_isin ON alloc_lignes (isin);
-- « Pourquoi ce choix » : commentaires visibles par tous les utilisateurs, sur un portefeuille ou sur un fonds (par ISIN).
CREATE TABLE IF NOT EXISTS alloc_commentaires (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cible TEXT NOT NULL,             -- « p:<id du portefeuille> » ou « f:<ISIN> »
  texte TEXT NOT NULL,
  auteur_id INTEGER NOT NULL,
  auteur_nom TEXT,
  cree_le TEXT NOT NULL,
  maj_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS alloc_commentaires_cible ON alloc_commentaires (cible, cree_le);
