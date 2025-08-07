import express from 'express';
import {
  getBarrios,
  createBarrio,
  updateBarrio,
  deleteBarrio
} from '../controllers/barrios.controller.js';

const router = express.Router();

router.get('/', getBarrios);
router.post('/', createBarrio);
router.put('/:id', updateBarrio);
router.delete('/:id', deleteBarrio);

export default router;
