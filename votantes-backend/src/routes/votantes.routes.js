
const express = require('express');
const {
  getVotantes,
  createVotante,
  updateVotante,
  deleteVotante,
  getTotalVotantes,
  validarCedula
} = require('../controllers/votantes.controller');
// const { filtrarVotantes } = require('../controllers/reportes.controller');
const { verificarToken } = require('../middlewares/auth');

const router = express.Router();
router.use(verificarToken);
router.get('/', getVotantes);
router.post('/', createVotante);
router.put('/:id', updateVotante);
router.delete('/:id', deleteVotante);
router.get('/votantes', verificarToken, getVotantes);
router.get('/filtrar', getVotantes);
router.get('/total', getTotalVotantes);
router.get('/validar-cedula/:cedula', validarCedula);
module.exports = router;

