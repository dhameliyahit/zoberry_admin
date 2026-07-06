const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../helpers/multer");
const productController = require("../controllers/product.controller");

router.get("/", productController.getAll);
router.get("/export/csv", protect, adminOnly, productController.exportCSV);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:id", productController.getById);
router.post("/bulk-get", productController.getBulk);
router.post("/:id/reviews", protect, productController.addReview);

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 10),
  [
    body("title").notEmpty().withMessage("Product title is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("category").notEmpty().withMessage("Category is required"),
    validate,
  ],
  productController.create
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 10),
  productController.update
);

router.delete("/:id", protect, adminOnly, productController.delete);

router.post("/bulk", protect, adminOnly, productController.bulkUpdate);

router.post("/:id/duplicate", protect, adminOnly, productController.duplicate);

module.exports = router;
