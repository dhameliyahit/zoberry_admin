const mongoose = require("mongoose");

// Generic key/value config store. The "payment" key holds the global,
// admin-controlled payment gateway configuration shared with the storefront.
const configSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
