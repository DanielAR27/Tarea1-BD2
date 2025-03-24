const pool = require("../../db");

const Restaurant = {
    getAll: async () => {
        console.log("Ejecutando consulta: SELECT * FROM restaurante"); 
        const result = await pool.query("SELECT * FROM restaurante"); 
        return result.rows;
    },

    getById: async (id) => {
        console.log(`Ejecutando consulta: SELECT * FROM restaurante WHERE id_restaurante = ${id}`); 
        const result = await pool.query("SELECT * FROM restaurante WHERE id_restaurante = $1", [id]); 
        return result.rows[0];
    },

    create: async (name, address, owner_id) => {
        console.log(`Insertando: ${name}, ${address}, ${owner_id}`); 
        const result = await pool.query(
            "INSERT INTO restaurante (nombre, direccion, id_admin) VALUES ($1, $2, $3) RETURNING *",
            [name, address, owner_id]
        );
        return result.rows[0];
    },

    update: async (id, nombre, direccion) => {
        console.log(`Actualizando: ${id}, ${nombre}, ${direccion}`); 
        const result = await pool.query(
            "UPDATE restaurante SET nombre = $1, direccion = $2 WHERE id_restaurante = $3 RETURNING *",
            [nombre, direccion, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        console.log(`Eliminando restaurante con ID: ${id}`); 
        await pool.query("DELETE FROM restaurante WHERE id_restaurante = $1", [id]); 
        return { message: "Restaurante eliminado" };
    },
};

module.exports = Restaurant;
