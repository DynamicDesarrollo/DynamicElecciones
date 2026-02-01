-- MIGRACIÓN: Agregar municipio_id y barrio_id a la tabla lideres
ALTER TABLE lideres ADD COLUMN municipio UUID REFERENCES municipios(id);
ALTER TABLE lideres ADD COLUMN barrio UUID REFERENCES barrios(id);