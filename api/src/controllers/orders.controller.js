const Order = require("../models/orders.model");

exports.createOrder = async (req, res) => {
    try {
      const { id_restaurante, tipo, productos, id_usuario } = req.body;
  
      // Si el usuario está autenticado, se usa el id del usuario
      const usuario_id = req.user ? req.user.id_usuario : id_usuario;

      if (!usuario_id) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }
  
      if (!id_restaurante || !tipo || !productos || productos.length === 0) {
        return res.status(400).json({ error: "Datos incompletos para realizar el pedido." });
      }
  
      const tiposValidos = ["en restaurante", "para recoger"];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: "Tipo de pedido inválido." });
      }
  
      const id_pedido = await Order.createOrder(usuario_id, id_restaurante, tipo, productos);
  
      res.status(201).json({
        message: "Pedido realizado exitosamente",
        pedido_id: id_pedido
      });
  
    } catch (error) {
      console.error("Error al crear pedido:", error.message);
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
