const router = require("express").Router();
const controller = require("../controllers/recentlyViewed.controller");

router.get("/", controller.getRecentlyViewed);
router.post("/", controller.addRecentlyViewed);

module.exports = router;
