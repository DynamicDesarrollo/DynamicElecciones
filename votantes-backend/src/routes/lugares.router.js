
const express = require('express');
const {
  getLugares,
  createLugar,
  updateLugar,
  deleteLugar
} = require('../controllers/lugares.controller');


const router = express.Router();


router.get('/', getLugares);
router.post('/', createLugar);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);

module.exports = router;