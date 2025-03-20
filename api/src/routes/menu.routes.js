const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");

/* router.get("/:restaurant_id", menuController.getMenusByRestaurant);*/
router.post("/", menuController.createMenu);
router.put("/:id", menuController.updateMenu);
router.get("/:id", menuController.getMenuById);
router.delete("/:id", menuController.deleteMenu);

module.exports = router;
