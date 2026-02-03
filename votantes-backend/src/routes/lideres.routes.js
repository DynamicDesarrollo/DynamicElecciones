const express = require('express');
const router = express.Router();
const {
  getLideres,
  getLiderById,
  createLider,
  updateLider,
  deleteLider,
  getAllLideresRaw
} = require('../controllers/lideres.controller');

// Endpoint temporal para comparar líderes con Neon
router.get('/todos-raw', getAllLideresRaw);

router.get('/', getLideres);
router.get('/:id', getLiderById);
router.post('/', createLider);
router.put('/:id', updateLider);
router.delete('/:id', deleteLider);

module.exports = router;
