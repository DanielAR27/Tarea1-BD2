const Restaurant = require("../models/restaurant.model");

exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.getAll();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.getById(req.params.id);
        if (!restaurant) return res.status(404).json({ error: "Restaurante no encontrado" });
        res.json(restaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Agrega la función createRestaurant
exports.createRestaurant = async (req, res) => {
    try {
        const { nombre, direccion, id_admin } = req.body;

        // 🔹 Si el usuario está autenticado, usar su id_usuario como id_admin
        const admin_id = req.user ? req.user.id_usuario : id_admin;

        // 🔹 Verificar que el id_admin es válido
        if (!admin_id) {
            return res.status(400).json({ error: "Se requiere un id_admin válido." });
        }

        // 🔹 Crear el restaurante en la BD
        const newRestaurant = await Restaurant.create(nombre, direccion, admin_id);

        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// 🔹 Agregar la función updateRestaurant
exports.updateRestaurant = async (req, res) => {
    try {
        console.log("🔍 Datos recibidos en `req.body`:", req.body);

        const { nombre, direccion } = req.body;

        if (!nombre || !direccion) {
            return res.status(400).json({ error: "El campo 'nombre' y 'direccion' son obligatorios." });
        }

        const updatedRestaurant = await Restaurant.update(req.params.id, nombre, direccion);
        
        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Restaurante no encontrado" });
        }
        
        res.json(updatedRestaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 🔹 Agregar la función deleteRestaurant
exports.deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.delete(req.params.id);
        res.json({ message: "Restaurante eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
