-- 006_puestos_control.sql
-- Puestos de control configurables: cada campaña (y cada aspirante dentro de ella) define
-- los puntos donde confirma la asistencia el día de la elección.
--
--   aspirante_id NULL  → puesto de toda la campaña (lo crea el admin; lo puede usar cualquiera)
--   aspirante_id dado  → puesto del equipo de ese aspirante (solo él y el admin lo ven)
--
-- La asistencia guarda el puesto elegido y conserva el nombre como texto, para que el
-- histórico siga legible si el puesto se renombra o se elimina.

CREATE TABLE puestos_control (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campana_id   uuid NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  aspirante_id uuid REFERENCES aspirantes(id) ON DELETE CASCADE,
  nombre       varchar(100) NOT NULL,
  referencia   varchar(200),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Sin nombres repetidos dentro del mismo dueño (la campaña o un aspirante)
CREATE UNIQUE INDEX ux_puestos_control_nombre
  ON puestos_control (campana_id, COALESCE(aspirante_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(nombre));

ALTER TABLE asistencia_votantes
  ADD COLUMN puesto_control_id uuid REFERENCES puestos_control(id) ON DELETE SET NULL,
  ADD COLUMN usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX idx_asistencia_puesto ON asistencia_votantes (puesto_control_id);

-- Los puestos que antes se escribían a mano pasan a ser puestos de la campaña
INSERT INTO puestos_control (campana_id, nombre)
SELECT pv.campana_id, MIN(btrim(a.puesto_control))
FROM asistencia_votantes a
JOIN prospectos_votantes pv ON pv.id = a.votante_uuid
WHERE btrim(COALESCE(a.puesto_control, '')) <> '' AND pv.campana_id IS NOT NULL
GROUP BY pv.campana_id, lower(btrim(a.puesto_control));

UPDATE asistencia_votantes a
SET puesto_control_id = pc.id
FROM prospectos_votantes pv, puestos_control pc
WHERE pv.id = a.votante_uuid
  AND pc.campana_id = pv.campana_id
  AND pc.aspirante_id IS NULL
  AND lower(pc.nombre) = lower(btrim(a.puesto_control));
