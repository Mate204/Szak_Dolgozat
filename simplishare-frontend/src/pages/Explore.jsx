// Explore Page - Discover new users and posts
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, followAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { UserPlus, UserMinus, Users, TrendingUp } from 'lucide-react';
import './Explore.css';

function Explore() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followStates, setFollowStates] = useState({});
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'trending'

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllUsers();
            // Filter out current user and deleted users
            const filteredUsers = response.data.filter(
                u => u.id !== currentUser.id && !u.deleted
            );
            setUsers(filteredUsers);

            // Check follow status for each user
            if (filteredUsers.length > 0) {
                checkFollowStatuses(filteredUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatuses = async (userList) => {
        const statuses = {};
        for (const u of userList) {
            try {
                const response = await followAPI.isFollowing(currentUser.id, u.id);
                statuses[u.id] = response.data.message?.includes('is following');
            } catch (error) {
                statuses[u.id] = false;
            }
        }
        setFollowStates(statuses);
    };

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
        <div className="explore-layout">
            <Navbar />

            <div className="explore-container">
                {/* Header */}
                <div className="explore-header">
                    <h1>Explore</h1>
                    <p className="explore-subtitle">Discover new people and content</p>
                </div>

                {/* Tabs */}
                <div className="explore-tabs">
                    <button
                        className={`explore-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        <span>Suggested Users</span>
                    </button>
                    <button
                        className={`explore-tab ${activeTab === 'trending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trending')}
                    >
                        <TrendingUp size={18} />
                        <span>Trending</span>
                    </button>
                </div>

                {/* Content */}
                <div className="explore-content">
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <>
                            {loading && (
                                <div className="explore-loading">
                                    <div className="spinner"></div>
                                    <p>Loading users...</p>
                                </div>
                            )}

                            {!loading && users.length === 0 && (
                                <div className="explore-empty">
                                    <p>No users found</p>
                                </div>
                            )}

                            {!loading && users.length > 0 && (
                                <div className="user-grid">
                                    {users.map((u) => (
                                        <div key={u.id} className="user-card">
                                            <Link to={`/profile/${u.id}`} className="user-card-link">
                                                <div className="user-card-avatar">
                                                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                                </div>
                                                <h3 className="user-card-name">{u.name}</h3>
                                                <p className="user-card-info">
                                                    {u.phoneNumber || 'SimpliShare User'}
                                                </p>
                                            </Link>
                                            <button
                                                className={`btn btn-sm w-full ${
                                                    followStates[u.id] ? 'btn-secondary' : 'btn-primary'
                                                }`}
                                                onClick={() => handleFollowToggle(u.id)}
                                            >
                                                {followStates[u.id] ? (
                                                    <>
                                                        <UserMinus size={16} />
                                                        Following
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={16} />
                                                        Follow
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Trending Tab */}
                    {activeTab === 'trending' && (
                        <div className="explore-empty">
                            <TrendingUp size={48} />
                            <h3>Coming Soon</h3>
                            <p>Trending posts will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Explore;