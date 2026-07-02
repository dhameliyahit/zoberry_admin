const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    content: {
      type: String,
      default: "",
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    author: {
      type: String,
      default: "Admin",
      trim: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

blogSchema.index({ category: 1 });
blogSchema.index({ isActive: 1 });
blogSchema.index({ publishedAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);
