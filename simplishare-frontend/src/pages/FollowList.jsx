// Follow List Page - Shows Followers or Following
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { followAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import './FollowList.css';

function FollowList() {
    const { userId, type } = useParams(); // type is 'followers' or 'following'
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followStates, setFollowStates] = useState({});

    const isFollowers = type === 'followers';
    const title = isFollowers ? 'Followers' : 'Following';

    useEffect(() => {
        fetchUsers();
    }, [userId, type]);

    // Fetch followers or following
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = isFollowers
                ? await followAPI.getFollowers(userId)
                : await followAPI.getFollowing(userId);
            setUsers(response.data);

            // Check follow status for each user
            if (response.data.length > 0) {
                checkFollowStatuses(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if current user follows each user in the list
    const checkFollowStatuses = async (userList) => {
        const statuses = {};
        for (const u of userList) {
            if (u.id !== currentUser.id) {
                try {
                    const response = await followAPI.isFollowing(currentUser.id, u.id);
                    statuses[u.id] = response.data.message?.includes('is following');
                } catch (error) {
                    statuses[u.id] = false;
                }
            }
        }
        setFollowStates(statuses);
    };

    // Handle follow/unfollow
    const handleFollowToggle = async (targetUserId) => {
        try {
            const isFollowing = followStates[targetUserId];

            if (isFollowing) {
                await followAPI.unfollowUser(currentUser.id, targetUserId);
            } else {
                await followAPI.followUser(currentUser.id, targetUserId);
            }

            setFollowStates({
                ...followStates,
                [targetUserId]: !isFollowing,
            });
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    return (
        <div className="follow-list-layout">
            <Navbar />

            <div className="follow-list-container">
                {/* Header */}
                <div className="follow-list-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>{title}</h1>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="follow-list-loading">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && users.length === 0 && (
                    <div className="follow-list-empty">
                        <p>No {title.toLowerCase()} yet</p>
                    </div>
                )}

                {/* Users List */}
                {!loading && users.length > 0 && (
                    <div className="follow-list-content">
                        {users.map((u) => (
                            <div key={u.id} className="follow-list-item">
                                <Link to={`/profile/${u.id}`} className="user-info">
                                    <div className="user-avatar">
                                        {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                    </div>
                                    <div className="user-details">
                                        <p className="user-name">{u.name}</p>
                                        <p className="user-email">{u.email || 'User'}</p>
                                    </div>
                                </Link>

                                {/* Follow Button (don't show for own profile) */}
                                {u.id !== currentUser.id && (
                                    <button
                                        className={`btn btn-sm ${
                                            followStates[u.id] ? 'btn-secondary' : 'btn-primary'
                                        }`}
                                        onClick={() => handleFollowToggle(u.id)}
                                    >
                                        {followStates[u.id] ? (
                                            <>
                                                <UserMinus size={16} />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FollowList;