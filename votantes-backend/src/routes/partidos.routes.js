import express from 'express';
import {
  getPartidos,
  createPartido,
  updatePartido,
  deletePartido,
} from '../controllers/partidos.controller.js';

const router = express.Router();

router.get('/', getPartidos);
router.post('/', createPartido);
router.put('/:id', updatePartido);
router.delete('/:id', deletePartido);

export default router;
