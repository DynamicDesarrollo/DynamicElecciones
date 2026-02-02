const express = require('express');
const router = express.Router();
const { crearUsuario } = require('../controllers/usuarios.controller');

// Crear usuario
router.post('/', crearUsuario);

module.exports = router;
