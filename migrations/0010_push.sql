-- Notifications (Web Push) : un abonnement par appareil, avec les éditions souhaitées.
CREATE TABLE IF NOT EXISTS push_abonnements (
  endpoint       TEXT PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL,
  p256dh         TEXT NOT NULL,
  auth           TEXT NOT NULL,
  editions       TEXT NOT NULL DEFAULT 'matin,soir',
  cree_le        TEXT NOT NULL,
  dernier_envoi  TEXT
);
CREATE INDEX IF NOT EXISTS idx_push_utilisateur ON push_abonnements (utilisateur_id);
