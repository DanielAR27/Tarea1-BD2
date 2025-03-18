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

exports.createRestaurant = async (req, res) => {
    try {
        const { name, address } = req.body;
        const owner_id = req.user ? req.user.id : null; // Se obtiene del token JWT si existe
        const newRestaurant = await Restaurant.create(name, address, owner_id);
        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 Agregar la función updateRestaurant
exports.updateRestaurant = async (req, res) => {
    try {
        const { name, address } = req.body;
        const updatedRestaurant = await Restaurant.update(req.params.id, name, address);
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
