
const express = require('express');
const { filtrarVotantes, obtenerResumenDashboard, getVotantesPorPartido, getVotantesPorAspirante } = require('../controllers/reportes.controller');
const router = express.Router();
router.get('/filtrarvotantes', filtrarVotantes);
router.get('/dashboard', obtenerResumenDashboard);
router.get('/votantesporpartido', getVotantesPorPartido);
router.get('/votantesporaspirante', getVotantesPorAspirante);
module.exports = router;
