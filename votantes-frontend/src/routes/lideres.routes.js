import express from 'express';
import {
  getLideres,
  createLider,
  updateLider,
  deleteLider
} from '../controllers/lideres.controller.js';

const router = express.Router();

router.get('/', getLideres);
router.post('/', createLider);
router.put('/:id', updateLider);
router.delete('/:id', deleteLider);

export default router;
