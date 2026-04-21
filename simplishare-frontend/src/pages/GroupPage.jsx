// Group Page Component
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupAPI, postAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Users, Lock, Globe, PlusCircle, UserCheck, X, Check } from 'lucide-react';
import './GroupPage.css';

function GroupPage() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [joining, setJoining] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    const fetchGroupData = async () => {
        try {
            setLoading(true);
            // Fetch all data in parallel
            const [allGroupsRes, myGroupsRes, membersRes] = await Promise.all([
                groupAPI.getAllGroups(),
                groupAPI.getMyGroups(),
                groupAPI.getGroupMembers(groupId),
            ]);

            // Find this group from all groups
            const foundGroup = allGroupsRes.data.find(g => g.id === parseInt(groupId));
            if (!foundGroup) {
                navigate('/feed');
                return;
            }
            setGroup(foundGroup);

            // Check membership
            const myGroupIds = new Set(myGroupsRes.data.map(g => g.id));
            const memberStatus = myGroupIds.has(parseInt(groupId));
            setIsMember(memberStatus);
            setIsCreator(foundGroup.creatorId === user.id);

            // Set approved members
            if (membersRes.data) {
                setMembers(membersRes.data.filter(m => m.isApproved));
            }

            // Fetch posts if member or public group
            if (memberStatus || !foundGroup.isPrivate) {
                const postsRes = await groupAPI.getGroupPosts(groupId);
                setPosts(postsRes.data || []);
            }

        } catch (error) {
            console.error('Error fetching group data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setJoining(true);
            await groupAPI.joinGroup(groupId);
            await fetchGroupData();
        } catch (error) {
            console.error('Error joining group:', error);
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="group-page-layout">
                <Navbar />
                <div className="group-page-loading">
                    <div className="spinner"></div>
                    <p>Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) return null;

    const canInteract = isMember;

    return (
        <div className="group-page-layout">
            <Navbar />

            <div className="group-page-container">

                {/* Left: Group Info */}
                <div className="group-page-left">
                    <div className="group-info-card">
                        <div className="group-info-avatar">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="group-info-name">{group.name}</h2>
                        <div className="group-info-privacy">
                            {group.isPrivate ? <Lock size={14} /> : <Globe size={14} />}
                            <span>{group.isPrivate ? 'Private' : 'Public'} Group</span>
                        </div>
                        {group.description && (
                            <p className="group-info-description">{group.description}</p>
                        )}
                        <p className="group-info-meta">
                            {group.memberCount} members · Created by {group.creatorName}
                        </p>

                        {/* Action buttons */}
                        {!isMember && (
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleJoin}
                                disabled={joining}
                            >
                                {joining ? 'Joining...' : group.isPrivate ? 'Request to Join' : 'Join Group'}
                            </button>
                        )}

                        {isMember && (
                            <button
                                className="btn btn-primary w-full"
                                onClick={() => setShowCreatePost(true)}
                            >
                                <PlusCircle size={18} />
                                Create Post
                            </button>
                        )}

                        {isCreator && (
                            <button
                                className="btn btn-secondary w-full"
                                onClick={() => setShowManageModal(true)}
                                style={{ marginTop: 8 }}
                            >
                                <UserCheck size={18} />
                                Manage Members
                            </button>
                        )}

                        {/* Allowed Tags */}
                        {group.allowedTagNames && group.allowedTagNames.length > 0 && (
                            <div className="group-info-tags">
                                <p className="group-tags-label">Allowed Tags</p>
                                <div className="group-tags-list">
                                    {group.allowedTagNames.map((tag, i) => (
                                        <span key={i} className="group-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle: Posts Feed */}
                <div className="group-page-feed">
                    {!isMember && group.isPrivate && (
                        <div className="group-private-notice">
                            <Lock size={32} />
                            <h3>This is a private group</h3>
                            <p>Join the group to interact with posts</p>
                        </div>
                    )}

                    {posts.length === 0 ? (
                        <div className="group-empty-feed">
                            <PlusCircle size={40} />
                            <h3>No posts yet</h3>
                            {isMember && <p>Be the first to post in this group!</p>}
                        </div>
                    ) : (
                        <div className="group-posts-list">
                            {posts.map(post => (
                                <div key={post.id} className={!canInteract ? 'post-disabled' : ''}>
                                    <PostCard
                                        post={post}
                                        onUpdate={fetchGroupData}
                                        readOnly={!canInteract}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Members Panel */}
                <div className="group-page-right">
                    <div className="group-members-panel">
                        <div className="group-members-header">
                            <Users size={16} />
                            <span>Members ({members.length})</span>
                        </div>
                        <div className="group-members-list">
                            {members.map(member => (
                                <Link
                                    key={member.userId}
                                    to={`/profile/${member.userId}`}
                                    className="group-member-item"
                                >
                                    <div className="group-member-avatar">
                                        {member.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="group-member-name">{member.userName}</span>
                                    {member.userId === group.creatorId && (
                                        <span className="group-member-badge">Creator</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
                <CreatePostModal
                    isOpen={showCreatePost}
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={() => {
                        setShowCreatePost(false);
                        fetchGroupData();
                    }}
                    groupId={parseInt(groupId)}
                />
            )}

            {/* Manage Members Modal */}
            {showManageModal && (
                <ManageMembersModal
                    groupId={groupId}
                    onClose={() => setShowManageModal(false)}
                    onApproved={fetchGroupData}
                />
            )}
        </div>
    );
}

// Manage Members Modal - for creator to approve pending members
function ManageMembersModal({ groupId, onClose, onApproved }) {
    const { user } = useAuth();
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState({});

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await groupAPI.getGroupMembers(groupId);
            setPendingMembers((res.data || []).filter(m => !m.isApproved));
        } catch (error) {
            console.error('Error fetching pending members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (targetUserId) => {
        try {
            setApproving(prev => ({ ...prev, [targetUserId]: true }));
            await groupAPI.approveMember(groupId, targetUserId);
            setPendingMembers(prev => prev.filter(m => m.userId !== targetUserId));
            onApproved();
        } catch (error) {
            console.error('Error approving member:', error);
        } finally {
            setApproving(prev => ({ ...prev, [targetUserId]: false }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Manage Members</h2>
                    <button className="modal-close-btn-small" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 24 }}>
                            <div className="spinner"></div>
                        </div>
                    ) : pendingMembers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                            <UserCheck size={40} />
                            <p style={{ marginTop: 12 }}>No pending requests</p>
                        </div>
                    ) : (
                        <div className="pending-members-list">
                            <p className="pending-members-title">
                                Pending Requests ({pendingMembers.length})
                            </p>
                            {pendingMembers.map(member => (
                                <div key={member.userId} className="pending-member-item">
                                    <div className="group-member-avatar">
                                        {member.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="pending-member-name">{member.userName}</span>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleApprove(member.userId)}
                                        disabled={approving[member.userId]}
                                    >
                                        <Check size={14} />
                                        {approving[member.userId] ? 'Approving...' : 'Approve'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GroupPage;