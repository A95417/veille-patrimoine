-- Étape 4 : informations produites par l'IA, et catégories (pour les filtres).

ALTER TABLE sujets ADD COLUMN ia_essais INTEGER NOT NULL DEFAULT 0;   -- tentatives ratées (abandon après 3)
ALTER TABLE sujets ADD COLUMN ia_modele TEXT;                          -- modèle d'IA utilisé
ALTER TABLE sujets ADD COLUMN ia_le TEXT;                              -- date du résumé

-- Une ligne par couple (sujet, catégorie) : permet de filtrer vite par catégorie.
CREATE TABLE IF NOT EXISTS sujet_categories (
  sujet_id  TEXT NOT NULL REFERENCES sujets(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL,
  PRIMARY KEY (sujet_id, categorie)
);
CREATE INDEX IF NOT EXISTS idx_sujet_categories_cat ON sujet_categories(categorie);
CREATE INDEX IF NOT EXISTS idx_sujets_importance ON sujets(importance, derniere_pub);

-- Correctif : les articles du BOFiP collectés sans date reçoivent la date écrite dans leur texte ("publié le 04/11/2026").
UPDATE articles
   SET publie_le = substr(extrait, instr(extrait, 'publié le ') + 16, 4) || '-' ||
                   substr(extrait, instr(extrait, 'publié le ') + 13, 2) || '-' ||
                   substr(extrait, instr(extrait, 'publié le ') + 10, 2) || 'T12:00:00.000Z'
 WHERE source_id = 'bofip' AND instr(extrait, 'publié le ') > 0;

UPDATE sujets
   SET derniere_pub = (SELECT MAX(publie_le) FROM articles WHERE sujet_id = sujets.id)
 WHERE id IN (SELECT sujet_id FROM articles WHERE source_id = 'bofip');
