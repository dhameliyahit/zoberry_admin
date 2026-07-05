const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

router.get("/", protect, adminOnly, userController.getAll);
router.get("/:id", protect, adminOnly, userController.getById);
router.put("/:id", protect, adminOnly, userController.update);
router.delete("/:id", protect, adminOnly, userController.delete);

router.post("/addresses", protect, userController.addAddress);
router.delete("/addresses/:addressId", protect, userController.deleteAddress);

module.exports = router;
