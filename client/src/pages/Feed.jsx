import React, { useState, useEffect, useContext, useCallback } from 'react'; 
import { AuthContext } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getPosts, createPost, uploadMedia, deletePost } from '../utils/api';
import PostCard from '../components/posts/PostCard';
import CreatePostForm from '../components/posts/CreatePostForm';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import './Feed.css';

const Feed = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    const loadPosts = useCallback(async (reset = false) => {
        if (loading && !reset) return; // Prevent multiple simultaneous loads unless resetting
        setLoading(true);
        const targetPage = reset ? 1 : page; // Use page 1 if resetting

        try {
            const response = await getPosts(targetPage);
            if (response.status === 'success') {
                // If resetting or loading page 1, replace posts. Otherwise, append.
                setPosts(prev => (targetPage === 1) ? response.data.posts : [...prev, ...response.data.posts]);
                setHasMore(response.data.hasMore || false);
                setError('');
            } else {
                setError('Failed to load posts.');
                showToast('Failed to load posts', 'error');
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error loading posts:", err);
            setError('An error occurred while loading posts.');
            showToast('An error occurred while loading posts', 'error');
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [page, showToast, loading]);

    useEffect(() => {
        loadPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handlePostSubmit = async (postData) => {
        try {
            setSubmitting(true);
            let mediaUrl = '';

            // Handle file upload if present
            if (postData.mediaFile) {
                try {
                    const uploadResponse = await uploadMedia(postData.mediaFile);
                    if (uploadResponse.status === 'success') {
                        mediaUrl = uploadResponse.data.url;
                    } else {
                        throw new Error(uploadResponse.message || 'Failed to upload media');
                    }
                } catch (uploadError) {
                    console.error('Media upload error:', uploadError);
                    showToast('Failed to upload media. Please try again.', 'error');
                    setSubmitting(false);
                    return false;
                }
            }

            // Create the post
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                tags: postData.tags,
                visibility: postData.visibility
            });

            if (response.status === 'success') {
                // Add new post to the top of the list immediately
                setPosts(prev => [response.data, ...prev]);
                setError('');
                showToast('Post created successfully!', 'success');
                setSubmitting(false);
                
                // Reload all posts from server to ensure consistency
                loadPosts(true);
                
                return true; // Return true to signal success to the form
            } else {
                throw new Error(response.message || 'Failed to create post');
            }
        } catch (err) {
            setError('Failed to create post');
            console.error('Post creation error:', err);
            showToast('Failed to create post. Please try again.', 'error');
            setSubmitting(false);
            return false;
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePostDelete = async (postId) => {
        try {
            const response = await deletePost(postId);
            if (response.status === 'success') {
                setPosts(prev => prev.filter(p => p._id !== postId));
                showToast('Post deleted successfully', 'success');
            } else {
                showToast(response.message || 'Failed to delete post', 'error');
            }
        } catch (err) {
            console.error('Delete post error:', err);
            showToast('Error deleting post. Please try again.', 'error');
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prev =>
            prev.map(p => p._id === updatedPost._id ? updatedPost : p)
        );
    };

    return (
        <div className="feed-container">
            <h1>SwimSphere Feed</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="create-post-section">
                <CreatePostForm
                    onSubmit={handlePostSubmit}
                    loading={submitting}
                />
            </div>

            <div className="posts-section">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            currentUser={user}
                            onPostUpdate={handlePostUpdate}
                            onPostDelete={handlePostDelete}
                        />
                    ))
                ) : !loading ? (
                    <p className="no-posts-message">No posts yet. Be the first to share something!</p>
                ) : null}

                {loading && page > 1 && <Loader />}
                {loading && page === 1 && <Loader />}

                {hasMore && !loading && (
                    <div className="load-more">
                        <Button onClick={handleLoadMore} className="load-more-btn">
                            Load More
                        </Button>
                    </div>
                )}
                {!hasMore && !loading && posts.length > 0 && (
                    <p className="text-center text-gray-500 my-4">You've reached the end!</p>
                )}
            </div>
        </div>
    );
};

export default Feed;
