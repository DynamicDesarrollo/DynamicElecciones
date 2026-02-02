
const express = require('express');
const {
  getPartidos,
  createPartido,
  updatePartido,
  deletePartido
} = require('../controllers/partidos.controller');
const router = express.Router();
router.get('/', getPartidos);
router.post('/', createPartido);
router.put('/:id', updatePartido);
router.delete('/:id', deletePartido);
module.exports = router;
