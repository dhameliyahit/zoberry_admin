const Testimonial = require("../models/Testimonial");
const { uploadSingle } = require("../helpers/imageUpload");

const getAll = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    else filter.isActive = true;

    const testimonials = await Testimonial.find(filter).sort({ order: 1 });

    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    let authorImg = "";

    if (req.file) {
      authorImg = await uploadSingle(req.file);
    } else if (req.body.authorImg) {
      authorImg = req.body.authorImg;
    }

    const testimonial = await Testimonial.create({ ...req.body, authorImg });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }

    let authorImg = testimonial.authorImg;
    if (req.file) {
      authorImg = await uploadSingle(req.file);
    } else if (req.body.authorImg) {
      authorImg = req.body.authorImg;
    }

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, authorImg },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, delete: delete_ };
