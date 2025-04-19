const express = require('express');
const { 
    getRecords,
    getRecordById,
    addRecord,
    updateRecord,
    deleteRecord
} = require('../controllers/recordController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getRecords);
router.get('/:id', getRecordById);

// Admin routes (protected)
router.post('/', authenticate, isAdmin, addRecord);
router.put('/:id', authenticate, isAdmin, updateRecord);
router.delete('/:id', authenticate, isAdmin, deleteRecord);

module.exports = router;
