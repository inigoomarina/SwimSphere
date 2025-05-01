import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSwimTime } from '../utils/helpers';
import Loader from '../components/common/Loader';
import './RecordsPage.css';
import { recordsData } from '../data/recordsData';

const RecordsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [filters, setFilters] = useState({
        course: '',
        type: '',
        gender: '',
        event: '' // Combined stroke and distance
    });
    
    const [availableFilters, setAvailableFilters] = useState({
        courses: [],
        types: [],
        genders: [],
        events: [] // Will be populated based on course selection
    });

    // Dynamic filters that change based on course selection
    const [courseSpecificTypes, setCourseSpecificTypes] = useState([]);
    const [courseSpecificEvents, setCourseSpecificEvents] = useState([]);

    // Create event options from stroke and distance
    const createEventOptions = useCallback((data, course) => {
        const filteredByCourse = data.filter(record => record.course === course);
        const eventOptions = [];
        
        filteredByCourse.forEach(record => {
            // Create event name
            let distance = record.distance;
            let eventName;
            
            if (record.isRelay) {
                const baseDistance = record.distance / 4;
                const unit = course === 'SCY' ? 'yd' : 'm';
                eventName = `4×${baseDistance}${unit} ${record.stroke}${record.stroke === 'medley' ? '' : ' relay'}`;
            } else {
                const unit = course === 'SCY' ? 'yd' : 'm';
                eventName = `${distance}${unit} ${record.stroke}`;
            }
            
            if (!eventOptions.includes(eventName)) {
                eventOptions.push(eventName);
            }
        });
        
        return eventOptions.sort();
    }, []);
    
    useEffect(() => {
        // Set available base filters
        setAvailableFilters({
            courses: ["LCM", "SCM", "SCY"],
            types: [],
            genders: ["male", "female", "mixed"],
            events: []
        });
    }, []);
    
    // Update available types based on course selection
    useEffect(() => {
        if (!filters.course) return;
        
        let types = [];
        
        if (filters.course === 'LCM') {
            types = ["World", "Olympic", "American"];
        } else if (filters.course === 'SCM') {
            types = ["World", "American"];
        } else if (filters.course === 'SCY') {
            types = ["American", "NCAA D1", "NCAA D2", "NCAA D3"];
        }
        
        setCourseSpecificTypes(types);
        
        // Reset type if not available in new course selection
        if (filters.type && !types.includes(filters.type)) {
            setFilters(prev => ({...prev, type: ''}));
        }
        
        // Update available events based on course
        const events = createEventOptions(recordsData, filters.course);
        setCourseSpecificEvents(events);
        
        // Reset event if not available in new course selection
        if (filters.event && !events.includes(filters.event)) {
            setFilters(prev => ({...prev, event: ''}));
        }
    }, [filters.course, filters.type, filters.event, createEventOptions]);
    
    const fetchRecordsData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Filter the records data based on selected filters
            let filteredData = [...recordsData];
            
            // Log initial count and check for incomplete records
            console.log(`Initial records count: ${filteredData.length}`);
            
            // Check for and log any potentially incomplete records
            const incompleteRecords = filteredData.filter(r => 
                !r.type || !r.course || !r.gender || !r.stroke || !r.distance || 
                !r.swimmer || !r.country || !r.time);
            
            if (incompleteRecords.length > 0) {
                console.warn(`Warning: Found ${incompleteRecords.length} incomplete records`);
                console.warn('First incomplete record:', incompleteRecords[0]);
            }
            
            // Continue with existing filtering code
            if (filters.course) {
                filteredData = filteredData.filter(record => record.course === filters.course);
                console.log(`After course filter (${filters.course}): ${filteredData.length} records`);
            }
            
            if (filters.type) {
                filteredData = filteredData.filter(record => record.type === filters.type);
                console.log(`After type filter (${filters.type}): ${filteredData.length} records`);
            }
            
            if (filters.gender) {
                filteredData = filteredData.filter(record => record.gender === filters.gender);
                console.log(`After gender filter (${filters.gender}): ${filteredData.length} records`);
            }
            
            if (filters.event) {
                // Parse event to get distance and stroke
                const eventParts = filters.event.split(' ');
                
                if (eventParts.length > 0) {
                    let distance, stroke, isRelay = false;
                    
                    if (eventParts[0].includes('×')) {
                        // This is a relay event
                        isRelay = true;
                        const relayParts = eventParts[0].split('×');
                        if (relayParts.length >= 2) {
                            // Extract numbers only for the distance part
                            const numPeople = parseInt(relayParts[0], 10);
                            const individualDistance = parseInt(relayParts[1].replace(/[^\d]/g, ''), 10);
                            if (!isNaN(numPeople) && !isNaN(individualDistance)) {
                                distance = numPeople * individualDistance;
                            }
                        }
                        
                        // For relay events, determine stroke correctly
                        if (eventParts.length > 1) {
                            // If it contains "medley", it's a medley relay
                            if (eventParts.join(' ').toLowerCase().includes('medley')) {
                                stroke = 'medley';
                            } else {
                                // Otherwise it's likely freestyle relay
                                stroke = 'freestyle';
                            }
                        }
                    } else {
                        // This is an individual event
                        // Extract number from first part (e.g. "100m" -> 100)
                        const distanceMatch = eventParts[0].match(/\d+/);
                        if (distanceMatch) {
                            distance = parseInt(distanceMatch[0], 10);
                        }
                        
                        // Get stroke name from remaining parts
                        if (eventParts.length > 1) {
                            stroke = eventParts.slice(1).join(' ');
                        }
                    }
                    
                    console.log(`Parsed event: distance=${distance}, stroke=${stroke}, isRelay=${isRelay}`);
                    
                    // Make sure we have valid data before filtering
                    if (distance && stroke) {
                        filteredData = filteredData.filter(record => {
                            // Ensure strict type checking with triple equals and explicit boolean check
                            const distanceMatch = record.distance === distance;
                            const strokeMatch = record.stroke.toLowerCase() === stroke.toLowerCase();
                            // Handle relay checking - some records might not have isRelay property
                            const relayMatch = (record.isRelay === isRelay) || 
                                              (isRelay === false && record.isRelay === undefined);
                            
                            const matches = distanceMatch && strokeMatch && relayMatch;
                            if (!matches && distanceMatch) {
                                console.log(`Filtering out: ${record.stroke} ${record.distance}m - stroke match: ${strokeMatch}, relay match: ${relayMatch}`);
                            }
                            return matches;
                        });
                        
                        console.log(`After event filter: ${filteredData.length} records`);
                    }
                }
            }
            
            // When getting duplicate records, log them to help identify the issue
            const recordCounts = {};
            filteredData.forEach(record => {
                const key = `${record.type}-${record.course}-${record.gender}-${record.stroke}-${record.distance}`;
                recordCounts[key] = (recordCounts[key] || 0) + 1;
            });
            
            const duplicates = Object.entries(recordCounts)
                .filter(([key, count]) => count > 1)
                .map(([key]) => key);
                
            if (duplicates.length > 0) {
                console.log(`Found ${duplicates.length} duplicate record keys:`, duplicates);
                
                // For each duplicate, show the actual records
                duplicates.forEach(key => {
                    const dupeRecords = filteredData.filter(record => 
                        `${record.type}-${record.course}-${record.gender}-${record.stroke}-${record.distance}` === key
                    );
                    console.log(`Duplicate group for ${key}:`, dupeRecords);
                });
            }
            
            // The rest of your code for deduplication and setting records
            const uniqueRecords = Array.from(new Map(filteredData.map(item => 
                [`${item.type}-${item.course}-${item.gender}-${item.stroke}-${item.distance}`, item]
            )).values());
            
            console.log(`After removing duplicates: ${uniqueRecords.length} records`);
            setRecords(uniqueRecords);
            setError('');
        } catch (err) {
            setError('Failed to load records data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);
    
    useEffect(() => {
        fetchRecordsData();
    }, [fetchRecordsData]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const clearFilters = () => {
        setFilters({
            course: '',
            type: '',
            gender: '',
            event: ''
        });
    };
    
    // Format record type for display
    const formatRecordType = (type) => {
        switch (type) {
            case 'Olympic': return 'Olympic Record';
            case 'World': return 'World Record';
            case 'American': return 'American Record';
            case 'NCAA D1': return 'NCAA Division I';
            case 'NCAA D2': return 'NCAA Division II';
            case 'NCAA D3': return 'NCAA Division III';
            default: return type;
        }
    };

    // Format gender for display
    const formatGender = (gender) => {
        if (gender === 'mixed') return 'Mixed';
        return gender.charAt(0).toUpperCase() + gender.slice(1);
    };

    // Animation variants for card grid
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="records-page-container">
            <h1>World Swimming Records</h1>
            <p className="records-intro">
                Explore our comprehensive collection of swimming records from around the world. 
                Use the filters below to find specific records by course type, record category, gender, and event.
            </p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="records-filters">
                <div className="filters-container">
                    <div className="filter-group">
                        <label htmlFor="course-filter">Distance</label>
                        <select 
                            id="course-filter"
                            name="course"
                            value={filters.course}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">Select Course</option>
                            {availableFilters.courses.map(course => (
                                <option key={course} value={course}>
                                    {course === 'LCM' ? 'Long Course Meters' : 
                                     course === 'SCM' ? 'Short Course Meters' : 'Short Course Yards'}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="type-filter">Category</label>
                        <select 
                            id="type-filter"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="filter-select"
                            disabled={!filters.course}
                        >
                            <option value="">Select Category</option>
                            {courseSpecificTypes.map(type => (
                                <option key={type} value={type}>
                                    {formatRecordType(type)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="gender-filter">Gender</label>
                        <select 
                            id="gender-filter"
                            name="gender"
                            value={filters.gender}
                            onChange={handleFilterChange}
                            className="filter-select"
                            disabled={!filters.course}
                        >
                            <option value="">Select Gender</option>
                            {availableFilters.genders.map(gender => (
                                <option key={gender} value={gender}>
                                    {formatGender(gender)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="event-filter">Event</label>
                        <select 
                            id="event-filter"
                            name="event"
                            value={filters.event}
                            onChange={handleFilterChange}
                            className="filter-select"
                            disabled={!filters.course}
                        >
                            <option value="">Select Event</option>
                            {courseSpecificEvents.map(event => (
                                <option key={event} value={event}>
                                    {event}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-actions">
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <Loader />
                </div>
            ) : (
                <div className="records-content">
                    {records.length > 0 ? (
                        <>
                            {/* Section headers based on filters */}
                            {filters.course && (
                                <h2 className="section-header">
                                    {filters.course === 'LCM' ? 'Long Course Meters' : 
                                     filters.course === 'SCM' ? 'Short Course Meters' : 'Short Course Yards'} Records
                                </h2>
                            )}
                            
                            {filters.type && (
                                <h3 className="category-header">{formatRecordType(filters.type)}</h3>
                            )}
                            
                            {filters.gender && (
                                <h4 className="gender-header">{formatGender(filters.gender)}</h4>
                            )}
                            
                            <motion.div 
                                className="records-grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                <AnimatePresence>
                                    {records.map((record, index) => (
                                        <motion.div
                                            key={`${record.swimmer}-${record.stroke}-${record.distance}-${record.gender}-${record.course}-${record.type}`}
                                            className="record-card"
                                            variants={itemVariants}
                                            layout
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <div className="record-card-header">
                                                <h3>
                                                    {record.distance}
                                                    {record.course === 'SCY' ? 'yd' : 'm'} {record.stroke}
                                                    {record.isRelay ? ' Relay' : ''}
                                                </h3>
                                                <div className="record-time">{formatSwimTime(record.time)}</div>
                                            </div>
                                            
                                            <div className="record-card-body">
                                                <div className="record-info">
                                                    <span className="record-swimmer">{record.swimmer}</span>
                                                    <span className="record-country">{record.country}</span>
                                                </div>
                                                
                                                <div className="record-meta">
                                                    <div className="record-date">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="record-type">{formatRecordType(record.type)}</div>
                                                </div>
                                                
                                                {record.location && (
                                                    <div className="record-location">{record.location}</div>
                                                )}
                                                
                                                {record.competition && (
                                                    <div className="record-competition">{record.competition}</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    ) : (
                        <div className="no-records">
                            <p>No records found matching your selected filters.</p>
                            <button onClick={clearFilters} className="clear-filters-btn">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordsPage;
