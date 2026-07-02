const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects routes — verifies JWT and attaches user to req.
 * Usage: router.get("/protected", protect, controllerFn)
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Not authorised — no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts access to admin role only.
 * Must be used AFTER protect middleware.
 * Usage: router.delete("/users/:id", protect, adminOnly, controllerFn)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ success: false, error: "Admin access required" });
};

module.exports = { protect, adminOnly };
