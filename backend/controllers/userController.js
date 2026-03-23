const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const auth = require("../middleware/auth");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const foundUser = await User.findById(req.params.id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

exports.editUser = async (req, res) => {
  const { username, email, password, role, status } = req.body;
  try {
    // Create an update object
    const updateData = { username, email };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // If role is provided, update it
    if (role) {
      updateData.role = role;
    }

    // If status is provided, update it
    if (status !== undefined) {
      updateData.status = status;

      // If the user is being deactivated, remove all refresh tokens to force logout
      if (status === false) {
        await User.updateOne(
          { _id: req.params.id },
          { $set: { refreshTokens: [] } },
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Save user to database
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};
