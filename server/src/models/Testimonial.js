const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review text is required"],
    },

    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },

    authorRole: {
      type: String,
      default: "",
      trim: true,
    },

    authorImg: {
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

testimonialSchema.index({ order: 1 });
testimonialSchema.index({ isActive: 1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);
