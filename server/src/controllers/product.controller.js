const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const { uploadMultiple } = require("../helpers/imageUpload");

const parseJSON = (val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const normalizeImages = (images) => {
  if (!images) return [];
  const arr = Array.isArray(images) ? images : [images];
  return arr.map((img) => {
    if (typeof img === "string") return { url: img, alt: "", isFeatured: false };
    if (img.url) return { url: img.url, alt: img.alt || "", isFeatured: !!img.isFeatured };
    return { url: String(img), alt: "", isFeatured: false };
  });
};

const autoGenerateVariants = (variantOptions, existingVariants = []) => {
  if (!variantOptions || variantOptions.length === 0) return [];

  const values = variantOptions.map((opt) => opt.values || []);

  const cartesian = (arr) => {
    return arr.reduce(
      (acc, curr) => {
        return acc.flatMap((a) => curr.map((c) => [...a, c]));
      },
      [[]]
    );
  };

  const combinations = cartesian(values);

  const existingMap = {};
  existingVariants.forEach((v) => {
    const key = [v.option1, v.option2, v.option3].filter(Boolean).join("|");
    existingMap[key] = v;
  });

  return combinations.map((combo) => {
    const key = combo.filter(Boolean).join("|");
    const existing = existingMap[key] || {};
    const title = combo.filter(Boolean).join(" / ");

    return {
      title: existing.title || title,
      sku: existing.sku || "",
      price: existing.price ?? null,
      discountedPrice: existing.discountedPrice ?? null,
      stock: existing.stock ?? 0,
      image: existing.image || "",
      barcode: existing.barcode || "",
      weight: existing.weight ?? null,
      option1: combo[0] || null,
      option2: combo[1] || null,
      option3: combo[2] || null,
      isActive: existing.isActive ?? true,
    };
  });
};

const buildProductData = (body, files) => {
  const data = {};

  if (body.title) data.title = body.title;
  else if (body.name) data.title = body.name;

  if (body.slug) data.slug = body.slug;
  if (body.description) data.description = body.description;

  data.brand = body.brand || "";
  data.productType = body.productType || "";

  if (body.price) data.price = Number(body.price);
  if (body.compareAtPrice) data.compareAtPrice = Number(body.compareAtPrice);
  if (body.costPrice) data.costPrice = Number(body.costPrice);

  if (body.category) data.category = body.category;
  if (body.sku) data.sku = body.sku;
  if (body.barcode) data.barcode = body.barcode;
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.trackQuantity !== undefined) data.trackQuantity = body.trackQuantity === "true" || body.trackQuantity === true;
  if (body.continueSelling !== undefined) data.continueSelling = body.continueSelling === "true" || body.continueSelling === true;
  if (body.status) data.status = body.status;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured === "true" || body.isFeatured === true;

  if (body.weight) data.weight = Number(body.weight);
  if (body.width) data.width = Number(body.width);
  if (body.height) data.height = Number(body.height);
  if (body.length) data.length = Number(body.length);

  if (body.discountedPrice) data.discountedPrice = Number(body.discountedPrice);

  if (body["seo.metaTitle"]) data.seo = { ...data.seo, metaTitle: body["seo.metaTitle"] };
  if (body["seo.metaDescription"]) data.seo = { ...data.seo, metaDescription: body["seo.metaDescription"] };
  if (body.seo) {
    const parsed = parseJSON(body.seo);
    if (typeof parsed === "object") data.seo = { ...data.seo, ...parsed };
  }

  if (body.specifications !== undefined) {
    data.specifications = parseJSON(body.specifications);
  }

  if (body.tags !== undefined) {
    const parsed = parseJSON(body.tags);
    data.tags = Array.isArray(parsed) ? parsed : [parsed];
  }

  // ── Variants ──
  if (body.hasVariants !== undefined) {
    data.hasVariants = body.hasVariants === "true" || body.hasVariants === true;
  }

  if (body.variantOptions) {
    data.variantOptions = parseJSON(body.variantOptions);
  }

  if (body.variants) {
    const parsedVariants = parseJSON(body.variants);
    if (body.variantOptions) {
      const parsedOpts = parseJSON(body.variantOptions);
      data.variants = autoGenerateVariants(parsedOpts, parsedVariants);
    } else {
      data.variants = parsedVariants;
    }
  } else if (body.variantOptions && data.hasVariants) {
    const parsedOpts = parseJSON(body.variantOptions);
    data.variants = autoGenerateVariants(parsedOpts);
  }

  // ── Images ──
  let images = [];
  if (body.images) {
    const parsed = parseJSON(body.images);
    images = normalizeImages(parsed);
  }
  data.images = images;

  // ── Videos ──
  if (body.videos !== undefined) {
    const parsed = parseJSON(body.videos);
    data.videos = Array.isArray(parsed) ? parsed : [];
  }

  return data;
};

const getAll = async (req, res, next) => {
  try {
    const {
      category,
      isFeatured,
      status,
      search,
      brand,
      productType,
      minPrice,
      maxPrice,
      stockStatus,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        filter.category = category;
      } else {
        const escapedCategory = category.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const foundCategory = await Category.findOne({
          $or: [
            { slug: category },
            { name: { $regex: new RegExp(`^${escapedCategory}$`, "i") } }
          ]
        });
        if (foundCategory) {
          filter.category = foundCategory._id;
        } else {
          filter.category = "000000000000000000000000";
        }
      }
    }
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (status) filter.status = status;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (productType) filter.productType = productType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (stockStatus === "in_stock") filter.stock = { $gt: 0 };
    else if (stockStatus === "out_of_stock") filter.stock = 0;
    else if (stockStatus === "low_stock") filter.stock = { $gt: 0, $lte: 10 };

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name_asc") sortOption = { title: 1 };
    else if (sort === "name_desc") sortOption = { title: -1 };
    else if (sort === "stock_asc") sortOption = { stock: 1 };
    else if (sort === "stock_desc") sortOption = { stock: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total, countsResult] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
      Product.aggregate([
        {
          $facet: {
            active: [{ $match: { status: "active" } }, { $count: "count" }],
            draft: [{ $match: { status: "draft" } }, { $count: "count" }],
            archived: [{ $match: { status: "archived" } }, { $count: "count" }],
            lowStock: [
              {
                $match: {
                  status: "active",
                  trackQuantity: true,
                  stock: { $gte: 0, $lte: 10 },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),
    ]);

    const counts = countsResult[0] || {};
    const activeCount = counts.active?.[0]?.count || 0;
    const draftCount = counts.draft?.[0]?.count || 0;
    const archivedCount = counts.archived?.[0]?.count || 0;
    const lowStockCount = counts.lowStock?.[0]?.count || 0;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      meta: {
        statusCounts: {
          active: activeCount,
          draft: draftCount,
          archived: archivedCount,
        },
        lowStockCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id }).populate("user", "name email");
    const productObj = product.toObject();
    productObj.reviews = reviews.map((r) => ({
      name: r.user ? r.user.name : "Anonymous",
      email: r.user ? r.user.email : "",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: productObj });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id }).populate("user", "name email");
    const productObj = product.toObject();
    productObj.reviews = reviews.map((r) => ({
      name: r.user ? r.user.name : "Anonymous",
      email: r.user ? r.user.email : "",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: productObj });
  } catch (error) {
    next(error);
  }
};

const getBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: "Product IDs must be an array" });
    }
    const validIds = ids.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    const products = await Product.find({ _id: { $in: validIds } }).populate(
      "category",
      "name slug"
    );
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = buildProductData(req.body, req.files);

    if (!data.category) {
      return res.status(400).json({ success: false, error: "Category is required" });
    }

    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, error: "Category not found" });
    }

    if (req.files && req.files.length > 0) {
      const uploaded = await uploadMultiple(req.files);
      const newImages = uploaded.map((url) => ({ url, alt: "", isFeatured: data.images.length === 0 }));
      data.images = [...data.images, ...newImages];
    }

    if (data.images.length > 0 && !data.images.some((i) => i.isFeatured)) {
      data.images[0].isFeatured = true;
    }

    const product = await Product.create(data);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const data = buildProductData(req.body, req.files);

    if (data.category) {
      const categoryExists = await Category.findById(data.category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, error: "Category not found" });
      }
    }

    if (req.body.images === undefined && !req.files) {
      data.images = product.images;
    }

    if (req.files && req.files.length > 0) {
      const uploaded = await uploadMultiple(req.files);
      const newImages = uploaded.map((url) => ({ url, alt: "", isFeatured: false }));
      data.images = [...data.images, ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

const bulkUpdate = async (req, res, next) => {
  try {
    const { ids, action, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "Product IDs are required" });
    }

    if (action === "delete") {
      await Product.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: `${ids.length} products deleted` });
    }

    if (action === "update" && data) {
      const updateData = {};
      if (data.status) updateData.status = data.status;
      if (data.category) updateData.category = data.category;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.price !== undefined) updateData.price = Number(data.price);
      if (data.stock !== undefined) updateData.stock = Number(data.stock);

      await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });
      return res.json({ success: true, message: `${ids.length} products updated` });
    }

    res.status(400).json({ success: false, error: "Invalid action or missing data" });
  } catch (error) {
    next(error);
  }
};

const duplicate = async (req, res, next) => {
  try {
    const source = await Product.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const sourceObj = source.toObject();
    delete sourceObj._id;
    delete sourceObj.__v;
    delete sourceObj.createdAt;
    delete sourceObj.updatedAt;
    delete sourceObj.slug;

    sourceObj.title = `${sourceObj.title} (Copy)`;

    const duplicate = await Product.create(sourceObj);
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    next(error);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate("category", "name").lean();

    const headers = [
      "Title", "Slug", "SKU", "Barcode", "Brand", "Product Type",
      "Price", "Compare At Price", "Cost Price", "Stock", "Status",
      "Category", "Tags", "Description",
    ];

    const rows = products.map((p) => [
      escapeCsv(p.title),
      escapeCsv(p.slug),
      escapeCsv(p.sku),
      escapeCsv(p.barcode),
      escapeCsv(p.brand),
      escapeCsv(p.productType),
      p.price ?? "",
      p.compareAtPrice ?? "",
      p.costPrice ?? "",
      p.stock ?? 0,
      p.status || "active",
      escapeCsv(p.category?.name || ""),
      escapeCsv((p.tags || []).join(", ")),
      escapeCsv(p.description),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const escapeCsv = (val) => {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: "Rating and comment are required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    let review = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (review) {
      review.rating = Number(rating);
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        product: req.params.id,
        rating: Number(rating),
        comment,
      });
    }

    const productReviews = await Review.find({ product: req.params.id });
    const totalReviews = productReviews.length;
    const sumRatings = productReviews.reduce((acc, r) => acc + r.rating, 0);

    product.ratings = {
      average: totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0,
      count: totalReviews,
    };

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate("category", "name slug");
    const reviews = await Review.find({ product: product._id }).populate("user", "name email");
    const productObj = updatedProduct.toObject();
    productObj.reviews = reviews.map((r) => ({
      name: r.user ? r.user.name : "Anonymous",
      email: r.user ? r.user.email : "",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.status(201).json({ success: true, data: productObj });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getBySlug,
  getById,
  getBulk,
  create,
  update,
  delete: delete_,
  bulkUpdate,
  duplicate,
  exportCSV,
  addReview,
};
