const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPostBySlug,
  trackPostView,
  getPostsByCategory,
} = require("../controllers/postController");

// Public routes — specific paths MUST come before /:id
router.get("/", getAllPosts);
router.get("/category/:categoryId", getPostsByCategory);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id", getPostById);
router.post("/:id/view", trackPostView);

// Protected routes
router.post("/", auth, createPost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);


module.exports = router;

