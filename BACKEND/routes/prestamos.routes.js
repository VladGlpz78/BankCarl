const express = require('express');
const router = express.Router();

// 👇 1. ASEGURATE DE IMPORTAR 'eliminarPrestamo' AQUÍ
const { crearPrestamo, obtenerPrestamos, eliminarPrestamo } = require('../controllers/prestamos.controller');
const { verificarToken } = require('../middlewares/auth');

// ... (tus otras rutas que ya tenías, como el POST o el GET)

// 👇 2. ASEGURATE DE QUE ESTA LÍNEA ESTÉ ANTES DEL module.exports
router.delete('/:id', verificarToken, eliminarPrestamo);

module.exports = router;