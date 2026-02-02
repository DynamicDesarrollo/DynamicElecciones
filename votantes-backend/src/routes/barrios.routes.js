
const express = require('express');
const {
  getBarrios,
  createBarrio,
  updateBarrio,
  deleteBarrio
} = require('../controllers/barrios.controller');
const router = express.Router();
router.get('/', getBarrios);
router.post('/', createBarrio);
router.put('/:id', updateBarrio);
router.delete('/:id', deleteBarrio);
module.exports = router;
