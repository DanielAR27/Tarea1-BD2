const Menu = require("../models/menu.model");

exports.getMenusByRestaurant = async (req, res) => {
    try {
        const menus = await Menu.getByRestaurant(req.params.restaurant_id);
        res.json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const { restaurant_id, name, price } = req.body;
        const newMenu = await Menu.create(restaurant_id, name, price);
        res.status(201).json(newMenu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🚀 **Nueva función para actualizar un menú**
exports.updateMenu = async (req, res) => {
    try {
        const { name, price } = req.body;
        const updatedMenu = await Menu.update(req.params.id, name, price);
        if (!updatedMenu) return res.status(404).json({ error: "Menú no encontrado" });
        res.json(updatedMenu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🚀 **Nueva función para eliminar un menú**
exports.deleteMenu = async (req, res) => {
    try {
        const deleted = await Menu.delete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Menú no encontrado" });
        res.json({ message: "Menú eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
