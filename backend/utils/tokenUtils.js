const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate access token - short lived (15 min)
exports.generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_ACCESS_SECRET || 'access_secret',
        { expiresIn: '15m' }
    );
};

// Generate refresh token - longer lived (7 days)
exports.generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        { expiresIn: '7d' }
    );
};

// Save refresh token to user document
exports.saveRefreshToken = async (userId, refreshToken) => {
    try {
        // Calculate expiry date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    refreshTokens: {
                        token: refreshToken,
                        expiresAt
                    }
                }
            }
        );
        return true;
    } catch (error) {
        console.error('Error saving refresh token:', error);
        return false;
    }
};

// Verify refresh token
exports.verifyRefreshToken = async (refreshToken) => {
    try {
        // Decode token without verification to get user ID
        const decoded = jwt.decode(refreshToken);
        if (!decoded) return null;

        // Find user with this token
        const user = await User.findOne({
            _id: decoded.id,
            'refreshTokens.token': refreshToken
        });

        if (!user) return null;

        // Verify token with secret
        const verified = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh_secret'
        );

        return verified;
    } catch (error) {
        console.error('Refresh token verification error:', error.message);
        return null;
    }
};

// Remove a specific refresh token
exports.removeRefreshToken = async (userId, refreshToken) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    refreshTokens: { token: refreshToken }
                }
            }
        );
        return true;
    } catch (error) {
        console.error('Error removing refresh token:', error);
        return false;
    }
};

// Remove all refresh tokens for a user (logout from all devices)
exports.removeAllRefreshTokens = async (userId) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            { $set: { refreshTokens: [] } }
        );
        return true;
    } catch (error) {
        console.error('Error removing all refresh tokens:', error);
        return false;
    }
};

// Clean expired tokens
exports.cleanExpiredTokens = async (userId) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    refreshTokens: {
                        expiresAt: { $lt: new Date() }
                    }
                }
            }
        );
        return true;
    } catch (error) {
        console.error('Error cleaning expired tokens:', error);
        return false;
    }
};
