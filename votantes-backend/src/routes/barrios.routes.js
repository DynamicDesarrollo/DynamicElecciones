
const express = require('express');
const {
  getBarrios,
  createBarrio,
  updateBarrio,
  deleteBarrio
} = require('../controllers/barrios.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Catálogo compartido: lo modifican superadmin y admin
const puedeEditar = requireRol('superadmin', 'admin');
router.get('/', getBarrios);
router.post('/', puedeEditar, createBarrio);
router.put('/:id', puedeEditar, updateBarrio);
router.delete('/:id', puedeEditar, deleteBarrio);
module.exports = router;
