import express from 'express';
import {
  getMunicipios,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio
} from '../controllers/municipios.controller.js';

const router = express.Router();

router.get('/', getMunicipios);
router.post('/', createMunicipio);
router.put('/:id', updateMunicipio);
router.delete('/:id', deleteMunicipio);

export default router;
