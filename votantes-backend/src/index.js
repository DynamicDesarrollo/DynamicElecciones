// 📁 src/index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./utils/db.js');

// Importamos las rutas
const partidosRoutes = require('./routes/partidos.routes');
const municipiosRoutes = require('./routes/municipios.routes');
const barriosRoutes = require('./routes/barrios.routes');
const aspirantesRoutes = require('./routes/aspirantes.routes');
const lideresRoutes = require('./routes/lideres.routes');
const votantesRoutes = require('./routes/votantes.routes');
const aspirantesConcejoRoutes = require('./routes/aspirantes_concejo.routes');
// Importamos las rutas de mesas
const mesasRoutes = require('./routes/mesas.router');
// Importamos las rutas de lugares
const lugaresRoutes = require('./routes/lugares.router');
//Rutas Reportes
const reportesRoutes = require('./routes/reportes.routes');
const filtrarVotantesRoutes = require('./routes/reportes.routes');
const resumenVotantesRoutes = require('./routes/reportes.routes');
//Rutas Asistencias
const asistenciaRoutes = require('./routes/asistencia.routes');
const informesRoutes = require('./routes/informes.routes');
//Rutas Auth
console.log('Antes de importar authRoutes');
const authRoutes = require('./routes/auth.routes');
console.log('Después de importar authRoutes');


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

// Rutas de informes
app.use('/api/informes', informesRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => res.send('API de Votantes Activa'));

console.log('Valor de process.env.PORT:', process.env.PORT);
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
db.query('SELECT NOW()')
  .then(res => console.log('🟢 Conexión exitosa a PostgreSQL:', res.rows[0]))
  .catch(err => console.error('🔴 Error de conexión a PostgreSQL:', err));
