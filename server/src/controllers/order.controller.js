const Order = require("../models/Order");

const getAll = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

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

const create = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, customer: req.user._id });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found" });
    }

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

module.exports = {
  getAll,
  getById,
  getUserOrders,
  create,
  update,
  delete: delete_,
};
