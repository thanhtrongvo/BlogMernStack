const route = require('express').Router();
const { getAllComments, getCommentById, createComment, updateComment, deleteComment, getCommentsByPostId, approveComment, rejectComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Public routes (reading comments)
route.get('/', getAllComments);
route.get('/:id', getCommentById);
route.get('/post/:postId', getCommentsByPostId);

// Protected routes (writing comments)
route.post('/', auth, createComment);
route.put('/:id', auth, updateComment);
route.put('/:id/approve', auth, approveComment);
route.put('/:id/reject', auth, rejectComment);
route.delete('/:id', auth, deleteComment);


module.exports = route;