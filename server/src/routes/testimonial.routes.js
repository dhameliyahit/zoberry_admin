const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../helpers/multer");
const testimonialController = require("../controllers/testimonial.controller");

router.get("/", testimonialController.getAll);
router.get("/:id", testimonialController.getById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("authorImg"),
  [
    body("review").notEmpty().withMessage("Review text is required"),
    body("authorName").notEmpty().withMessage("Author name is required"),
    validate,
  ],
  testimonialController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("authorImg"),
  testimonialController.update
);

router.delete("/:id", protect, adminOnly, testimonialController.delete);

module.exports = router;
