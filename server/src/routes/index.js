const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "Zoberry Admin API is running" });
});

router.use("/auth", require("./auth.routes"));
router.use("/products", require("./product.routes"));
router.use("/categories", require("./category.routes"));
router.use("/orders", require("./order.routes"));
router.use("/users", require("./user.routes"));
router.use("/testimonials", require("./testimonial.routes"));
router.use("/blogs", require("./blog.routes"));
router.use("/contact", require("./contact.routes"));
router.use("/hero-slides", require("./heroSlide.routes"));
router.use("/recently-viewed", require("./recentlyViewed.routes"));

module.exports = router;
