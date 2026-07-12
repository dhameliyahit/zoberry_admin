const Order = require("../models/Order");

const getAll = async (req, res, next) => {
  try {
    const { status, paymentStatus, utrStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (utrStatus) filter.utrStatus = utrStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "customer",
      "name email phone"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const Product = require("../models/Product");

const create = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "Order must have at least one item" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, error: "Shipping address is required" });
    }

    // Validate phone number
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!shippingAddress.phone || !phoneRegex.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number. Must be a valid 10-digit Indian mobile number."
      });
    }

    // Validate zip (Indian 6-digit pin code)
    const zipRegex = /^\d{6}$/;
    if (!shippingAddress.zip || !zipRegex.test(shippingAddress.zip.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid zip/pincode. Must be a valid 6-digit Indian pincode."
      });
    }

    // 1. Verify stock for all items
    const productsToUpdate = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.title}` });
      }

      if (product.trackQuantity && !product.continueSelling) {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for product "${product.title}". Only ${product.stock} available.`,
          });
        }
      }
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // 2. Decrement stock
    for (const entry of productsToUpdate) {
      const { product, quantity } = entry;
      if (product.trackQuantity && !product.continueSelling) {
        product.stock -= quantity;
        await product.save();
      }
    }

    // 3. Create the order
    const order = await Order.create({ ...req.body, customer: req.user._id });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found" });
    }

    // Restore stock if transitioned to cancelled
    if (req.body.status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.trackQuantity) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorised to cancel this order" });
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.trackQuantity) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = "cancelled";
    const updated = await order.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    next(error);
  }
};

// Manual verification of a Direct UPI payment: merchant confirms the credit
// in their bank, then approves (or rejects) the buyer-submitted UTR.
const verifyUtr = async (req, res, next) => {
  try {
    const { action, utr } = req.body;
    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    if (order.paymentMethod !== "directupi") {
      return res
        .status(400)
        .json({ success: false, error: "Order is not a Direct UPI order" });
    }

    if (action === "verify") {
      order.utr = (utr || order.utr || "").toString().trim();
      order.utrStatus = "verified";
      order.paymentStatus = "paid";
      if (order.status === "pending") order.status = "confirmed";
    } else {
      order.utrStatus = "rejected";
      order.paymentStatus = "failed";
    }

    const updated = await order.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const getMetrics = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueData
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getUserOrders,
  create,
  update,
  cancelMyOrder,
  verifyUtr,
  getMetrics,
  delete: delete_,
};
