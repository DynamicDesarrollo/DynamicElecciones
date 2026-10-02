
const express = require('express');
const {
  listarAspirantes,
  createAspirante,
  updateAspirante,
  deleteAspirante
} = require('../controllers/aspirantes.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
const soloAdmin = requireRol('superadmin', 'admin');
router.get('/', listarAspirantes);
router.post('/', soloAdmin, createAspirante);
router.put('/:id', soloAdmin, updateAspirante);
router.delete('/:id', soloAdmin, deleteAspirante);
module.exports = router;
