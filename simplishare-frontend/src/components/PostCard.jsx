// Post Card Component
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { Heart, ChevronLeft, ChevronRight, X, Trash2, MoreVertical, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PostCard.css';

function PostCard({ post, onUpdate }) {
    const { user } = useAuth();

    // Initialize like state directly from post prop - backend now sets this correctly
    const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [likeLoading, setLikeLoading] = useState(false);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Image state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);

    // Post menu state
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const hasImages = post.images && post.images.length > 0;
    const hasMultipleImages = post.images && post.images.length > 1;
    const isOwnPost = user?.id === post.user?.id;



    // Load comments once on first render
    useEffect(() => {
        loadComments();
    }, [post.id]);

    const loadComments = async () => {
        if (commentsLoaded) return;
        try {
            setLoadingComments(true);
            const response = await postAPI.getPost(post.id);
            const data = response.data;
            const postData = data.data || data;
            // ONLY set comments - never touch like state here
            if (postData?.comments) {
                setComments(postData.comments);
            }
            setCommentsLoaded(true);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://localhost:7114${url}`;
    };

    // ── Like handler with optimistic update ──
    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);

        // Save current state for rollback
        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;

        // Optimistic update - update UI immediately
        setIsLiked(!previousIsLiked);
        setLikeCount(prev => previousIsLiked ? prev - 1 : prev + 1);

        try {
            if (previousIsLiked) {
                await postAPI.unlikePost({ userId: user.id, postId: post.id });
            } else {
                await postAPI.likePost({ userId: user.id, postId: post.id });
            }
            // Success - keep the optimistic update, don't refetch
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
        } finally {
            setLikeLoading(false);
        }
    };

    // ── Comment handlers ──
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || submittingComment) return;

        const text = commentText.trim();
        setCommentText('');

        try {
            setSubmittingComment(true);
            await postAPI.addComment(post.id, {
                userId: user.id,
                postId: post.id,
                textContent: text,
            });
            setComments(prev => [...prev, {
                id: Date.now(),
                userId: user.id,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name
                },
                textContent: text,
                uploadDate: new Date().toISOString(),
                postId: post.id
            }]);
        } catch (error) {
            console.error('Error adding comment:', error);
            setCommentText(text);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await postAPI.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // ── Post delete ──
    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            setDeleting(true);
            await postAPI.deletePost(post.id);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post.');
        } finally {
            setDeleting(false);
            setShowPostMenu(false);
        }
    };

    // ── Image navigation ──
    const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % post.images.length);
    const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + post.images.length) % post.images.length);

    // ── Date formatter ──
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
                {/* Header */}
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
                    {isOwnPost && (
                        <div className="post-menu">
                            <button className="post-menu-btn" onClick={() => setShowPostMenu(!showPostMenu)}>
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

                {/* Title */}
                <h3 className="post-title">{post.title}</h3>

                {/* Body: media + comments */}
                <div className="post-body">

                    {/* Left: media + like */}
                    <div className="post-media">
                        {hasImages && (
                            <div className="post-images">
                                <div
                                    className="post-image-container"
                                    onClick={() => setShowImageModal(true)}
                                >
                                    <img
                                        src={resolveImageUrl(post.images[currentImageIndex].imageUrl)}
                                        alt={post.images[currentImageIndex].description || post.title}
                                        className="post-image"
                                    />
                                    {hasMultipleImages && (
                                        <>
                                            <button className="image-nav-btn prev-btn" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button className="image-nav-btn next-btn" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                                                <ChevronRight size={20} />
                                            </button>
                                            <div className="image-indicator">
                                                {currentImageIndex + 1} / {post.images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {post.textContent && (
                            <p className="post-content">{post.textContent}</p>
                        )}

                        <div className="post-actions">
                            <button
                                className={`action-btn ${isLiked ? 'liked' : ''}`}
                                onClick={handleLike}
                                disabled={likeLoading}
                            >
                                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                                <span>{likeCount}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: comments panel */}
                    <div className="comments-panel">
                        <div className="comments-panel-header">
                            Comments ({comments.length})
                        </div>
                        <div className="comments-panel-list">
                            {loadingComments ? (
                                <div className="comments-empty">Loading...</div>
                            ) : comments.length === 0 ? (
                                <div className="comments-empty">No comments yet. Be the first!</div>
                            ) : (
                                comments.map(comment => (
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
                                        {comment.userId === user?.id && (
                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleCommentSubmit} className="comments-panel-input">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="comment-input"
                                disabled={submittingComment}
                            />
                            <button
                                type="submit"
                                className="comment-submit-btn"
                                disabled={submittingComment || !commentText.trim()}
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>

                </div>
            </article>

            {/* Image Modal */}
            {showImageModal && hasImages && (
                <div className="image-modal" onClick={() => setShowImageModal(false)}>
                    <button className="modal-close-btn" onClick={() => setShowImageModal(false)}>
                        <X size={24} />
                    </button>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={resolveImageUrl(post.images[currentImageIndex].imageUrl)}
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