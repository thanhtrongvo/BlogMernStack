const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const auth = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

exports.getAllComments = async (req, res) => { 
    try {
        const comment = await Comment.find();
        res.status(200).json(comment);
    }
    catch (error) {
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
    const author = req.user.username;

    try {
        const newComment = new Comment({
            postId,
            content,
            author
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
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
        const comments = await Comment.find({ postId: req.params.postId });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found for this post' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByUserId = async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.params.userId });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found for this user' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
}
exports.getCommentsByStatus = async (req, res) => {
    try {
        const comments = await Comment.find({ status: req.params.status });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found with this status' });
        }
        res.status(200).json(comments);
    } catch (error) {
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
        const comments = await Comment.find({ author: req.params.author });
        if (!comments) {
            return res.status(404).json({ message: 'No comments found by this author' });
        }
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
}

exports.approveComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id, 
            { status: true }, 
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment approved successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error approving comment' });
    }
}

exports.rejectComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id, 
            { status: false }, 
            { new: true }
        );
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment rejected successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting comment' });
    }
}
