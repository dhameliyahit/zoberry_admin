const RecentlyViewed = require("../models/RecentlyViewed");

const getRecentlyViewed = async (req, res, next) => {
  try {
    const { macAddress } = req.query;
    if (!macAddress) {
      return res.status(400).json({ success: false, error: "MAC address is required" });
    }

    const data = await RecentlyViewed.findOne({ macAddress }).populate({
      path: "productIds",
      match: { isActive: true } // Only fetch active products
    });

    // Filter out any null products (in case any product was deleted but still referenced)
    const products = data && data.productIds ? data.productIds.filter(p => p !== null) : [];

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const addRecentlyViewed = async (req, res, next) => {
  try {
    const { macAddress, productId } = req.body;
    if (!macAddress || !productId) {
      return res.status(400).json({ success: false, error: "MAC address and product ID are required" });
    }

    let record = await RecentlyViewed.findOne({ macAddress });

    if (record) {
      // Remove product ID from existing list if it exists to move it to the front
      const updatedIds = record.productIds
        .filter(id => id.toString() !== productId.toString());
      
      // Prepend the new product ID
      updatedIds.unshift(productId);

      // Keep only the 8 most recent
      record.productIds = updatedIds.slice(0, 8);
      await record.save();
    } else {
      record = await RecentlyViewed.create({
        macAddress,
        productIds: [productId]
      });
    }

    res.status(200).json({
      success: true,
      message: "Product added to recently viewed list"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentlyViewed,
  addRecentlyViewed
};
