import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateUserProfile, fetchUserProfile } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, login } = useContext(AuthContext);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        city: '',
        country: '',
        swimTeam: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    useEffect(() => {
        // Load user data
        const loadUserData = async () => {
            setLoading(true);
            try {
                const response = await fetchUserProfile();
                if (response.status === 'success') {
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
                    }));
                }
            } catch (err) {
                showToast("Failed to load profile information", "error");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        loadUserData();
    }, [showToast]);

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
                if (login) {
                    login({
                        ...user,
                        firstName: dataToUpdate.firstName,
                        lastName: dataToUpdate.lastName
                    });
                }
                
                // Reset password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                showToast("Settings updated successfully");
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
            
            <div className="settings-card">
                <h2>Personal Information</h2>
                <form onSubmit={handleProfileUpdate}>
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
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
                            <label htmlFor="username">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
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
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
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
                            <label htmlFor="swimTeam">Swim Team</label>
                            <input 
                                type="text" 
                                id="swimTeam" 
                                name="swimTeam" 
                                value={formData.swimTeam}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea 
                                id="bio" 
                                name="bio" 
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                    </div>
                    
                    <h2>Password</h2>
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input 
                                type="password" 
                                id="currentPassword" 
                                name="currentPassword" 
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                            <small>Leave blank to keep current password</small>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                name="newPassword" 
                                value={formData.newPassword}
                                onChange={handleChange}
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
                            />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <Button 
                            type="submit" 
                            className="save-settings-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
