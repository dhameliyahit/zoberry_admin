/**
 * Central error handler middleware.
 * Catches all errors passed via next(err) and returns a consistent JSON response.
 * Always keep this as the LAST middleware in app.js.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Mongoose duplicate key error (e.g. unique email/slug)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(", "),
    });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // Multer file upload error (wrong file type, too large)
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, error: err.message });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Token expired" });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server error",
  });
};

module.exports = errorHandler;
