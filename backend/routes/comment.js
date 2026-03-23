const route = require("express").Router();
const {
  getAllComments,
  getCommentById,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const auth = require("../middleware/auth");

route.get("/", auth, getAllComments);
route.get("/post/:postId", getCommentsByPostId);
route.get("/:id", getCommentById);

route.post("/", createComment);
route.put("/:id", auth, updateComment);

route.delete("/:id", auth, deleteComment);

module.exports = route;
