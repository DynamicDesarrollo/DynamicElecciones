-- MIGRACIÓN: Cambiar tipo de municipio y barrio a UUID en lideres
ALTER TABLE lideres ALTER COLUMN municipio TYPE UUID USING municipio::uuid;
ALTER TABLE lideres ALTER COLUMN barrio TYPE UUID USING barrio::uuid;