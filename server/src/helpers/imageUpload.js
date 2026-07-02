const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadSingle = async (file) => {
  try {
    if (!file) throw new Error("No file provided");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "zoberry/products",
          resource_type: "image",
          format: "webp",
          quality: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Image upload error: ${error.message}`);
  }
};

const uploadMultiple = async (files) => {
  if (!files || files.length === 0) return [];
  const uploads = files.map((file) => uploadSingle(file));
  return Promise.all(uploads);
};

const uploadFromUrl = async (imageUrl) => {
  try {
    if (!imageUrl) throw new Error("No image URL provided");

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "zoberry/products",
      resource_type: "image",
      format: "webp",
      quality: "auto",
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Image upload error: ${error.message}`);
  }
};

module.exports = { uploadSingle, uploadMultiple, uploadFromUrl };
