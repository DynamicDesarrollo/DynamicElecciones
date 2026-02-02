
const express = require('express');
const {
  getMunicipios,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio
} = require('../controllers/municipios.controller');
const router = express.Router();
router.get('/', getMunicipios);
router.post('/', createMunicipio);
router.put('/:id', updateMunicipio);
router.delete('/:id', deleteMunicipio);
module.exports = router;
