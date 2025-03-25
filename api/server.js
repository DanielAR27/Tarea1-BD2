// Para los tests
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const pool = require("./db"); // Importar conexión a la BD
const restaurantRoutes = require("./src/routes/restaurant.routes");

// Debugear si las rutas se han cargado
console.log("Rutas de restaurantes cargadas correctamente");

const menuRoutes = require("./src/routes/menu.routes");
const reservationRoutes = require("./src/routes/reservations.routes");
const orderRoutes = require("./src/routes/orders.routes");
const productoRouters = require("./src/routes/product.routes");

const app = express();
const PORT = process.env.API_PORT || 5000;

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
            console.log("Conectado a PostgreSQL en Docker:", result.rows[0]);
            return;
        } catch (err) {
            console.error(`Intento ${attempts + 1}: Error conectando a PostgreSQL:`, err.message);
            attempts++;
            await new Promise(res => setTimeout(res, 5000)); // Esperar 5 segundos antes de reintentar
        }
    }
    console.error("No se pudo conectar a PostgreSQL después de varios intentos.");
    process.exit(1); // Terminar la ejecución si no se puede conectar
};

// Intentar conectar a la BD al iniciar la API
if (process.env.NODE_ENV !== "test") {
    testDBConnection();
}
  
// Ruta de documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/restaurants", restaurantRoutes);
app.use("/menus", menuRoutes);
app.use("/reservations", reservationRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productoRouters);

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de Gestión de Restaurantes");
});

module.exports = app; // Exportar para las pruebas de coverage

// Iniciar el servidor solo si no es requerido por test
/* istanbul ignore next */
if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en http://0.0.0.0:${PORT} `);
    });
  }
  