-- Inserta el usuario admin@demo.com con hash para 1234
INSERT INTO usuarios (nombre, correo, password, rol)
VALUES ('Administrador', 'admin@demo.com', '$2b$10$yWTSSILxZFNppEqyNjMgPenR.tom.mgv/1Dv2vy0.t7l5je/bWDim', 'admin');
