
// Configuración de la conexión a PostgreSQL
const { Pool } = require("pg");
require("dotenv").config();



const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres_container",  // ⬅️ Debe ser el nombre del contenedor
  user: process.env.POSTGRES_USER || "admin",
  password: process.env.POSTGRES_PASSWORD || "admin",
  database: process.env.POSTGRES_DB || "apidb",
  port: 5432  // ⬅️ Debe coincidir con PostgreSQL
});

module.exports = pool;
