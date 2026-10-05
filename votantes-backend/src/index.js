// 📁 src/index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./utils/db.js');
const { verificarToken, requireCampana } = require('./middlewares/auth');
const { getLogo } = require('./controllers/partidos.controller');

// Rutas públicas
const authRoutes = require('./routes/auth.routes');

// Catálogos compartidos entre campañas
const partidosRoutes = require('./routes/partidos.routes');
const municipiosRoutes = require('./routes/municipios.routes');
const barriosRoutes = require('./routes/barrios.routes');
const mesasRoutes = require('./routes/mesas.router');
const lugaresRoutes = require('./routes/lugares.router');
const geografiaRoutes = require('./routes/geografia.routes');

// Administración del SaaS
const campanasRoutes = require('./routes/campanas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

// Datos de cada campaña
const aspirantesRoutes = require('./routes/aspirantes.routes');
const lideresRoutes = require('./routes/lideres.routes');
const votantesRoutes = require('./routes/votantes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const informesRoutes = require('./routes/informes.routes');


const app = express();

app.use(cors({
  origin: [
    'https://dynamic-elecciones.vercel.app', // Frontend en Vercel
    'http://localhost:5173' // Desarrollo local (ajusta el puerto si usas otro)
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API de Votantes Activa'));

// Públicos: el login y los logos de los partidos (una etiqueta <img> no envía el token)
app.use('/api/auth', authRoutes);
app.get('/api/publico/partidos/:id/logo', getLogo);

// Todo lo demás exige sesión
app.use('/api', verificarToken);

app.use('/api/partidos', partidosRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/barrios', barriosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/lugares', lugaresRoutes);
app.use('/api/geografia', geografiaRoutes);
app.use('/api/ajustes', require('./routes/ajustes.routes'));

app.use('/api/campanas', campanasRoutes);
app.use('/api/usuarios', requireCampana, usuariosRoutes);

// Los datos de campaña exigen una campaña activa
app.use('/api/aspirantes', requireCampana, aspirantesRoutes);
app.use('/api/lideres', requireCampana, lideresRoutes);
app.use('/api/votantes', requireCampana, votantesRoutes);
app.use('/api/reportes', requireCampana, reportesRoutes);
app.use('/api/asistencia', requireCampana, asistenciaRoutes);
app.use('/api/puestos-control', requireCampana, require('./routes/puestos.routes'));
app.use('/api/informes', requireCampana, informesRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
db.query('SELECT NOW()')
  .then(res => console.log('🟢 Conexión exitosa a PostgreSQL:', res.rows[0]))
  .catch(err => console.error('🔴 Error de conexión a PostgreSQL:', err));
