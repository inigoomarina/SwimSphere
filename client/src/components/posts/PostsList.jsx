import React, { useState, useEffect, useCallback } from 'react';
import { getPosts, deletePost } from '../../utils/api';
import PostCard from './PostCard';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext.jsx';
import './PostFeed.css';

const PostsList = ({ initialPosts = [], userFeed = false, userId = null }) => {
    const [posts, setPosts] = useState(initialPosts || []);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { showToast } = useToast();
    
    // Load posts from the backend
    const loadPosts = useCallback(async (resetPosts = false) => {
        if (loading && !resetPosts) return;
        
        setLoading(true);
        try {
            let response;
            if (userId) {
                // Get posts for a specific user
                response = await fetch(`/api/posts/user/${userId}?page=${resetPosts ? 1 : page}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                response = await response.json();
            } else {
                // Get feed posts
                response = await getPosts(resetPosts ? 1 : page);
            }
            
            if (!response || response.status !== 'success') {
                throw new Error('Failed to load posts');
            }
            
            const newPosts = response.data?.posts || [];
            if (resetPosts || page === 1) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }
            
            setHasMore(response.data?.currentPage < response.data?.totalPages);
        } catch (error) {
            console.error('Error loading posts:', error);
            showToast('Failed to load posts', 'error');
        } finally {
            setLoading(false);
        }
    }, [loading, page, userId, showToast]);
    
    // Initialize with posts
    useEffect(() => {
        if (initialPosts && initialPosts.length > 0) {
            setPosts(initialPosts);
        } else {
            loadPosts();
        }
    }, [loadPosts, initialPosts]);
    
    // Handle post updates
    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post)
        );
    };
    
    // Handle post deletion
    const handlePostDelete = async (postId) => {
        try {
            // Optimistic UI update
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
            
            // Call API to delete
            const response = await deletePost(postId);
            if (response.status !== 'success') {
                throw new Error(response.message || 'Failed to delete post');
            }
            
            showToast('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Failed to delete post', 'error');
            // Could reload posts here to restore state
        }
    };
    
    // Add a new post to the list
    const addNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    
    // Load more posts
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };
    
    return (
        <div className="posts-list-container">
            {loading && page === 1 ? (
                <Loader />
            ) : posts.length > 0 ? (
                <div className="posts-list">
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onPostDelete={handlePostDelete}
                        />
                    ))}
                    
                    {loading && page > 1 && <Loader />}
                    
                    {!loading && hasMore && (
                        <div className="load-more">
                            <Button onClick={handleLoadMore} className="load-more-button">
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-posts">
                    {userId ? (
                        <p>No posts to show from this user yet.</p>
                    ) : (
                        <p>No posts in your feed yet. Follow more users to see their posts!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostsList;
