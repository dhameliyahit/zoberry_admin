const User = require("../models/User");

const getAll = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;

    if (password) {
      const user = await User.findById(req.params.id).select("+password");
      user.password = password;
      await user.save();
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, update, delete: delete_ };
