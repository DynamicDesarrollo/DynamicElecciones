-- 003_partidos.sql
-- Catálogo de partidos del SaaS (lo administra el superadmin): sigla, eslogan, color y
-- el identificador de Wikidata cuando se importó desde allí (logo incluido).

ALTER TABLE partidos
  ADD COLUMN sigla       varchar(30),
  ADD COLUMN eslogan     text,
  ADD COLUMN color       varchar(7),
  ADD COLUMN wikidata_id varchar(20);
ALTER TABLE partidos ALTER COLUMN nombre TYPE varchar(150);
CREATE UNIQUE INDEX ux_partidos_wikidata ON partidos (wikidata_id) WHERE wikidata_id IS NOT NULL;
