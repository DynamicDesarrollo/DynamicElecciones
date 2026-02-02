
const express = require('express');
const {
  getAspirantesConcejo,
  createAspiranteConcejo,
  updateAspiranteConcejo,
  deleteAspiranteConcejo
} = require('../controllers/aspirantes_concejo.controller');
const router = express.Router();
router.get('/', getAspirantesConcejo);
router.post('/', createAspiranteConcejo);
router.put('/:id', updateAspiranteConcejo);
router.delete('/:id', deleteAspiranteConcejo);
module.exports = router;
