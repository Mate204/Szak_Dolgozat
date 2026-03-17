// Profile Page Component
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI, followAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { Settings, UserPlus, UserMinus, Users, Grid } from 'lucide-react';
import './Profile.css';

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = currentUser?.id === parseInt(userId);

    useEffect(() => {
        fetchProfile();
        fetchPosts();
        fetchFollowCounts();
        if (!isOwnProfile) {
            checkIfFollowing();
        }
    }, [userId]);

    // Fetch user profile
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = isOwnProfile
                ? await userAPI.getPrivateProfile(userId)
                : await userAPI.getPublicProfile(userId);
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user posts
    const fetchPosts = async () => {
        try {
            const response = await postAPI.getUserPosts(userId);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    // Fetch follower/following counts
    const fetchFollowCounts = async () => {
        try {
            const [followersRes, followingRes] = await Promise.all([
                followAPI.getFollowersCount(userId),
                followAPI.getFollowingCount(userId),
            ]);
            setFollowersCount(followersRes.data.data || 0);
            setFollowingCount(followingRes.data.data || 0);
        } catch (error) {
            console.error('Error fetching follow counts:', error);
        }
    };

    // Check if current user is following this profile
    const checkIfFollowing = async () => {
        try {
            const response = await followAPI.isFollowing(currentUser.id, userId);
            // Backend returns success message, we need to check the message
            setIsFollowing(response.data.message?.includes('is following'));
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    // Handle follow/unfollow
    const handleFollowToggle = async () => {
        try {
            setFollowLoading(true);
            if (isFollowing) {
                await followAPI.unfollowUser(currentUser.id, userId);
                setIsFollowing(false);
                setFollowersCount(followersCount - 1);
            } else {
                await followAPI.followUser(currentUser.id, userId);
                setIsFollowing(true);
                setFollowersCount(followersCount + 1);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-layout">
                <Navbar />
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-layout">
                <Navbar />
                <div className="profile-error">
                    <h2>User not found</h2>
                    <button onClick={() => navigate('/feed')} className="btn btn-primary">
                        Go to Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-layout">
            <Navbar />

            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-header-content">
                        {/* Avatar */}
                        <div className="profile-avatar-large">
                            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                        </div>

                        {/* Profile Info */}
                        <div className="profile-info">
                            <div className="profile-info-top">
                                <h1 className="profile-name">{profile.name}</h1>
                                {isOwnProfile ? (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <Settings size={18} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus size={18} />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={18} />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="profile-stats">
                                <div className="profile-stat">
                                    <span className="stat-value">{posts.length}</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <button
                                    className="profile-stat profile-stat-btn"
                                    onClick={() => navigate(`/profile/${userId}/followers`)}
                                >
                                    <span className="stat-value">{followersCount}</span>
                                    <span className="stat-label">Followers</span>
                                </button>
                                <button
                                    className="profile-stat profile-stat-btn"
                                    onClick={() => navigate(`/profile/${userId}/following`)}
                                >
                                    <span className="stat-value">{followingCount}</span>
                                    <span className="stat-label">Following</span>
                                </button>
                            </div>

                            {/* Email (only on own profile) */}
                            {isOwnProfile && (
                                <p className="profile-email">{profile.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="profile-content">
                    <div className="profile-posts-header">
                        <Grid size={18} />
                        <h2>Posts</h2>
                    </div>

                    {posts.length === 0 ? (
                        <div className="profile-empty">
                            <p>No posts yet</p>
                        </div>
                    ) : (
                        <div className="profile-posts-list">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;