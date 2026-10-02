
const express = require('express');
const {
  getMesas,
  createMesa,
  updateMesa,
  deleteMesa
} = require('../controllers/mesas.controller');


const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Catálogo compartido: lo modifica solo superadmin
const puedeEditar = requireRol('superadmin');


router.get('/', getMesas);
router.post('/', puedeEditar, createMesa);
router.put('/:id', puedeEditar, updateMesa);
router.delete('/:id', puedeEditar, deleteMesa);

module.exports = router;