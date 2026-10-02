
const express = require('express');
const { votantesDuplicados, asistenciasDuplicadas } = require('../controllers/informes.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Los duplicados entre aspirantes solo los ve el admin de la campaña
router.use(requireRol('superadmin', 'admin'));
router.get('/votantes-duplicados', votantesDuplicados);
router.get('/asistencias-duplicadas', asistenciasDuplicadas);
module.exports = router;
