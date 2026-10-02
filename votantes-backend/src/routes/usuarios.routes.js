const express = require('express');
const router = express.Router();
const { listarUsuarios, crearUsuario, eliminarUsuario, restablecerPassword } = require('../controllers/usuarios.controller');
const { requireRol } = require('../middlewares/auth');

// Gestionan usuarios los administradores y los aspirantes (estos últimos, solo su equipo)
router.use(requireRol('superadmin', 'admin', 'aspirante'));
router.get('/', listarUsuarios);
router.post('/', crearUsuario);
router.put('/:id/password', restablecerPassword);
router.delete('/:id', eliminarUsuario);

module.exports = router;
