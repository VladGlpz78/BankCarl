const express = require('express');
const router = express.Router();
const { crearCliente, obtenerClientes, actualizarCliente, eliminarCliente } = require('../controllers/clientes.controller');

router.get('/', obtenerClientes);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);     // 👈 Nueva ruta para editar
router.delete('/:id', eliminarCliente);  // 👈 Nueva ruta para borrar

module.exports = router;