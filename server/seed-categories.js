require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./src/models/Category");





const categories = [
  { name: "Massage Products", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop" },
  { name: "Home & Kitchen Products", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" },
  { name: "Safety Products", image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600&h=400&fit=crop" },
  { name: "Car Accessories", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop" },
  { name: "Rain Season", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&h=400&fit=crop" },
  { name: "Hairbrush", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop" },
  { name: "Winter Products", image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&h=400&fit=crop" },
  { name: "Travel", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop" },
  { name: "Wallpaper", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop" },
  { name: "Kids Stationery", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop" },
  { name: "Night Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=400&fit=crop" },
  { name: "Holi Products", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop" },
  { name: "Glass Products", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop" },
  { name: "Soft Toy", image: "https://images.unsplash.com/photo-1559715541-d5bdb2cff4be?w=600&h=400&fit=crop" },
  { name: "Pet Products", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop" },
  { name: "Wipes Products", image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop" },
  { name: "Bag Cover", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop" },
  { name: "Computer Products", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop" },
  { name: "Summer Products", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
  { name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop" },
  { name: "Bottle Products", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=400&fit=crop" },
  { name: "Cleaning Products", image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600&h=400&fit=crop" },
  { name: "Beauty Products", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop" },
  { name: "Clock", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop" },
  { name: "Humidifier", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop" },
  { name: "Packing Material", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop" },
  { name: "Baby Products", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop" },
  { name: "Fashion Products", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop" },
  { name: "Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop" },
  { name: "Bathroom Accessories", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" },
  { name: "Hardware", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop" },
  { name: "Mask", image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600&h=400&fit=crop" },
  { name: "Garden", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop" },
  { name: "Umbrella", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&h=400&fit=crop" },
  { name: "Perfume", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=400&fit=crop" },
  { name: "Mobile Accessories", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop" },
  { name: "Kids Home Decor", image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=400&fit=crop" },
  { name: "Stainless Products", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&h=400&fit=crop" },
  { name: "Kitchen", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    let added = 0;
    let skipped = 0;

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (exists) {
        console.log(`SKIP (exists): ${cat.name}`);
        skipped++;
        continue;
      }
      await Category.create({ name: cat.name, image: cat.image });
      console.log(`ADDED: ${cat.name}`);
      added++;
    }

    console.log(`\nDone! ${added} added, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
