import React, { useState, useRef } from 'react';
import Button from '../common/Button';
import { FaCamera, FaTimes } from 'react-icons/fa';
import './CreatePostForm.css';

const CreatePostForm = ({ onSubmit, loading, initialContent = '', closeForm }) => {
    const [content, setContent] = useState(initialContent);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [visibility, setVisibility] = useState('public');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setMediaFile(file);
        
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file.type.match('video.*')) {
            const url = URL.createObjectURL(file);
            setMediaPreview(url);
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreview('');
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim() && !mediaFile) {
            return;
        }
        
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
            
            // Close form if provided
            if (closeForm) closeForm();
        }
    };

    const handleCancel = () => {
        if (closeForm) closeForm();
    };

    return (
        <div className="create-post-form">
            <h3>Create Post</h3>
            
            <form onSubmit={handleSubmit}>
                <textarea 
                    placeholder="What's on your mind?" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="post-content-input"
                    rows="4"
                    required={!mediaFile}
                ></textarea>
                
                {mediaPreview && (
                    <div className="media-preview">
                        {mediaFile.type.match('image.*') ? (
                            <img src={mediaPreview} alt="Preview" />
                        ) : mediaFile.type.match('video.*') ? (
                            <video controls>
                                <source src={mediaPreview} type={mediaFile.type} />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="file-name">{mediaFile.name}</div>
                        )}
                        <Button 
                            type="button" 
                            onClick={handleRemoveMedia}
                            className="remove-media-btn"
                        >
                            <FaTimes /> Remove
                        </Button>
                    </div>
                )}
                
                <div className="form-row">
                    <div className="form-group">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            id="media-upload"
                            style={{ display: 'none' }} 
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="media-upload" onClick={() => fileInputRef.current.click()}>
                            <FaCamera /> Add Photo/Video
                        </label>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="visibility">Who can see your post?</label>
                        <select
                            id="visibility"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                        >
                            <option value="public">Everyone</option>
                            <option value="followers">Followers Only</option>
                            <option value="private">Only Me</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-actions">
                    {closeForm && (
                        <Button 
                            type="button" 
                            onClick={handleCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </Button>
                    )}
                    
                    <Button 
                        type="submit" 
                        className="post-btn"
                        disabled={loading || (!content.trim() && !mediaFile)}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;
