-- Étape 7 : brief matinal (un par jour, conservé 3 mois comme les articles).
CREATE TABLE IF NOT EXISTS briefs (
  jour    TEXT PRIMARY KEY,     -- date du brief (AAAA-MM-JJ, heure de Paris)
  contenu TEXT NOT NULL,        -- brief complet (JSON) : synthèse, marchés, actualités, points à retenir
  cree_le TEXT NOT NULL
);
