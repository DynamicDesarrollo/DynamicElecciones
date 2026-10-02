
const express = require('express');
const {
  getVotantes,
  createVotante,
  updateVotante,
  deleteVotante,
  getTotalVotantes,
  validarCedula,
  exportarExcelVotantes
} = require('../controllers/votantes.controller');

const router = express.Router();
router.get('/', getVotantes);
router.post('/', createVotante);
router.get('/validar-cedula/:cedula', validarCedula);
router.get('/exportar-excel', exportarExcelVotantes);
router.get('/total', getTotalVotantes);
router.put('/:id', updateVotante);
router.delete('/:id', deleteVotante);
module.exports = router;
