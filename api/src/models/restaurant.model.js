const pool = require("../../db"); // ✅ Subir dos niveles


const Restaurant = {
    getAll: async () => {
        const result = await pool.query("SELECT * FROM restaurants");
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query("SELECT * FROM restaurants WHERE id = $1", [id]);
        return result.rows[0];
    },

    create: async (name, address, owner_id) => {
        const result = await pool.query(
            "INSERT INTO restaurants (name, address, owner_id) VALUES ($1, $2, $3) RETURNING *",
            [name, address, owner_id]
        );
        return result.rows[0];
    },

    update: async (id, name, address) => {
        const result = await pool.query(
            "UPDATE restaurants SET name = $1, address = $2 WHERE id = $3 RETURNING *",
            [name, address, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        await pool.query("DELETE FROM restaurants WHERE id = $1", [id]);
        return { message: "Restaurante eliminado" };
    },
};

module.exports = Restaurant;
