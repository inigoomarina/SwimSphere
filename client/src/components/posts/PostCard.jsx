import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';
import { toggleLike, addComment } from '../../utils/api';
import './PostCard.css';

// Helper function to safely format dates
const safeFormatDate = (dateValue) => {
    if (!dateValue) return 'recently';
    
    try {
        // Convert various date formats to a Date object
        const date = new Date(dateValue);
        
        // Check if the date is valid before formatting
        if (isNaN(date.getTime())) {
            return 'recently';
        }
        
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error('Error formatting date:', error, dateValue);
        return 'recently';
    }
};

const PostCard = ({ post, onPostUpdate }) => {
    const { user } = useContext(AuthContext);
    const [liked, setLiked] = useState(post.isLiked || false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localLikes, setLocalLikes] = useState(
        Array.isArray(post.likes) ? post.likes.length : 
        typeof post.likes === 'number' ? post.likes : 0
    );
    const [localComments, setLocalComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    
    // Use createdAt, timestamp, or date - whichever exists
    const postDate = post.createdAt || post.timestamp || post.date || null;
    
    // Get the comments to display based on showAllComments flag
    const commentsToDisplay = showAllComments 
        ? localComments 
        : localComments.slice(-2);
    
    // Format a user's name properly
    const formatUserName = (userData) => {
        if (!userData) return "Anonymous User";
        
        if (userData.firstName && userData.lastName) {
            return `${userData.firstName} ${userData.lastName}`;
        }
        
        if (userData.firstName) return userData.firstName;
        if (userData.name) return userData.name;
        if (userData.username) return userData.username;
        
        return "Anonymous User";
    };
    
    const handleLikeClick = async () => {
        if (isToggling) return;
        
        try {
            setIsToggling(true);
            // Optimistically update UI
            if (!liked) {
                setLocalLikes(prev => prev + 1);
            } else {
                setLocalLikes(prev => Math.max(0, prev - 1));
            }
            setLiked(!liked);
            
            // Make API call to toggle like status
            const response = await toggleLike(post._id);
            
            // If API call fails, revert the UI
            if (!response || response.status !== 'success') {
                setLiked(liked);
                setLocalLikes(localLikes);
                console.error('Failed to toggle like:', response);
            } else {
                // Update the post state if needed
                if (onPostUpdate) {
                    onPostUpdate({
                        ...post,
                        likes: response.data.likesCount,
                        isLiked: response.data.isLiked
                    });
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert UI changes on error
            setLiked(liked);
            setLocalLikes(localLikes);
        } finally {
            setIsToggling(false);
        }
    };
    
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            // Make API call to add comment
            const response = await addComment(post._id, commentText);
            
            if (!response || response.status !== 'success') {
                console.error('Failed to add comment:', response);
                return;
            }
            
            // Create a properly formatted comment object with user data
            const newComment = {
                ...response.data,
                author: {
                    id: user.id,
                    name: formatUserName(user),
                    profileImage: user.profileImage || "/default-avatar.png"
                }
            };
            
            const updatedComments = [...localComments, newComment];
            setLocalComments(updatedComments);
            
            // Update the post if callback is provided
            if (onPostUpdate) {
                onPostUpdate({
                    ...post,
                    comments: updatedComments
                });
            }
            
            // Clear input field
            setCommentText('');
            
            // Auto-expand to show all comments when user adds a comment
            setShowAllComments(true);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleComments = () => {
        setShowComments(!showComments);
    };
    
    const toggleShowAllComments = () => {
        setShowAllComments(!showAllComments);
    };
    
    const renderMedia = () => {
        if (!post.media) return null;
        
        if (post.media.type === 'image') {
            return (
                <div className="post-media">
                    <img src={post.media.url} alt="Post attachment" />
                </div>
            );
        } else if (post.media.type === 'video') {
            return (
                <div className="post-media">
                    <video controls>
                        <source src={post.media.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }
        
        return null;
    };
    
    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author">
                    <img 
                        src={post.author?.profileImage || "/default-avatar.png"} 
                        alt={post.author?.name || "User"} 
                        className="author-avatar"
                    />
                    <div>
                        <Link to={`/profile/${post.author?.id || '#'}`} className="author-name">
                            {post.author?.name || "Anonymous User"}
                        </Link>
                        <div className="author-details">
                            {post.author?.team && <span className="author-team">{post.author.team}</span>}
                            <span className="post-time">
                                {safeFormatDate(postDate)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="post-actions">
                    <button className="post-menu-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="post-content">
                <p>{post.content}</p>
                {renderMedia()}
            </div>
            
            <div className="post-interactions">
                <div className="interaction-stats">
                    <div className="likes-count">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                        </svg>
                        <span>{localLikes} {localLikes === 1 ? 'like' : 'likes'}</span>
                    </div>
                    <div className="comments-count" onClick={toggleComments}>
                        <span>{localComments.length} comments</span>
                    </div>
                </div>
                
                <div className="interaction-buttons">
                    <button 
                        onClick={handleLikeClick} 
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        disabled={isToggling}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d={liked 
                                ? "M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                                : "M21.8 9.46c0-2.25-1.85-4.1-4.1-4.1-1.5 0-2.8.85-3.7 2.1-.9-1.25-2.2-2.1-3.7-2.1-2.25 0-4.1 1.85-4.1 4.1 0 4.05 4.3 7.4 7.8 9.8 3.5-2.4 7.8-5.75 7.8-9.8z"
                            } />
                        </svg>
                        {liked ? 'Liked' : 'Like'}
                    </button>
                    
                    <button 
                        onClick={toggleComments}
                        className="comment-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97A49.145 49.145 0 0112 2.25z" clipRule="evenodd" />
                        </svg>
                        Comment
                    </button>
                    
                    <button className="share-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                        </svg>
                        Share
                    </button>
                </div>
            </div>
            
            {showComments && (
                <div className="post-comments">
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <img 
                            src={user?.profileImage || "/default-avatar.png"} 
                            alt={formatUserName(user)}
                            className="comment-user-avatar" 
                        />
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            required
                        />
                        <button 
                            type="submit" 
                            className="submit-comment-btn"
                            disabled={!commentText.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            )}
                        </button>
                    </form>
                    
                    <div className="comments-list">
                        {localComments && localComments.length > 0 ? (
                            <>
                                {commentsToDisplay.map((comment, index) => (
                                    <div key={comment._id || index} className="comment">
                                        <div className="comment-header">
                                            <div className="comment-author">
                                                <img 
                                                    src={comment.author?.profileImage || "/default-avatar.png"} 
                                                    alt={formatUserName(comment.author)} 
                                                    className="comment-avatar"
                                                />
                                                <div>
                                                    <Link to={`/profile/${comment.author?.id || '#'}`} className="comment-author-name">
                                                        {formatUserName(comment.author)}
                                                    </Link>
                                                    <span className="comment-time">
                                                        {safeFormatDate(comment.createdAt || comment.timestamp || comment.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                    </div>
                                ))}
                                
                                {localComments.length > 2 && (
                                    <button 
                                        className="toggle-comments-btn"
                                        onClick={toggleShowAllComments}
                                    >
                                        {showAllComments
                                            ? 'Show fewer comments' 
                                            : `Show all ${localComments.length} comments`}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="no-comments">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
