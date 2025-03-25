const Restaurant = require("../models/restaurant.model");

exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.getAll();
        res.status(201).json(restaurants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.getById(req.params.id);
        if (!restaurant) return res.status(404).json({ error: "Restaurante no encontrado" });
        res.status(201).json(restaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// función para crear un restaurante
exports.createRestaurant = async (req, res) => {
    try {
        const { nombre, direccion, id_admin } = req.body;

        // Si el usuario está autenticado, se usa el id del usuario
        const admin_id = req.user ? req.user.id_usuario : id_admin;

        //  Verificar que el id del admin es válido
        if (!admin_id) {
            return res.status(400).json({ error: "Se requiere un id_admin válido." });
        }

        //  Crea el restaurante en la BD
        const newRestaurant = await Restaurant.create(nombre, direccion, admin_id);

        // Si el proceso es exitoso, envia en un JSON la información del restaurante creado
        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// función para actualizar un restaurante
exports.updateRestaurant = async (req, res) => {
    try {
        console.log("Datos recibidos en `req.body`:", req.body);

        const { nombre, direccion } = req.body;

        if (!nombre || !direccion) {
            return res.status(400).json({ error: "El campo 'nombre' y 'direccion' son obligatorios." });
        }

        const updatedRestaurant = await Restaurant.update(req.params.id, nombre, direccion);
        
        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Restaurante no encontrado" });
        }
        
        res.status(201).json(updatedRestaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// función para eliminar un restaurante
exports.deleteRestaurant = async (req, res) => {
    try {
        const deleted = await Restaurant.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: "Restaurante no encontrado" });
        }

        res.status(201).json({ message: "Restaurante eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

