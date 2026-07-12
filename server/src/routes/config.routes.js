const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const configController = require("../controllers/config.controller");

router.get("/payment", protect, adminOnly, configController.getPaymentConfig);
router.put("/payment", protect, adminOnly, configController.updatePaymentConfig);

module.exports = router;
