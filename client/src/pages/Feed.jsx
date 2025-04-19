import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getPosts, createPost, uploadMedia } from '../utils/api';
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

    useEffect(() => {
        loadPosts();
    }, [page]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await getPosts(page);
            
            if (page === 1) {
                // Replace posts completely on first page
                setPosts(response.data.posts);
            } else {
                // Append posts for subsequent pages
                setPosts(prev => [...prev, ...response.data.posts]);
            }
            
            // Check if there are more pages
            setHasMore(response.data.currentPage < response.data.totalPages);
            setError('');
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async (postData) => {
        try {
            setSubmitting(true);
            let mediaUrl = '';
            
            // Handle file upload if present
            if (postData.mediaFile) {
                const uploadResponse = await uploadMedia(postData.mediaFile);
                mediaUrl = uploadResponse.data.url;
            }
            
            // Create the post
            const response = await createPost({
                content: postData.content,
                mediaUrl,
                tags: postData.tags,
                visibility: postData.visibility
            });
            
            // Add new post to the top of the list
            setPosts(prev => [response.data, ...prev]);
            setError('');
            return true;
        } catch (err) {
            setError('Failed to create post');
            console.error(err);
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
                            onPostUpdate={(updatedPost) => {
                                setPosts(prev => 
                                    prev.map(p => p._id === updatedPost._id ? updatedPost : p)
                                );
                            }}
                            onPostDelete={(postId) => {
                                setPosts(prev => prev.filter(p => p._id !== postId));
                            }}
                        />
                    ))
                ) : !loading ? (
                    <p className="no-posts-message">No posts yet. Be the first to share something!</p>
                ) : null}
                
                {loading && <Loader />}
                
                {hasMore && !loading && (
                    <div className="load-more">
                        <Button onClick={handleLoadMore} className="load-more-btn">
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
