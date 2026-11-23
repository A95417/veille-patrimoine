-- Allocation : classement SFDR (article 6, 8 ou 9) et indicateur de risque (SRI de 1 à 7 du DIC) de chaque fonds d'un portefeuille.
ALTER TABLE alloc_lignes ADD COLUMN sfdr INTEGER;
ALTER TABLE alloc_lignes ADD COLUMN risque INTEGER;
