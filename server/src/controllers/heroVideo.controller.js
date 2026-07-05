const HeroVideo = require("../models/HeroVideo");

const getAll = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const videos = await HeroVideo.find(filter).populate("product").sort({ order: 1 });

    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const video = await HeroVideo.findById(req.params.id).populate("product");
    if (!video) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Video not found" });
    }
    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const video = await HeroVideo.create(req.body);
    const populated = await HeroVideo.findById(video._id).populate("product");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const video = await HeroVideo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("product");

    if (!video) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Video not found" });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const video = await HeroVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, error: "Hero Video not found" });
    }
    res.json({ success: true, message: "Hero Video deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, delete: delete_ };
