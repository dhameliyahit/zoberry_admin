const mongoose = require("mongoose");
const slugify = require("slugify");

const variantOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    values: [{ type: String }],
  },
  { _id: false }
);

const productVariantSchema = new mongoose.Schema(
  {
    title: { type: String },
    sku: { type: String, trim: true },
    price: { type: Number, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String, default: "" },
    barcode: { type: String, trim: true },
    weight: { type: Number },
    option1: { type: String },
    option2: { type: String },
    option3: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String },
    value: { type: String },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    productType: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, "Compare-at price cannot be negative"],
    },

    costPrice: {
      type: Number,
      default: null,
      min: [0, "Cost price cannot be negative"],
    },

    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        isFeatured: { type: Boolean, default: false },
      },
    ],

    videos: [
      {
        url: { type: String, required: true },
        title: { type: String, default: "" },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    tags: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    trackQuantity: {
      type: Boolean,
      default: true,
    },

    continueSelling: {
      type: Boolean,
      default: false,
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ─── Variant system ────────────────────────────────────────────────

    hasVariants: {
      type: Boolean,
      default: false,
    },

    // Defines option groups: [{ name: "Size", values: ["S","M","L"] }, { name: "Color", values: ["Red","Blue"] }]
    variantOptions: [variantOptionSchema],

    // Auto-generated combinations. Each entry = one unique variant.
    // For Size×Color (3×2) this will have 6 entries.
    variants: [productVariantSchema],

    // ─── SEO ───────────────────────────────────────────────────────────

    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },

    // ─── Shipping ──────────────────────────────────────────────────────

    weight: { type: Number, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    length: { type: Number, default: null },

    // ─── Legacy compat ─────────────────────────────────────────────────

    specifications: [specificationSchema],
    discountedPrice: { type: Number, default: null, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("status")) {
    this.isActive = this.status === "active";
  }
  if (this.isModified("isActive")) {
    this.status = this.isActive ? "active" : "draft";
  }
  next();
});

productSchema.virtual("name").get(function () {
  return this.title;
});

productSchema.virtual("margin").get(function () {
  if (this.costPrice && this.price && this.price > 0) {
    return Math.round(((this.price - this.costPrice) / this.price) * 100);
  }
  return null;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ "variants.sku": 1 });

module.exports = mongoose.model("Product", productSchema);
