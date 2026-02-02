-- Migración para simplificar aspirante_concejo y aspirante_alcaldia a una sola columna tipo_aspirante
ALTER TABLE usuarios
  ADD COLUMN tipo_aspirante VARCHAR(30);

-- Si tienes datos existentes y quieres migrar los valores:
-- UPDATE usuarios SET tipo_aspirante = 'concejo' WHERE aspirante_concejo IS NOT NULL;
-- UPDATE usuarios SET tipo_aspirante = 'alcaldia' WHERE aspirante_alcald IS NOT NULL;

-- Elimina las columnas antiguas si ya no se usan:
ALTER TABLE usuarios
  DROP COLUMN IF EXISTS aspirante_concejo,
  DROP COLUMN IF EXISTS aspirante_alcald;

-- Puedes agregar un comentario para documentación
COMMENT ON COLUMN usuarios.tipo_aspirante IS 'Tipo de aspirante: senado, camara, alcaldia, concejo, null si no aplica';
