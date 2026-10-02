const express = require('express');
const router = express.Router();
const {
  getLideres,
  getLiderById,
  createLider,
  updateLider,
  deleteLider
} = require('../controllers/lideres.controller');

router.get('/', getLideres);
router.get('/:id', getLiderById);
router.post('/', createLider);
router.put('/:id', updateLider);
router.delete('/:id', deleteLider);

module.exports = router;
