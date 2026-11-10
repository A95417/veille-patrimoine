-- Refonte du design : historique des cours de clôture, pour les mini-courbes sur 30 jours.
-- Un point par marché et par jour, dans la devise de l'indice (effet du change retiré pour l'Europe et le Japon).
CREATE TABLE IF NOT EXISTS historique_marches (
  symbole TEXT NOT NULL,
  jour    TEXT NOT NULL,   -- AAAA-MM-JJ (date de la séance)
  cours   REAL NOT NULL,
  PRIMARY KEY (symbole, jour)
);
