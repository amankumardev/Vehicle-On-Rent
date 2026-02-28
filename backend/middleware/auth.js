const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please log in to access this resource.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

// Restrict access to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
