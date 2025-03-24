const Product = require("../models/product.model");

exports.getAllProducts = async (req, res) => {
  try {
    const productos = await Product.getAll();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const producto = await Product.getById(req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { id_menu, nombre, precio, descripcion } = req.body;
    const producto = await Product.create(id_menu, nombre, precio, descripcion);
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { nombre, precio, descripcion } = req.body;
    const producto = await Product.update(req.params.id, nombre, precio, descripcion);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
