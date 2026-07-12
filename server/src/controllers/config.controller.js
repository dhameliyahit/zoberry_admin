const Config = require("../models/Config");

// Bootstrap defaults are taken from env so the gateway works out of the box.
// Once an admin saves the form, the persisted DB value becomes the source of truth.
const DEFAULT_PAYMENT_CONFIG = {
  enabledMethods: ["cod", "uropay", "directupi"],
  defaultMethod: "cod",
  providers: {
    uropay: {
      enabled: true,
      mode: process.env.UROPAY_MODE || "test",
      apiKey: process.env.UROPAY_API_KEY || "",
      secret: process.env.UROPAY_SECRET || "",
      vpa: process.env.UROPAY_VPA || "",
      vpaName: process.env.UROPAY_VPA_NAME || "Zoberry",
    },
    directupi: {
      enabled: true,
      vpa: process.env.UPI_VPA || "heetdhameliya59-2@oksbi",
      vpaName: process.env.UPI_VPA_NAME || "Zoberry",
    },
  },
};

const getPaymentConfig = async (req, res, next) => {
  try {
    let doc = await Config.findOne({ key: "payment" });
    if (!doc) {
      doc = await Config.create({ key: "payment", value: DEFAULT_PAYMENT_CONFIG });
    }
    res.json({ success: true, data: doc.value });
  } catch (error) {
    next(error);
  }
};

const updatePaymentConfig = async (req, res, next) => {
  try {
    const value = req.body && req.body.value ? req.body.value : req.body;
    if (!value || typeof value !== "object") {
      return res.status(400).json({ success: false, error: "Invalid payment config payload" });
    }

    // Merge providers so the admin UI (which only manages `uropay`) does not
    // wipe providers it doesn't render, e.g. the static `directupi` UPI VPA.
    const existing = await Config.findOne({ key: "payment" });
    const mergedProviders = {
      ...(existing?.value?.providers || {}),
      ...(value.providers || {}),
    };
    const merged = {
      ...(existing?.value || {}),
      ...value,
      providers: mergedProviders,
    };

    const doc = await Config.findOneAndUpdate(
      { key: "payment" },
      { $set: { value: merged } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: doc.value });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentConfig, updatePaymentConfig };
