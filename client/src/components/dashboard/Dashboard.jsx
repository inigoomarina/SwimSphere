import React, { useState, useEffect, useContext, useCallback } from 'react'; // Import useCallback
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx'; // Ensure correct extension
import { fetchUserProfile, createPost, uploadMedia } from '../../utils/api'; // Import createPost and uploadMedia
import { useToast } from '../../context/ToastContext.jsx'; // Import useToast
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../common/Loader';
import PostFeed from '../posts/PostFeed'; // This component internally uses getFeedPosts
import CreatePostForm from '../posts/CreatePostForm'; // Import CreatePostForm
import Button from '../common/Button'; // Import Button for modal actions
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast(); // Get showToast function
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [swimStats, setSwimStats] = useState({
        totalSwims: 0,
        favoriteStroke: '',
        fastestTime: null,
        recentImprovement: 0
    });
    // State for Create Post Modal
    const [showCreatePostModal, setShowCreatePostModal] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedRefreshKey, setFeedRefreshKey] = useState(0); // Add refresh key for PostFeed

    // Define handleCreatePost *before* it's used in mainContent
    const handleCreatePostSubmit = useCallback(async (postData) => {
        setIsSubmitting(true);
        try {
            let mediaUrl = '';
            // Handle file upload if present
            if (postData.mediaFile) {
                try {
                    const uploadResponse = await uploadMedia(postData.mediaFile);
                    if (uploadResponse.status === 'success') {
                        mediaUrl = uploadResponse.data.url;
                    } else {
                        throw new Error(uploadResponse.message || 'Failed to upload media');
                    }
                } catch (uploadError) {
                    console.error('Media upload error:', uploadError);
                    showToast('Failed to upload media. Please try again.', 'error');
                    setIsSubmitting(false);
                    return false; // Indicate failure
                }
            }

            // Create the post
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                visibility: postData.visibility || 'public'
            });

            if (response.status === 'success') {
                showToast('Post created successfully!');
                setShowCreatePostModal(false); // Close modal on success
                
                // Trigger a refresh of the PostFeed component
                setFeedRefreshKey(prev => prev + 1);
                
                setIsSubmitting(false);
                return true; // Indicate success
            } else {
                throw new Error(response.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            showToast(error.message || 'Failed to create post', 'error');
            setIsSubmitting(false);
            return false; // Indicate failure
        }
    }, [showToast]); // Add dependencies

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
                    
                    // Use the favoriteStroke from user context if available, otherwise calculate from swim times
                    const favoriteStroke = user.favoriteStroke || Object.keys(
                        swimTimes.reduce((counts, swim) => {
                            counts[swim.stroke] = (counts[swim.stroke] || 0) + 1;
                            return counts;
                        }, {})
                    ).reduce((a, b) => 
                        (swimTimes.filter(s => s.stroke === a).length > 
                         swimTimes.filter(s => s.stroke === b).length) ? a : b, '');
                    
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
                        // Prioritize user context's favoriteStroke over calculated one
                        favoriteStroke: user.favoriteStroke || favoriteStroke,
                        fastestTime: fastestSwim,
                        recentImprovement
                    });
                } else if (user.favoriteStroke) {
                    // If no swim times but user has a favorite stroke set in their profile
                    setSwimStats(prevStats => ({
                        ...prevStats,
                        favoriteStroke: user.favoriteStroke
                    }));
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
    }, [user]); // Add user as a dependency to re-fetch when user object changes
    
    if (loading) return <Loader />;
    
    const abbreviateStroke = (stroke) => {
        if (!stroke) return '-';
        switch (stroke.toLowerCase()) {
            case 'freestyle': return 'FR';
            case 'backstroke': return 'BK';
            case 'breaststroke': return 'BR';
            case 'butterfly': return 'FL';
            case 'individualmedley': // Handle potential variations
            case 'individual medley': return 'IM';
            default: return stroke.substring(0, 2).toUpperCase(); // Fallback
        }
    };

    // Left sidebar content
    const leftSidebar = (
        <>
            {/* Profile Card */}
            <div className="sidebar-card profile-card">
                <div className="profile-card-cover">
                    <img 
                        src={user?.profileBanner || profile?.profileBanner || "/images/swimming-background.jpg"} 
                        alt="Profile Banner" 
                        className="profile-banner-img"
                    />
                </div>
                <div className="profile-card-content">
                    <img 
                        src={user?.profileImage || profile?.profileImage || "/default-avatar.png"} 
                        alt={user?.firstName || profile?.firstName || "User"} 
                        className="profile-avatar"
                    />
                    <h3 className="profile-name">
                        {user?.firstName || profile?.firstName} {user?.lastName || profile?.lastName || user?.username || profile?.username}
                    </h3>
                    <p className="profile-team">
                        {user?.swimTeam || profile?.swimTeam || 'No team'}
                    </p>
                </div>
                <div className="profile-card-stats">
                    <div className="stat">
                        <div className="stat-label">Total Swims</div>
                        <div className="stat-value">{swimStats.totalSwims}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Favorite Stroke</div>
                        <div className="stat-value">{abbreviateStroke(user?.favoriteStroke || swimStats.favoriteStroke)}</div>
                    </div>
                </div>
                <Link to="/profile" className="view-profile-link">View Profile</Link>
            </div>
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                <Link to="/dashboard" className="sidebar-nav-item active">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="nav-icon" fill="currentColor">
                        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
                    </svg>
                    Dashboard
                </Link>
                <Link to="/profile" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="nav-icon" fill="currentColor">
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                    </svg>
                    Profile
                </Link>
                <Link to="/chat" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="nav-icon" fill="currentColor">
                        <path d="M80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm160-320h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80Z"/>
                    </svg>
                    Messages
                </Link>
                <Link to="/leaderboard" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="nav-icon" fill="currentColor">
                        <path d="M80-120v-480h220v480H80Zm290 0v-720h220v720H370Zm290 0v-400h220v400H660Z"/>
                    </svg>
                    Leaderboards
                </Link>
                <Link to="/records" className="sidebar-nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="nav-icon" fill="currentColor">
                        <path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm400 0q36-13 58-43.5t22-68.5v-40h-80v152Z"/>
                    </svg>
                    Records
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
            
            {/* Clickable "What's on your mind" input to open modal */}
            <div className="create-post-card">
                <div className="create-post-header">
                    <img 
                        src={user?.profileImage || "/default-avatar.png"} 
                        alt="Your Profile" 
                        className="post-user-avatar"
                    />
                    {/* Make the wrapper clickable */}
                    <div 
                        className="create-post-input-wrapper" 
                        onClick={() => setShowCreatePostModal(true)} // Open modal on click
                    >
                        {/* Use a div styled like the input, or keep input readOnly */}
                        <div className="create-post-textfield"> 
                           What's on your mind?
                        </div>
                    </div>
                </div>
            </div>
            
            <PostFeed 
                showCreatePost={false} // Keep this false as modal handles creation
                key={`dashboard-feed-${feedRefreshKey}`} // Use key with refresh value to force re-render
                forceRefresh={feedRefreshKey} // Pass refresh trigger as prop
            />
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
                </div>
            </div>
        </>
    );

    return (
        <>
            <DashboardLayout
                leftSidebar={leftSidebar}
                mainContent={mainContent}
                rightSidebar={rightSidebar}
            />
            
            {/* Create Post Modal */}
            {showCreatePostModal && (
                <div className="modal-overlay" onClick={() => setShowCreatePostModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {/* Use CreatePostForm inside the modal */}
                        <CreatePostForm 
                            onSubmit={handleCreatePostSubmit} 
                            onCancel={() => setShowCreatePostModal(false)} // Pass cancel handler
                            loading={isSubmitting} // Pass loading state
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;