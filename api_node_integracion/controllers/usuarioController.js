// Importa el pool de base de datos centralizado
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Función auxiliar para manejar errores de base de datos
const handleDBError = (err, res, message = 'Error en la base de datos') => {
  console.error(message, err);
  // Evita enviar errores detallados de BD al cliente en producción
  return res.status(500).json({ error: 'Error interno del servidor' });
};

// Función para obtener todos los usuarios
exports.getAll = (req, res) => {
  db.query('SELECT id, username, email, created_at FROM usuarios', (err, result) => { // Excluye el hash de la contraseña
    if (err) {
      return handleDBError(err, res, 'Error al obtener usuarios');
    }
    res.json(result);
  });
};

// Función para crear un usuario (con hashing)
exports.crear = async (req, res) => { // Usa async para await
  const { username, password, email } = req.body;

  // Validación básica (considera usar una librería como Joi)
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Faltan datos requeridos (username, password, email)' });
  }
  // Añade más validación (ej. fortaleza de contraseña, formato de email)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' });
  }

  try {
    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // Usa await

    // Inserta el nuevo usuario en la base de datos
    db.query('INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err, result) => {
      if (err) {
        // Maneja errores específicos como entrada duplicada
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El username o email ya existe.' });
        }
        return handleDBError(err, res, 'Error al crear el usuario');
      }
      // Devuelve la información del usuario creado (sin contraseña)
      res.status(201).json({ id: result.insertId, username, email, message: 'Usuario creado con éxito' });
    });
  } catch (hashError) {
    handleDBError(hashError, res, 'Error al hashear la contraseña');
  }
};

// Función para editar un usuario (con hashing de contraseña opcional)
exports.editar = async (req, res) => { // Usa async para await
  const { id } = req.params;
  const { username, password, email } = req.body;

  if (!username && !password && !email) {
    return res.status(400).json({ error: 'No hay datos para actualizar' });
  }

  let query = 'UPDATE usuarios SET';
  const values = [];
  const fieldsToUpdate = [];

  if (username) {
      fieldsToUpdate.push('username = ?');
      values.push(username);
  }
  if (email) {
      // Validar formato de email si se está actualizando
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
      }
      // Añade validación de formato de email si es necesario
      fieldsToUpdate.push('email = ?');
      values.push(email);
  }

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fieldsToUpdate.push('password = ?');
      values.push(hashedPassword);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }

    query += ` ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    values.push(id);

    db.query(query, values, (err, result) => {
      // Manejo de errores de la consulta UPDATE
  if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El username o email ya está en uso por otro usuario.' });
        }
        return handleDBError(err, res, 'Error al editar el usuario');
  }

      // Verifica si se afectaron filas
      if (result.affectedRows === 0) {
        // Verifica si el usuario realmente existe, aunque no se hayan cambiado filas
        db.query('SELECT 1 FROM usuarios WHERE id = ?', [id], (selectErr, selectResults) => {
            if (selectErr) {
                // Error al intentar verificar, devuelve 500
                // Error al intentar verificar, devuelve 500
                return handleDBError(selectErr, res, 'Error al verificar usuario después de editar');
            }
            if (selectResults.length === 0) {
                // La consulta SELECT confirma que el usuario no existe
                return res.status(404).json({ message: 'Usuario no encontrado' });
            } else {
                // El usuario existe, pero no se modificó nada. Devuelve éxito.
                return res.json({ message: 'Usuario actualizado (sin cambios detectados)' });
            }
        });
      } else {
        // affectedRows > 0, la actualización fue exitosa y modificó datos
        res.json({ message: 'Usuario actualizado con éxito' });
      }
    });
  } catch (hashError) {
    handleDBError(hashError, res, 'Error al hashear la contraseña');
  }
};

// Función para eliminar un usuario
exports.eliminar = (req, res) => {
  const { id } = req.params;

  // Elimina al usuario
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) {
      return handleDBError(err, res, 'Error al eliminar el usuario');
    }
    if (result.affectedRows > 0) {
      return res.json({ message: 'Usuario eliminado con éxito' });
    }
    res.status(404).json({ message: 'Usuario no encontrado' });
  });
};
