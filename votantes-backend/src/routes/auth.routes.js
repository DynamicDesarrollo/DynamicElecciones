
const express = require('express');
const { login, yo, cambiarPassword, renovar } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth');
const router = express.Router();
// El registro público se eliminó: los usuarios los crea un admin desde /api/usuarios
router.post('/login', login);
router.get('/yo', verificarToken, yo);
router.post('/renovar', verificarToken, renovar);
router.put('/password', verificarToken, cambiarPassword);
module.exports = router;
