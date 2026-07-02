const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../helpers/multer");
const categoryController = require("../controllers/category.controller");

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  [
    body("name").notEmpty().withMessage("Category name is required"),
    validate,
  ],
  categoryController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  categoryController.update
);

router.delete("/:id", protect, adminOnly, categoryController.delete);

module.exports = router;
