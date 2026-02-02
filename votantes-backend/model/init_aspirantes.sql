-- SQL para crear la tabla aspirantes
CREATE TABLE IF NOT EXISTS aspirantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
  tipo_aspirante VARCHAR(30) NOT NULL, -- senado, camara, alcaldia, concejo, gobernacion
  partido VARCHAR(100),
  municipio VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por tipo
CREATE INDEX IF NOT EXISTS idx_aspirantes_tipo ON aspirantes(tipo_aspirante);
