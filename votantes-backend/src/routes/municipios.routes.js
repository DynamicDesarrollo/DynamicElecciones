
const express = require('express');
const {
  getMunicipios,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio
} = require('../controllers/municipios.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Catálogo compartido: lo modifica solo superadmin
const puedeEditar = requireRol('superadmin');
router.get('/', getMunicipios);
router.post('/', puedeEditar, createMunicipio);
router.put('/:id', puedeEditar, updateMunicipio);
router.delete('/:id', puedeEditar, deleteMunicipio);
module.exports = router;
