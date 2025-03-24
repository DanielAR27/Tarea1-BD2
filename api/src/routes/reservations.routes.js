const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const reservationController = require("../controllers/reservation.controller");

router.get("/", reservationController.getAllReservations);
router.get("/:id", reservationController.getReservationById);
router.post("/", verificarToken, reservationController.createReservation);
router.put("/:id", reservationController.updateReservation);
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
