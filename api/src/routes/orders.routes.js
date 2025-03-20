const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orders.controller");

router.post("/", verificarToken, orderController.createOrder);
router.get("/:id", verificarToken, orderController.getOrderById);

module.exports = router;
