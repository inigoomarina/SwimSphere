import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom'; // Add this import
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchUserProfile, updateUserProfile, addSwimTime, createPost, uploadMedia, getUserPosts, toggleFollowUser } from '../utils/api';
import { formatDate, formatSwimTime } from '../utils/helpers';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PerformanceChart from '../components/charts/PerformanceChart';
import { FaInstagram, FaTwitter, FaShareAlt, FaEnvelope, FaEdit, FaCamera, FaPlus, FaTrophy, FaCalendarAlt, 
         FaMedal, FaChartLine, FaEllipsisH, FaSwimmer, FaStopwatch, FaAward, FaUsers } from 'react-icons/fa';
import PostCard from '../components/posts/PostCard';
import ImageCropper from '../components/common/ImageCropper';
import { Datepicker } from "flowbite-react";
import dayjs from 'dayjs';
import ActionButton from '../components/common/ActionButton';
import TimeInput from '../components/common/TimeInput';
import PostFeed from '../components/posts/PostFeed';
import CreatePostForm from '../components/posts/CreatePostForm';
import './ProfilePage.css';

const PostsTab = () => {
    const { user } = useContext(AuthContext);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { showToast } = useToast();
    
    const handlePostSubmit = async (postData) => {
        try {
            let mediaUrl = '';
            
            if (postData.mediaFile) {
                const uploadResponse = await uploadMedia(postData.mediaFile);
                if (uploadResponse.status === 'success') {
                    mediaUrl = uploadResponse.data.url;
                }
            }
            
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                visibility: postData.visibility || 'public'
            });
            
            if (response.status === 'success') {
                showToast('Post created successfully!');
                setShowCreateForm(false);
                return true;
            } else {
                throw new Error(response.message || "Failed to create post");
            }
        } catch (err) {
            console.error('Error creating post:', err);
            showToast('Failed to create post', 'error');
            return false;
        }
    };
    
    return (
        <div className="posts-tab-content">
            <div className="posts-header">
                <h3>Posts</h3>
                <Button onClick={() => setShowCreateForm(true)} className="create-post-btn">
                    <FaPlus /> Create Post
                </Button>
            </div>
            
            {showCreateForm && (
                <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Create New Post</h3>
                        <CreatePostForm 
                            onSubmit={handlePostSubmit}
                            closeForm={() => setShowCreateForm(false)}
                        />
                    </div>
                </div>
            )}
            
            <PostFeed 
                userId={user?.id} 
                userFeed={true}
                showCreatePost={false}
            />
        </div>
    );
};

const TimesTab = ({ swimTimes = [], onTimeClick }) => {
    const [activeSection, setActiveSection] = useState('meets');
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [showAddMeetForm, setShowAddMeetForm] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        date: formatDate(new Date()),
        stroke: 'freestyle',
        distance: 50,
        time: '',
        location: '',
        competition: '',
    });
    
    const [meetFormData, setMeetFormData] = useState({
        name: '',
        date: formatDate(new Date()),
        location: '',
        description: '',
    });
    
    const [meets, setMeets] = useState([
        {
            id: 'm1',
            name: 'Regional Championship',
            date: '2023-12-10',
            location: 'City Aquatic Center',
            description: 'Annual regional championship meet.'
        },
        {
            id: 'm2',
            name: 'University Invitational',
            date: '2023-11-15',
            location: 'University Pool',
            description: 'Invitational meet with 5 universities participating.'
        }
    ]);
    
    const bestTimes = useMemo(() => {
        if (!swimTimes || swimTimes.length === 0) {
            return [
                { event: '50m Freestyle', time: '23.45', date: '2023-11-15' },
                { event: '100m Freestyle', time: '52.10', date: '2023-11-20' },
                { event: '100m Butterfly', time: '58.75', date: '2023-10-05' }
            ];
        }
        
        const groupedTimes = swimTimes.reduce((groups, time) => {
            const event = `${time.distance}m ${time.stroke}`;
            if (!groups[event]) {
                groups[event] = [];
            }
            groups[event].push(time);
            return groups;
        }, {});
        
        return Object.entries(groupedTimes).map(([event, times]) => {
            const bestTime = times.reduce((best, current) => 
                current.time < best.time ? current : best, times[0]);
            
            return {
                event,
                time: formatSwimTime(bestTime.time),
                rawTime: bestTime.time,
                date: bestTime.date,
                location: bestTime.location,
                competition: bestTime.competition
            };
        }).sort((a, b) => a.rawTime - b.rawTime);
    }, [swimTimes]);
    
    const availableEvents = [...new Set(swimTimes?.map(t => `${t.distance}m ${t.stroke}`) || [])];
    
    const formatTimeInput = (input) => {
        // Handle non-string inputs
        if (input === null || input === undefined) {
            return '';
        }
        
        // Convert to string if it's not already
        if (typeof input !== 'string') {
            input = String(input);
        }
        
        input = input.replace(/[^\d:.]/g, ''); // Allow decimal points
        if (input.includes(':')) {
            const [minutes, seconds] = input.split(':');
            const formattedMinutes = minutes ? minutes.slice(0, 2) : '0';
            let formattedSeconds = seconds || '00';
            
            if (seconds && seconds.includes('.')) {
                const [secs, tenths] = seconds.split('.');
                formattedSeconds = `${secs ? secs.slice(0, 2) : '00'}.${tenths ? tenths.slice(0, 2) : '00'}`;
            } else if (seconds) {
                formattedSeconds = seconds.slice(0, 2);
            }
            
            return `${formattedMinutes}:${formattedSeconds}`;
        }
        return input;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'time') {
            setFormData(prev => ({ ...prev, [name]: formatTimeInput(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleMeetFormChange = (e) => {
        const { name, value } = e.target;
        setMeetFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmitTime = async (e) => {
        e.preventDefault();
        
        try {
            const timeParts = formData.time.split(':');
            let seconds = 0;
            if (timeParts.length === 2) {
                seconds = parseFloat(timeParts[0]) * 60 + parseFloat(timeParts[1]);
            } else {
                seconds = parseFloat(formData.time);
            }
            
            const timeData = {
                stroke: formData.stroke,
                distance: parseInt(formData.distance),
                time: seconds,
                date: formData.date,
                location: formData.location,
                notes: formData.competition
            };
            
            const response = await addSwimTime(timeData);
            
            if (response.status === 'success') {
                const newSwimTime = {
                    ...timeData,
                    _id: response.data._id || Date.now().toString()
                };
                
                setShowSubmitForm(false);
                setFormData({
                    date: formatDate(new Date()),
                    stroke: 'freestyle',
                    distance: 50,
                    time: '',
                    location: '',
                    competition: '',
                });
                
                showToast("Time added successfully!");
                
                if (onTimeClick) {
                    onTimeClick(newSwimTime);
                }
            } else {
                showToast("Failed to add time. Please try again.", "error");
            }
        } catch (err) {
            console.error("Error adding swim time:", err);
            showToast("Error adding time. Please try again.", "error");
        }
    };
    
    const handleSubmitMeet = (e) => {
        e.preventDefault();
        
        const newMeet = {
            id: `m${meets.length + 1}`,
            ...meetFormData
        };
        
        setMeets(prev => [newMeet, ...prev]);
        setShowAddMeetForm(false);
        showToast("Meet added successfully!");
        
        setMeetFormData({
            name: '',
            date: formatDate(new Date()),
            location: '',
            description: '',
        });
    };
    
    const handleTimeSelection = (time) => {
        setSelectedTime(time);
        if(onTimeClick) onTimeClick(time);
    };
    
    const handleEventSelection = (event) => {
        setSelectedEvent(event);
    };
    
    const toggleCardExpansion = (index) => {
        setExpandedCard(expandedCard === index ? null : index);
    };
    
    return (
        <div className="times-tab-content">
            <div className="times-sections-nav">
                <button 
                    className={`section-btn ${activeSection === 'meets' ? 'active' : ''}`}
                    onClick={() => setActiveSection('meets')}
                >
                    <FaCalendarAlt /> Meets
                </button>
                <button 
                    className={`section-btn ${activeSection === 'best-times' ? 'active' : ''}`}
                    onClick={() => setActiveSection('best-times')}
                >
                    <FaMedal /> Best Times
                </button>
                <button 
                    className={`section-btn ${activeSection === 'progression' ? 'active' : ''}`}
                    onClick={() => setActiveSection('progression')}
                >
                    <FaChartLine /> Progression
                </button>
            </div>
            
            {activeSection === 'meets' && (
                <div className="meets-section">
                    <div className="section-header">
                        <h3>Swim Meets</h3>
                        <Button onClick={() => setShowAddMeetForm(true)} className="add-btn">
                            <FaPlus /> Add Meet
                        </Button>
                    </div>
                    
                    {showAddMeetForm && (
                        <div className="modal-overlay" onClick={() => setShowAddMeetForm(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <h3>Add New Meet</h3>
                                <form onSubmit={handleSubmitMeet}>
                                    <div className="form-group">
                                        <label htmlFor="meet-name">Meet Name</label>
                                        <input 
                                            type="text"
                                            id="meet-name"
                                            name="name"
                                            value={meetFormData.name}
                                            onChange={handleMeetFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="meet-date">Date</label>
                                        <Datepicker
                                            value={meetFormData.date ? new Date(meetFormData.date) : new Date()}
                                            onSelectedDateChanged={(date) => 
                                                setMeetFormData(prev => ({ 
                                                    ...prev, 
                                                    date: formatDate(date)
                                                }))
                                            }
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="meet-location">Location</label>
                                        <input 
                                            type="text"
                                            id="meet-location"
                                            name="location"
                                            value={meetFormData.location}
                                            onChange={handleMeetFormChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="meet-description">Description</label>
                                        <textarea
                                            id="meet-description"
                                            name="description"
                                            value={meetFormData.description}
                                            onChange={handleMeetFormChange}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="modal-actions">
                                        <Button type="button" onClick={() => setShowAddMeetForm(false)} className="cancel-btn">Cancel</Button>
                                        <Button type="submit" className="add-btn">
                                            <FaPlus /> Add Meet
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    
                    <div className="meets-grid">
                        {meets.map((meet) => (
                            <div key={meet.id} className="meet-card">
                                <h4>{meet.name}</h4>
                                <div className="meet-info">
                                    <div className="meet-date"><strong>Date:</strong> {new Date(meet.date).toLocaleDateString()}</div>
                                    <div className="meet-location"><strong>Location:</strong> {meet.location}</div>
                                    {meet.description && <div className="meet-description">{meet.description}</div>}
                                </div>
                            </div>
                        ))}
                        {meets.length === 0 && <p className="empty-state-message">No meets added yet.</p>}
                    </div>
                </div>
            )}
            
            {activeSection === 'best-times' && (
                <div className="best-times-section">
                    <div className="section-header">
                        <h3>Best Times</h3>
                        <ActionButton 
                            icon={<FaPlus />} 
                            onClick={() => setShowSubmitForm(true)} 
                            className="add-btn"
                        >
                            Add Time
                        </ActionButton>
                    </div>
                    
                    {showSubmitForm && (
                        <div className="modal-overlay" onClick={() => setShowSubmitForm(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <h3>Add New Time</h3>
                                <form onSubmit={handleSubmitTime}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="date">Date</label>
                                            <Datepicker
                                                value={formData.date ? new Date(formData.date) : new Date()}
                                                onSelectedDateChanged={(date) => 
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        date: formatDate(date)
                                                    }))
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="stroke">Stroke</label>
                                            <select
                                                id="stroke"
                                                name="stroke"
                                                value={formData.stroke}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="freestyle">Freestyle</option>
                                                <option value="backstroke">Backstroke</option>
                                                <option value="breaststroke">Breaststroke</option>
                                                <option value="butterfly">Butterfly</option>
                                                <option value="individualMedley">Individual Medley</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="distance">Distance (m)</label>
                                            <select
                                                id="distance"
                                                name="distance"
                                                value={formData.distance}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="50">50m</option>
                                                <option value="100">100m</option>
                                                <option value="200">200m</option>
                                                <option value="400">400m</option>
                                                <option value="1500">1500m</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="time">Time (mm:ss.ms)</label>
                                            <TimeInput
                                                id="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="location">Location</label>
                                            <input 
                                                type="text"
                                                id="location"
                                                name="location"
                                                placeholder="Pool or venue name"
                                                value={formData.location}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="competition">Meet/Competition</label>
                                            <input
                                                type="text"
                                                id="competition"
                                                name="competition"
                                                placeholder="Optional"
                                                value={formData.competition}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="modal-actions">
                                        <Button type="button" onClick={() => setShowSubmitForm(false)} className="cancel-btn">Cancel</Button>
                                        <Button type="submit" className="add-btn">
                                            <FaPlus /> Add Time
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    
                    <div className="best-times-grid">
                        {bestTimes.length > 0 ? (
                            bestTimes.map((record, index) => (
                                <div 
                                    key={index} 
                                    className={`best-time-card ${expandedCard === index ? 'expanded' : ''}`}
                                    onClick={() => toggleCardExpansion(index)}
                                >
                                    <div className="best-time-card-header">
                                        <div className="event-name">{record.event}</div>
                                        <div className="best-time">{record.time}</div>
                                    </div>
                                    <div className="best-time-card-details">
                                        <div className="time-date"><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</div>
                                        {record.location && <div className="time-location"><strong>Location:</strong> {record.location}</div>}
                                        {record.competition && <div className="time-competition"><strong>Competition:</strong> {record.competition}</div>}
                                        <Button 
                                            className="view-details-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEventSelection(`${record.event}`);
                                                setActiveSection('progression');
                                            }}
                                        >
                                            <FaChartLine /> View Progression
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state-message">No best times recorded yet.</p>
                        )}
                    </div>
                </div>
            )}
            
            {activeSection === 'progression' && (
                <div className="progression-section">
                    <div className="section-header">
                        <h3>Time Progression</h3>
                        <div className="event-selector">
                            <label htmlFor="event-select">Select Event:</label>
                            <select 
                                id="event-select"
                                value={selectedEvent || ''}
                                onChange={(e) => handleEventSelection(e.target.value)}
                            >
                                <option value="">Select an event</option>
                                {availableEvents.map(event => (
                                    <option key={event} value={event}>{event}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {selectedEvent ? (
                        <div className="event-progression">
                            <div className="time-progression">
                                <h4>{selectedEvent} Progression</h4>
                                <div className="chart-container">
                                    <PerformanceChart event={selectedEvent} />
                                </div>
                            </div>
                            
                            <div className="times-list-container">
                                <h4>All Times</h4>
                                {swimTimes && swimTimes.filter(time => `${time.distance}m ${time.stroke}` === selectedEvent).length > 0 ? (
                                    <ul className="times-list">
                                        {swimTimes
                                            .filter(time => `${time.distance}m ${time.stroke}` === selectedEvent)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((time, index) => (
                                                <li 
                                                    key={index} 
                                                    onClick={() => handleTimeSelection(time)}
                                                    className={selectedTime === time ? 'selected' : ''}
                                                >
                                                    <span>{new Date(time.date).toLocaleDateString()}</span>
                                                    <span>{time.location || 'N/A'}</span>
                                                    <span><strong>{formatSwimTime(time.time)}</strong></span>
                                                    <span>{time.competition || '-'}</span>
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <p className="empty-state-message">No times recorded for this event.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="select-event-prompt">
                            <p>Select an event to see your time progression</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ChallengesTab = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: dayjs(),
        endDate: dayjs().add(7, 'day'),
    });
    const { showToast } = useToast();
    
    const challenges = [
        {
            id: 'c1',
            title: '30-Day Swim Challenge',
            description: 'Swim at least 1000m every day for 30 days',
            creator: {
                id: 'u1',
                name: 'Coach Thompson',
                profileImage: '/default-avatar.png'
            },
            status: 'completed',
            completedDate: '2023-10-15'
        },
        {
            id: 'c2',
            title: 'Butterfly Improvement',
            description: 'Improve your 100m butterfly time by 5% in two weeks',
            creator: {
                id: 'u2',
                name: 'Sarah Williams',
                profileImage: '/default-avatar.png'
            },
            status: 'completed',
            completedDate: '2023-11-05'
        }
    ];
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCreateChallenge = (e) => {
        e.preventDefault();
        console.log("Creating challenge:", formData);
        showToast("Challenge created successfully!");
        setShowCreateForm(false);
    };
    
    return (
        <div className="challenges-tab-content">
            <div className="challenges-header">
                <h3>Challenges</h3>
                <Button onClick={() => setShowCreateForm(true)} className="create-challenge-btn">
                    <FaTrophy /> Create Challenge
                </Button>
            </div>
            
            {showCreateForm && (
                <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Create New Challenge</h3>
                        <form onSubmit={handleCreateChallenge}>
                            <div className="form-group">
                                <label htmlFor="title">Challenge Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="E.g., 30-Day Swim Marathon"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your challenge..."
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date</label>
                                    <Datepicker
                                        value={formData.startDate ? new Date(formData.startDate) : new Date()}
                                        onSelectedDateChanged={(date) => 
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                startDate: date
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endDate">End Date</label>
                                    <Datepicker
                                        value={formData.endDate ? new Date(formData.endDate) : new Date()}
                                        onSelectedDateChanged={(date) => 
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                endDate: date
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <Button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">Cancel</Button>
                                <Button type="submit">Create Challenge</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <div className="challenges-grid">
                {challenges.map(challenge => (
                    <div key={challenge.id} className="challenge-card">
                        <div className="challenge-header">
                            <div className="challenge-creator">
                                <img src={challenge.creator.profileImage} alt={challenge.creator.name} />
                                <span>{challenge.creator.name}</span>
                            </div>
                            <div className="challenge-status completed">Completed</div>
                        </div>
                        <div className="challenge-content">
                            <h4>{challenge.title}</h4>
                            <p>{challenge.description}</p>
                        </div>
                        <div className="challenge-footer">
                            <span className="completed-date">Completed on: {new Date(challenge.completedDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {challenges.length === 0 && (
                    <p className="empty-state-message">No challenges completed yet. Join or create a challenge to get started!</p>
                )}
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { user, login } = useContext(AuthContext);
    const { showToast } = useToast();
    const history = useHistory(); // Initialize the history object
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [highlightsEditing, setHighlightsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [croppingImage, setCroppingImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [cropTarget, setCropTarget] = useState(''); // 'profile' or 'banner'
    const [showBannerOptions, setShowBannerOptions] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        swimTeam: '',
        location: '',
        favoriteStroke: '',
        favoriteEvent: '',
    });
    const [activeTab, setActiveTab] = useState('posts');
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const stats = {
        posts: 15,
    };

    const socialLinks = {
        instagram: 'https://instagram.com/example',
        twitter: 'https://twitter.com/example'
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await fetchUserProfile();
                console.log("Profile data:", response.data);
                setProfile(response.data);
                setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    bio: response.data.bio || '',
                    swimTeam: response.data.swimTeam || '',
                    location: response.data.location || 'City, Country',
                    favoriteStroke: response.data.favoriteStroke || '',
                    favoriteEvent: response.data.favoriteEvent || '',
                });
                setError('');
            } catch (err) {
                console.error("Error loading profile:", err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        const getFollowCounts = async () => {
            try {
                const response = await fetch(`/api/follow/counts/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const data = await response.json();
                if (data.status === 'success') {
                    setFollowersCount(data.data.followers);
                    setFollowingCount(data.data.following);
                    setIsFollowing(data.data.isFollowing);
                }
            } catch (err) {
                console.error("Error fetching follow counts:", err);
            }
        };

        loadProfile();
        getFollowCounts();
    }, [user.id]);

    const handleEditToggle = () => {
        setEditing(!editing);
        if (editing && profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                bio: profile.bio || '',
                swimTeam: profile.swimTeam || '',
                location: profile.location || 'City, Country',
                favoriteStroke: profile.favoriteStroke || '',
                favoriteEvent: profile.favoriteEvent || '',
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            console.log("Updating profile with data:", formData);
            const response = await updateUserProfile(formData);
            
            if (response.status === 'success') {
                setProfile(prevProfile => ({
                    ...prevProfile,
                    ...formData
                }));

                if (login) {
                    login({
                        ...user,
                        ...formData
                    });
                }

                setEditing(false);
                setHighlightsEditing(false);
                setError('');
                
                showToast("Profile updated successfully!");
            } else {
                throw new Error(response.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError('Failed to update profile');
            showToast("Failed to update profile. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeClick = (time) => {
        console.log("Selected time:", time);
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            setCroppingImage(reader.result);
            setCropTarget('banner');  
            setShowImageCropper(true);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
            // Hide banner options menu after selecting a file
            setShowBannerOptions(false);
        };
        reader.readAsDataURL(file);
    };

    const handleProfilePictureUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            setCroppingImage(reader.result);
            setCropTarget('profile');
            setShowImageCropper(true);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async () => {
        if (!croppedImage) return;
        
        try {
            setLoading(true);
            
            // Convert base64 data URL to Blob for upload
            const fetchRes = await fetch(croppedImage);
            const blob = await fetchRes.blob();
            
            // Create a File object from the Blob
            const file = new File([blob], 
                cropTarget === 'profile' ? 'profile-image.jpg' : 'banner-image.jpg', 
                { type: 'image/jpeg' }
            );
            
            // Upload the image
            const uploadResponse = await uploadMedia(file);
            
            if (!uploadResponse || uploadResponse.status !== 'success') {
                throw new Error(uploadResponse?.message || "Failed to upload image");
            }
            
            const imageUrl = uploadResponse.data.url;
            
            // Create update data with the new image URL
            const updateData = {};
            if (cropTarget === 'profile') {
                updateData.profileImage = imageUrl;
            } else {
                updateData.profileBanner = imageUrl;
            }
            
            // Update user profile with the new image URL
            const updateResponse = await updateUserProfile(updateData);
            
            if (!updateResponse || updateResponse.status !== 'success') {
                throw new Error(updateResponse?.message || "Failed to update profile");
            }
            
            // Update local state with new image URL
            setProfile(prev => ({ ...prev, ...updateData }));
            
            // Update user context if available (for profile images)
            if (login && cropTarget === 'profile') {
                login({
                    ...user,
                    profileImage: imageUrl
                });
            }
            
            // Show success message
            showToast(
                cropTarget === 'profile' 
                    ? "Profile picture updated successfully!" 
                    : "Banner updated successfully!"
            );
            
            // Close modal and reset state
            setShowImageCropper(false);
            setCroppingImage(null);
            setCroppedImage(null);
            
            // Re-enable scrolling on body
            document.body.style.overflow = 'auto';
            
        } catch (err) {
            console.error("Image upload error:", err);
            showToast("Failed to update image. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelCrop = () => {
        setShowImageCropper(false);
        setCroppingImage(null);
        setCroppedImage(null);
        // Re-enable scrolling on body
        document.body.style.overflow = 'auto';
    };

    const toggleHighlightsEditing = () => {
        setHighlightsEditing(!highlightsEditing);
        if (highlightsEditing && profile) {
            setFormData(prev => ({
                ...prev,
                favoriteStroke: profile.favoriteStroke || '',
                favoriteEvent: profile.favoriteEvent || ''
            }));
        }
    };

    const getFavoriteEventBestTime = () => {
        if (!profile || !profile.favoriteEvent || !profile.swimTimes || profile.swimTimes.length === 0) {
            return null;
        }
        
        const parts = profile.favoriteEvent.split('m ');
        if (parts.length !== 2) return null;
        
        const distance = parseInt(parts[0]);
        const stroke = parts[1].toLowerCase();
        
        const eventTimes = profile.swimTimes.filter(time => 
            time.distance === distance && time.stroke.toLowerCase() === stroke
        );
        
        if (eventTimes.length === 0) return null;
        
        return eventTimes.reduce((best, time) => 
            time.time < best.time ? time : best, eventTimes[0]
        );
    };

    const favoriteEventBestTime = getFavoriteEventBestTime();

    const handleToggleFollow = async () => {
        if (isFollowLoading) return;
        
        try {
            setIsFollowLoading(true);
            const response = await toggleFollowUser(profile.id);
            
            if (response.status === 'success') {
                // Update follow status
                setIsFollowing(!isFollowing);
                
                // Update followers count
                setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
            showToast("Failed to update follow status", "error");
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (loading && !profile) return <Loader />;

    return (
        <div className="profile-page-v2">
            {error && <div className="error-message">{error}</div>}

            {profile && (
                <>
                    <div className="profile-banner">
                        <img 
                            src={profile.profileBanner || "/images/swimming-background.jpg"} 
                            alt="Profile Banner" 
                        />
                        <div className="banner-options">
                            <button 
                                className="banner-options-btn" 
                                onClick={() => setShowBannerOptions(!showBannerOptions)} 
                                aria-label="Banner options"
                            >
                                <FaEllipsisH />
                            </button>
                            {showBannerOptions && (
                                <div className="banner-options-menu">
                                    <button onClick={() => bannerInputRef.current.click()}>
                                        <FaCamera /> Change Banner
                                    </button>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="profile-header-container">
                        <div className="profile-header-v2">
                            <div className="profile-picture-section">
                                <div className="profile-picture-container">
                                    <img
                                        src={profile.profileImage || '/images/default-avatar.png'}
                                        alt={`${profile.firstName || ''} ${profile.lastName || ''}`}
                                        className="profile-picture-v2"
                                    />
                                    <div className="profile-picture-edit-overlay">
                                        <button 
                                            className="edit-picture-btn" 
                                            onClick={() => fileInputRef.current.click()}
                                            aria-label="Change profile picture"
                                        >
                                            <FaCamera />
                                        </button>
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleProfilePictureUpload}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-info-section">
                                <div className="profile-name-location">
                                    <h1>{profile.firstName} {profile.lastName}</h1>
                                    <p className="location">{formData.location}</p>
                                    <p className="team">{profile.swimTeam || 'No Team Specified'}</p>
                                </div>
                                <div className="profile-stats-v2">
                                    <span><strong>{stats.posts}</strong> Posts</span>
                                    <span><strong>{followersCount}</strong> Followers</span>
                                    <span><strong>{followingCount}</strong> Following</span>
                                </div>
                            </div>
                            
                            {/* Only show these buttons if viewing someone else's profile */}
                            {user && user.id !== profile.id && (
                                <div className="profile-actions-v2">
                                    {isFollowing ? (
                                        <>
                                            <Button 
                                                onClick={() => history.push(`/chat/${profile.id}`)}
                                                className="message-btn"
                                            >
                                                <FaEnvelope /> Message
                                            </Button>
                                            <Button 
                                                onClick={handleToggleFollow} 
                                                className="unfollow-btn"
                                                disabled={isFollowLoading}
                                            >
                                                {isFollowLoading ? 'Processing...' : 'Unfollow'}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            onClick={handleToggleFollow} 
                                            className="follow-btn"
                                            disabled={isFollowLoading}
                                        >
                                            {isFollowLoading ? 'Processing...' : 'Follow'}
                                        </Button>
                                    )}
                                    <Button className="share-btn"><FaShareAlt /></Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="profile-content-area">
                        <div className="profile-card bio-card">
                            <div className="card-header">
                                <h3>About</h3>
                                <Button onClick={handleEditToggle} className="edit-bio-btn">
                                    {editing ? 'Cancel' : <><FaEdit /> Edit</>}
                                </Button>
                            </div>
                            {editing ? (
                                <form onSubmit={handleProfileUpdate} className="bio-edit-form">
                                    <div className="form-group">
                                        <label htmlFor="bio">Bio</label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="form-actions">
                                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                                        <Button type="button" onClick={handleEditToggle} className="cancel-btn">Cancel</Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <p>{profile.bio || 'No bio available.'}</p>
                                    <Button onClick={handleEditToggle} className="edit-bio-btn">Edit Bio</Button>
                                </>
                            )}
                        </div>
                        <div className="profile-card info-grid-card">
                            <div className="card-header">
                                <h3>Highlights</h3>
                                <Button 
                                    onClick={toggleHighlightsEditing} 
                                    className="edit-highlights-btn"
                                >
                                    {highlightsEditing ? 'Cancel' : <><FaEdit /> Edit</>}
                                </Button>
                            </div>
                            
                            {highlightsEditing ? (
                                <form onSubmit={handleProfileUpdate} className="highlights-form">
                                    <div className="form-group">
                                        <label htmlFor="favoriteStroke">Favorite Stroke</label>
                                        <select
                                            id="favoriteStroke"
                                            name="favoriteStroke"
                                            value={formData.favoriteStroke}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select a stroke</option>
                                            <option value="freestyle">Freestyle</option>
                                            <option value="backstroke">Backstroke</option>
                                            <option value="breaststroke">Breaststroke</option>
                                            <option value="butterfly">Butterfly</option>
                                            <option value="individualMedley">Individual Medley</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="favoriteEvent">Favorite Event</label>
                                        <select
                                            id="favoriteEvent"
                                            name="favoriteEvent"
                                            value={formData.favoriteEvent}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select an event</option>
                                            <option value="50m freestyle">50m Freestyle</option>
                                            <option value="100m freestyle">100m Freestyle</option>
                                            <option value="200m freestyle">200m Freestyle</option>
                                            <option value="100m backstroke">100m Backstroke</option>
                                            <option value="100m butterfly">100m Butterfly</option>
                                            <option value="200m individualMedley">200m Individual Medley</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="swimTeam">Team</label>
                                        <input
                                            type="text"
                                            id="swimTeam"
                                            name="swimTeam"
                                            value={formData.swimTeam}
                                            onChange={handleChange}
                                            placeholder="Enter your team name"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="highlights-grid">
                                    <div className="highlight-card">
                                        <div className="highlight-icon">
                                            <FaSwimmer />
                                        </div>
                                        <div className="highlight-content">
                                            <span className="highlight-label">Favorite Stroke</span>
                                            <span className="highlight-value">
                                                {profile.favoriteStroke ? 
                                                    profile.favoriteStroke.charAt(0).toUpperCase() + profile.favoriteStroke.slice(1) : 
                                                    'Not Set'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="highlight-card">
                                        <div className="highlight-icon">
                                            <FaStopwatch />
                                        </div>
                                        <div className="highlight-content">
                                            <span className="highlight-label">Favorite Event</span>
                                            <span className="highlight-value">{profile.favoriteEvent || 'Not Set'}</span>
                                        </div>
                                    </div>
                                    <div className="highlight-card">
                                        <div className="highlight-icon">
                                            <FaAward />
                                        </div>
                                        <div className="highlight-content">
                                            <span className="highlight-label">Personal Best</span>
                                            <span className="highlight-value">
                                                {favoriteEventBestTime ? 
                                                    `${formatSwimTime(favoriteEventBestTime.time)} (${profile.favoriteEvent})` : 
                                                    profile.favoriteEvent ? 'No times recorded' : 'Not Set'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="highlight-card">
                                        <div className="highlight-icon">
                                            <FaUsers />
                                        </div>
                                        <div className="highlight-content">
                                            <span className="highlight-label">Team</span>
                                            <span className="highlight-value">{profile.swimTeam || 'Not Set'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-tabs-container">
                        <div className="tab-navigation-v2">
                            <button
                                className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                Posts
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'times' ? 'active' : ''}`}
                                onClick={() => setActiveTab('times')}
                            >
                                Times
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
                                onClick={() => setActiveTab('challenges')}
                            >
                                Challenges
                            </button>
                        </div>
                        
                        <div className="tab-content-v2">
                            {activeTab === 'posts' && <PostsTab />}
                            {activeTab === 'times' && <TimesTab swimTimes={profile.swimTimes} onTimeClick={handleTimeClick} />}
                            {activeTab === 'challenges' && <ChallengesTab />}
                        </div>
                    </div>
                    {showImageCropper && (
                        <div className="modal-overlay" onClick={handleCancelCrop}>
                            <div className="cropper-modal" onClick={e => e.stopPropagation()}>
                                <h3>{cropTarget === 'profile' ? 'Crop Profile Picture' : 'Crop Banner Image'}</h3>
                                <ImageCropper
                                    src={croppingImage}
                                    aspect={cropTarget === 'profile' ? 1 : 3}
                                    onCropComplete={setCroppedImage}
                                    circularCrop={cropTarget === 'profile'}
                                />
                                <div className="modal-actions">
                                    <Button type="button" onClick={handleCancelCrop} className="cancel-btn">
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={handleCropComplete}
                                        disabled={loading || !croppedImage}
                                    >
                                        {loading ? 'Saving...' : 'Save Image'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;
