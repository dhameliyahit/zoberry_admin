const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Admin access only" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify token with Google API
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = response.data;

    // payload contains: email, name, picture, sub (googleId), email_verified
    const { email, name, picture, email_verified } = payload;

    if (!email || (email_verified !== "true" && email_verified !== true)) {
      return res.status(401).json({ success: false, error: "Google account email is not verified" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      // Generate a random password since password field is required in schema
      const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        image: picture || "",
      });
    } else if (!user.image && picture) {
      user.image = picture;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    if (error.response) {
      return res.status(401).json({ success: false, error: "Invalid Google token" });
    }
    next(error);
  }
};

module.exports = { register, login, adminLogin, getMe, googleLogin };
