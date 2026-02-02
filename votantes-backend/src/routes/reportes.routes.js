
const express = require('express');
const { getVotantesDuplicados, filtrarVotantes, getResumenVotantes, obtenerResumenDashboard, getVotantesPorPartido } = require('../controllers/reportes.controller');
const { verificarToken } = require('../middlewares/auth');
const router = express.Router();
router.get('/votantesduplicados', getVotantesDuplicados);
router.get('/filtrarvotantes', filtrarVotantes);
router.get('/resumenvotantes', getResumenVotantes);
router.get('/dashboard', verificarToken, obtenerResumenDashboard);
router.get('/votantesporpartido', verificarToken, getVotantesPorPartido);
module.exports = router;