require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Only allow requests from localhost (admin panel frontend)
app.use(cors({ origin: ["http://localhost:3001", "http://localhost:3000","http://incompetent-crook.surge.sh","https://zoberryenterprise.vercel.app"] }));

// Parse incoming JSON and urlencoded bodies (increased limit for base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logger (dev mode only)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api", routes);

// Health check — useful to confirm the server is up
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Central error handler ────────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
