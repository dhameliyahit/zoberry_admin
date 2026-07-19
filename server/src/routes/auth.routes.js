const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  adminLogin,
  getMe,
  googleLogin,
} = require("../controllers/auth.controller");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    validate,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  login
);

router.post(
  "/google-login",
  [body("token").notEmpty().withMessage("Google token is required"), validate],
  googleLogin
);

router.post(
  "/admin-login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  adminLogin
);

router.get("/me", protect, getMe);

module.exports = router;
