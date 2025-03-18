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
        if (!reservation) return res.status(404).json({ error: "Reserva no encontrada" });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { restaurant_id, user_id, date, time, guests } = req.body;
        if (!restaurant_id || !user_id || !date || !time || !guests) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const newReservation = await Reservation.create(restaurant_id, user_id, date, time, guests);
        res.status(201).json(newReservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, guests } = req.body;

        const updatedReservation = await Reservation.update(id, date, time, guests);
        if (!updatedReservation) return res.status(404).json({ error: "Reserva no encontrada" });

        res.json(updatedReservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReservation = await Reservation.delete(id);
        if (!deletedReservation) return res.status(404).json({ error: "Reserva no encontrada" });

        res.json({ message: "Reserva eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
