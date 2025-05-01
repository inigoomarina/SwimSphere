import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import './CreatePostForm.css';

const CreatePostForm = ({ onSubmit, onCancel, loading = false }) => {
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [visibility, setVisibility] = useState('public');
    const { user } = useContext(AuthContext);

    const handleContentChange = (e) => {
        setContent(e.target.value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVisibilityChange = (e) => {
        setVisibility(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !mediaFile) {
            return;
        }

        // Call the onSubmit function and close the modal on success
        const success = await onSubmit({
            content,
            mediaFile,
            visibility
        });

        if (success) {
            // Reset form
            setContent('');
            setMediaFile(null);
            setMediaPreview('');
            setVisibility('public');
            
            // Close the modal automatically (handled by parent component)
        }
    };

    const handleCancel = (e) => {
        if (e) e.preventDefault();
        
        // Reset form
        setContent('');
        setMediaFile(null);
        setMediaPreview('');
        setVisibility('public');
        
        // Close the modal
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form className="create-post-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <img 
                    src={user?.profileImage || '/default-avatar.png'} 
                    alt={user?.username} 
                    className="user-avatar"
                />
                <h3>Create Post</h3>
            </div>
            
            <textarea 
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind?"
                rows="4"
                className="post-content-input"
                disabled={loading}
            />
            
            {mediaPreview && (
                <div className="media-preview">
                    <img src={mediaPreview} alt="Preview" />
                    <button 
                        type="button" 
                        onClick={() => {
                            setMediaFile(null);
                            setMediaPreview('');
                        }}
                        className="remove-media-btn"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>
            )}
            
            <div className="form-controls">
                <div className="media-upload">
                    <label htmlFor="media-upload" className={`media-upload-label ${loading ? 'disabled' : ''}`}>
                        <span className="media-icon">📷</span>
                        Photo/Video
                    </label>
                    <input 
                        type="file"
                        id="media-upload"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={loading}
                    />
                </div>
                
                <div className="visibility-selector">
                    <select 
                        value={visibility} 
                        onChange={handleVisibilityChange}
                        disabled={loading}
                    >
                        <option value="public">Public</option>
                        <option value="followers">Followers Only</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>
            
            <div className="form-actions">
                <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleCancel} 
                    disabled={loading}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="post-btn" 
                    disabled={loading || (!content && !mediaFile)}
                >
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
};

export default CreatePostForm;
