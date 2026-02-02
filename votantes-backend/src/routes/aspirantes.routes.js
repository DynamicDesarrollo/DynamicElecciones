
const express = require('express');
const {
  getAspirantesAlcaldia,
  createAspiranteAlcaldia,
  updateAspiranteAlcaldia,
  deleteAspiranteAlcaldia
} = require('../controllers/aspirantes.controller');
const router = express.Router();
router.get('/', getAspirantesAlcaldia);
router.post('/', createAspiranteAlcaldia);
router.put('/:id', updateAspiranteAlcaldia);
router.delete('/:id', deleteAspiranteAlcaldia);
module.exports = router;
