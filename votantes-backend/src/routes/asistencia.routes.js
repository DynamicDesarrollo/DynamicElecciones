

const express = require('express');
const { getAsistencias, createAsistencia, totalVotantes, resumenAsistencias } = require('../controllers/asistencias.controler');
const router = express.Router();
router.get('/', getAsistencias);
router.post('/', createAsistencia);
router.get('/total', totalVotantes);
router.get('/resumen', resumenAsistencias);
module.exports = router;
