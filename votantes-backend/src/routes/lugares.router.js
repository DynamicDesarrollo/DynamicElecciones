import express from 'express';
import {
  getLugares,
  createLugar,
  updateLugar,
  deleteLugar
} from '../controllers/lugares.controller.js';

const router = express.Router();

router.get('/', getLugares);
router.post('/', createLugar);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);

export default router;