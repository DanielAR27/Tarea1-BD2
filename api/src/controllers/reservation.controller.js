const Reservation = require("../models/reservation.model");

exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.getAll();
        res.status(201).json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.getById(req.params.id);
        if (!reservation) return res.status(404).json({ error: "Reservación no encontrada" });
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { id_usuario, id_restaurante, fecha_hora, estado } = req.body;
        
        // Si el usuario está autenticado, se usa el id del usuario
        const usuario_id = req.user ? req.user.id_usuario : id_usuario;
        
        //  Verificar que el id del usuario es válido
        if (!usuario_id) {
            return res.status(400).json({ error: "Se requiere un id_usuario válido." });
        }

        const newReservation = await Reservation.create(usuario_id, id_restaurante, fecha_hora, estado);
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
        res.status(201).json(updatedReservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const deleted = await Reservation.delete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Reservación no encontrada" });
        res.status(201).json({ message: "Reservación eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
