// Feed Page Component
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import './Feed.css';

function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const pageSize = 10;

    // Fetch feed posts
    useEffect(() => {
        fetchFeed();
    }, [pageNumber]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await postAPI.getFeed(user.id, pageNumber, pageSize);
            console.log('First post isLikedByUser:', response.data[0]?.isLikedByUser);
            setPosts(response.data);
        } catch (err) {
            setError('Failed to load feed. Please try again.');
            console.error('Error fetching feed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = () => {
        console.log('Create post clicked');
        setIsCreateModalOpen(true);
    };

        const handlePostCreated = () => {
            setPageNumber(1);
            setPosts([]); // Clear first so pageNumber=1 triggers fresh fetch

        };

    const handlePostDeleted = () => {
        fetchFeed();
    };

    return (
        <div className="feed-layout">
            <Navbar onCreatePost={handleCreatePost} />

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostCreated={handlePostCreated}
            />

            <div className="feed-container">
                <div className="feed-content">
                    <h2 className="feed-title">Your Feed</h2>

                    {/* Loading State */}
                    {loading && (
                        <div className="feed-loading">
                            <div className="spinner"></div>
                            <p>Loading posts...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="feed-error">
                            <p>{error}</p>
                            <button onClick={fetchFeed} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && posts.length === 0 && (
                        <div className="feed-empty">
                            <h3>No posts yet</h3>
                            <p>Start following people or create your first post!</p>
                            <button onClick={handleCreatePost} className="btn btn-primary">
                                Create Post
                            </button>
                        </div>
                    )}

                    {/* Posts List */}
                    {!loading && !error && posts.length > 0 && (
                        <div className="posts-list">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onUpdate={handlePostDeleted}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More Button */}
                    {!loading && posts.length >= pageSize && (
                        <button
                            className="btn btn-secondary load-more-btn"
                            onClick={() => setPageNumber(pageNumber + 1)}
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


export default Feed;