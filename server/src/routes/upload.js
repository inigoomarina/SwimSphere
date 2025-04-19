const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { generateResponse } = require('../utils/helpers');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Add middleware to ensure images folder is available for defaults
router.use((req, res, next) => {
    const imagesDir = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    next();
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Create upload middleware with file size limit
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route for uploading media
router.post('/', authenticate, upload.single('media'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(generateResponse('error', 'No file uploaded'));
        }

        // Generate URL for the uploaded file
        const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json(generateResponse('success', 'File uploaded successfully', { url: fileUrl }));
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json(generateResponse('error', 'Error uploading file'));
    }
});

module.exports = router;
