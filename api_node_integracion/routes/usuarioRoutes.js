const express = require('express');
const router = express.Router();
// Importa el controlador
const usuarioController = require('../controllers/usuarioController');
// Opcional: Añade middleware para validación si se desea
// const { validateCreateUser, validateUpdateUser } = require('../middleware/validation');

// Obtener todos los usuarios
router.get('/', usuarioController.getAll);

// Crear un nuevo usuario (usando controlador)
router.post('/', /* Opcional: validateCreateUser, */ usuarioController.crear);

// Actualizar un usuario
router.patch('/:id', /* Opcional: validateUpdateUser, */ usuarioController.editar);

// Eliminar un usuario
router.delete('/:id', usuarioController.eliminar);

module.exports = router;
