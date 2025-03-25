const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const reservationController = require("../controllers/reservation.controller");

/**
 * @swagger
 * tags:
 *   name: Reservaciones
 *   description: Endpoints para gestionar reservaciones
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Obtener todas las reservaciones
 *     tags: [Reservaciones]
 *     responses:
 *       201:
 *         description: Lista de reservaciones
 *       500:
 *         description: Otro tipo de error
 */
router.get("/", reservationController.getAllReservations);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Obtener reservación por ID
 *     tags: [Reservaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reservación
 *     responses:
 *       201:
 *         description: Detalles de la reservación
 *       404:
 *         description: Reservación no encontrada
 *       500:
 *         description: Otro tipo de error
 */
router.get("/:id", reservationController.getReservationById);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crear una nueva reservación
 *     tags: [Reservaciones]
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
 *               - fecha_hora
 *               - estado
 *             properties:
 *               id_restaurante:
 *                 type: integer
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *                 example: pendiente
 *     responses:
 *       201:
 *         description: Reservación creada exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Otro tipo de error
 */
router.post("/", verificarToken, reservationController.createReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Actualizar una reservación
 *     tags: [Reservaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reservación a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *                 example: confirmada
 *     responses:
 *       201:
 *         description: Reservación actualizada
 *       404:
 *         description: Reservación no encontrada
 *       500:
 *         description: Otro tipo de error
 */
router.put("/:id", reservationController.updateReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Eliminar una reservación
 *     tags: [Reservaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reservación
 *     responses:
 *       201:
 *         description: Reservación eliminada correctamente
 *       404:
 *         description: Reservación no encontrada
 *       500:
 *         description: Otro tipo de error
 */
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
