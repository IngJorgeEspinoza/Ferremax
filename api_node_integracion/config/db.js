// config/db.js
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

// Usa createPool para el pool de conexiones
const pool = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones en el pool
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
// Opcional: Prueba la conexión al inicio
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al obtener conexión del pool:', err);
    return;
  }
  console.log('✅ Pool de base de datos conectado exitosamente.');
  connection.release(); // Libera la conexión de vuelta al pool
});

module.exports = pool; // Exporta el pool
