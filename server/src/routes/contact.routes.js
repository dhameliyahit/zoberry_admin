const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const contactController = require("../controllers/contact.controller");

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").notEmpty().withMessage("Message is required"),
    validate,
  ],
  contactController.create
);

router.get("/", protect, adminOnly, contactController.getAll);
router.get("/:id", protect, adminOnly, contactController.getById);
router.put("/:id/read", protect, adminOnly, contactController.markRead);
router.delete("/:id", protect, adminOnly, contactController.delete);

module.exports = router;
