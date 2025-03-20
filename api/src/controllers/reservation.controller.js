const Reservation = require("../models/reservation.model");

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.getAll();
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.getById(req.params.id);
        if (!reservation) return res.status(404).json({ error: "Reservación no encontrada" });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { id_usuario, id_restaurante, fecha_hora, estado } = req.body;
        const newReservation = await Reservation.create(id_usuario, id_restaurante, fecha_hora, estado);
        res.status(201).json(newReservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { fecha_hora, estado } = req.body;
        const updatedReservation = await Reservation.update(req.params.id, fecha_hora, estado);
        if (!updatedReservation) {
            return res.status(404).json({ error: "Reservación no encontrada" });
        }
        res.json(updatedReservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const deleted = await Reservation.delete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Reservación no encontrada" });
        res.json({ message: "Reservación eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
