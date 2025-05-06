const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Usa la función login del controlador
router.post('/', authController.login); // Asumiendo que el prefijo es /api/login en index.js

module.exports = router;
