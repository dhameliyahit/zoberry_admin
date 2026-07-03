require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");


    const user = new User({
      name: "Admin",
      email: "dhruv@admin.com",
      password: "Dhruv@123",
      role: "admin",
      phone: "",
      isActive: true,
    });
    await user.save({ validateBeforeSave: false });

    console.log("Admin created: heet@admin.com / 1212");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
