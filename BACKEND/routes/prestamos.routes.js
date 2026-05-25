const express = require('express');
const router = express.Router();
const { crearPrestamo } = require('../controllers/prestamos.controller');

router.post('/', crearPrestamo);

module.exports = router;