const Record = require('../models/Record');
const { generateResponse } = require('../utils/helpers');

// Get all records with optional filtering
exports.getRecords = async (req, res) => {
    try {
        const { stroke, distance, region, gender, ageGroup, limit } = req.query;
        
        // Build filter object based on query parameters
        const filter = {};
        if (stroke) filter.stroke = stroke;
        if (distance) filter.distance = parseInt(distance);
        if (region) filter.region = region;
        if (gender) filter.gender = gender;
        if (ageGroup) filter.ageGroup = ageGroup;
        
        // Find records with filters, sort by time (ascending)
        const records = await Record.find(filter)
            .sort({ time: 1 })
            .limit(limit ? parseInt(limit) : 100);
        
        // Group records by stroke, distance, and region
        const groupedRecords = records.reduce((acc, record) => {
            const key = `${record.stroke}-${record.distance}-${record.region}`;
            
            if (!acc[key]) {
                acc[key] = {
                    stroke: record.stroke,
                    distance: record.distance,
                    region: record.region,
                    records: []
                };
            }
            
            acc[key].records.push(record);
            return acc;
        }, {});
        
        // Convert the grouped object to an array
        const response = Object.values(groupedRecords);
        
        // Get unique values for filter dropdowns
        const uniqueStrokes = await Record.distinct('stroke');
        const uniqueDistances = await Record.distinct('distance');
        const uniqueRegions = await Record.distinct('region');
        const uniqueAgeGroups = await Record.distinct('ageGroup');
        
        res.json(generateResponse('success', 'Records retrieved successfully', {
            records: response,
            filters: {
                strokes: uniqueStrokes,
                distances: uniqueDistances,
                regions: uniqueRegions,
                ageGroups: uniqueAgeGroups
            }
        }));
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving records'));
    }
};

// Get a single record by ID
exports.getRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const record = await Record.findById(id);
        if (!record) {
            return res.status(404).json(generateResponse('error', 'Record not found'));
        }
        
        res.json(generateResponse('success', 'Record retrieved successfully', record));
    } catch (error) {
        console.error('Get record by id error:', error);
        res.status(500).json(generateResponse('error', 'Error retrieving record'));
    }
};

// Add a new record (admin only)
exports.addRecord = async (req, res) => {
    try {
        const { 
            stroke, distance, region, time, swimmer, 
            date, location, ageGroup, gender, competition 
        } = req.body;
        
        // Validate required fields
        if (!stroke || !distance || !region || !time || !swimmer || !gender) {
            return res.status(400).json(generateResponse('error', 'Missing required fields'));
        }
        
        const newRecord = new Record({
            stroke,
            distance,
            region,
            time,
            swimmer,
            date: date || Date.now(),
            location: location || '',
            ageGroup: ageGroup || 'Open',
            gender,
            competition: competition || '',
            verified: false // Admin needs to verify later
        });
        
        const savedRecord = await newRecord.save();
        
        res.status(201).json(generateResponse('success', 'Record added successfully', savedRecord));
    } catch (error) {
        console.error('Add record error:', error);
        res.status(500).json(generateResponse('error', 'Error adding record'));
    }
};

// Update a record (admin only)
exports.updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const record = await Record.findById(id);
        if (!record) {
            return res.status(404).json(generateResponse('error', 'Record not found'));
        }
        
        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id' && key !== '__v') {
                record[key] = updateData[key];
            }
        });
        
        const updatedRecord = await record.save();
        
        res.json(generateResponse('success', 'Record updated successfully', updatedRecord));
    } catch (error) {
        console.error('Update record error:', error);
        res.status(500).json(generateResponse('error', 'Error updating record'));
    }
};

// Delete a record (admin only)
exports.deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        
        const record = await Record.findById(id);
        if (!record) {
            return res.status(404).json(generateResponse('error', 'Record not found'));
        }
        
        await record.remove();
        
        res.json(generateResponse('success', 'Record deleted successfully'));
    } catch (error) {
        console.error('Delete record error:', error);
        res.status(500).json(generateResponse('error', 'Error deleting record'));
    }
};
