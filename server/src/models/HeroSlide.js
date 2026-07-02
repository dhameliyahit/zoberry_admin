const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    discount: {
      type: String,
      trim: true,
      default: "",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      required: [true, "Slide title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "#",
    },
    image: {
      type: String,
      default: "",
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

// Indexing for faster sorting and filtering
heroSlideSchema.index({ isActive: 1 });
heroSlideSchema.index({ order: 1 });

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
