const pool = require("../../db");

const Order = {
    createOrder: async (id_usuario, id_restaurante, tipo, productos) => {
        const pedido = await pool.query(
            "INSERT INTO Pedido (id_usuario, id_restaurante, fecha_hora, estado, tipo) VALUES ($1, $2, NOW(), 'pendiente', $3) RETURNING id_pedido",
            [id_usuario, id_restaurante, tipo]
        );

        const id_pedido = pedido.rows[0].id_pedido;

        for (const producto of productos) {
            await pool.query(
                "INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, subtotal) VALUES ($1, $2, $3, $4)",
                [id_pedido, producto.id_producto, producto.cantidad, producto.subtotal]
            );
        }

        return id_pedido;
    },

    getOrderById: async (id_pedido) => {
        const pedido = await pool.query(
            "SELECT * FROM Pedido WHERE id_pedido = $1",
            [id_pedido]
        );

        if (pedido.rows.length === 0) return null;

        const productos = await pool.query(
            "SELECT p.nombre, dp.cantidad, dp.subtotal FROM Detalle_Pedido dp JOIN Producto p ON dp.id_producto = p.id_producto WHERE dp.id_pedido = $1",
            [id_pedido]
        );

        return {
            pedido: pedido.rows[0],
            productos: productos.rows
        };
    }
};

module.exports = Order;
