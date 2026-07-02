const { validationResult } = require("express-validator");

/**
 * Runs after express-validator checks.
 * If there are errors, responds with 400 and the first error message.
 * If clean, calls next() to proceed to the controller.
 *
 * Usage:
 *   router.post("/products", [
 *     body("title").notEmpty(),
 *     validate,
 *     productController.create,
 *   ]);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg, // return first error only for simplicity
    });
  }
  next();
};

module.exports = validate;
