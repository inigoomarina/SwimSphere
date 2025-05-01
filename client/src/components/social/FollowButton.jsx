import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toggleFollowUser } from '../../utils/api';
import './FollowButton.css';

const FollowButton = ({ userId, initialIsFollowing = false, onFollowChange, size = 'md', className = '' }) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Size variants
    const sizeClasses = {
        sm: 'follow-btn-sm',
        md: 'follow-btn-md',
        lg: 'follow-btn-lg'
    };

    const handleToggleFollow = async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        
        try {
            const previousState = isFollowing;
            
            // Optimistically update UI
            setIsFollowing(!isFollowing);
            
            // Call API
            const response = await toggleFollowUser(userId);
            
            // If API call was successful and callback provided, call it
            if (response.status === 'success') {
                if (onFollowChange) {
                    onFollowChange(!previousState);
                }
            } else {
                // If API call failed, revert UI
                setIsFollowing(previousState);
                console.error('Follow toggle failed:', response.message);
            }
        } catch (error) {
            // If API call threw an error, revert UI
            setIsFollowing(isFollowing);
            console.error('Follow toggle error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.button
            className={`follow-button ${sizeClasses[size]} ${isFollowing ? 'following' : ''} ${className}`}
            onClick={handleToggleFollow}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isProcessing ? (
                <span className="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </span>
            ) : isFollowing ? (
                isHovered ? "Unfollow" : "Following"
            ) : (
                "Follow"
            )}
        </motion.button>
    );
};

export default FollowButton;
