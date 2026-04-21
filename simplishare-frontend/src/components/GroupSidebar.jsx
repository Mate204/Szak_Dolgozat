// GroupSidebar Component - shows joined and available groups
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Lock, Globe } from 'lucide-react';
import './GroupSidebar.css';
import { createPortal } from 'react-dom';
import { groupAPI, tagsAPI } from '../services/api';

function GroupSidebar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myGroups, setMyGroups] = useState([]);
    const [otherGroups, setOtherGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const [myRes, allRes] = await Promise.all([
                groupAPI.getMyGroups(),
                groupAPI.getAllGroups(),
            ]);

            const myGroupIds = new Set(myRes.data.map(g => g.id));
            setMyGroups(myRes.data);
            setOtherGroups(allRes.data.filter(g => !myGroupIds.has(g.id)));
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = (groupId) => {
        navigate(`/group/${groupId}`);
    };

    return (
        <div className="group-sidebar">
            {/* Create Group Button */}
            <button
                className="create-group-btn"
                onClick={() => setShowCreateModal(true)}
            >
                <Plus size={16} />
                Create Group
            </button>

            {loading ? (
                <div className="group-sidebar-loading">
                    <div className="spinner-small-dark"></div>
                </div>
            ) : (
                <>
                    {/* My Groups */}
                    {myGroups.length > 0 && (
                        <div className="group-sidebar-section">
                            <p className="group-sidebar-label">My Groups</p>
                            {myGroups.map(group => (
                                <button
                                    key={group.id}
                                    className="group-sidebar-item joined"
                                    onClick={() => handleGroupClick(group.id)}
                                >
                                    <div className="group-sidebar-avatar">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="group-sidebar-info">
                                        <span className="group-sidebar-name">{group.name}</span>
                                        <span className="group-sidebar-meta">
                                            {group.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                                            {group.memberCount} members
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Divider */}
                    {myGroups.length > 0 && otherGroups.length > 0 && (
                        <div className="group-sidebar-divider" />
                    )}

                    {/* Other Groups */}
                    {otherGroups.length > 0 && (
                        <div className="group-sidebar-section">
                            <p className="group-sidebar-label">Discover Groups</p>
                            {otherGroups.map(group => (
                                <button
                                    key={group.id}
                                    className="group-sidebar-item"
                                    onClick={() => handleGroupClick(group.id)}
                                >
                                    <div className="group-sidebar-avatar other">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="group-sidebar-info">
                                        <span className="group-sidebar-name">{group.name}</span>
                                        <span className="group-sidebar-meta">
                                            {group.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                                            {group.memberCount} members
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {myGroups.length === 0 && otherGroups.length === 0 && (
                        <p className="group-sidebar-empty">No groups yet</p>
                    )}
                </>
            )}

            {showCreateModal && createPortal(
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchGroups();
                    }}
                />,
                document.body
            )}
        </div>
    );
}

// Create Group Modal
function CreateGroupModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [allTags, setAllTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [tagSearch, setTagSearch] = useState('');

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await tagsAPI.getAllTags();
            setAllTags(res.data || []);
        } catch (err) {
            console.error('Error fetching tags:', err);
        } finally {
            setTagsLoading(false);
        }
    };

    const toggleTag = (tagId) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const filteredTags = allTags.filter(t =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Group name is required');
            return;
        }
        try {
            setLoading(true);
            await groupAPI.createGroup({
                name: name.trim(),
                description: description.trim(),
                isPrivate,
                allowedTagIds: selectedTagIds,
            });
            onCreated();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Group</h2>
                    <button className="modal-close-btn-small" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Group Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input"
                            placeholder="Enter group name"
                            maxLength={100}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="input textarea"
                            placeholder="What is this group about?"
                            rows={3}
                            maxLength={500}
                        />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={e => setIsPrivate(e.target.checked)}
                            />
                            <span>Private group (members need approval)</span>
                        </label>
                    </div>

                    {/* Tag Picker */}
                    <div className="form-group">
                        <label className="form-label">
                            Allowed Tags
                            {selectedTagIds.length > 0 && (
                                <span className="tag-selected-count"> ({selectedTagIds.length} selected)</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={tagSearch}
                            onChange={e => setTagSearch(e.target.value)}
                            className="input"
                            placeholder="Search tags..."
                            style={{ marginBottom: 8 }}
                        />
                        {tagsLoading ? (
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading tags...</p>
                        ) : filteredTags.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No tags found</p>
                        ) : (
                            <div className="tag-picker">
                                {filteredTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        className={`tag-pill ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GroupSidebar;