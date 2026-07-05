const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const heroVideoController = require("../controllers/heroVideo.controller");

router.get("/", heroVideoController.getAll);
router.get("/:id", heroVideoController.getById);

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("title").notEmpty().withMessage("Video title is required"),
    body("url").notEmpty().withMessage("Video URL is required"),
    body("product").notEmpty().withMessage("Linked product is required"),
    validate,
  ],
  heroVideoController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    body("title").optional().notEmpty().withMessage("Video title is required"),
    body("url").optional().notEmpty().withMessage("Video URL is required"),
    body("product").optional().notEmpty().withMessage("Linked product is required"),
    validate,
  ],
  heroVideoController.update
);

router.delete("/:id", protect, adminOnly, heroVideoController.delete);

module.exports = router;
