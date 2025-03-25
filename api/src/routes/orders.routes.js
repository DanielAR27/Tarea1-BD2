const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orders.controller");

/**
 * @swagger
 * tags:
 *   name: Órdenes
 *   description: Gestión de órdenes de pedido
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_restaurante
 *               - tipo
 *               - productos
 *             properties:
 *               id_restaurante:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [en restaurante, para recoger]
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               id_usuario:
 *                 type: integer
 *                 description: Solo si el usuario no está autenticado
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       400:
 *         description: Datos incompletos o inválidos
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *          description: Otro tipo de error
 */
router.post("/", verificarToken, orderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener detalles de un pedido por su ID
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       201:
 *         description: Detalles del pedido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *          description: Otro tipo de error
 */
router.get("/:id", verificarToken, orderController.getOrderById);

module.exports = router;
