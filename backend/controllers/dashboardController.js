const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

// Get overall dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Get post count
        const postCount = await Post.countDocuments();
        
        // Get user count
        const userCount = await User.countDocuments();
        
        // Get comment count
        const commentCount = await Comment.countDocuments();
        
        // Calculate total views (assuming posts have a views field)
        // If your Post model doesn't have views, you need to add it
        const posts = await Post.find({}, 'views');
        const totalViews = posts.reduce((total, post) => total + (post.views || 0), 0);
        
        // Return stats
        res.status(200).json({
            stats: {
                postCount,
                userCount,
                commentCount,
                totalViews
            },
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

// Get weekly views data
exports.getWeeklyViewsData = async (req, res) => {
    try {
        // Calculate dates for the last 7 days
        const days = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            days.push({
                date,
                name: dayNames[dayOfWeek],
                views: 0 // Default value
            });
        }
        
        // Aggregate daily views for the last 7 days
        // This is a placeholder - you need to modify based on your actual data model
        // If you track views with timestamps, you can aggregate by day
        
        // In a real implementation, you would query views with timestamps and group by day
        // For now, we'll simulate with random data
        days.forEach(day => {
            // Simulated view count between 150 and 600
            day.views = Math.floor(Math.random() * 450) + 150;
        });
        
        res.status(200).json(days);
    } catch (error) {
        console.error('Error fetching weekly views:', error);
        res.status(500).json({ message: 'Error fetching weekly views data' });
    }
};

// Get monthly views data
exports.getMonthlyViewsData = async (req, res) => {
    try {
        const months = [];
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        
        const currentMonth = new Date().getMonth();
        
        // Get data for the last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            months.push({
                name: monthNames[monthIndex],
                views: 0 // Default value
            });
        }
        
        // In a real implementation, you would query views grouped by month
        // For now, we'll simulate with random data
        months.forEach(month => {
            // Simulated view count between 1000 and 4000
            month.views = Math.floor(Math.random() * 3000) + 1000;
        });
        
        res.status(200).json(months);
    } catch (error) {
        console.error('Error fetching monthly views:', error);
        res.status(500).json({ message: 'Error fetching monthly views data' });
    }
};

// Get top posts by views
exports.getTopPosts = async (req, res) => {
    try {
        // Limit can be specified in the request query
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        
        // Get top posts by views
        const topPosts = await Post.find()
            .sort({ views: -1 }) // Sort by views in descending order
            .limit(limit)
            .populate('category', 'name'); // Get category name
        
        // Transform for client
        const formattedPosts = topPosts.map(post => ({
            id: post._id,
            title: post.title,
            views: post.views || 0,
            category: post.category ? post.category.name : 'Uncategorized'
        }));
        
        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error('Error fetching top posts:', error);
        res.status(500).json({ message: 'Error fetching top posts' });
    }
};
