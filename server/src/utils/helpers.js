// This file exports utility functions for the server-side application.

const generateResponse = (status, message, data = null) => {
    return {
        status,
        message,
        data,
    };
};

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const hashPassword = async (password) => {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    generateResponse,
    validateEmail,
    hashPassword,
    comparePassword,
};