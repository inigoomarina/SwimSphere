const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateEmail, generateResponse } = require('../utils/helpers');

// Create a function to format user data for response
const formatUserResponse = (user) => {
    return {
        id: user._id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        city: user.city,
        country: user.country,
        favoriteStroke: user.favoriteStroke,
        favoriteEvent: user.favoriteEvent,
        swimTeam: user.swimTeam,
        coachRole: user.coachRole,
        profileImage: user.profileImage,
        bio: user.bio,
        onboardingComplete: user.onboardingComplete
    };
}

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
            user: formatUserResponse(user)
        }));
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(generateResponse('error', 'Error logging in'));
    }
};

exports.googleLogin = async (req, res) => {
    const { credential, tokenId } = req.body;
    
    // Use either credential (new format) or tokenId (old format) depending on what's available
    const token = credential || tokenId;
    
    if (!token) {
        return res.status(400).json(generateResponse('error', 'No Google token provided'));
    }

    try {
        console.log("Received Google token, attempting verification...");
        // Verify the Google token
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, email_verified, name, picture, given_name, family_name } = payload;
        
        console.log(`Google verification success for: ${email}`);
        
        if (!email_verified) {
            return res.status(400).json(generateResponse('error', 'Email not verified with Google'));
        }
        
        // Check if user exists
        let user = await User.findOne({ email });
        let isNewUser = false;
        
        if (!user) {
            console.log(`Creating new user for: ${email}`);
            // Create new user if doesn't exist
            const username = (given_name || name.split(' ')[0]).toLowerCase() + Math.floor(Math.random() * 1000);
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            // Extract first and last name from Google data or full name
            const firstName = given_name || name.split(' ')[0] || '';
            const lastName = family_name || (name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : '') || '';
            
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
            console.log(`New user created for: ${email}`);
        } else {
            console.log(`Existing user found for: ${email}`);
        }
        
        // Generate JWT token
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '24h' });
        
        res.status(200).json(generateResponse('success', 'Google login successful', {
            token: jwtToken,
            user: formatUserResponse(user),
            isNewUser
        }));
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json(generateResponse('error', 'Error with Google login: ' + error.message));
    }
};