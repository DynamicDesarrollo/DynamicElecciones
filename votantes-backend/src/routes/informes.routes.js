import { Router } from "express";
import {
  votantesDuplicados,
  asistenciasDuplicadas
} from "../controllers/informes.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.get("/votantes-duplicados", verificarToken, votantesDuplicados);
router.get("/asistencias-duplicadas", verificarToken, asistenciasDuplicadas);

export default router;
