const mongoose = require("mongoose");

const heroVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Linked product is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexing for faster filtering and sorting
heroVideoSchema.index({ isActive: 1 });
heroVideoSchema.index({ order: 1 });

module.exports = mongoose.model("HeroVideo", heroVideoSchema);
