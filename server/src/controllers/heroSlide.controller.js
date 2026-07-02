const HeroSlide = require("../models/HeroSlide");
const { uploadSingle } = require("../helpers/imageUpload");

const getAll = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const slides = await HeroSlide.find(filter).sort({ order: 1 });

    res.json({ success: true, data: slides });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Slide not found" });
    }
    res.json({ success: true, data: slide });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    let image = "";

    if (req.file) {
      image = await uploadSingle(req.file);
    } else if (req.body.image) {
      image = req.body.image;
    }

    const slide = await HeroSlide.create({ ...req.body, image });

    res.status(201).json({ success: true, data: slide });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Slide not found" });
    }

    let image = slide.image;
    if (req.file) {
      image = await uploadSingle(req.file);
    } else if (req.body.image) {
      image = req.body.image;
    }

    const updated = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Slide not found" });
    }
    res.json({ success: true, message: "Hero Slide deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, delete: delete_ };
