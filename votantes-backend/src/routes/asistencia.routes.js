import { Router } from "express";
import { getAsistencias
, createAsistencia,totalVotantes,resumenAsistencias} from "../controllers/asistencias.controler.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", verificarToken, getAsistencias);
router.post("/", verificarToken, createAsistencia);
router.get("/total", verificarToken, totalVotantes);
router.get("/resumen", verificarToken, resumenAsistencias);


export default router; 