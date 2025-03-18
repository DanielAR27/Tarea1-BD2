const pool = require("../../db"); // Asegúrate de que la ruta a db.js sea correcta

const Reservation = {
    getAll: async () => {
        const result = await pool.query("SELECT * FROM reservations");
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query("SELECT * FROM reservations WHERE id = $1", [id]);
        return result.rows[0];
    },

    create: async (restaurant_id, user_id, date, time, guests) => {
        const result = await pool.query(
            "INSERT INTO reservations (restaurant_id, user_id, date, time, guests) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [restaurant_id, user_id, date, time, guests]
        );
        return result.rows[0];
    },

    update: async (id, date, time, guests) => {
        const result = await pool.query(
            "UPDATE reservations SET date = $1, time = $2, guests = $3 WHERE id = $4 RETURNING *",
            [date, time, guests, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query("DELETE FROM reservations WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    },
};

module.exports = Reservation;
