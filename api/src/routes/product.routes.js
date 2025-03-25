const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const verificarToken = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos del menú
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       201:
 *         description: Lista de productos obtenida exitosamente
 *       500:
 *          description: Otro tipo de error
 */
router.get("/", controller.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       201:
 *         description: Producto encontrado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *          description: Otro tipo de error
 */
router.get("/:id", controller.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_menu
 *               - nombre
 *               - precio
 *               - descripcion
 *             properties:
 *               id_menu:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       500:
 *          description: Otro tipo de error
 */
router.post("/", verificarToken, controller.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *          description: Otro tipo de error
 */
router.put("/:id", verificarToken, controller.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto a eliminar
 *     responses:
 *       201:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *          description: Otro tipo de error
 */
router.delete("/:id", verificarToken, controller.deleteProduct);

module.exports = router;
