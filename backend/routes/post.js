const express = require("express");
const router = express.Router();
const morgan = require("morgan");
const auth = require("../middleware/auth");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  trackPostView,
  getPostsByCategory,
} = require("../controllers/postController");

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById); // Removed auth middleware to allow public access
router.post("/:id/view", trackPostView);
router.get("/category/:categoryId", getPostsByCategory);
// Protected routes
router.post("/", auth, createPost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);


module.exports = router;
