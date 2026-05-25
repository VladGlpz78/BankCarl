const express = require('express');
const router = express.Router();
const { obtenerEstadisticas } = require('../controllers/dashboard.controller');

// Ruta para traer los números del panel
router.get('/', obtenerEstadisticas);

module.exports = router;