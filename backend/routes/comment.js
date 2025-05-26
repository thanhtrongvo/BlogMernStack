const route = require('express').Router();
const { getAllComments, getCommentById, createComment, updateComment, deleteComment } = require('../controllers/commentController');

route.get('/', getAllComments);
route.get('/:id', getCommentById);

route.post('/', createComment);
route.put('/:id', updateComment);

route.delete('/:id', deleteComment);


module.exports = route;