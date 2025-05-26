const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = async (req, res, next) => { 
        
    console.log('AUTH middleware loaded for path:', req.path);
    let token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    
    try {
        // Verify access token using the access token secret
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Check if user is active
        if (req.user.status === false) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
        }
        
        // Clean expired refresh tokens on authentication
        // This helps keep the database clean
        const now = new Date();
        await User.updateOne(
            { _id: req.user._id },
            { $pull: { refreshTokens: { expiresAt: { $lt: now } } } }
        );
        
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        
        // Specific error for expired tokens
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired', 
                expired: true 
            });
        }
        
        return res.status(401).json({ message: 'Invalid token' });
    }
}