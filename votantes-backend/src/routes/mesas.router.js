import express from 'express';
import {
  getMesas,
  createMesa,
  updateMesa,
  deleteMesa
} from '../controllers/mesas.controller.js';

const router = express.Router();

router.get('/', getMesas);
router.post('/', createMesa);
router.put('/:id', updateMesa);
router.delete('/:id', deleteMesa);

export default router;