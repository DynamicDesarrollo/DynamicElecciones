-- 001_campanas_jerarquia.sql
-- Base SaaS: campañas con tipo y territorio, y una jerarquía única de aspirantes.
--
--   Campaña (tipo + territorio, una sola por tipo y territorio)
--     └─ Aspirante principal (gobernador, diputado, alcalde o concejal según el tipo)
--         └─ Aspirantes secundarios (diputados de la gobernación, concejales de la alcaldía)
--             └─ Líderes
--                 └─ Prospectos votantes (también pueden colgar directo de un aspirante)
--
-- Las tablas aspirantes_alcaldia y aspirantes_concejo y las columnas aspirante_concejo_id /
-- aspirante_alcaldia_id quedan solo como histórico: el código ya no las usa.
-- El ejecutor (scripts/migrate.js) corre este archivo dentro de una transacción.

-- 1. Campañas ------------------------------------------------------------------
CREATE TABLE campanas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       varchar(150) NOT NULL,
  tipo         varchar(20)  NOT NULL CHECK (tipo IN ('gobernacion', 'asamblea', 'alcaldia', 'concejo')),
  departamento varchar(100) NOT NULL,
  municipio    varchar(100),
  descripcion  text,
  activa       boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  -- Alcaldía y Concejo son municipales; Gobernación y Asamblea, departamentales
  CONSTRAINT campanas_territorio_check
    CHECK ((tipo IN ('alcaldia', 'concejo')) = (municipio IS NOT NULL))
);

-- Privacidad: una sola campaña por tipo y territorio
CREATE UNIQUE INDEX ux_campanas_territorio
  ON campanas (tipo, upper(departamento), upper(COALESCE(municipio, '')));

-- 2. Aspirantes (tabla única) -----------------------------------------------------
-- La tabla "aspirantes" anterior era un listado suelto sin uso real: se conserva como histórico
ALTER TABLE aspirantes RENAME TO aspirantes_legacy;
ALTER TABLE aspirantes_legacy RENAME CONSTRAINT aspirantes_pkey TO aspirantes_legacy_pkey;
ALTER INDEX IF EXISTS idx_aspirantes_tipo RENAME TO idx_aspirantes_legacy_tipo;

CREATE TABLE aspirantes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campana_id      uuid NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  cargo           varchar(20) NOT NULL CHECK (cargo IN ('gobernador', 'diputado', 'alcalde', 'concejal')),
  padre_id        uuid REFERENCES aspirantes(id),
  nombre_completo varchar(150) NOT NULL,
  cedula          varchar(20),
  telefono        varchar(20),
  direccion       text,
  barrio          varchar(100),
  fecha_nace      date,
  partido_id      uuid REFERENCES partidos(id),
  municipio_id    uuid REFERENCES municipios(id),
  coalicion       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Un solo aspirante principal (sin padre) por campaña
CREATE UNIQUE INDEX ux_aspirantes_principal ON aspirantes (campana_id) WHERE padre_id IS NULL;
CREATE INDEX idx_aspirantes_campana ON aspirantes (campana_id);

-- 3. Columnas nuevas en usuarios, líderes y votantes ------------------------------
ALTER TABLE usuarios
  ADD COLUMN campana_id   uuid REFERENCES campanas(id),
  ADD COLUMN aspirante_id uuid REFERENCES aspirantes(id);

ALTER TABLE lideres
  ADD COLUMN campana_id   uuid REFERENCES campanas(id),
  ADD COLUMN aspirante_id uuid REFERENCES aspirantes(id);

ALTER TABLE prospectos_votantes
  ADD COLUMN campana_id   uuid REFERENCES campanas(id),
  ADD COLUMN aspirante_id uuid REFERENCES aspirantes(id);

-- 4. Datos existentes → "Campaña principal" ---------------------------------------
-- Solo si ya hay datos. El tipo y territorio quedan "POR DEFINIR" para que el superadmin los corrija.
DO $$
DECLARE
  v_campana   uuid;
  v_principal uuid;
BEGIN
  IF NOT (EXISTS (SELECT 1 FROM prospectos_votantes)
       OR EXISTS (SELECT 1 FROM lideres)
       OR EXISTS (SELECT 1 FROM aspirantes_concejo)
       OR EXISTS (SELECT 1 FROM aspirantes_alcaldia)
       OR EXISTS (SELECT 1 FROM usuarios)) THEN
    RETURN;
  END IF;

  INSERT INTO campanas (nombre, tipo, departamento, municipio, descripcion)
  VALUES ('Campaña principal', 'alcaldia', 'POR DEFINIR', 'POR DEFINIR',
          'Datos existentes antes de la migración multi-campaña. Revise tipo y territorio.')
  RETURNING id INTO v_campana;

  -- Principal: el primer aspirante a la alcaldía (se conserva su id) o un marcador
  INSERT INTO aspirantes (id, campana_id, cargo, nombre_completo, cedula, telefono, direccion,
                          barrio, fecha_nace, partido_id, municipio_id, coalicion)
  SELECT id, v_campana, 'alcalde', nombre_completo, cedula, telefono, direccion,
         barrio, fecha_nace, partido_id, municipio_id, COALESCE(coalicion, false)
  FROM aspirantes_alcaldia
  ORDER BY nombre_completo
  LIMIT 1
  RETURNING id INTO v_principal;

  IF v_principal IS NULL THEN
    INSERT INTO aspirantes (campana_id, cargo, nombre_completo)
    VALUES (v_campana, 'alcalde', 'Aspirante principal (por definir)')
    RETURNING id INTO v_principal;
  END IF;

  -- Concejales (se conservan sus ids para no romper las referencias)
  INSERT INTO aspirantes (id, campana_id, cargo, padre_id, nombre_completo, cedula, telefono,
                          direccion, barrio, fecha_nace, partido_id, municipio_id)
  SELECT id, v_campana, 'concejal', v_principal, nombre_completo, cedula, telefono,
         direccion, barrio, fecha_nace, partido_id, municipio_id
  FROM aspirantes_concejo;

  UPDATE lideres l
  SET campana_id   = v_campana,
      aspirante_id = COALESCE((SELECT a.id FROM aspirantes a WHERE a.id = l.aspirante_concejo_id), v_principal);

  -- Admin sigue viendo toda la campaña. Un usuario ligado a un concejal pasa a rol "aspirante".
  -- Los demás conservan el rol "user" (solo ven lo que registraron), sin ampliar su acceso.
  UPDATE usuarios u
  SET campana_id   = v_campana,
      aspirante_id = CASE WHEN u.rol = 'admin' THEN NULL
                          ELSE (SELECT a.id FROM aspirantes a
                                WHERE a.id = u.aspirante_concejo_id AND a.padre_id IS NOT NULL) END;
  UPDATE usuarios SET rol = 'aspirante' WHERE aspirante_id IS NOT NULL;

  -- Votante: su aspirante explícito, si no el de su líder, si no el de quien lo registró, si no el principal
  UPDATE prospectos_votantes pv
  SET campana_id   = v_campana,
      aspirante_id = COALESCE(
        (SELECT a.id FROM aspirantes a WHERE a.id = COALESCE(pv.aspirante_concejo_id, pv.aspirante_alcaldia_id)),
        (SELECT NULLIF(l.aspirante_id, v_principal) FROM lideres l WHERE l.id = pv.lider_id),
        (SELECT u.aspirante_id FROM usuarios u WHERE u.id = pv.usuario_id),
        v_principal);
END $$;

-- 5. Restricciones e índices ------------------------------------------------------
ALTER TABLE lideres             ALTER COLUMN campana_id SET NOT NULL, ALTER COLUMN aspirante_id SET NOT NULL;
ALTER TABLE prospectos_votantes ALTER COLUMN campana_id SET NOT NULL, ALTER COLUMN aspirante_id SET NOT NULL;

-- superadmin no pertenece a una campaña (su campana_id es la campaña en la que está trabajando)
ALTER TABLE usuarios ADD CONSTRAINT usuarios_campana_check
  CHECK (rol = 'superadmin' OR campana_id IS NOT NULL);

CREATE INDEX idx_usuarios_campana            ON usuarios (campana_id);
CREATE INDEX idx_usuarios_aspirante          ON usuarios (aspirante_id);
CREATE INDEX idx_lideres_campana_aspirante   ON lideres (campana_id, aspirante_id);
CREATE INDEX idx_votantes_campana_aspirante  ON prospectos_votantes (campana_id, aspirante_id);
CREATE INDEX idx_votantes_campana_cedula     ON prospectos_votantes (campana_id, cedula);
CREATE INDEX IF NOT EXISTS idx_asistencia_votante ON asistencia_votantes (votante_uuid);

COMMENT ON TABLE aspirantes_alcaldia IS 'Histórico. Reemplazada por aspirantes (migración 001).';
COMMENT ON TABLE aspirantes_concejo  IS 'Histórico. Reemplazada por aspirantes (migración 001).';
COMMENT ON TABLE aspirantes_legacy   IS 'Histórico. Listado anterior sin uso real.';
