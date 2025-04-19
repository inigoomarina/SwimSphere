import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserProfile } from '../../utils/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../common/Loader';
import PostFeed from '../posts/PostFeed';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [swimStats, setSwimStats] = useState({
        totalSwims: 0,
        favoriteStroke: '',
        fastestTime: null,
        recentImprovement: 0
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch user profile data
                const profileResponse = await fetchUserProfile();
                setProfile(profileResponse.data);
                
                // Process swim times data
                if (profileResponse.data.swimTimes && profileResponse.data.swimTimes.length > 0) {
                    const swimTimes = profileResponse.data.swimTimes;
                    
                    // Calculate total swims
                    const totalSwims = swimTimes.length;
                    
                    // Find favorite stroke (most frequently used)
                    const strokeCounts = swimTimes.reduce((counts, swim) => {
                        counts[swim.stroke] = (counts[swim.stroke] || 0) + 1;
                        return counts;
                    }, {});
                    const favoriteStroke = Object.keys(strokeCounts).reduce((a, b) => 
                        strokeCounts[a] > strokeCounts[b] ? a : b);
                    
                    // Find fastest time
                    const fastestSwim = swimTimes.reduce((fastest, swim) => 
                        !fastest || swim.time < fastest.time ? swim : fastest, null);
                    
                    // Check for recent improvement
                    let recentImprovement = 0;
                    if (swimTimes.length >= 2) {
                        // Group by stroke and distance
                        const groupedSwims = swimTimes.reduce((groups, swim) => {
                            const key = `${swim.stroke}-${swim.distance}`;
                            if (!groups[key]) groups[key] = [];
                            groups[key].push(swim);
                            return groups;
                        }, {});
                        
                        // For each group, check if there's improvement
                        Object.values(groupedSwims).forEach(group => {
                            if (group.length >= 2) {
                                // Sort by date, ascending
                                group.sort((a, b) => new Date(a.date) - new Date(b.date));
                                const first = group[0].time;
                                const last = group[group.length - 1].time;
                                if (last < first) {
                                    const improvement = ((first - last) / first) * 100;
                                    if (improvement > recentImprovement) {
                                        recentImprovement = improvement;
                                    }
                                }
                            }
                        });
                    }
                    
                    setSwimStats({
                        totalSwims,
                        favoriteStroke,
                        fastestTime: fastestSwim,
                        recentImprovement
                    });
                }
                
                setError('');
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        loadDashboardData();
    }, []);
    
    // Format time in seconds to mm:ss.ms format
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '-';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    if (loading) return <Loader />;
    
    // Left sidebar content
    const leftSidebar = (
        <>
            {/* Profile Card */}
            <div className="sidebar-card profile-card">
                <div className="profile-card-cover"></div>
                <div className="profile-card-content">
                    <img 
                        src={profile?.profileImage || "/default-avatar.png"} 
                        alt={profile?.firstName || "User"} 
                        className="profile-avatar"
                    />
                    <h3 className="profile-name">
                        {profile?.firstName} {profile?.lastName || profile?.username}
                    </h3>
                    <p className="profile-tagline">
                        {profile?.bio || `Swimmer${profile?.swimTeam ? ` at ${profile?.swimTeam}` : ''}`}
                    </p>
                </div>
                <div className="profile-card-stats">
                    <div className="stat">
                        <div className="stat-label">Total Swims</div>
                        <div className="stat-value">{swimStats.totalSwims}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Favorite Stroke</div>
                        <div className="stat-value">{swimStats.favoriteStroke ? swimStats.favoriteStroke.charAt(0).toUpperCase() + swimStats.favoriteStroke.slice(1) : '-'}</div>
                    </div>
                </div>
                <Link to="/profile" className="view-profile-link">View Full Profile</Link>
            </div>
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                <Link to="/dashboard" className="sidebar-nav-item active">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Dashboard
                </Link>
                <Link to="/feed" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                        <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                    </svg>
                    Feed
                </Link>
                <Link to="/leaderboard" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Leaderboards
                </Link>
                <Link to="/records" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                    </svg>
                    Records
                </Link>
                <Link to="/profile" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Profile
                </Link>
                <Link to="/chat" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    Messages
                </Link>
                {user?.role === 'coach' && (
                    <Link to="/coach" className="sidebar-nav-item">
                        <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Coach Dashboard
                    </Link>
                )}
            </nav>
        </>
    );
    
    // Main content
    const mainContent = (
        <>
            {error && <div className="error-message">{error}</div>}
            
            <PostFeed showCreatePost={true} />
        </>
    );
    
    // Right sidebar content
    const rightSidebar = (
        <>
            {/* Upcoming Events */}
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">Upcoming Events</h3>
                <div className="events-list">
                    <div className="event-item">
                        <div className="event-date">
                            <div className="event-month">Jul</div>
                            <div className="event-day">15</div>
                        </div>
                        <div className="event-details">
                            <h4>City Swim Championships</h4>
                            <p>Aquatic Center, Downtown</p>
                        </div>
                    </div>
                    
                    <div className="event-item">
                        <div className="event-date">
                            <div className="event-month">Aug</div>
                            <div className="event-day">03</div>
                        </div>
                        <div className="event-details">
                            <h4>Summer Open Water Challenge</h4>
                            <p>Lake View Park</p>
                        </div>
                    </div>
                </div>
                <Link to="/events" className="view-all-link">View All Events</Link>
            </div>
            
            {/* Active Challenges */}
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">Active Challenges</h3>
                <div className="challenges-list">
                    <div className="challenge-item">
                        <div className="challenge-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="challenge-details">
                            <h4>50m Freestyle Sprint</h4>
                            <div className="challenge-progress">
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: '75%' }}></div>
                                </div>
                                <span>75% Complete</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* More challenge items can be added here */}
                </div>
                <Link to="/challenges" className="view-all-link">View All Challenges</Link>
            </div>
            
            {/* Swimmer Suggestions */}
            <div className="sidebar-card">
                <h3 className="sidebar-card-title">Swimmers You May Know</h3>
                <div className="swimmers-list">
                    <div className="swimmer-suggestion">
                        <img src="/placeholder-avatar-1.png" alt="Swimmer" className="swimmer-avatar" />
                        <div className="swimmer-info">
                            <h4>Michael Johnson</h4>
                            <p>City Swim Club</p>
                        </div>
                        <button className="follow-button">Follow</button>
                    </div>
                    
                    {/* More swimmer suggestions can be added here */}
                </div>
            </div>
        </>
    );

    return (
        <DashboardLayout
            leftSidebar={leftSidebar}
            mainContent={mainContent}
            rightSidebar={rightSidebar}
        />
    );
};

export default Dashboard;