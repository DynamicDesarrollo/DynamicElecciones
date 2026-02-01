-- ==========================
-- CREACIÓN DE TABLAS BASE
-- ==========================

-- 🔹 Tabla: Partidos Políticos
CREATE TABLE IF NOT EXISTS partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT
);

-- 🔹 Tabla: Municipios
CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 🔹 Tabla: Barrios
CREATE TABLE IF NOT EXISTS barrios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE
);

-- 🔹 Tabla: Aspirantes a la Alcaldía
CREATE TABLE IF NOT EXISTS aspirantes_alcaldia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  partido_id UUID REFERENCES partidos(id),
  municipio_id UUID REFERENCES municipios(id),
  coalicion BOOLEAN DEFAULT FALSE
);

-- 🔹 Tabla: Aspirantes al Concejo
CREATE TABLE IF NOT EXISTS aspirantes_concejo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  partido_id UUID REFERENCES partidos(id),
  municipio_id UUID REFERENCES municipios(id),
  alcaldia_id UUID REFERENCES aspirantes_alcaldia(id) ON DELETE SET NULL
);

-- 🔹 Tabla: Líderes
CREATE TABLE IF NOT EXISTS lideres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  aspirante_concejo_id UUID REFERENCES aspirantes_concejo(id) ON DELETE SET NULL,
  municipio UUID REFERENCES municipios(id),
  barrio UUID REFERENCES barrios(id),
  cedula VARCHAR(20),
  direccion TEXT,
  telefono VARCHAR(20),
  fecha_nace DATE
);

-- 🔹 Tabla: Prospectos Votantes
CREATE TABLE IF NOT EXISTS prospectos_votantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(150) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  municipio_id UUID REFERENCES municipios(id),
  barrio_id UUID REFERENCES barrios(id),

  -- Referencias opcionales
  lider_id UUID REFERENCES lideres(id) ON DELETE SET NULL,
  aspirante_concejo_id UUID REFERENCES aspirantes_concejo(id) ON DELETE SET NULL,
  aspirante_alcaldia_id UUID REFERENCES aspirantes_alcaldia(id) ON DELETE SET NULL,

  registrado_por UUID, -- usuario opcional (si se implementa login)
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(cedula) -- evitar duplicados
);
