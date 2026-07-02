const Blog = require("../models/Blog");
const { uploadSingle } = require("../helpers/imageUpload");

const getAll = async (req, res, next) => {
  try {
    const { category, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    else filter.isActive = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blogs,
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

const getBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    blog.views += 1;
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }
    res.json({ success: true, data: blog });
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

    const blog = await Blog.create({ ...req.body, image });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    let image = blog.image;
    if (req.file) {
      image = await uploadSingle(req.file);
    } else if (req.body.image) {
      image = req.body.image;
    }

    const updated = await Blog.findByIdAndUpdate(
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
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getBySlug, getById, create, update, delete: delete_ };
