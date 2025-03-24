const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/authMiddleware");
const restaurantController = require("../controllers/restaurant.controller");

router.get("/", restaurantController.getAllRestaurants);
router.get("/:id", restaurantController.getRestaurantById);
router.post("/", verificarToken, restaurantController.createRestaurant);
router.put("/:id", restaurantController.updateRestaurant);
router.delete("/:id", restaurantController.deleteRestaurant);

module.exports = router;
