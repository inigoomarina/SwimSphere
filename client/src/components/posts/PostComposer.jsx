import React, { useState } from 'react';
import { createPost, uploadMedia } from '../../utils/api';
import { useToast } from '../../context/ToastContext.jsx';
import CreatePostForm from './CreatePostForm';
import './PostFeed.css';

const PostComposer = ({ onPostCreated }) => {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    
    const handleOpenModal = () => {
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
    };
    
    const handleCreatePost = async (postData) => {
        try {
            setIsSubmitting(true);
            let mediaUrl = '';
            
            // Handle media upload if present
            if (postData.mediaFile) {
                try {
                    const uploadResponse = await uploadMedia(postData.mediaFile);
                    if (uploadResponse.status === 'success') {
                        mediaUrl = uploadResponse.data.url;
                    } else {
                        throw new Error(uploadResponse.message || 'Failed to upload media');
                    }
                } catch (error) {
                    console.error('Media upload error:', error);
                    showToast('Failed to upload media', 'error');
                    setIsSubmitting(false);
                    return false;
                }
            }
            
            // Create the post
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                visibility: postData.visibility || 'public'
            });
            
            if (response.status === 'success') {
                // Close modal and update feed
                showToast('Post created successfully!');
                
                // Call the callback to update the parent's post list
                if (onPostCreated) {
                    onPostCreated(response.data);
                }
                
                setIsSubmitting(false);
                return true; // Return true to indicate success
            } else {
                throw new Error(response.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Post creation error:', error);
            showToast('Failed to create post', 'error');
            setIsSubmitting(false);
            return false; // Return false to indicate failure
        }
    };
    
    return (
        <div className="post-compose">
            <div className="post-prompt" onClick={handleOpenModal}>
                <img 
                    src="/default-avatar.png"
                    alt="Your Profile"
                    className="avatar"
                />
                <div className="prompt-text">What's on your mind?</div>
            </div>
            
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <CreatePostForm
                            onSubmit={handleCreatePost}
                            onCancel={handleCloseModal}
                            loading={isSubmitting}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostComposer;
