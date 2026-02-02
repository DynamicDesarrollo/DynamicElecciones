
const express = require('express');
const {
  getAspirantesAlcaldia,
  createAspiranteAlcaldia,
  updateAspiranteAlcaldia,
  deleteAspiranteAlcaldia,
  crearAspirante,
  listarAspirantes
} = require('../controllers/aspirantes.controller');
const router = express.Router();
// Rutas antiguas (alcaldía)
router.get('/alcaldia', getAspirantesAlcaldia);
router.post('/alcaldia', createAspiranteAlcaldia);

// Rutas nuevas generales
router.get('/', listarAspirantes);
router.post('/', crearAspirante);
router.put('/alcaldia/:id', updateAspiranteAlcaldia);
router.delete('/alcaldia/:id', deleteAspiranteAlcaldia);
module.exports = router;
