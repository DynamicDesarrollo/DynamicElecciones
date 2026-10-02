
const express = require('express');
const {
  getTipos,
  getCampanas,
  createCampana,
  updateCampana,
  createAdminCampana,
  restablecerAdminCampana,
  recargarTerritorio
} = require('../controllers/campanas.controller');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();
const soloSuperadmin = requireRol('superadmin');
router.get('/tipos', getTipos);
router.get('/', getCampanas);
router.post('/', soloSuperadmin, createCampana);
router.put('/:id', soloSuperadmin, updateCampana);
router.post('/:id/admin', soloSuperadmin, createAdminCampana);
router.put('/:id/admin/password', soloSuperadmin, restablecerAdminCampana);
router.post('/:id/territorio', soloSuperadmin, recargarTerritorio);
module.exports = router;
