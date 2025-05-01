import React, { useState, useContext, useRef, useEffect } from 'react'; // Added useRef, useEffect
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../../context/AuthContext.jsx';
import { toggleLike, addComment, deletePost, deleteComment } from '../../utils/api'; // Import deletePost, deleteComment
import './PostCard.css';

// Helper function to safely format dates
const safeFormatDate = (dateValue) => {
    if (!dateValue) return 'recently';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'recently';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error('Error formatting date:', error, dateValue);
        return 'recently';
    }
};


const PostCard = ({ post, onPostUpdate, onPostDelete }) => { // Add onPostDelete prop
    const { user } = useContext(AuthContext);
    const [liked, setLiked] = useState(post.isLiked || false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localLikes, setLocalLikes] = useState(
        Array.isArray(post.likes) ? post.likes.length :
        typeof post.likes === 'number' ? post.likes : (post.likesCount || 0) // Use likesCount as fallback
    );
    const [localComments, setLocalComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [showMenu, setShowMenu] = useState(false); // State for post menu visibility
    const menuRef = useRef(null); // Ref for the menu dropdown

    // Use createdAt, timestamp, or date - whichever exists
    const postDate = post.createdAt || post.timestamp || post.date || null;

    // Get the comments to display based on showAllComments flag
    const commentsToDisplay = showAllComments
        ? localComments
        : localComments.slice(-2);

    // Format a user's name properly
    const formatUserName = (userData) => {
        if (!userData) return "Anonymous User";
        if (userData.firstName && userData.lastName) return `${userData.firstName} ${userData.lastName}`;
        if (userData.firstName) return userData.firstName;
        if (userData.name) return userData.name; // Added check for name property
        if (userData.username) return userData.username;
        return "Anonymous User";
    };

    // Click outside handler for the post menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const handleLikeToggle = async () => {
        if (isToggling) return;
        setIsToggling(true);
        const originalLiked = liked;
        const originalLikes = localLikes;
        setLiked(!liked);
        setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
        try {
            const response = await toggleLike(post._id);
            if (response.status === 'success') {
                setLiked(response.data.isLiked);
                setLocalLikes(response.data.likesCount);
                if (onPostUpdate) {
                    onPostUpdate({
                        ...post,
                        likes: response.data.likesCount, // Use likesCount from response
                        isLiked: response.data.isLiked,
                        comments: localComments // Keep local comments state
                    });
                }
            } else {
                setLiked(originalLiked);
                setLocalLikes(originalLikes);
                console.error('Failed to toggle like:', response.message);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setLiked(originalLiked);
            setLocalLikes(originalLikes);
        } finally {
            setIsToggling(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await addComment(post._id, commentText);
            if (!response || response.status !== 'success') {
                console.error('Failed to add comment:', response);
                setIsSubmitting(false); // Reset submitting state on failure
                return;
            }
            const newComment = response.data; // API now returns the populated comment
            const updatedComments = [...localComments, newComment];
            setLocalComments(updatedComments);
            if (onPostUpdate) {
                onPostUpdate({
                    ...post,
                    likes: localLikes, // Keep local likes state
                    isLiked: liked, // Keep local liked state
                    comments: updatedComments,
                });
            }
            setCommentText('');
            setShowComments(true); // Ensure comments section is open
            setShowAllComments(true); // Show all comments including the new one
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setShowMenu(false); // Close menu
            if (onPostDelete) {
                onPostDelete(post._id); // Call parent handler immediately for optimistic UI
            } else {
                // Fallback if no parent handler (though Feed.jsx provides one)
                try {
                    await deletePost(post._id);
                } catch (error) {
                    console.error("Error deleting post directly:", error);
                }
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                const response = await deleteComment(post._id, commentId);
                if (response.status === 'success') {
                    const updatedComments = localComments.filter(c => c._id !== commentId);
                    setLocalComments(updatedComments);
                    if (onPostUpdate) {
                        onPostUpdate({
                            ...post,
                            likes: localLikes,
                            isLiked: liked,
                            comments: updatedComments,
                        });
                    }
                } else {
                    console.error('Failed to delete comment:', response.message);
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };


    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const toggleShowAllComments = () => {
        setShowAllComments(!showAllComments);
    };

    const renderMedia = () => {
        if (!post.media || !post.media.url) return null; // Added check for media.url
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

    // Check if the current user is the author of the post
    const isAuthor = user && post.author && user.id === post.author.id;

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author">
                    <img
                        src={post.author?.profileImage || "/default-avatar.png"}
                        alt={formatUserName(post.author)} // Use formatUserName
                        className="author-avatar"
                    />
                    <div>
                        <Link to={`/profile/${post.author?.id || '#'}`} className="author-name">
                            {formatUserName(post.author)} {/* Use formatUserName */}
                        </Link>
                        <div className="author-details">
                            {post.author?.team && <span className="author-team">{post.author.team}</span>}
                            <span className="post-time">
                                {safeFormatDate(postDate)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Post Actions Menu */}
                <div className="post-actions" ref={menuRef}>
                    <button className="post-menu-btn" onClick={() => setShowMenu(!showMenu)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    {showMenu && (
                        <div className="post-menu-dropdown">
                            {/* Add other actions like Edit later */}
                            {isAuthor && (
                                <button onClick={handleDeletePost} className="menu-item delete-item">
                                    Delete Post
                                </button>
                            )}
                            {!isAuthor && (
                                <button className="menu-item">Report Post</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="post-content">
                <p>{post.content}</p>
                {renderMedia()}
            </div>

            <div className="post-interactions">
                <div className="interaction-stats">
                    <div className="likes-count">
                        {/* SVG for likes */}
                        <span>{localLikes} {localLikes === 1 ? 'like' : 'likes'}</span>
                    </div>
                    <div className="comments-count" onClick={toggleComments}>
                        <span>{localComments.length} {localComments.length === 1 ? 'comment' : 'comments'}</span>
                    </div>
                </div>

                <div className="interaction-buttons">
                    <button
                        onClick={handleLikeToggle}
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        disabled={isToggling}
                    >
                        {/* Like SVG */}
                        {liked ? 'Liked' : 'Like'}
                    </button>

                    <button
                        onClick={toggleComments}
                        className="comment-btn"
                    >
                        {/* Comment SVG */}
                        Comment
                    </button>

                    <button className="share-btn">
                        {/* Share SVG */}
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
                                // Send SVG
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="comments-list">
                        {localComments && localComments.length > 0 ? (
                            <>
                                {commentsToDisplay.map((comment) => {
                                    // Determine if the current user can delete this comment
                                    const canDeleteComment = user && (comment.author?._id === user.id || isAuthor);
                                    return (
                                        <div key={comment._id} className="comment">
                                            <div className="comment-header">
                                                <div className="comment-author">
                                                    <img
                                                        src={comment.author?.profileImage || "/default-avatar.png"}
                                                        alt={formatUserName(comment.author)}
                                                        className="comment-author-avatar" // Corrected class name
                                                    />
                                                    <Link to={`/profile/${comment.author?._id || '#'}`} className="comment-author-name">
                                                        {formatUserName(comment.author)}
                                                    </Link>
                                                    <span className="comment-time">
                                                        {safeFormatDate(comment.createdAt || comment.timestamp)}
                                                    </span>
                                                </div>
                                                {/* Delete Comment Button */}
                                                {canDeleteComment && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="delete-comment-btn"
                                                        title="Delete comment"
                                                    >
                                                        &times; {/* Simple 'x' for delete */}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="comment-content">{comment.content || comment.text}</p> {/* Check for content first, then text */}
                                        </div>
                                    );
                                })}

                                {localComments.length > 2 && (
                                    <button
                                        className="toggle-comments-btn"
                                        onClick={toggleShowAllComments}
                                    >
                                        {showAllComments
                                            ? 'Show fewer comments'
                                            : `View all ${localComments.length} comments`}
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
