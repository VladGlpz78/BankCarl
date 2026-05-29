const express = require('express');
const router = express.Router();
// Volamos multer porque de la foto se encarga React
const { subirDocumento, obtenerDocumentosPorCliente, eliminarDocumento } = require('../controllers/documentos.controller');

// 1. Ruta para guardar (Recibe el JSON limpio desde React)
router.post('/', subirDocumento);

// 2. Ruta para traer los documentos de un cliente
router.get('/:cliente_id', obtenerDocumentosPorCliente);

// 3. NUEVA RUTA para borrar el documento cuando toques el tachito
router.delete('/:id', eliminarDocumento);

module.exports = router;