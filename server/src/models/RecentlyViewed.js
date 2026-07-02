const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema(
  {
    macAddress: {
      type: String,
      required: [true, "MAC address is required"],
      trim: true,
      unique: true,
      index: true,
    },
    productIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
