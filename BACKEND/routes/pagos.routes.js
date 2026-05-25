const express = require('express');
const router = express.Router();
const { obtenerCuotasPendientes, registrarPago, obtenerHistorialCaja } = require('../controllers/pagos.controller');

router.get('/pendientes/:cliente_id', obtenerCuotasPendientes);
router.post('/', registrarPago);
router.get('/historial', obtenerHistorialCaja); // 👈 Esta es la ruta clave

module.exports = router;