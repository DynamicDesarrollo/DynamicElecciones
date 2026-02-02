

const express = require('express');
const { getAsistencias, createAsistencia, totalVotantes, resumenAsistencias } = require('../controllers/asistencias.controler');
const { verificarToken } = require('../middlewares/auth');
const router = express.Router();
router.get('/', verificarToken, getAsistencias);
router.post('/', verificarToken, createAsistencia);
router.get('/total', verificarToken, totalVotantes);
router.get('/resumen', verificarToken, resumenAsistencias);
module.exports = router;