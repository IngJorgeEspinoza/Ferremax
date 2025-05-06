const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

app.use(express.json());

// Prefijo para las rutas
app.use('/api/login', authRoutes);      // Prefijo para las rutas de autenticación
app.use('/api/usuarios', usuarioRoutes); // Prefijo para las rutas de usuario

// Middleware para rutas no encontradas (404)
// Debe ir DESPUÉS de todas las rutas válidas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para manejo de errores generales
// Debe ir AL FINAL, después del handler 404
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicia el servidor en el puerto especificado en el archivo .env
// app.listen debe ser la última llamada
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});