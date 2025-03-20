const Order = require("../models/orders.model");

exports.createOrder = async (req, res) => {
    try {
        const { id_restaurante, tipo, productos } = req.body;
        const id_usuario = req.usuario.id_usuario;

        const id_pedido = await Order.createOrder(id_usuario, id_restaurante, tipo, productos);

        res.status(201).json({
            message: "Pedido realizado exitosamente",
            pedido_id: id_pedido
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orderData = await Order.getOrderById(id);

        if (!orderData) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        res.json(orderData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};
