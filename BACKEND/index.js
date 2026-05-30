const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos el cliente de Supabase
const supabase = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Middlewares globales - CORS ESTRICTO Y BLINDADO
const corsOptions = {
  origin: [
    'https://bank-carl.vercel.app', // Tu Vercel oficial (¡Sin barra al final!)
    'http://localhost:5173',        // Tu compu local
    'http://localhost:3000'         // Por si acaso
  ], 
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); 
app.use(express.json());

// Importamos las rutas
const rutasClientes = require('./routes/clientes.routes');
const rutasPrestamos = require('./routes/prestamos.routes');
const rutasPagos = require('./routes/pagos.routes');
const rutasDocumentos = require('./routes/documentos.routes');
const rutasDashboard = require('./routes/dashboard.routes');
const { iniciarCronJobs } = require('./services/cron.service');

// Importamos el guardia de seguridad y la ruta de login
const verificarToken = require('./middlewares/verificarToken');
const rutasAuth = require('./routes/auth.routes');


// --- RUTAS PÚBLICAS (No piden token) ---
app.use('/api/auth', rutasAuth);

app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok',
        mensaje: '¡Servidor de BankCarl levantado, blindado y listo en la nube!' 
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
    console.log(`🚀 Servidor corriendo con éxito en el puerto ${PORT}`);
});