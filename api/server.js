const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const pool = require("./db"); // Importar conexión a la BD
const restaurantRoutes = require("./src/routes/restaurant.routes");
const menuRoutes = require("./src/routes/menu.routes");
const reservationRoutes = require("./src/routes/reservations.routes");
const orderRoutes = require("./src/routes/orders.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Verificar la conexión a la base de datos con reintentos
const testDBConnection = async () => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        try {
            const result = await pool.query("SELECT NOW()");
            console.log("🟢 Conectado a PostgreSQL en Docker:", result.rows[0]);
            return;
        } catch (err) {
            console.error(`🔴 Intento ${attempts + 1}: Error conectando a PostgreSQL:`, err.message);
            attempts++;
            await new Promise(res => setTimeout(res, 5000)); // Esperar 5 segundos antes de reintentar
        }
    }
    console.error("🔴 No se pudo conectar a PostgreSQL después de varios intentos.");
    process.exit(1); // Terminar la ejecución si no se puede conectar
};

// Intentar conectar a la BD al iniciar la API
testDBConnection();

// Rutas
app.use("/restaurants", restaurantRoutes);
app.use("/menus", menuRoutes);
app.use("/reservations", reservationRoutes);
app.use("/orders", orderRoutes);

// Ruta de prueba para verificar conexión a la BD
app.get("/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ message: "Conexión exitosa", time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error conectando a la BD", details: err.message });
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de Gestión de Restaurantes");
});

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
