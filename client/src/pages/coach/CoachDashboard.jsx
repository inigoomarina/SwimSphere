import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import WorkoutForm from '../../components/coach/WorkoutForm';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/helpers';
import './CoachDashboard.css';

const CoachDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('workouts');
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [workouts, setWorkouts] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        activeChallengers: 0,
        completedChallenges: 0
    });
    const [error, setError] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [challengeForm, setChallengeForm] = useState({
        title: '',
        description: '',
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // One week from now
        targetDistance: 5000,
        targetTime: '',
        stroke: 'any'
    });

    useEffect(() => {
        // Fetch coach data when component mounts
        fetchCoachData();
    }, []);

    const fetchCoachData = async () => {
        try {
            setLoading(true);
            
            // Fetch workouts
            const workoutResponse = await fetch('/api/coach/workouts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const workoutData = await workoutResponse.json();
            
            if (workoutData.status === 'success') {
                setWorkouts(workoutData.data);
                setStats(prev => ({ ...prev, totalWorkouts: workoutData.data.length }));
            }
            
            // Fetch challenges
            const challengeResponse = await fetch('/api/coach/challenges', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const challengeData = await challengeResponse.json();
            
            if (challengeData.status === 'success') {
                setChallenges(challengeData.data);
                
                // Calculate challenge stats
                const activeParticipants = challengeData.data
                    .filter(c => c.isActive)
                    .reduce((sum, challenge) => sum + challenge.participants.length, 0);
                
                const completed = challengeData.data
                    .filter(c => !c.isActive)
                    .length;
                
                setStats(prev => ({
                    ...prev,
                    activeChallengers: activeParticipants,
                    completedChallenges: completed
                }));
            }
            
            setError('');
        } catch (err) {
            console.error('Error fetching coach data:', err);
            setError('Failed to load coach dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkoutSubmit = async (workoutData) => {
        try {
            setSubmitting(true);
            let mediaUrl = '';
            
            // Handle file upload if present
            if (workoutData.mediaFile) {
                const formData = new FormData();
                formData.append('media', workoutData.mediaFile);
                
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                const uploadData = await uploadResponse.json();
                
                if (uploadData.status === 'success') {
                    mediaUrl = uploadData.data.url;
                }
            }
            
            const endpoint = selectedWorkout 
                ? `/api/coach/workouts/${selectedWorkout._id}`
                : '/api/coach/workouts';
            
            const method = selectedWorkout ? 'PUT' : 'POST';
            
            delete workoutData.mediaFile;
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...workoutData,
                    mediaUrl
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setWorkouts(prev => {
                    if (selectedWorkout) {
                        return prev.map(w => w._id === selectedWorkout._id ? data.data : w);
                    } else {
                        return [data.data, ...prev];
                    }
                });
                
                setShowWorkoutForm(false);
                setSelectedWorkout(null);
                setStats(prev => ({ ...prev, totalWorkouts: prev.totalWorkouts + (selectedWorkout ? 0 : 1) }));
                setError('');
            } else {
                setError(data.message || 'Failed to save workout');
            }
        } catch (err) {
            console.error('Error submitting workout:', err);
            setError('Failed to save workout');
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleChallengeChange = (e) => {
        const { name, value } = e.target;
        setChallengeForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleChallengeSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            let mediaUrl = '';
            
            // Handle file upload if present
            if (e.target.media.files[0]) {
                const formData = new FormData();
                formData.append('media', e.target.media.files[0]);
                
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                const uploadData = await uploadResponse.json();
                
                if (uploadData.status === 'success') {
                    mediaUrl = uploadData.data.url;
                }
            }
            
            const endpoint = selectedChallenge 
                ? `/api/coach/challenges/${selectedChallenge._id}`
                : '/api/coach/challenges';
            
            const method = selectedChallenge ? 'PUT' : 'POST';
            
            const payload = {
                ...challengeForm,
                mediaUrl,
                targetTime: challengeForm.targetTime ? parseFloat(challengeForm.targetTime) : null
            };
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setChallenges(prev => {
                    if (selectedChallenge) {
                        return prev.map(c => c._id === selectedChallenge._id ? data.data : c);
                    } else {
                        return [data.data, ...prev];
                    }
                });
                
                setShowChallengeForm(false);
                setSelectedChallenge(null);
                setChallengeForm({
                    title: '',
                    description: '',
                    startDate: formatDate(new Date()),
                    endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                    targetDistance: 5000,
                    targetTime: '',
                    stroke: 'any'
                });
                setError('');
            } else {
                setError(data.message || 'Failed to save challenge');
            }
        } catch (err) {
            console.error('Error submitting challenge:', err);
            setError('Failed to save challenge');
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleEditWorkout = (workout) => {
        setSelectedWorkout(workout);
        setShowWorkoutForm(true);
    };
    
    const handleEditChallenge = (challenge) => {
        setSelectedChallenge(challenge);
        setChallengeForm({
            title: challenge.title,
            description: challenge.description,
            startDate: formatDate(new Date(challenge.startDate)),
            endDate: formatDate(new Date(challenge.endDate)),
            targetDistance: challenge.targetDistance,
            targetTime: challenge.targetTime || '',
            stroke: challenge.stroke
        });
        setShowChallengeForm(true);
    };
    
    const handleDeleteWorkout = async (workoutId) => {
        if (!window.confirm('Are you sure you want to delete this workout?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/coach/workouts/${workoutId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setWorkouts(prev => prev.filter(w => w._id !== workoutId));
                setStats(prev => ({ ...prev, totalWorkouts: prev.totalWorkouts - 1 }));
                setError('');
            } else {
                setError(data.message || 'Failed to delete workout');
            }
        } catch (err) {
            console.error('Error deleting workout:', err);
            setError('Failed to delete workout');
        }
    };
    
    const handleDeleteChallenge = async (challengeId) => {
        if (!window.confirm('Are you sure you want to delete this challenge?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/coach/challenges/${challengeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setChallenges(prev => prev.filter(c => c._id !== challengeId));
                setError('');
            } else {
                setError(data.message || 'Failed to delete challenge');
            }
        } catch (err) {
            console.error('Error deleting challenge:', err);
            setError('Failed to delete challenge');
        }
    };

    if (!user || user.role !== 'coach') {
        return (
            <div className="coach-dashboard">
                <h1>Access Denied</h1>
                <p>You need to be logged in as a coach to access this page.</p>
            </div>
        );
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="coach-dashboard">
            <h1>Coach Dashboard</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="coach-stats">
                <div className="stat-card">
                    <h3>Total Workouts</h3>
                    <p className="stat-value">{stats.totalWorkouts}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Challengers</h3>
                    <p className="stat-value">{stats.activeChallengers}</p>
                </div>
                <div className="stat-card">
                    <h3>Completed Challenges</h3>
                    <p className="stat-value">{stats.completedChallenges}</p>
                </div>
            </div>
            
            <div className="tab-navigation">
                <button 
                    className={`tab-button ${activeTab === 'workouts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workouts')}
                >
                    Workouts
                </button>
                <button 
                    className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    Challenges
                </button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'workouts' && (
                    <div className="workouts-tab">
                        <div className="section-header">
                            <h2>My Workouts</h2>
                            <Button 
                                onClick={() => {
                                    setSelectedWorkout(null);
                                    setShowWorkoutForm(true);
                                }}
                                className="add-new-btn"
                            >
                                Create New Workout
                            </Button>
                        </div>
                        
                        {showWorkoutForm ? (
                            <div className="workout-form-container">
                                <h3>{selectedWorkout ? 'Edit Workout' : 'Create New Workout'}</h3>
                                <WorkoutForm 
                                    onSubmit={handleWorkoutSubmit}
                                    workout={selectedWorkout}
                                    loading={submitting}
                                />
                                <Button 
                                    onClick={() => {
                                        setShowWorkoutForm(false);
                                        setSelectedWorkout(null);
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="workouts-list">
                                {workouts.length > 0 ? (
                                    <div className="items-grid">
                                        {workouts.map(workout => (
                                            <div key={workout._id} className="item-card">
                                                <div className="item-card-header">
                                                    <h3 className="item-card-title">{workout.title}</h3>
                                                    <p className="item-card-subtitle">
                                                        {workout.duration} mins | {workout.distance}m | {workout.difficulty}
                                                    </p>
                                                </div>
                                                <div className="item-card-body">
                                                    <p>{workout.description.substring(0, 150)}
                                                        {workout.description.length > 150 ? '...' : ''}
                                                    </p>
                                                    <p><strong>Focus:</strong> {workout.focusArea}</p>
                                                    <p><strong>Exercises:</strong> {workout.exercises.length}</p>
                                                </div>
                                                <div className="item-card-footer">
                                                    <button 
                                                        onClick={() => handleEditWorkout(workout)}
                                                        className="item-card-btn edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteWorkout(workout._id)}
                                                        className="item-card-btn delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-items-message">
                                        You haven't created any workouts yet. Click "Create New Workout" to get started.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'challenges' && (
                    <div className="challenges-tab">
                        <div className="section-header">
                            <h2>My Challenges</h2>
                            <Button 
                                onClick={() => {
                                    setSelectedChallenge(null);
                                    setShowChallengeForm(true);
                                }}
                                className="add-new-btn"
                            >
                                Create New Challenge
                            </Button>
                        </div>
                        
                        {showChallengeForm ? (
                            <div className="challenge-form-container">
                                <h3>{selectedChallenge ? 'Edit Challenge' : 'Create New Challenge'}</h3>
                                <form onSubmit={handleChallengeSubmit} className="challenge-form">
                                    <div className="form-group">
                                        <label htmlFor="title">Challenge Title*</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={challengeForm.title}
                                            onChange={handleChallengeChange}
                                            placeholder="Enter challenge title"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="description">Description*</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={challengeForm.description}
                                            onChange={handleChallengeChange}
                                            placeholder="Enter challenge description"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="startDate">Start Date*</label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                value={challengeForm.startDate}
                                                onChange={handleChallengeChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="endDate">End Date*</label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                value={challengeForm.endDate}
                                                onChange={handleChallengeChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="targetDistance">Target Distance (meters)*</label>
                                            <input
                                                type="number"
                                                id="targetDistance"
                                                name="targetDistance"
                                                min="25"
                                                step="25"
                                                value={challengeForm.targetDistance}
                                                onChange={handleChallengeChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="targetTime">Target Time (seconds, optional)</label>
                                            <input
                                                type="number"
                                                id="targetTime"
                                                name="targetTime"
                                                min="1"
                                                step="0.01"
                                                value={challengeForm.targetTime}
                                                onChange={handleChallengeChange}
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="stroke">Stroke</label>
                                        <select
                                            id="stroke"
                                            name="stroke"
                                            value={challengeForm.stroke}
                                            onChange={handleChallengeChange}
                                        >
                                            <option value="any">Any</option>
                                            <option value="freestyle">Freestyle</option>
                                            <option value="backstroke">Backstroke</option>
                                            <option value="breaststroke">Breaststroke</option>
                                            <option value="butterfly">Butterfly</option>
                                            <option value="individualMedley">Individual Medley</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="media">Challenge Media (optional)</label>
                                        <input
                                            type="file"
                                            id="media"
                                            name="media"
                                            accept="image/*,video/*"
                                        />
                                        <small>Upload an image or video for the challenge</small>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <Button 
                                            type="button" 
                                            onClick={() => {
                                                setShowChallengeForm(false);
                                                setSelectedChallenge(null);
                                                setChallengeForm({
                                                    title: '',
                                                    description: '',
                                                    startDate: formatDate(new Date()),
                                                    endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                                                    targetDistance: 5000,
                                                    targetTime: '',
                                                    stroke: 'any'
                                                });
                                            }}
                                            className="cancel-btn"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="submit-challenge-btn"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Saving...' : (selectedChallenge ? 'Update Challenge' : 'Create Challenge')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="challenges-list">
                                {challenges.length > 0 ? (
                                    <div className="items-grid">
                                        {challenges.map(challenge => (
                                            <div key={challenge._id} className="item-card">
                                                <div className="item-card-header">
                                                    <h3 className="item-card-title">
                                                        <span 
                                                            className={`challenge-status ${challenge.isActive ? 'challenge-active' : 'challenge-inactive'}`}
                                                        >
                                                            {challenge.isActive ? 'Active' : 'Ended'}
                                                        </span>
                                                        {challenge.title}
                                                    </h3>
                                                    <p className="item-card-subtitle">
                                                        {challenge.targetDistance}m {challenge.stroke !== 'any' ? challenge.stroke : ''}
                                                    </p>
                                                </div>
                                                <div className="item-card-body">
                                                    <p>{challenge.description.substring(0, 100)}
                                                        {challenge.description.length > 100 ? '...' : ''}
                                                    </p>
                                                    <p>
                                                        <strong>Period:</strong> {new Date(challenge.startDate).toLocaleDateString()} to {new Date(challenge.endDate).toLocaleDateString()}
                                                    </p>
                                                    <p><strong>Participants:</strong> {challenge.participants ? challenge.participants.length : 0}</p>
                                                </div>
                                                <div className="item-card-footer">
                                                    <button 
                                                        onClick={() => handleEditChallenge(challenge)}
                                                        className="item-card-btn edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteChallenge(challenge._id)}
                                                        className="item-card-btn delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-items-message">
                                        You haven't created any challenges yet. Click "Create New Challenge" to get started.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachDashboard;
