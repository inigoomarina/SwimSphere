const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateResponse } = require('../utils/helpers');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json(generateResponse('error', 'Access denied. No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json(generateResponse('error', 'Invalid token.'));
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json(generateResponse('error', 'Access denied. Admins only.'));
        }
        next();
    } catch (error) {
        res.status(500).json(generateResponse('error', 'Server error.'));
    }
};

const isCoach = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'coach') {
            return res.status(403).json(generateResponse('error', 'Access denied. Coaches only.'));
        }
        next();
    } catch (error) {
        res.status(500).json(generateResponse('error', 'Server error.'));
    }
};

module.exports = { authenticate, isAdmin, isCoach };