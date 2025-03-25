const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");

/**
 * @swagger
 * tags:
 *   name: Menús
 *   description: Gestión de menús de restaurantes
 */

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Crear un nuevo menú
 *     tags: [Menús]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - nombre
 *               - descripcion
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menú creado exitosamente
 */
router.post("/", menuController.createMenu);

/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Actualizar un menú existente
 *     tags: [Menús]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del menú
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menú actualizado exitosamente
 *       404:
 *         description: Menú no encontrado
 */
router.put("/:id", menuController.updateMenu);

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Obtener un menú por su ID
 *     tags: [Menús]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del menú
 *     responses:
 *       201:
 *         description: Detalles del menú
 *       404:
 *         description: Menú no encontrado
 */
router.get("/:id", menuController.getMenuById);

/**
 * @swagger
 * /menus/{id}:
 *   delete:
 *     summary: Eliminar un menú por su ID
 *     tags: [Menús]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del menú
 *     responses:
 *       201:
 *         description: Menú eliminado exitosamente
 *       404:
 *         description: Menú no encontrado
 */
router.delete("/:id", menuController.deleteMenu);

module.exports = router;
