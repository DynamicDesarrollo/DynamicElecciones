import express from 'express';
import {
  getAspirantesConcejo,
  createAspiranteConcejo,
  updateAspiranteConcejo,
  deleteAspiranteConcejo
} from '../controllers/aspirantes_concejo.controller.js';

const router = express.Router();

router.get('/', getAspirantesConcejo);
router.post('/', createAspiranteConcejo);
router.put('/:id', updateAspiranteConcejo);
router.delete('/:id', deleteAspiranteConcejo);

export default router;
