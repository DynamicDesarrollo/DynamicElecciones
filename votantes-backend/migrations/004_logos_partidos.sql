-- 004_logos_partidos.sql
-- Los logos de los partidos se guardan en la base (se descargan una vez al cargar el partido)
-- para no depender de que cne.gov.co o Wikimedia respondan cada vez que alguien abre la app.

ALTER TABLE partidos
  ADD COLUMN logo_datos bytea,
  ADD COLUMN logo_tipo  varchar(40),
  -- Dirección de respaldo del logo (Wikimedia) por si la oficial no responde
  ADD COLUMN logo_respaldo text;
