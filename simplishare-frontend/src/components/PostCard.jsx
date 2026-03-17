// Post Card Component - displays a single post
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, X, Trash2, MoreVertical  } from 'lucide-react';
import { Link } from 'react-router-dom';  // ADD THIS LINE
import './PostCard.css';

function PostCard({ post, onUpdate }) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const hasImages = post.images && post.images.length > 0;
    const hasMultipleImages = post.images && post.images.length > 1;
    const isOwnPost = user.id === post.user?.id;

    // Fetch comments when comments section is opened
    useEffect(() => {
        if (showComments && comments.length === 0 && post.commentCount > 0) {
            fetchComments();
        }
    }, [showComments]);

    // Fetch comments for this post (by re-fetching the full post)
    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await postAPI.getPost(post.id);
            // The post should include comments array from backend
            if (response.data.data?.comments) {
                setComments(response.data.data.comments);
            } else if (response.data.comments) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    // Handle like/unlike
    const handleLike = async () => {
        try {
            if (isLiked) {
                await postAPI.unlikePost({ userId: user.id, postId: post.id });
                setIsLiked(false);
                setLikeCount(likeCount - 1);
            } else {
                await postAPI.likePost({ userId: user.id, postId: post.id });
                setIsLiked(true);
                setLikeCount(likeCount + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await postAPI.addComment(post.id, {
                userId: user.id,
                postId: post.id,
                textContent: commentText,
            });

            setCommentText('');

            // Add the new comment to the local state instead of refetching
            const newComment = {
                id: Date.now(), // Temporary ID
                userId: user.id,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name
                },
                textContent: commentText,
                uploadDate: new Date().toISOString(),
                postId: post.id
            };

            setComments([...comments, newComment]);

            // Don't call onUpdate to avoid page refresh
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    // Delete post
    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setDeleting(true);
            await postAPI.deletePost(post.id);
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setDeleting(false);
            setShowPostMenu(false);
        }
    };

    // Navigate images in gallery
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <article className="post-card">
                {/* Post Header */}
                <div className="post-header">
                    <Link to={`/profile/${post.user?.id}`} className="post-author">
                        <div className="author-avatar">
                            {post.user?.firstName?.charAt(0)}{post.user?.lastName?.charAt(0)}
                        </div>
                        <div className="author-info">
                            <p className="author-name">{post.user?.name}</p>
                            <p className="post-time">{formatDate(post.uploadDate)}</p>
                        </div>
                    </Link>

                    {/* Post Menu (only for own posts) */}
                    {isOwnPost && (
                        <div className="post-menu">
                            <button
                                className="post-menu-btn"
                                onClick={() => setShowPostMenu(!showPostMenu)}
                            >
                                <MoreVertical size={20} />
                            </button>
                            {showPostMenu && (
                                <div className="post-menu-dropdown">
                                    <button
                                        className="post-menu-item delete"
                                        onClick={handleDeletePost}
                                        disabled={deleting}
                                    >
                                        <Trash2 size={16} />
                                        <span>{deleting ? 'Deleting...' : 'Delete Post'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Title */}
                <h3 className="post-title">{post.title}</h3>

                {/* Post Images */}
                {hasImages && (
                    <div className="post-images">
                        <div
                            className="post-image-container"
                            onClick={() => setShowImageModal(true)}
                        >
                            <img
                                src={post.images[currentImageIndex].imageUrl}
                                alt={post.images[currentImageIndex].description || post.title}
                                className="post-image"
                            />
                            {hasMultipleImages && (
                                <>
                                    <button
                                        className="image-nav-btn prev-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        className="image-nav-btn next-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    <div className="image-indicator">
                                        {currentImageIndex + 1} / {post.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Post Text Content */}
                {post.textContent && (
                    <p className="post-content">{post.textContent}</p>
                )}

                {/* Post Actions */}
                <div className="post-actions">
                    <button
                        className={`action-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{likeCount}</span>
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle size={20} />
                        <span>{post.commentCount}</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="comments-section">
                        <div className="comments-header">
                            <h4>Comments</h4>
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="comment-input"
                                disabled={submittingComment}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={submittingComment || !commentText.trim()}
                            >
                                {submittingComment ? 'Posting...' : 'Post'}
                            </button>
                        </form>

                        {/* Comments List - Placeholder for now */}
                        <div className="comments-list">
                            {loadingComments ? (
                                <div className="comments-loading">
                                    <div className="spinner-small"></div>
                                    <span>Loading comments...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-secondary text-sm">
                                    {post.commentCount === 0
                                        ? 'No comments yet. Be the first to comment!'
                                        : 'Click to load comments'}
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-avatar">
                                            {comment.user?.firstName?.charAt(0)}{comment.user?.lastName?.charAt(0)}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.user?.name}</span>
                                                <span className="comment-time">{formatDate(comment.uploadDate)}</span>
                                            </div>
                                            <p className="comment-text">{comment.textContent}</p>
                                        </div>
                                        {comment.userId === user.id && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                title="Delete comment"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </article>

            {/* Image Modal (Full Screen) */}
            {showImageModal && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <button className="modal-close-btn" onClick={() => setShowImageModal(false)}>
                        <X size={24} />
                    </button>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={post.images[currentImageIndex].imageUrl}
                            alt={post.images[currentImageIndex].description || post.title}
                            className="modal-image"
                        />
                        {hasMultipleImages && (
                            <>
                                <button className="modal-nav-btn prev-btn" onClick={prevImage}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="modal-nav-btn next-btn" onClick={nextImage}>
                                    <ChevronRight size={32} />
                                </button>
                                <div className="modal-image-indicator">
                                    {currentImageIndex + 1} / {post.images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default PostCard;