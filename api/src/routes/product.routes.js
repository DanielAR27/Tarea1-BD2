const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const verificarToken = require("../middlewares/authMiddleware");

// Se usa el middleware para proteger los productos
router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);
router.post("/", verificarToken, controller.createProduct);
router.put("/:id", verificarToken, controller.updateProduct);
router.delete("/:id", verificarToken, controller.deleteProduct);

module.exports = router;
