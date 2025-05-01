import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../utils/api';
import { formatSwimTime } from '../utils/helpers';
import Loader from '../components/common/Loader';
import AnimatedPage from '../components/animation/AnimatedPage';
import FadeIn from '../components/animation/FadeIn';
import './LeaderboardPage.css'; // Make sure the CSS is imported

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        stroke: '',
        distance: ''
    });
    const [availableFilters, setAvailableFilters] = useState({
        strokes: [],
        distances: []
    });

    // Fetch leaderboard data on initial load and when filters change
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getLeaderboard(filters);
                
                if (response.status === 'success') {
                    setLeaderboardData(response.data.leaderboard);
                    setAvailableFilters(response.data.filters);
                } else {
                    setError('Failed to retrieve leaderboard data');
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err.message || 'An error occurred while fetching leaderboard data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [filters]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            stroke: '',
            distance: ''
        });
    };

    // Format stroke name for display
    const formatStroke = (stroke) => {
        return stroke.charAt(0).toUpperCase() + stroke.slice(1);
    };
    
    // Format distance for display
    const formatDistance = (distance) => {
        return `${distance}m`;
    };

    // Get medal class based on position
    const getMedalClass = (position) => {
        if (position === 0) return 'bg-yellow-100 border-yellow-300';
        if (position === 1) return 'bg-gray-100 border-gray-300';
        if (position === 2) return 'bg-orange-100 border-orange-300';
        return '';
    };

    // Get medal emoji based on position
    const getMedalEmoji = (position) => {
        if (position === 0) return '🥇';
        if (position === 1) return '🥈';
        if (position === 2) return '🥉';
        return '';
    };

    // Render leaderboard entries by category
    const renderLeaderboardCategories = () => {
        if (leaderboardData.length === 0) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 text-center bg-white rounded-lg shadow-sm"
                >
                    <p className="text-gray-600 italic mb-4">No leaderboard entries match your filters.</p>
                    {(filters.stroke || filters.distance) && (
                        <button 
                            onClick={clearFilters} 
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </motion.div>
            );
        }

        return leaderboardData.map((category, categoryIndex) => (
            <FadeIn key={`${category.stroke}-${category.distance}`} delay={categoryIndex * 0.1} className="mb-10">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-primary text-white p-4">
                        <h3 className="text-xl font-semibold">
                            {formatStroke(category.stroke)} - {formatDistance(category.distance)}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider w-16">Rank</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Swimmer</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider w-28">Time</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider w-28">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {category.entries.map((entry, position) => (
                                    <motion.tr 
                                        key={entry._id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + position * 0.05 }}
                                        className={`${getMedalClass(position)}`}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-center font-bold">
                                            {position + 1} {position < 3 && (
                                                <span className="ml-1 text-lg">{getMedalEmoji(position)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Link to={`/profile/${entry.userId._id}`} className="flex items-center hover:text-primary transition-colors">
                                                <img 
                                                    src={entry.userId.profileImage || '/default-avatar.png'} 
                                                    alt={entry.userId.username}
                                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                                />
                                                <span className="font-medium">
                                                    {entry.userId.firstName && entry.userId.lastName 
                                                        ? `${entry.userId.firstName} ${entry.userId.lastName}`
                                                        : entry.userId.username
                                                    }
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-primary font-bold">
                                            {formatSwimTime(entry.time)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                            {entry.location || '-'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </FadeIn>
        ));
    };

    return (
        <AnimatedPage className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">SwimSphere Leaderboards</h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
                Compare your best times with other swimmers around the world.
                Each swimmer's personal best time is displayed for each stroke and distance combination.
            </p>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )}
            
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-lg shadow-sm mb-8"
            >
                <h3 className="text-lg font-semibold mb-4">Filter Leaderboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="stroke-filter" className="block text-gray-700 mb-1">Stroke</label>
                        <select 
                            id="stroke-filter"
                            name="stroke"
                            value={filters.stroke}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                        >
                            <option value="">All Strokes</option>
                            {availableFilters.strokes.map(stroke => (
                                <option key={stroke} value={stroke}>
                                    {formatStroke(stroke)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="distance-filter" className="block text-gray-700 mb-1">Distance</label>
                        <select 
                            id="distance-filter"
                            name="distance"
                            value={filters.distance}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                        >
                            <option value="">All Distances</option>
                            {availableFilters.distances.map(distance => (
                                <option key={distance} value={distance}>
                                    {formatDistance(distance)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <button 
                            className="bg-gray-200 hover:bg-gray-300 w-full md:w-auto px-4 py-2 rounded-md transition-colors"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </motion.div>
            
            <div className="space-y-6">
                {loading ? <Loader /> : renderLeaderboardCategories()}
            </div>
        </AnimatedPage>
    );
};

export default LeaderboardPage;