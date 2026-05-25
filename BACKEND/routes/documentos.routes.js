const express = require('express');
const router = express.Router();
const multer = require('multer');
const { subirDocumento, obtenerDocumentosPorCliente } = require('../controllers/documentos.controller');

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para subir
router.post('/', upload.single('foto'), subirDocumento);

// 👈 Nueva ruta para traer los documentos de un cliente específico
router.get('/:cliente_id', obtenerDocumentosPorCliente);

module.exports = router;