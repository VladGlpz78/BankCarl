const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos el cliente de Supabase
const supabase = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); 
app.use(express.json()); 

// Importamos las rutas
const rutasClientes = require('./routes/clientes.routes');
const rutasPrestamos = require('./routes/prestamos.routes');
const rutasPagos = require('./routes/pagos.routes');
const rutasDocumentos = require('./routes/documentos.routes');
const rutasDashboard = require('./routes/dashboard.routes');
const { iniciarCronJobs } = require('./services/cron.service');

// --- NUEVO: Importamos el guardia de seguridad y la ruta de login ---
const verificarToken = require('./middlewares/verificarToken');
const rutasAuth = require('./routes/auth.routes');


// --- RUTAS PÚBLICAS (No piden token) ---
app.use('/api/auth', rutasAuth);

app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok',
        mensaje: '¡Servidor de préstamos levantado y listo para programar!' 
    });
});


// --- RUTAS PRIVADAS (Piden pase VIP) ---
// Le decimos a Express que use el middleware "verificarToken" antes de dejar pasar
app.use('/api/clientes', verificarToken, rutasClientes);
app.use('/api/prestamos', verificarToken, rutasPrestamos);
app.use('/api/pagos', verificarToken, rutasPagos);
app.use('/api/documentos', verificarToken, rutasDocumentos);
app.use('/api/dashboard', verificarToken, rutasDashboard);


// Arrancamos las tareas automáticas
iniciarCronJobs();

// Ponemos el servidor a escuchar
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo con éxito en http://localhost:${PORT}`);
});