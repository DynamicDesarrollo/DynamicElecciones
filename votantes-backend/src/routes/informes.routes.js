
const express = require('express');
const { votantesDuplicados, asistenciasDuplicadas } = require('../controllers/informes.controller');
const { verificarToken } = require('../middlewares/auth');
const router = express.Router();
router.get('/votantes-duplicados', verificarToken, votantesDuplicados);
router.get('/asistencias-duplicadas', verificarToken, asistenciasDuplicadas);
module.exports = router;
