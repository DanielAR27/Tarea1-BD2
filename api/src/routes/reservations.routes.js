const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");
const authMiddleware = require("../middlewares/authMiddleware"); // ✅ Esto es correcto


// Rutas para gestionar reservas
router.get("/", reservationController.getAllReservations);
router.get("/:id", reservationController.getReservationById);
router.post("/", authMiddleware, reservationController.createReservation);
router.put("/:id", authMiddleware, reservationController.updateReservation);
router.delete("/:id", authMiddleware, reservationController.deleteReservation);

module.exports = router;
