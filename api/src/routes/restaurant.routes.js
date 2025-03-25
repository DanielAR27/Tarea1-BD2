const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const restaurantController = require("../controllers/restaurant.controller");

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Gestión de restaurantes
 */

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Obtener todos los restaurantes
 *     tags: [Restaurantes]
 *     responses:
 *       201:
 *         description: Lista de restaurantes
 *       500:
 *         description: Otro tipo de error
 */
router.get("/", restaurantController.getAllRestaurants);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Obtener restaurante por ID
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *     responses:
 *       201:
 *         description: Detalles del restaurante
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Otro tipo de error
 */
router.get("/:id", restaurantController.getRestaurantById);

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Crear un nuevo restaurante
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *       400:
 *         description: No autorizado
 *       500:
 *         description: Otro tipo de error
 */
router.post("/", verificarToken, restaurantController.createRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Actualizar un restaurante
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *       400:
 *         description: Campos nombre o dirección no encontrados
 *       404:
 *          description: Restaurante no encontrado
 *       500:
 *          description: Otro tipo de error
 */
router.put("/:id", restaurantController.updateRestaurant);

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Eliminar un restaurante
 *     tags: [Restaurantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante eliminado
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Otro tipo de error
 */
router.delete("/:id", restaurantController.deleteRestaurant);

module.exports = router;
