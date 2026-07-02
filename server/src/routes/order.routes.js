const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const orderController = require("../controllers/order.controller");

router.get("/", protect, adminOnly, orderController.getAll);
router.get("/my-orders", protect, orderController.getUserOrders);
router.get("/:id", protect, adminOnly, orderController.getById);

router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    body("subtotal").isNumeric().withMessage("Subtotal is required"),
    body("total").isNumeric().withMessage("Total is required"),
    validate,
  ],
  orderController.create
);

router.put("/:id", protect, adminOnly, orderController.update);
router.delete("/:id", protect, adminOnly, orderController.delete);

module.exports = router;
