import express from 'express';
import {
  getVotantes,
  createVotante,
  updateVotante,
  deleteVotante,
} from '../controllers/votantes.controller.js';

import { filtrarVotantes } from '../controllers/reportes.controller.js';

import { verificarToken } from '../middlewares/auth.js'; // 👈 Importa el middleware

const router = express.Router();

// 🔒 Aplicar middleware a todas las rutas:
router.use(verificarToken);

// ✅ Rutas protegidas
router.get('/', getVotantes);
router.post('/', createVotante);
router.put('/:id', updateVotante);
router.delete('/:id', deleteVotante);
router.get('/votantes', verificarToken, getVotantes); // 👈 Aquí debe estar el middleware
router.get('/filtrar', filtrarVotantes); // ✅ Agrega esta línea


export default router;

