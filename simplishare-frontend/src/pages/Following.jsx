// Following Page - Shows people you are following
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { followAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { UserMinus } from 'lucide-react';
import './FollowList.css';

function Following() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowing();
    }, []);

    const fetchFollowing = async () => {
        try {
            setLoading(true);
            const response = await followAPI.getFollowing(user.id);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching following:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (targetUserId) => {
        try {
            await followAPI.unfollowUser(user.id, targetUserId);
            // Remove from local state
            setUsers(users.filter(u => u.id !== targetUserId));
        } catch (error) {
            console.error('Error unfollowing:', error);
        }
    };

    return (
        <div className="follow-list-layout">
            <Navbar />

            <div className="follow-list-container">
                {/* Header */}
                <div className="follow-list-header">
                    <h1>Following</h1>
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
                        <p>You're not following anyone yet</p>
                        <p className="text-sm text-secondary">Discover people in the Explore page</p>
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
                                        <p className="user-email">{u.phoneNumber || 'User'}</p>
                                    </div>
                                </Link>

                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleUnfollow(u.id)}
                                >
                                    <UserMinus size={16} />
                                    Unfollow
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Following;