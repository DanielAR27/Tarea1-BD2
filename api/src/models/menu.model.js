const pool = require("../../db"); // ✅ Corrección de ruta

const Menu = {
    getByRestaurant: async (id_restaurante) => {
        const result = await pool.query("SELECT * FROM Menu WHERE id_restaurante = $1", [id_restaurante]);
        return result.rows;
    },

    create: async (id_restaurante, nombre, precio) => {
        const result = await pool.query(
            "INSERT INTO Menu (id_restaurante, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *",
            [id_restaurante, nombre, precio]
        );
        return result.rows[0];
    },

    update: async (id_menu, nombre, precio) => {
        const result = await pool.query(
            "UPDATE Menu SET nombre = $1, descripcion = $2 WHERE id_menu = $3 RETURNING *",
            [nombre, precio, id_menu]
        );
        return result.rows[0];
    },

    delete: async (id_menu) => {
        const result = await pool.query("DELETE FROM Menu WHERE id_menu = $1 RETURNING *", [id_menu]);
        return result.rows[0]; // Retorna el menú eliminado si existía
    }
};

module.exports = Menu;
