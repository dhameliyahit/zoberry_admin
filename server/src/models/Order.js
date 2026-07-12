const mongoose = require("mongoose");

// Embedded sub-schema for each item inside an order
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true },  // snapshot at time of order
    image: { type: String, default: "" },
    price: { type: Number, required: true },   // price paid (snapshot)
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false } // no separate _id for each item sub-doc
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Human-readable order number e.g. ZOB-10001
    orderNumber: {
      type: String,
      unique: true,
    },

    // Reference to the customer who placed the order
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    shippingAddress: {
      type: addressSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item",
      },
    },

    // Pricing breakdown
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Order lifecycle status
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet", "uropay", "directupi"],
      default: "cod",
    },

    // UroPay (UPI gateway) linkage
    uroPayOrderId: { type: String },

    // Static Direct UPI linkage (QR scanned to merchant VPA)
    upiVpa: { type: String, default: "" },
    utr: { type: String, default: "" },
    utrStatus: {
      type: String,
      enum: ["", "submitted", "verified", "rejected"],
      default: "",
    },

    // Admin or customer notes
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate orderNumber before save (e.g. ZOB-10001)
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ZOB-${10001 + count}`;
  }
  next();
});

// Indexes
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
