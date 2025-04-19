import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getPosts } from '../../utils/api';
import PostCard from './PostCard';
import Loader from '../common/Loader';
import CreatePostForm from './CreatePostForm';
import Button from '../common/Button';
import { uploadMedia, createPost } from '../../utils/api';
import './PostFeed.css';

const PostFeed = ({ userFeed = false, userId = null, showCreatePost = true }) => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [creating, setCreating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [page, userId, userFeed]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            let response;
            
            if (userId) {
                // Get posts for a specific user (profile page)
                response = await fetch(`/api/posts/user/${userId}?page=${page}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                // Get feed posts (dashboard)
                response = await getPosts(page);
            }
            
            if (!response.success && !response.data) {
                throw new Error("Failed to load posts");
            }
            
            if (page === 1) {
                setPosts(response.data.posts);
            } else {
                setPosts(prev => [...prev, ...response.data.posts]);
            }
            
            setHasMore(response.data.currentPage < response.data.totalPages);
            setError('');
        } catch (err) {
            console.error('Error loading posts:', err);
            setError('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (postData) => {
        try {
            setSubmitting(true);
            let mediaUrl = '';
            
            // Upload media file if present
            if (postData.mediaFile) {
                const uploadResponse = await uploadMedia(postData.mediaFile);
                
                if (uploadResponse.status === 'success') {
                    mediaUrl = uploadResponse.data.url;
                } else {
                    throw new Error("Failed to upload media");
                }
            }
            
            // Create the post with the media URL
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                visibility: postData.visibility
            });
            
            if (response.status === 'success') {
                // Add the new post to the top of the feed
                setPosts(prev => [response.data, ...prev]);
                setShowCreateForm(false);
                return true;
            } else {
                throw new Error(response.message || "Failed to create post");
            }
        } catch (err) {
            console.error("Error creating post:", err);
            setError("Failed to create post. Please try again.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    return (
        <div className="post-feed">
            {error && <div className="error-message">{error}</div>}
            
            {showCreatePost && (
                <div className="create-post-container">
                    {showCreateForm ? (
                        <CreatePostForm 
                            onSubmit={handleCreatePost} 
                            loading={submitting}
                            closeForm={() => setShowCreateForm(false)}
                        />
                    ) : (
                        <div className="create-post-prompt" onClick={() => setShowCreateForm(true)}>
                            <img 
                                src={user?.profileImage || "/images/default-avatar.png"} 
                                alt={user?.firstName || "User"}
                                className="user-avatar" 
                            />
                            <div className="prompt-text">
                                What's on your mind, {user?.firstName || 'there'}?
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {loading && page === 1 ? (
                <Loader />
            ) : posts.length > 0 ? (
                <div className="posts-list">
                    {posts.map(post => (
                        <PostCard 
                            key={post._id} 
                            post={post}
                            currentUser={user}
                            onPostUpdate={(updatedPost) => {
                                setPosts(prev => 
                                    prev.map(p => p._id === updatedPost._id ? updatedPost : p)
                                );
                            }}
                            onPostDelete={(postId) => {
                                setPosts(prev => prev.filter(p => p._id !== postId));
                            }}
                        />
                    ))}
                    
                    {loading && page > 1 && <Loader />}
                    
                    {!loading && hasMore && (
                        <div className="load-more-container">
                            <Button 
                                onClick={handleLoadMore} 
                                className="load-more-btn"
                            >
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-posts-message">
                    {userId === user?.id ? (
                        <p>You haven't created any posts yet. Share your first update!</p>
                    ) : userId ? (
                        <p>This user hasn't shared any posts yet.</p>
                    ) : (
                        <p>No posts in your feed yet. Follow swimmers to see their updates!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostFeed;
