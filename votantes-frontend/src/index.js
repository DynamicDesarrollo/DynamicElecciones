// 📁 src/index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import db from './utils/db.js';

// Importamos las rutas
import partidosRoutes from './routes/partidos.routes.js';
import municipiosRoutes from './routes/municipios.routes.js';
import barriosRoutes from './routes/barrios.routes.js';
import aspirantesRoutes from './routes/aspirantes.routes.js';
import lideresRoutes from './routes/lideres.routes.js';
import votantesRoutes from './routes/votantes.routes.js';
import aspirantesConcejoRoutes from './routes/aspirantes_concejo.routes.js';
// Importamos las rutas de mesas
import mesasRoutes from './routes/mesas.router.js';
// Importamos las rutas de lugares
import lugaresRoutes from './routes/lugares.router.js';
//Rutas Reportes
import reportesRoutes from './routes/reportes.routes.js';
import filtrarVotantesRoutes from './routes/reportes.routes.js';
import resumenVotantesRoutes from './routes/reportes.routes.js';
//Rutas Asistencias
import asistenciaRoutes from './routes/asistencia.routes.js';
import informesRoutes from "./routes/informes.routes.js";
//Ruras AUth
import authRoutes from './routes/auth.routes.js'; 


const app = express();

app.use(cors());
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
// Rutas de mesas
app.use('/api/mesas', mesasRoutes);
// Rutas de lugares
app.use('/api/lugares', lugaresRoutes);
// Ruta Reportes
app.use('/api/reportes', reportesRoutes);
app.use('/api/filtrarvotantes', filtrarVotantesRoutes);
app.use('/api/resumenvotantess', resumenVotantesRoutes);
// Rutas de asistencias
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/votantes', asistenciaRoutes);

// Rutas de informes
app.use('/api/informes', informesRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => res.send('API de Votantes Activa'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
db.query('SELECT NOW()')
  .then(res => console.log('🟢 Conexión exitosa a PostgreSQL:', res.rows[0]))
  .catch(err => console.error('🔴 Error de conexión a PostgreSQL:', err));
