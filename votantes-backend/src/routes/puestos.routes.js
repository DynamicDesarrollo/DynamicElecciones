const express = require('express');
const { listarPuestos, createPuesto, updatePuesto, deletePuesto } = require('../controllers/puestos.controller');
const router = express.Router();
router.get('/', listarPuestos);
router.post('/', createPuesto);
router.put('/:id', updatePuesto);
router.delete('/:id', deletePuesto);
module.exports = router;
