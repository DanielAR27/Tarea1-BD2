
// Configuración de la conexión a PostgreSQL
const { Pool } = require("pg");

// No hace falta usar dotenv ya que las variables se estan guardando en el docker-compose.
const pool = new Pool({
  host: process.env.DB_HOST,  // Debe ser el nombre del contenedor
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT  // Debe coincidir con PostgreSQL
});

module.exports = pool;
