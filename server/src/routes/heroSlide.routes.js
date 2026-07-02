const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../helpers/multer");
const heroSlideController = require("../controllers/heroSlide.controller");

router.get("/", heroSlideController.getAll);
router.get("/:id", heroSlideController.getById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Slide title is required"),
    validate,
  ],
  heroSlideController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  heroSlideController.update
);

router.delete("/:id", protect, adminOnly, heroSlideController.delete);

module.exports = router;
