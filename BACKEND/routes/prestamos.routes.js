const express = require('express');
const router = express.Router();

// Importamos el guardia de seguridad
const { verificarToken } = require('../middlewares/auth');

// Importamos LAS MISMAS funciones que existen en tu controlador
const { 
    crearNuevoPrestamo, // <-- Ahora los nombres coinciden
    eliminarPrestamo 
} = require('../controllers/prestamos.controller');

// 1. RUTA PARA CREAR UN PRÉSTAMO
router.post('/', verificarToken, crearNuevoPrestamo); // <-- Le pasamos la correcta

// 2. RUTA PARA BORRAR UN PRÉSTAMO (La del tachito)
router.delete('/:id', verificarToken, eliminarPrestamo);

module.exports = router;