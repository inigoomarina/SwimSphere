import React, { useState, useEffect, useCallback } from 'react';
import { getRecords } from '../utils/api';
import { formatSwimTime } from '../utils/helpers';
import Loader from '../components/common/Loader';
import './RecordsPage.css';

const RecordsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [filters, setFilters] = useState({
        stroke: '',
        distance: '',
        region: '',
        gender: '',
        ageGroup: ''
    });
    
    const [availableFilters, setAvailableFilters] = useState({
        strokes: [],
        distances: [],
        regions: [],
        ageGroups: []
    });
    
    // Gender options are static
    const genderOptions = [
        { value: '', label: 'All Genders' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'mixed', label: 'Mixed' }
    ];
    
    const fetchRecordsData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRecords(filters);
            
            if (response.status === 'success') {
                setRecords(response.data.records || []);
                
                // Set available filters if not already set
                if (response.data.filters) {
                    setAvailableFilters(response.data.filters);
                }
            }
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
            stroke: '',
            distance: '',
            region: '',
            gender: '',
            ageGroup: ''
        });
    };
    
    // Format the stroke name for display
    const formatStroke = (stroke) => {
        return stroke.charAt(0).toUpperCase() + stroke.slice(1);
    };
    
    // Format the distance for display
    const formatDistance = (distance) => {
        return `${distance}m`;
    };

    return (
        <div className="records-page-container">
            <h1>Swimming Records</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="records-filters">
                <h3>Filter Records</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label htmlFor="stroke-filter">Stroke</label>
                        <select 
                            id="stroke-filter"
                            name="stroke"
                            value={filters.stroke}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Strokes</option>
                            {availableFilters.strokes.map(stroke => (
                                <option key={stroke} value={stroke}>
                                    {formatStroke(stroke)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="distance-filter">Distance</label>
                        <select 
                            id="distance-filter"
                            name="distance"
                            value={filters.distance}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Distances</option>
                            {availableFilters.distances.map(distance => (
                                <option key={distance} value={distance}>
                                    {formatDistance(distance)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="region-filter">Region</label>
                        <select 
                            id="region-filter"
                            name="region"
                            value={filters.region}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Regions</option>
                            {availableFilters.regions.map(region => (
                                <option key={region} value={region}>
                                    {region}
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
                        >
                            {genderOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="ageGroup-filter">Age Group</label>
                        <select 
                            id="ageGroup-filter"
                            name="ageGroup"
                            value={filters.ageGroup}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Age Groups</option>
                            {availableFilters.ageGroups.map(ageGroup => (
                                <option key={ageGroup} value={ageGroup}>
                                    {ageGroup}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-actions">
                        <button 
                            onClick={clearFilters} 
                            className="clear-filters-btn"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
            
            {loading ? (
                <Loader />
            ) : records.length > 0 ? (
                <div className="records-container">
                    {records.map((group, index) => (
                        <div key={index} className="record-group">
                            <div className="record-group-header">
                                <h3>
                                    {formatStroke(group.stroke)} - {formatDistance(group.distance)} - {group.region}
                                </h3>
                            </div>
                            
                            <div className="record-list">
                                {group.records.map((record) => (
                                    <div key={record._id} className="record-card">
                                        <div className="record-time">
                                            {formatSwimTime(record.time)}
                                        </div>
                                        <div className="record-details">
                                            <p className="record-swimmer">{record.swimmer}</p>
                                            <p className="record-meta">
                                                <span className="record-date">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </span>
                                                <span className="record-gender">
                                                    {record.gender.charAt(0).toUpperCase() + record.gender.slice(1)}
                                                </span>
                                                <span className="record-age-group">
                                                    {record.ageGroup}
                                                </span>
                                            </p>
                                            {record.location && (
                                                <p className="record-location">{record.location}</p>
                                            )}
                                            {record.competition && (
                                                <p className="record-competition">{record.competition}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-records-message">
                    <p>No records found with the selected filters.</p>
                    <button onClick={clearFilters} className="clear-filters-btn">
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecordsPage;
