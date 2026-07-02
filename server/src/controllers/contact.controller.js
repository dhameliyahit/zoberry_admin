const Contact = require("../models/Contact");

const getAll = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (isRead !== undefined) filter.isRead = isRead === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: contacts,
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
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact enquiry not found" });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Contact enquiry not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact enquiry not found" });
    }
    res.json({ success: true, message: "Contact enquiry deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, markRead, delete: delete_ };
