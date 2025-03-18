const express = require("express");
const pool = require("../../db");
const verificarToken = require("../middlewares/authMiddleware"); // Middleware de autenticación


const router = express.Router();

// Realizar un pedido
router.post("/", verificarToken, async (req, res) => {
    try {
        const { id_restaurante, tipo, productos } = req.body;
        const id_usuario = req.usuario.id_usuario;

        // Crear el pedido en la base de datos
        const pedido = await pool.query(
            "INSERT INTO Pedido (id_usuario, id_restaurante, fecha_hora, estado, tipo) VALUES ($1, $2, NOW(), 'pendiente', $3) RETURNING id_pedido",
            [id_usuario, id_restaurante, tipo]
        );

        const id_pedido = pedido.rows[0].id_pedido;

        // Insertar los productos en la tabla Detalle_Pedido
        for (const producto of productos) {
            await pool.query(
                "INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, subtotal) VALUES ($1, $2, $3, $4)",
                [id_pedido, producto.id_producto, producto.cantidad, producto.subtotal]
            );
        }

        res.status(201).json({
            message: "Pedido realizado exitosamente",
            pedido_id: id_pedido
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Obtener detalles de un pedido
router.get("/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener los datos del pedido
        const pedido = await pool.query(
            "SELECT * FROM Pedido WHERE id_pedido = $1",
            [id]
        );

        if (pedido.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        // Obtener los productos asociados al pedido
        const productos = await pool.query(
            "SELECT p.nombre, dp.cantidad, dp.subtotal FROM Detalle_Pedido dp JOIN Producto p ON dp.id_producto = p.id_producto WHERE dp.id_pedido = $1",
            [id]
        );

        res.json({
            pedido: pedido.rows[0],
            productos: productos.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;
