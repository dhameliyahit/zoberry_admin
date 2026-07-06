const Category = require("../models/Category");
const Product = require("../models/Product");
const { uploadSingle } = require("../helpers/imageUpload");

const getAll = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const categories = await Category.find(filter).sort({ name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        const obj = cat.toObject ? cat.toObject() : cat;
        return {
          ...obj,
          count: count,
          products: count
        };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, data: category });
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

    const category = await Category.create({ ...req.body, image });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    let image = category.image;
    if (req.file) {
      image = await uploadSingle(req.file);
    } else if (req.body.image) {
      image = req.body.image;
    }

    const updated = await Category.findByIdAndUpdate(
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
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, delete: delete_ };
