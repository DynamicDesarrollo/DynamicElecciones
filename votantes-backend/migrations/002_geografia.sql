-- 002_geografia.sql
-- Geografía oficial: municipios con código DANE, campañas con territorio codificado
-- y puestos de votación (lugares) ligados a su municipio, cargados desde datos.gov.co.

-- Municipios: el nombre ya no es único (hay Buenavista en varios departamentos); el código DANE sí
ALTER TABLE municipios DROP CONSTRAINT IF EXISTS municipios_nombre_key;
ALTER TABLE municipios
  ADD COLUMN codigo_dane         varchar(5),
  ADD COLUMN codigo_departamento varchar(2),
  ADD COLUMN departamento        varchar(100);
CREATE UNIQUE INDEX ux_municipios_codigo_dane ON municipios (codigo_dane) WHERE codigo_dane IS NOT NULL;
CREATE INDEX idx_municipios_departamento ON municipios (codigo_departamento);

-- Campañas: territorio con códigos DANE (los nombres se conservan para mostrar)
ALTER TABLE campanas
  ADD COLUMN codigo_departamento varchar(2),
  ADD COLUMN codigo_municipio    varchar(5);

-- Puestos de votación ligados a su municipio, con dirección y georreferencia
ALTER TABLE lugares_votacion
  ADD COLUMN municipio_id uuid REFERENCES municipios(id),
  ADD COLUMN direccion    text,
  ADD COLUMN comuna       varchar(100),
  ADD COLUMN latitud      numeric(10, 7),
  ADD COLUMN longitud     numeric(10, 7),
  ADD COLUMN fuente       varchar(40);
ALTER TABLE lugares_votacion ALTER COLUMN nombre TYPE varchar(150);
ALTER TABLE lugares_votacion ALTER COLUMN municipio TYPE varchar(100);
ALTER TABLE lugares_votacion ALTER COLUMN departamento TYPE varchar(100);
CREATE INDEX idx_lugares_municipio ON lugares_votacion (municipio_id);
CREATE INDEX idx_mesas_lugar ON mesas_votacion (lugar_id);
