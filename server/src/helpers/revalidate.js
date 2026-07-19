const axios = require("axios");

const revalidate = async (tags) => {
  try {
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3000";
    await axios.post(`${storefrontUrl}/api/revalidate`, { tags }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
  } catch (error) {
    console.error("Revalidation failed:", error.message);
  }
};

module.exports = revalidate;
