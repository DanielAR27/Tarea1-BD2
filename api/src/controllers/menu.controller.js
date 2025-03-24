const Menu = require("../models/menu.model");

exports.getMenuById = async (req, res) => {
    try {
        console.log(`Buscando menú con ID: ${req.params.id}`);
        const menu = await Menu.getById(req.params.id);
        if (!menu) return res.status(404).json({ error: "Menú no encontrado" });
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMenusByRestaurant = async (req, res) => {
    try {
        const menus = await Menu.getByRestaurant(req.params.restaurant_id);
        res.json(menus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//  función para crear un menú
exports.createMenu = async (req, res) => {
    try {
        const { restaurant_id, nombre, descripcion } = req.body; 
        console.log(`Creando menú: ${nombre}, ${descripcion}, en restaurante ID: ${restaurant_id}`); 
        const newMenu = await Menu.create(restaurant_id, nombre, descripcion);
        res.status(201).json(newMenu);
    } catch (err) {
        console.error("Error al crear el menú:", err.message);
        res.status(500).json({ error: err.message });
    }
};

//  función para actualizar un menú
exports.updateMenu = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const updatedMenu = await Menu.update(req.params.id, nombre, descripcion);
        if (!updatedMenu) return res.status(404).json({ error: "Menú no encontrado" });
        res.json(updatedMenu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// función para eliminar un menú
exports.deleteMenu = async (req, res) => {
    try {
        const deleted = await Menu.delete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Menú no encontrado" });
        res.json({ message: "Menú eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
