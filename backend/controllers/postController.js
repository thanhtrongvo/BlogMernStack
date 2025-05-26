const Post = require('../models/Post');
const User = require('../models/User');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('category', 'name');
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
}
exports.getPostById = async (req, res) => { 
    try {
        const post = await Post.findById(req.params.id).populate('category', 'name description');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post' });
    }
}

exports.createPost = async (req, res) => {
    const { title, content, image, category, status = true } = req.body;

    try {
        // Check if user exists in request object
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User authentication required' });
        }

        // Get user info
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new post
        const newPost = new Post({
            title,
            content,
            image,
            author: user.username,
            category,
            status: Boolean(status)
        });

        // Save the post
        await newPost.save();

        // Add post to user's posts array
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { posts: newPost._id } }
        );

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
}
exports.updatePost = async (req, res) => {
    const { title, content, image } = req.body;
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            title,
            content,
            image
        }, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post' });
    }
}
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post' });
    }
}// Track views for a post
exports.trackPostView = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Find post by ID
        const post = await Post.findById(id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Increment view count
        post.views = (post.views || 0) + 1;
        await post.save();
        
        res.status(200).json({ success: true, views: post.views });
    } catch (error) {
        console.error('Error tracking post view:', error);
        res.status(500).json({ message: 'Error tracking post view' });
    }
};

exports.getPostsByCategory = async (req, res) => { 
    const {categoryId} = req.params ;
    try {
        const posts = await Post.find({ category: categoryId }).populate('category', 'name description');
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this category' });
        }
        res.status(200).json(posts);
    }
    catch (error) {
        console.error('Error fetching posts by category:', error);
        res.status(500).json({ message: 'Error fetching posts by category' });
    }
}
