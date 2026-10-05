// Ajustes generales del SaaS: los lee cualquier usuario con sesión, los cambia el superadmin
const express = require('express');
const db = require('../utils/db');
const { requireRol } = require('../middlewares/auth');
const router = express.Router();

// Ajustes que existen y cómo se valida cada uno
const AJUSTES = {
  url_consulta_votacion: (valor) => {
    try {
      const url = new URL(valor);
      return url.protocol === 'https:' ? null : 'La dirección debe empezar por https://';
    } catch {
      return 'Escriba una dirección web válida (https://…)';
    }
  },
};

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT clave, valor FROM ajustes WHERE clave = ANY($1)', [Object.keys(AJUSTES)]);
    res.json(Object.fromEntries(rows.map((r) => [r.clave, r.valor])));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los ajustes', details: err.message });
  }
});

router.put('/', requireRol('superadmin'), async (req, res) => {
  try {
    for (const [clave, validar] of Object.entries(AJUSTES)) {
      if (!(clave in req.body)) continue;
      const valor = String(req.body[clave] ?? '').trim();
      const error = validar(valor);
      if (error) return res.status(400).json({ error });
      await db.query(
        'INSERT INTO ajustes (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor',
        [clave, valor]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar los ajustes', details: err.message });
  }
});

module.exports = router;
