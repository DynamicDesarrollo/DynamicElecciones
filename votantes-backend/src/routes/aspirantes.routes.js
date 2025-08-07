import express from 'express';
import {
  getAspirantesAlcaldia,
  createAspiranteAlcaldia,
  updateAspiranteAlcaldia,
  deleteAspiranteAlcaldia
} from '../controllers/aspirantes.controller.js';

const router = express.Router();

router.get('/', getAspirantesAlcaldia);
router.post('/', createAspiranteAlcaldia);
router.put('/:id', updateAspiranteAlcaldia);
router.delete('/:id', deleteAspiranteAlcaldia);

export default router;
