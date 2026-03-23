const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
} = require("../utils/tokenUtils");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("⏳ Hit REGISTER with body:", req.body);
  try {
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user account is active
    if (user.status === false) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    await saveRefreshToken(user._id, refreshToken);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Error refreshing token" });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Verify refresh token first
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(200).json({ message: "Logged out" });
    }

    // Remove the specific refresh token
    await removeRefreshToken(decoded.id, refreshToken);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    // This requires authentication middleware to attach user to request
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Remove all refresh tokens for this user
    await removeAllRefreshTokens(req.user._id);

    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};
