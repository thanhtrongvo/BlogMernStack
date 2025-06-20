const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const auth = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

exports.getAllComments = async (req, res) => { 
    try {
        const { limit, sort, order } = req.query;
        
        let query = Comment.find()
            .populate('postId', 'title')
            .populate('author', 'name email');
        
        // Add sorting if specified
        if (sort) {
            const sortOrder = order === 'desc' ? -1 : 1;
            query = query.sort({ [sort]: sortOrder });
        }
        
        // Add limit if specified
        if (limit) {
            query = query.limit(parseInt(limit));
        }
        
        const comments = await query;
        res.status(200).json(comments);
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}

exports.getCommentById = async (req, res) => { 
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment' });
    }

}

exports.createComment = async (req, res) => {
    const { postId, content } = req.body;
    const author = req.user.id; // Use user ID from auth middleware

    try {
        const newComment = new Comment({
            postId,
            content,
            author, // author is object ID of the user
        });
        await newComment.save();
        
        // Populate author and post info before returning
        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'name email')
            .populate('postId', 'title');
            
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
}
exports.updateComment = async (req, res) => {
    const { content } = req.body;
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, {
            content
        }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment' });
    }
}
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment' });
    }
}
exports.getCommentsByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('author', 'name email')
            .populate('postId', 'title')
            .sort({ createdAt: -1 }); // Sort by newest first
            
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByUserId = async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.params.userId })
            .populate('author', 'name email')
            .populate('postId', 'title');
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByDate = async (req, res) => {
    try {
        const comments = await Comment.find({ createdAt: { $gte: req.params.startDate, $lte: req.params.endDate } });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found in this date range' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByContent = async (req, res) => {
    try {
        const comments = await Comment.find({ content: { $regex: req.params.content, $options: 'i' } });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found with this content' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByAuthor = async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.params.author })
            .populate('author', 'name email')
            .populate('postId', 'title');
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
