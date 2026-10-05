
const express = require('express');
const {
  getPartidos,
  createPartido,
  updatePartido,
  deletePartido,
  reintentarLogos,
  buscarEnWikidata,
  importarDeWikidata,
  buscarEnCNE,
  importarDeCNE
} = require('../controllers/partidos.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
// Catálogo compartido: lo modifica solo superadmin
const puedeEditar = requireRol('superadmin');
router.get('/', getPartidos);
router.get('/cne', puedeEditar, buscarEnCNE);
router.post('/cne', puedeEditar, importarDeCNE);
router.get('/wikidata', puedeEditar, buscarEnWikidata);
router.post('/wikidata', puedeEditar, importarDeWikidata);
router.post('/logos/reintentar', puedeEditar, reintentarLogos);
router.post('/', puedeEditar, createPartido);
router.put('/:id', puedeEditar, updatePartido);
router.delete('/:id', puedeEditar, deletePartido);
module.exports = router;
