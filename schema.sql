-- Base de données RSV Conciergerie (Cloudflare D1).
-- À coller une seule fois dans la console de la base, onglet "Console".

CREATE TABLE IF NOT EXISTS membres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  telephone TEXT NOT NULL DEFAULT '',
  formule TEXT NOT NULL CHECK (formule IN ('privee', 'entreprise')),
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'actif', 'suspendu')),
  mdp_hash TEXT NOT NULL,
  mdp_sel TEXT NOT NULL,
  mdp_iterations INTEGER NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  jeton_hash TEXT PRIMARY KEY,
  membre_id INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
  expire_le INTEGER NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS sessions_membre ON sessions (membre_id);

CREATE TABLE IF NOT EXISTS demandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  membre_id INTEGER REFERENCES membres(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  contact TEXT NOT NULL,
  arrivee TEXT,
  depart TEXT,
  voyageurs INTEGER NOT NULL DEFAULT 1,
  inclus TEXT NOT NULL DEFAULT '',
  souhaits TEXT NOT NULL DEFAULT '',
  langue TEXT NOT NULL DEFAULT 'fr',
  cree_le TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS essais (
  cle TEXT NOT NULL,
  quand INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS essais_cle ON essais (cle, quand);
