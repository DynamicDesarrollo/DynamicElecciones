
const express = require('express');
const {
  getMesas,
  createMesa,
  updateMesa,
  deleteMesa
} = require('../controllers/mesas.controller');


const router = express.Router();


router.get('/', getMesas);
router.post('/', createMesa);
router.put('/:id', updateMesa);
router.delete('/:id', deleteMesa);

module.exports = router;