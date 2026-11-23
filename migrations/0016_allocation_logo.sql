-- Allocation : site internet de l'assureur (pour afficher son icône) et logo déposé par un conseiller (image réduite, en base64).
ALTER TABLE alloc_assureurs ADD COLUMN site TEXT;
ALTER TABLE alloc_assureurs ADD COLUMN logo TEXT;
