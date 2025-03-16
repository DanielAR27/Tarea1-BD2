// Importar módulos
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,  // "postgres" en docker-compose
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Verificar conexión a PostgreSQL
pool.connect()
    .then(() => console.log('Conectado a PostgreSQL en Docker'))
    .catch(err => console.error('Error conectando a PostgreSQL:', err));

// Ruta de prueba para verificar conexión a la BD
app.get('/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Conexión exitosa', time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error conectando a la BD', details: err.message });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});