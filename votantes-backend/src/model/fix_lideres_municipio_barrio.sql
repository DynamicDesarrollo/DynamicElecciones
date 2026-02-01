-- Reemplaza los nombres por los UUID correctos antes de migrar
-- Ejemplo: busca el UUID de 'Municipio X' y 'La Esperanza'

-- Consulta para obtener el UUID de Municipio X
SELECT id FROM municipios WHERE nombre = 'Municipio X';
-- Consulta para obtener el UUID de La Esperanza
SELECT id FROM barrios WHERE nombre = 'La Esperanza';

-- Supón que los UUID obtenidos son:
-- Municipio X: bbc04f33-3ef7-43f6-8228-1bb0e0953534
-- La Esperanza: 6e4db1ea-49f7-4758-8a61-474ef023ccd3

-- Actualiza los líderes:
UPDATE lideres SET municipio = 'bbc04f33-3ef7-43f6-8228-1bb0e0953534' WHERE municipio = 'Municipio X';
UPDATE lideres SET barrio = '6e4db1ea-49f7-4758-8a61-474ef023ccd3' WHERE barrio = 'La Esperanza';

-- Repite para cualquier otro municipio o barrio con nombre en vez de UUID.