const pool = require("../../db");

const Product = {
  getAll: async () => {
    const result = await pool.query("SELECT * FROM producto");
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query("SELECT * FROM producto WHERE id_producto = $1", [id]);
    return result.rows[0];
  },

  create: async (id_menu, nombre, precio, descripcion) => {
    const result = await pool.query(
      "INSERT INTO producto (id_menu, nombre, precio, descripcion) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_menu, nombre, precio, descripcion]
    );
    return result.rows[0];
  },

  update: async (id, nombre, precio, descripcion) => {
    const result = await pool.query(
      "UPDATE producto SET nombre = $1, precio = $2, descripcion = $3 WHERE id_producto = $4 RETURNING *",
      [nombre, precio, descripcion, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query("DELETE FROM producto WHERE id_producto = $1 RETURNING *", [id]);
    return result.rows[0];
  },
};

module.exports = Product;
