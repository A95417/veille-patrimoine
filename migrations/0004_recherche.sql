-- Étape 5 : titre traduit en français, recherche plein texte, retraitement des dernières 48 h.

ALTER TABLE sujets ADD COLUMN titre_fr TEXT;

-- Index de recherche plein texte (insensible aux accents et aux majuscules).
CREATE VIRTUAL TABLE IF NOT EXISTS recherche USING fts5(sujet_id UNINDEXED, contenu, tokenize = 'unicode61 remove_diacritics 2');

-- Remplissage initial avec ce qui existe déjà.
INSERT INTO recherche (sujet_id, contenu)
  SELECT sujet_id, titre || ' ' || COALESCE(extrait, '') FROM articles;
INSERT INTO recherche (sujet_id, contenu)
  SELECT id, resume_court FROM sujets WHERE resume_court IS NOT NULL;

-- Les sujets des dernières 48 h repassent dans la file de l'IA, avec les consignes améliorées.
UPDATE sujets SET ia_statut = 'a_faire', ia_essais = 0
 WHERE nb_articles > 0 AND derniere_pub >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days');
