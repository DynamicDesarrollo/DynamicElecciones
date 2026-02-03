
const express = require('express');
const {
  getLideres,
  getLiderById,
  createLider,
  updateLider,
  deleteLider
} = require('../controllers/lideres.controller');


const router = express.Router();



router.get('/', getLideres);
router.get('/:id', getLiderById);
router.post('/', createLider);
router.put('/:id', updateLider);
router.delete('/:id', deleteLider);

module.exports = router;
