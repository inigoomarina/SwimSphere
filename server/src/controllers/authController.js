const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateEmail, generateResponse } = require('../utils/helpers');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json(generateResponse('error', 'All fields are required'));
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json(generateResponse('error', 'Invalid email format'));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json(generateResponse('error', 'User already exists'));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json(generateResponse('success', 'User registered successfully', { 
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
            isNewUser: true // Add flag to indicate this is a new registration
        }));
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(generateResponse('error', 'Error registering user'));
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json(generateResponse('error', 'Email and password are required'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json(generateResponse('error', 'User not found'));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json(generateResponse('error', 'Invalid credentials'));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(200).json(generateResponse('success', 'Login successful', {
            token, 
            user: { id: user._id, username: user.username, email: user.email }
        }));
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(generateResponse('error', 'Error logging in'));
    }
};

exports.googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    try {
        // Verify the Google token
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const { email_verified, email, name, picture } = ticket.getPayload();
        
        if (!email_verified) {
            return res.status(400).json(generateResponse('error', 'Email not verified with Google'));
        }
        
        // Check if user exists
        let user = await User.findOne({ email });
        let isNewUser = false;
        
        if (!user) {
            // Create new user if doesn't exist
            const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            // Extract first and last name from full name
            const nameParts = name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            user = new User({
                username,
                email,
                password: hashedPassword,
                googleId: email,
                firstName,
                lastName,
                profileImage: picture || ''
            });
            
            await user.save();
            isNewUser = true; // Mark this as a new user
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '24h' });
        
        res.status(200).json(generateResponse('success', 'Google login successful', {
            token,
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            },
            isNewUser: isNewUser // Include the flag in response
        }));
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json(generateResponse('error', 'Error with Google login'));
    }
};