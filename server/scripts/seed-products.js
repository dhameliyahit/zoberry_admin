/**
 * Seed Script — Generates and inserts products into MongoDB
 *
 * Usage:
 *   node scripts/seed-products.js              — Seed all products
 *   node scripts/seed-products.js --dry-run    — Preview without inserting
 *   node scripts/seed-products.js --count 5    — Seed only 5 products
 *
 * Environment:
 *   MONGODB_URI — MongoDB connection string
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { generateProductContent } = require("./groq-helper");
const { fetchProductImages } = require("./unsplash-helper");
const CATALOG = require("./product-catalog");

// ═══════════════════════════════════════════════════════════════════
// PRODUCT DATA — loaded from product-catalog.js
// ═══════════════════════════════════════════════════════════════════

const PRODUCTS = CATALOG;
console.log(`📦 Loaded ${PRODUCTS.length} products from catalog\n`);

// ═══════════════════════════════════════════════════════════════════
// CATEGORY SEED DATA — Matches the storefront categories
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { name: "Televisions", description: "Smart TVs, LED, OLED, and QLED displays from top brands" },
  { name: "Laptop & PC", description: "Laptops, desktops, monitors, and PC accessories" },
  { name: "Mobile & Tablets", description: "Smartphones, tablets, and mobile accessories" },
  { name: "Games & Videos", description: "Gaming consoles, controllers, and video equipment" },
  { name: "Home Appliances", description: "Kitchen, laundry, and home comfort appliances" },
  { name: "Health & Sports", description: "Fitness trackers, sports gear, and health devices" },
  { name: "Watches", description: "Smartwatches, analog watches, and watch accessories" },
  { name: "Audio & Speakers", description: "Headphones, earbuds, speakers, and audio equipment" },
];

// ═══════════════════════════════════════════════════════════════════
// MONGOOSE SCHEMAS (mirror admin backend models)
// ═══════════════════════════════════════════════════════════════════

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: "" },
  brand: { type: String, default: "" },
  productType: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: null, min: 0 },
  costPrice: { type: Number, default: null, min: 0 },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
  }],
  videos: [{
    url: { type: String, required: true },
    title: { type: String, default: "" },
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  tags: [String],
  sku: { type: String, unique: true, sparse: true },
  barcode: { type: String, default: "" },
  stock: { type: Number, default: 0, min: 0 },
  trackQuantity: { type: Boolean, default: true },
  continueSelling: { type: Boolean, default: false },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  status: { type: String, default: "active", enum: ["active", "draft", "archived"] },
  isFeatured: { type: Boolean, default: false },
  hasVariants: { type: Boolean, default: false },
  variantOptions: [{
    name: { type: String, required: true },
    values: [String],
  }],
  variants: [{
    title: String,
    sku: String,
    price: Number,
    discountedPrice: Number,
    stock: { type: Number, default: 0 },
    image: { type: String, default: "" },
    barcode: String,
    weight: Number,
    option1: String,
    option2: String,
    option3: String,
    isActive: { type: Boolean, default: true },
  }],
  seo: {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  specifications: [{
    key: String,
    value: String,
  }],
  weight: Number,
  width: Number,
  height: Number,
  length: Number,
  discountedPrice: { type: Number, default: null, min: 0 },
  isActive: { type: Boolean, default: true },
  reviews: [{
    name: String,
    email: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Auto-generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    const slugify = require("slugify");
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isActive) {
    this.status = "active";
  }
  next();
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    const slugify = require("slugify");
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function seedDatabase() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const countIdx = args.indexOf("--count");
  const maxProducts = countIdx >= 0 ? parseInt(args[countIdx + 1]) : PRODUCTS.length;

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║         ZOBBERRY DATABASE SEED SCRIPT               ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log();

  if (dryRun) {
    console.log("⚠️  DRY RUN MODE — No data will be inserted\n");
  }

  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://codingtest545_db_user:sHWkjltDJr11GzaK@wpilot.uid1v8i.mongodb.net/zoberry_enterprise";

  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const Category = mongoose.model("Category", categorySchema);
  const Product = mongoose.model("Product", productSchema);

  // ── Step 1: Seed Categories ──
  console.log("═══ STEP 1: Seeding Categories ═══");
  const categoryMap = {};

  for (const cat of CATEGORIES) {
    if (dryRun) {
      console.log(`  [DRY] Would create category: ${cat.name}`);
      categoryMap[cat.name] = `dry-run-id-${cat.name}`;
      continue;
    }

    let existing = await Category.findOne({ name: cat.name });
    if (existing) {
      console.log(`  ✅ Category already exists: ${cat.name} (${existing._id})`);
      categoryMap[cat.name] = existing._id;
    } else {
      const created = await Category.create({
        name: cat.name,
        description: cat.description,
        isActive: true,
      });
      console.log(`  🆕 Created category: ${cat.name} (${created._id})`);
      categoryMap[cat.name] = created._id;
    }
  }
  console.log();

  // ── Step 2: Seed Products ──
  console.log("═══ STEP 2: Seeding Products ═══");
  const productsToSeed = PRODUCTS.slice(0, maxProducts);

  for (let i = 0; i < productsToSeed.length; i++) {
    const prod = productsToSeed[i];
    const progress = `[${i + 1}/${productsToSeed.length}]`;
    console.log(`\n${progress} Processing: ${prod.title}`);

    // Check if product already exists
    if (!dryRun) {
      const existing = await Product.findOne({ sku: prod.sku });
      if (existing) {
        console.log(`  ⏭️  Product already exists (SKU: ${prod.sku}), skipping`);
        continue;
      }
    }

    // Step 2a: Generate AI content via Groq
    console.log(`  🤖 Generating content via Groq AI...`);
    let aiContent;
    try {
      aiContent = await generateProductContent(prod.title, prod.brand);
      console.log(`  ✅ Generated description (${aiContent.description.length} chars)`);
    } catch (err) {
      console.error(`  ❌ Groq failed: ${err.message}`);
      aiContent = {
        description: `${prod.title} from ${prod.brand || "Zoberry"}. Available at best price in India with warranty.`,
        specifications: [],
        tags: [prod.brand?.toLowerCase() || "electronics"],
        seoTitle: `${prod.title} - Buy Online at Zoberry`,
        seoDescription: `Buy ${prod.title} at best price in India.`,
      };
    }

    // Step 2b: Fetch images via Unsplash
    console.log(`  🖼️  Fetching images from Unsplash...`);
    let images;
    try {
      images = await fetchProductImages(prod.title, prod.brand, 2);
      console.log(`  ✅ Got ${images.length} images`);
    } catch (err) {
      console.error(`  ❌ Unsplash failed: ${err.message}`);
      images = [
        { url: `https://source.unsplash.com/800x800/?${encodeURIComponent(prod.title)}`, alt: prod.title },
      ];
    }

    // Step 2c: Build final product document
    const categoryId = categoryMap[prod.category];
    if (!categoryId) {
      console.error(`  ❌ Category "${prod.category}" not found, skipping product`);
      continue;
    }

    const productDoc = {
      title: prod.title,
      description: aiContent.description,
      brand: prod.brand || "",
      price: prod.price,
      discountedPrice: prod.discountedPrice,
      compareAtPrice: prod.compareAtPrice || null,
      images: images.map((img, idx) => ({
        url: img.url,
        alt: img.alt || prod.title,
        isFeatured: idx === 0,
      })),
      category: categoryId,
      tags: aiContent.tags || [],
      sku: prod.sku,
      stock: prod.stock,
      trackQuantity: true,
      status: "active",
      isActive: true,
      isFeatured: prod.isFeatured || false,
      hasVariants: prod.hasVariants || false,
      variantOptions: prod.variantOptions || [],
      ratings: {
        average: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        count: Math.floor(10 + Math.random() * 100),
      },
      specifications: aiContent.specifications || [],
      seo: {
        metaTitle: aiContent.seoTitle || `${prod.title} - Zoberry`,
        metaDescription: aiContent.seoDescription || aiContent.description,
      },
    };

    // Step 2d: Insert product
    if (dryRun) {
      console.log(`  [DRY] Would insert product:`);
      console.log(`    Title: ${productDoc.title}`);
      console.log(`    Price: ₹${productDoc.discountedPrice} (MRP: ₹${productDoc.price})`);
      console.log(`    Category: ${prod.category}`);
      console.log(`    Images: ${productDoc.images.length}`);
      console.log(`    Specs: ${productDoc.specifications.length}`);
      console.log(`    Tags: ${productDoc.tags.join(", ")}`);
      console.log(`    Description: ${productDoc.description.substring(0, 80)}...`);
    } else {
      try {
        const created = await Product.create(productDoc);
        console.log(`  ✅ Inserted product: ${created.title} (${created._id})`);
      } catch (err) {
        console.error(`  ❌ Insert failed: ${err.message}`);
      }
    }

    // Rate limiting — wait 4s between products to avoid Groq 429 errors (6000 TPM limit)
    // For 95 products, this takes ~6 minutes total
    if (i < productsToSeed.length - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 Seeding complete!");
  console.log("═══════════════════════════════════════════════════════");

  await mongoose.disconnect();
  console.log("📡 Disconnected from MongoDB");
}

// Run
seedDatabase().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
