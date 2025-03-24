const pool = require("../../db");

const Reservation = {
    getAll: async () => {
        const result = await pool.query("SELECT * FROM reserva");  
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query("SELECT * FROM reserva WHERE id_reserva = $1", [id]); 
        return result.rows[0];
    },

    create: async (id_usuario, id_restaurante, fecha_hora, estado) => {
        const result = await pool.query(
            "INSERT INTO reserva (id_usuario, id_restaurante, fecha_hora, estado) VALUES ($1, $2, $3, $4) RETURNING *",
            [id_usuario, id_restaurante, fecha_hora, estado]
        );
        return result.rows[0];
    },

    update: async (id, fecha_hora, estado) => {
        const result = await pool.query(
            "UPDATE reserva SET fecha_hora = $1, estado = $2 WHERE id_reserva = $3 RETURNING *",
            [fecha_hora, estado, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        const result = await pool.query("DELETE FROM reserva WHERE id_reserva = $1 RETURNING *", [id]);  
        return result.rowCount > 0;
    },
};

module.exports = Reservation;
