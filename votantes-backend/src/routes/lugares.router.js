
const express = require('express');
const {
  getLugares,
  createLugar,
  updateLugar,
  deleteLugar
} = require('../controllers/lugares.controller');


const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Catálogo compartido: lo modifica solo superadmin
const puedeEditar = requireRol('superadmin');


router.get('/', getLugares);
router.post('/', puedeEditar, createLugar);
router.put('/:id', puedeEditar, updateLugar);
router.delete('/:id', puedeEditar, deleteLugar);

module.exports = router;