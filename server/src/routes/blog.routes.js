const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../helpers/multer");
const blogController = require("../controllers/blog.controller");

router.get("/", blogController.getAll);
router.get("/slug/:slug", blogController.getBySlug);
router.get("/:id", blogController.getById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Blog title is required"),
    validate,
  ],
  blogController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  blogController.update
);

router.delete("/:id", protect, adminOnly, blogController.delete);

module.exports = router;
