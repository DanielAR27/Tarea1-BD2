const pool = require("../../db");

const Order = {
  createOrder: async (id_usuario, id_restaurante, tipo, productos) => {
    const client = await pool.connect();

    try {
      // Se intentará hacerlo como transaction en caso de que algo falle
      await client.query("BEGIN TRANSACTION");

      // Insertar en Pedido
      const pedidoResult = await client.query(
        `INSERT INTO Pedido (id_usuario, id_restaurante, tipo, estado) 
         VALUES ($1, $2, $3, 'pendiente') RETURNING id_pedido`,
        [id_usuario, id_restaurante, tipo]
      );

      // Se crea un pedido y se obtiene su id
      const id_pedido = pedidoResult.rows[0].id_pedido;

      // Insertar productos en Detalle_Pedido
      for (const prod of productos) {
        const productoResult = await client.query(
          "SELECT precio FROM Producto WHERE id_producto = $1",
          [prod.id_producto]
        );

        if (productoResult.rows.length === 0) {
          throw new Error(`Producto con ID ${prod.id_producto} no existe.`);
        }

        const precio = parseFloat(productoResult.rows[0].precio);
        const subtotal = precio * prod.cantidad;

        await client.query(
          `INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, subtotal) 
           VALUES ($1, $2, $3, $4)`,
          [id_pedido, prod.id_producto, prod.cantidad, subtotal]
        );
      }

      await client.query("COMMIT");
      return id_pedido;

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  getOrderById: async (id_pedido) => {
    const pedido = await pool.query(
      "SELECT * FROM Pedido WHERE id_pedido = $1",
      [id_pedido]
    );
  
    if (pedido.rows.length === 0) return null;
  
    const productos = await pool.query(
      `SELECT p.nombre, dp.cantidad, dp.subtotal 
       FROM Detalle_Pedido dp 
       JOIN Producto p ON dp.id_producto = p.id_producto 
       WHERE dp.id_pedido = $1`,
      [id_pedido]
    );
  
    return {
      pedido: pedido.rows[0],
      productos: productos.rows
    };
  }

};

module.exports = Order;
