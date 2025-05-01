import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import { useHistory } from 'react-router-dom';
// Change to default import
import { AuthContext } from '../context/AuthContext.jsx';
import { updateUserProfile, fetchUserProfile } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaSwimmer, FaUserTie, FaLock } from 'react-icons/fa';
import './SettingsPage.css';

const SettingsPage = () => {
    // Get context values safely with fallbacks
    const authContext = useContext(AuthContext) || {};
    const toastContext = useToast() || {};
    
    const user = authContext.user || {};
    const login = authContext.login || (() => {});

    // Wrap showToast initialization in useMemo for stable reference
    const showToast = useMemo(() => toastContext.showToast || (() => {}), [toastContext.showToast]);
    
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        city: '',
        country: '',
        swimTeam: '',
        bio: '',
        role: '',
        favoriteStroke: '',
        favoriteEvent: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Wrap loadUserData in useCallback
    const loadUserData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchUserProfile();
            if (response && response.status === 'success') {
                setFormData(prevData => ({
                    ...prevData,
                    email: response.data.email || '',
                    username: response.data.username || '',
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    city: response.data.city || '',
                    country: response.data.country || '',
                    swimTeam: response.data.swimTeam || '',
                    bio: response.data.bio || '',
                    role: response.data.role || '',
                    favoriteStroke: response.data.favoriteStroke || '',
                    favoriteEvent: response.data.favoriteEvent || ''
                }));
            }
        } catch (err) {
            showToast("Failed to load profile information", "error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Handle password change if provided
            const dataToUpdate = { ...formData };
            
            // Remove password fields from update data if not all are filled
            if (!(dataToUpdate.currentPassword && dataToUpdate.newPassword && dataToUpdate.confirmPassword)) {
                delete dataToUpdate.currentPassword;
                delete dataToUpdate.newPassword;
                delete dataToUpdate.confirmPassword;
            } else if (dataToUpdate.newPassword !== dataToUpdate.confirmPassword) {
                showToast("New passwords don't match", "error");
                setSaving(false);
                return;
            }
            
            const response = await updateUserProfile(dataToUpdate);
            
            if (response.status === 'success') {
                // Update the user in the context to reflect changes throughout the app
                login({
                    ...user,
                    firstName: dataToUpdate.firstName,
                    lastName: dataToUpdate.lastName,
                    username: dataToUpdate.username,
                    role: dataToUpdate.role,
                    city: dataToUpdate.city,
                    country: dataToUpdate.country,
                    swimTeam: dataToUpdate.swimTeam,
                    bio: dataToUpdate.bio,
                    favoriteStroke: dataToUpdate.favoriteStroke,
                    favoriteEvent: dataToUpdate.favoriteEvent
                });
                
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                showToast("Settings updated successfully");
                
                // Redirect to profile page after successful update
                history.push('/profile'); 
            } else {
                showToast(response.message || "Failed to update settings", "error");
            }
        } catch (err) {
            const errorMsg = err.message || "Failed to update settings";
            showToast(errorMsg, "error");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="settings-page-container">
            <h1>Account Settings</h1>
            
            <div className="settings-tabs">
                <button 
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FaUser /> Profile
                </button>
                <button 
                    className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    <FaLock /> Password
                </button>
            </div>
            
            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="settings-card">
                        <h2>Personal Information</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-section">
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FaEnvelope className="form-icon" /> Email
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <FaUser className="form-icon" /> Username
                                    </label>
                                    <div className="input-with-prefix">
                                        <span className="input-prefix">@</span>
                                        <input 
                                            type="text" 
                                            id="username" 
                                            name="username" 
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input 
                                            type="text" 
                                            id="firstName" 
                                            name="firstName" 
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input 
                                            type="text" 
                                            id="lastName" 
                                            name="lastName" 
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="role">
                                        <FaSwimmer className="form-icon" /> Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a role</option>
                                        <option value="swimmer">Swimmer</option>
                                        <option value="coach">Coach</option>
                                    </select>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">
                                            <FaMapMarkerAlt className="form-icon" /> City
                                        </label>
                                        <input 
                                            type="text" 
                                            id="city" 
                                            name="city" 
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="country">Country</label>
                                        <input 
                                            type="text" 
                                            id="country" 
                                            name="country" 
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="swimTeam">
                                        <FaUserTie className="form-icon" /> Swim Team
                                    </label>
                                    <input 
                                        type="text" 
                                        id="swimTeam" 
                                        name="swimTeam" 
                                        value={formData.swimTeam}
                                        onChange={handleChange}
                                    />
                                </div>

                                {formData.role === 'swimmer' && (
                                    <div className="form-row">
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
                                    </div>
                                )}
                                
                                <div className="form-group">
                                    <label htmlFor="bio">Bio</label>
                                    <textarea 
                                        id="bio" 
                                        name="bio" 
                                        rows="4"
                                        value={formData.bio}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'password' && (
                    <div className="settings-card">
                        <h2>Change Password</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-section">
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <input 
                                        type="password" 
                                        id="currentPassword" 
                                        name="currentPassword" 
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        name="newPassword" 
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
