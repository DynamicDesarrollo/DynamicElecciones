// Departamentos y municipios oficiales (DANE) para los selectores de la app
const express = require('express');
const divipola = require('../services/divipola');
const router = express.Router();

const responder = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    console.error('Error consultando datos.gov.co:', err.message);
    res.status(502).json({ error: 'No se pudo consultar la información oficial. Intente de nuevo en un momento.' });
  }
};

router.get('/departamentos', responder(async () =>
  (await divipola.departamentos()).map(({ codigo, nombre }) => ({ codigo, nombre }))
));

router.get('/departamentos/:codigo/municipios', responder(async (req) =>
  (await divipola.municipios(req.params.codigo)).map(({ codigo, nombre }) => ({ codigo, nombre }))
));

module.exports = router;
