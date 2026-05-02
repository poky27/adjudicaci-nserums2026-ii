-- Schema D1 para SERUMS 2026-I Adjudicación
-- Ejecutar con: npx wrangler d1 execute serums-2026 --remote --file=schema.sql

DROP TABLE IF EXISTS adjudicaciones;
DROP TABLE IF EXISTS plazas_tomadas;

CREATE TABLE adjudicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_adjudicacion INTEGER NOT NULL UNIQUE,
  candidato_rank INTEGER NOT NULL,
  candidato_nombre TEXT NOT NULL,
  candidato_puntaje REAL,
  estado TEXT NOT NULL CHECK(estado IN ('adjudicado','no_adjudico')),
  diresa TEXT,
  institucion TEXT,
  provincia TEXT,
  distrito TEXT,
  establecimiento TEXT,
  grado_dificultad TEXT,
  categoria TEXT,
  codigo_renipress TEXT,
  plaza_index INTEGER,
  oportunidades_usadas INTEGER DEFAULT 1,
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_adj_numero ON adjudicaciones(numero_adjudicacion);
CREATE INDEX idx_adj_rank ON adjudicaciones(candidato_rank);

CREATE TABLE plazas_tomadas (
  plaza_index INTEGER PRIMARY KEY,
  adjudicado_por TEXT NOT NULL,
  candidato_rank INTEGER,
  numero_adjudicacion INTEGER,
  timestamp INTEGER NOT NULL
);
