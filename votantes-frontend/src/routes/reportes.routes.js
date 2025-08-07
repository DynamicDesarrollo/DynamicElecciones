import { Router } from 'express';
import { getVotantesDuplicados } from '../controllers/reportes.controller.js';
import { filtrarVotantes } from '../controllers/reportes.controller.js';
import { getResumenVotantes } from '../controllers/reportes.controller.js';
import { obtenerResumenDashboard } from '../controllers/reportes.controller.js';
import { getVotantesPorPartido } from "../controllers/reportes.controller.js";
import {verificarToken} from '../middlewares/auth.js';



const router = Router();

router.get('/votantesduplicados', getVotantesDuplicados);
router.get('/filtrarvotantes', filtrarVotantes);
router.get('/resumenvotantes', getResumenVotantes);
router.get("/dashboard", verificarToken, obtenerResumenDashboard);
router.get('/votantesporpartido', verificarToken, getVotantesPorPartido);

export default router;