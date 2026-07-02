const axios = require("axios");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const slugify = require("slugify");

const Category = require("./src/models/Category"); 
const Product = require("./src/models/Product");

cloudinary.config({
  cloud_name: "dus5nkeb2",
  api_key: "832383457177824",
  api_secret: "MQr1DWwwF8HH6AqBNeyOuccZ7ac"
});

const MONGO_URI = "mongodb+srv://codingtest545_db_user:sHWkjltDJr11GzaK@wpilot.uid1v8i.mongodb.net/zoberry_enterprise"; 
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("💾 MongoDB Connected Successfully..."))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// --- NEW DEFINITION: COMPLETELY WIPE MONGODB & CLOUDINARY FOLDER ---
async function wipeExistingStorageData(localCategoryId) {
  try {
    console.log("\n🧹 STARTING MASTER STORAGE CLEANUP...");

    // 1. Wipe Mongo items assigned to this specific Category ID
    if (localCategoryId) {
      const deleteProducts = await Product.deleteMany({ category: localCategoryId });
      console.log(`🗑️ MongoDB: Removed ${deleteProducts.deletedCount} old products matching category.`);
    }

    // 2. Wipe all images inside the 'cheaperzone_products' directory in Cloudinary
    console.log("☁️ Cloudinary: Deleting resources inside 'cheaperzone_products' folder...");
    
    // Deletes the assets
    const cloudRes = await cloudinary.api.delete_resources_by_prefix("cheaperzone_products/");
    console.log("♻️ Cloudinary cleanup response:", cloudRes.deleted);

    // Deletes the empty folder wrapper
    try {
      await cloudinary.api.delete_folder("cheaperzone_products");
      console.log("📁 Cloudinary: Empty folder structure deleted successfully.");
    } catch (folderErr) {
      // Throws error if folder was already absent or not empty yet, ignore gracefully
    }

    console.log("✨ MASTER CLEANUP COMPLETE. Starting fresh sync import...\n");
  } catch (error) {
    console.error("⚠️ Warning during database/cloudinary wipe:", error.message);
  }
}

async function syncAllProducts(graphqlCategoryId) {
  const CHUNK_LIMIT = 50; 
  let currentOffset = 0;
  let totalRecordsToFetch = 0;
  let isStorageCleaned = false;
  let localCategoryId = null;

  const query = `
    query MyQuery(
      $categoryId: uuid!, 
      $limit: Int!, 
      $offset: Int!, 
      $minPrice: float8!, 
      $maxPrice: float8!, 
      $orderBy: Products_order_by, 
      $warehouseId: uuid
    ) {
      WarehouseStock(
        where: {
          warehouseId: {_eq: $warehouseId}, 
          Product: {
            ProductCategory: {id: {_eq: $categoryId}}, 
            visibleOutsideSurat: {_eq: true}, 
            purchasePrice: {_neq: "0"}, 
            isActive: {_eq: true}, 
            isDeleted: {_eq: false}, 
            displayPrice: {_gte: $minPrice, _lte: $maxPrice}
          }
        }
        order_by: [{Product: $orderBy}, {totalQty: desc}]
        limit: $limit
        offset: $offset
      ) {
        totalQty
        Product {
          id
          name
          displayPrice
          mrp
          purchasePrice
          hsn
          gst
          attatchments: Attachments(where: {isDefault: {_eq: true}}) {
            path
          }
          productCategory: ProductCategory {
            name
            id
          }
        }
      }
      Products_aggregate(
        where: {
          visibleOutsideSurat: {_eq: true}, 
          isActive: {_eq: true}, 
          isDeleted: {_eq: false}, 
          purchasePrice: {_neq: "0"}, 
          ProductCategory: {id: {_eq: $categoryId}}, 
          displayPrice: {_gte: $minPrice, _lte: $maxPrice}
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    while (currentOffset === 0 || currentOffset < totalRecordsToFetch) {
      console.log(`\n📡 Fetching batch: Offset ${currentOffset} (Limit ${CHUNK_LIMIT})...`);
      
      const variables = {
        categoryId: graphqlCategoryId,
        limit: CHUNK_LIMIT,
        offset: currentOffset,
        minPrice: 0,
        maxPrice: 5000,
        orderBy: null,
        warehouseId: "fd3abea8-d801-4841-bc1e-6c507a61938d"
      };

      const response = await axios.post(
        "https://gql.cheaperzoneretail.in/v1/graphql",
        { operationName: "MyQuery", query, variables },
        { headers: { "Content-Type": "application/json", "x-hasura-admin-secret": "JqYKhrDHTnXCPklb" } }
      );

      const stocks = response.data?.data?.WarehouseStock;
      
      if (currentOffset === 0) {
        totalRecordsToFetch = response.data?.data?.Products_aggregate?.aggregate?.count || 0;
        console.log(`📊 Target category tracking total: ${totalRecordsToFetch} Products found.`);
        
        if (!stocks || stocks.length === 0) {
          console.log("No items returned from targeted endpoint.");
          break;
        }

        const rawCategoryData = stocks[0].Product.productCategory;
        const targetCategorySlug = slugify(rawCategoryData.name, { lower: true, strict: true });

        const localCategory = await Category.findOneAndUpdate(
          { slug: targetCategorySlug },
          { $setOnInsert: { name: rawCategoryData.name, description: "Imported Category" } },
          { upsert: true, new: true }
        );
        
        localCategoryId = localCategory._id;
        console.log(`Using Category: "${localCategory.name}" (ID: ${localCategoryId})`);

        // --- STEP 2: Execute Master Wipe Function ---
        if (!isStorageCleaned) {
          await wipeExistingStorageData(localCategoryId);
          isStorageCleaned = true;
        }
      }

      if (!stocks || stocks.length === 0) {
        break; 
      }

      for (let i = 0; i < stocks.length; i++) {
        const gqProduct = stocks[i].Product;
        const totalStock = stocks[i].totalQty;
        const globalIndex = currentOffset + i + 1;
        
        console.log(`🔄 [${globalIndex}/${totalRecordsToFetch}] Processing: "${gqProduct.name}"`);

        let cloudinaryUrl = "";

        if (gqProduct.attatchments && gqProduct.attatchments.length > 0) {
          const rawPath = gqProduct.attatchments[0].path;
          const filename = rawPath.substring(rawPath.lastIndexOf("/") + 1);
          const publicId = filename.split(".")[0]; 

          const sizeMatch = rawPath.match(/w-[\d-]+/);
          const sizePrefix = sizeMatch ? sizeMatch[0] : "w-900"; 
          
          const imageUrlsToTry = [
            `https://api.cheaperzoneretail.in/images/uploads/${sizePrefix}/${filename}`,
            `https://api.cheaperzoneretail.in/images/uploads/w-900/${filename}`,
            `https://api.cheaperzoneretail.in/${rawPath}`
          ];

          for (const urlOption of imageUrlsToTry) {
            try {
              const uploadResult = await uploadToCloudinary(urlOption, publicId);
              cloudinaryUrl = uploadResult.secure_url;
              break; 
            } catch (err) {
              // Retry alternative path matching options...
            }
          }

          if (cloudinaryUrl) {
            console.log(`   📸 Cloudinary Upload Success: ${cloudinaryUrl}`);
          } else {
            console.warn(`   ⚠️ Image could not be recovered for: ${gqProduct.name}`);
          }
        }

        const productSlug = slugify(gqProduct.name, { lower: true, strict: true });

        const productPayload = {
          title: gqProduct.name,
          slug: productSlug,
          price: gqProduct.displayPrice || 0,
          compareAtPrice: gqProduct.mrp || null,
          costPrice: gqProduct.purchasePrice || null,
          stock: totalStock || 0,
          category: localCategoryId, 
          status: "active",
          isActive: true,
          sku: gqProduct.id, 
          barcode: gqProduct.hsn || "",
          specifications: [
            { key: "GST", value: `${gqProduct.gst}%` },
            { key: "HSN Code", value: gqProduct.hsn || "N/A" }
          ],
          images: cloudinaryUrl ? [{ url: cloudinaryUrl, alt: gqProduct.name, isFeatured: true }] : []
        };

        try {
          await Product.findOneAndUpdate(
            { sku: productPayload.sku }, 
            productPayload, 
            { upsert: true, runValidators: true }
          );
        } catch (dbError) {
          console.error(`   ❌ DB Insertion error for "${gqProduct.name}":`, dbError.message);
        }
      }

      currentOffset += CHUNK_LIMIT;
    }

    console.log("\n🏁 Complete sync loop finished successfully! Wiped old files and imported new data.");
    // NOTE: Removed mongoose.disconnect() from here so sequential processing doesn't crash.

  } catch (e) {
    console.error("Critical Runtime Stop Error:", e.stack);
    // NOTE: Removed mongoose.disconnect() from here as well.
  }
}

function uploadToCloudinary(url, publicId) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({ method: "GET", url, responseType: "stream", timeout: 8000 });
      const cldUploadStream = cloudinary.uploader.upload_stream(
        { folder: "cheaperzone_products", public_id: publicId, overwrite: true },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      response.data.pipe(cldUploadStream);
    } catch (err) {
      reject(err);
    }
  });
}

// --- SEQUENTIAL RUNNER EXECUTION ---
async function runSequentialSync() {
  const categories = [
    "ea022e9c-9f3a-4183-89e5-c953fee5825f",
    "fc32a88f-a57e-4fca-934c-5349b4594b56",
    "22a7c7cc-493d-4825-8987-304912449904",
    "dba444b5-90e2-4596-bac9-549b7da3b6d3"
  ];

  console.log("🚀 Starting sequential processing for all categories...");

  for (const categoryId of categories) {
    try {
      console.log(`\n==============================================`);
      console.log(`▶️ STARTING CATEGORY: ${categoryId}`);
      console.log(`==============================================`);
      
      await syncAllProducts(categoryId); 
      
    } catch (error) {
      console.error(`❌ Failed processing category ${categoryId}:`, error.message);
    }
  }

  console.log("\n✅ All categories processed. Disconnecting from MongoDB.");
  mongoose.disconnect();
}

// Fire the runner
runSequentialSync();