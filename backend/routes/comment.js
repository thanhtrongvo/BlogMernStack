const route = require('express').Router();
const { getAllComments, getCommentById, createComment, updateComment, deleteComment, getCommentsByPostId } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Public route
route.get('/', getAllComments);
route.get('/:id', getCommentById);
route.get('/post/:postId', getCommentsByPostId);

// Auth route
route.post('/', auth, createComment);
route.put('/:id', auth, updateComment);
route.delete('/:id', auth, deleteComment);

module.exports = route;