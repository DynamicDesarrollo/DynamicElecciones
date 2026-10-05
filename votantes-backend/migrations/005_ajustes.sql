-- 005_ajustes.sql
-- Ajustes generales del SaaS que administra el superadmin.
-- El primero: la dirección de la consulta oficial de puesto y mesa de la Registraduría,
-- que cambia con cada elección.

CREATE TABLE ajustes (
  clave text PRIMARY KEY,
  valor text
);

INSERT INTO ajustes (clave, valor)
VALUES ('url_consulta_votacion', 'https://wsp.registraduria.gov.co/censo/consultar/');
