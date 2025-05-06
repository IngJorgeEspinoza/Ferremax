// const UsuarioModel = require('../models/usuarioModel'); // Usa acceso directo a BD por ahora, o crea el modelo
const db = require('../config/db');
const bcrypt = require('bcryptjs');
// Opcional: Importa JWT para generación de tokens
// const jwt = require('jsonwebtoken');

// Función auxiliar para manejar errores de base de datos (puede ser compartida)
const handleDBError = (err, res, message = 'Error en la base de datos') => {
  console.error(message, err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

exports.login = async (req, res) => { // Usa async para await
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Falta username o password' });
  }

  // Busca usuario por username
  db.query('SELECT id, username, password FROM usuarios WHERE username = ?', [username], async (err, results) => {
    if (err) {
      return handleDBError(err, res, 'Error al buscar usuario');
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = results[0];

    // Compara la contraseña proporcionada con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Login exitoso
    // Opcional: Genera un token JWT aquí
    // const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // return res.status(200).json({ message: 'Inicio de sesión exitoso', token });

    // Mensaje simple de éxito sin token
    return res.status(200).json({ message: 'Inicio de sesión exitoso', userId: user.id });
  });
};
