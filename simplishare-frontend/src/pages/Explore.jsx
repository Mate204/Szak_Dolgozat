import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, followAPI, trendingAPI, recommendationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { UserPlus, UserMinus, Users, TrendingUp, Search, Compass, Image as ImageIcon, X } from 'lucide-react';
import './Explore.css';

function Explore() {
    const { user: currentUser } = useAuth();

    // --- Users tab ---
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [followStates, setFollowStates] = useState({});

    // --- Trending tab ---
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [trendingLoading, setTrendingLoading] = useState(false);
    const [trendingPeriod, setTrendingPeriod] = useState(1); // 0=Daily,1=Weekly,2=Monthly

    // --- Discover tab ---
    const [discoverPosts, setDiscoverPosts] = useState([]);
    const [discoverLoading, setDiscoverLoading] = useState(false);



    const [activeTab, setActiveTab] = useState('users');

    // Load data when tab changes
    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) fetchUsers();
        if (activeTab === 'trending') fetchTrending(trendingPeriod);
        if (activeTab === 'discover' && discoverPosts.length === 0) fetchDiscover();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'trending') fetchTrending(trendingPeriod);
    }, [trendingPeriod]);

    // ── Users ──────────────────────────────────────────
    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await userAPI.getAllUsers();
            const filtered = response.data.filter(u => u.id !== currentUser.id && !u.deleted);
            setUsers(filtered);
            if (filtered.length > 0) checkFollowStatuses(filtered);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const checkFollowStatuses = async (userList) => {
        const statuses = {};
        for (const u of userList) {
            try {
                const res = await followAPI.isFollowing(currentUser.id, u.id);
                statuses[u.id] = res.data.message?.includes('is following');
            } catch {
                statuses[u.id] = false;
            }
        }
        setFollowStates(statuses);
    };

    const handleFollowToggle = async (targetUserId) => {
        try {
            console.log('currentUser.id:', currentUser.id, 'targetUserId:', targetUserId, 'type:', typeof currentUser.id, typeof targetUserId);
            const isFollowing = followStates[targetUserId];
            if (isFollowing) {
                await followAPI.unfollowUser(parseInt(currentUser.id),parseInt(targetUserId));
            } else {
                await followAPI.followUser(parseInt(currentUser.id),parseInt(targetUserId));
            }
            setFollowStates(prev => ({ ...prev, [targetUserId]: !isFollowing }));
        } catch (err) {
            console.error('Error toggling follow:', err.response?.data);
        }
    };

    // ── Trending ───────────────────────────────────────
    const fetchTrending = async (period) => {
        try {
            setTrendingLoading(true);
            const res = await trendingAPI.getTrending(period);
            setTrendingPosts(res.data || []);
        } catch (err) {
            console.error('Error fetching trending:', err);
        } finally {
            setTrendingLoading(false);
        }
    };

    // ── Discover ───────────────────────────────────────
    const fetchDiscover = async () => {
        try {
            setDiscoverLoading(true);
            const res = await recommendationAPI.getDiscoverFeed(20);
            setDiscoverPosts(res.data || []);
        } catch (err) {
            console.error('Error fetching discover:', err);
        } finally {
            setDiscoverLoading(false);
        }
    };









    const PERIOD_LABELS = ['Daily', 'Weekly', 'Monthly'];

    return (
        <div className="explore-layout">
            <Navbar />

            <div className="explore-container">
                <div className="explore-header">
                    <h1>Explore</h1>
                    <p className="explore-subtitle">Discover people, trending posts, and more</p>
                </div>

                {/* Tabs */}
                <div className="explore-tabs">
                    {[
                        { id: 'users',    icon: <Users size={18} />,      label: 'People' },
                        { id: 'trending', icon: <TrendingUp size={18} />, label: 'Trending' },
                        { id: 'discover', icon: <Compass size={18} />,    label: 'Discover' },

                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`explore-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="explore-content">

                    {/* ── PEOPLE TAB ── */}
                    {activeTab === 'users' && (
                        <>
                            {usersLoading && <div className="explore-loading"><div className="spinner" /><p>Loading users...</p></div>}
                            {!usersLoading && users.length === 0 && (
                                <div className="explore-empty"><p>No users found</p></div>
                            )}
                            {!usersLoading && users.length > 0 && (
                                <div className="user-grid">
                                    {users.map(u => (
                                        <div key={u.id} className="user-card">
                                            <Link to={`/profile/${u.id}`} className="user-card-link">
                                                <div className="user-card-avatar">
                                                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                                </div>
                                                <h3 className="user-card-name">{u.name}</h3>
                                                <p className="user-card-info">{u.phoneNumber || 'SimpliShare User'}</p>
                                            </Link>
                                            <button
                                                className={`btn btn-sm w-full ${followStates[u.id] ? 'btn-secondary' : 'btn-primary'}`}
                                                onClick={() => handleFollowToggle(u.id)}
                                            >
                                                {followStates[u.id] ? <><UserMinus size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TRENDING TAB ── */}
                    {activeTab === 'trending' && (
                        <>
                            {/* Period selector */}
                            <div className="period-selector">
                                {PERIOD_LABELS.map((label, idx) => (
                                    <button
                                        key={idx}
                                        className={`period-btn ${trendingPeriod === idx ? 'active' : ''}`}
                                        onClick={() => setTrendingPeriod(idx)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {trendingLoading && <div className="explore-loading"><div className="spinner" /><p>Loading trending posts...</p></div>}

                            {!trendingLoading && trendingPosts.length === 0 && (
                                <div className="explore-empty">
                                    <TrendingUp size={48} />
                                    <h3>No trending posts</h3>
                                    <p>Check back later for trending content</p>
                                </div>
                            )}

                            {!trendingLoading && trendingPosts.length > 0 && (
                                <div className="posts-feed">
                                    {trendingPosts.map(post => (
                                        <PostCard key={post.id} post={post} onUpdate={() => fetchTrending(trendingPeriod)} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── DISCOVER TAB ── */}
                    {activeTab === 'discover' && (
                        <>
                            <div className="discover-header">
                                <p className="discover-subtitle">Posts recommended just for you</p>
                                <button className="btn btn-secondary btn-sm" onClick={fetchDiscover}>
                                    Refresh
                                </button>
                            </div>

                            {discoverLoading && <div className="explore-loading"><div className="spinner" /><p>Finding posts for you...</p></div>}

                            {!discoverLoading && discoverPosts.length === 0 && (
                                <div className="explore-empty">
                                    <Compass size={48} />
                                    <h3>Nothing to discover yet</h3>
                                    <p>Interact with posts to get personalised recommendations</p>
                                </div>
                            )}

                            {!discoverLoading && discoverPosts.length > 0 && (
                                <div className="posts-feed">
                                    {discoverPosts.map(post => (
                                        <PostCard key={post.id} post={post} onUpdate={fetchDiscover} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}



                </div>
            </div>
        </div>
    );
}

export default Explore;