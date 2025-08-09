// 📁 src/index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import db from './utils/db.js';

import partidosRoutes from './routes/partidos.routes.js';
import municipiosRoutes from './routes/municipios.routes.js';
import barriosRoutes from './routes/barrios.routes.js';
import aspirantesRoutes from './routes/aspirantes.routes.js';
import lideresRoutes from './routes/lideres.routes.js';
import votantesRoutes from './routes/votantes.routes.js';
import aspirantesConcejoRoutes from './routes/aspirantes_concejo.routes.js';
import mesasRoutes from './routes/mesas.router.js';
import lugaresRoutes from './routes/lugares.router.js';
import reportesRoutes from './routes/reportes.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';
import informesRoutes from "./routes/informes.routes.js";
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: ["https://tu-frontend.vercel.app"], // 👈 cambia por tu dominio en Vercel
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas de la API
app.use('/api/partidos', partidosRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/barrios', barriosRoutes);
app.use('/api/alcaldia', aspirantesRoutes);
app.use('/api/lideres', lideresRoutes);
app.use('/api/votantes', votantesRoutes);
app.use('/api/concejo', aspirantesConcejoRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/lugares', lugaresRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/informes', informesRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API de Votantes Activa'));

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // 👈 importante para Railway

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

// Probar conexión a PostgreSQL
db.query('SELECT NOW()')
  .then(res => console.log('🟢 Conexión exitosa a PostgreSQL:', res.rows[0]))
  .catch(err => console.error('🔴 Error de conexión a PostgreSQL:', err));
