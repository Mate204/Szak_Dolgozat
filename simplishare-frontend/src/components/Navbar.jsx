// Navigation Bar Component
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Home,
    PlusCircle,
    User,
    Users,
    Settings,
    LogOut,
    Moon,
    Sun,
    Compass,
    Search,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { searchAPI } from '../services/api';
import './Navbar.css';

function Navbar({ onCreatePost }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    // ── Search state ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showImageDrop, setShowImageDrop] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageSearchLoading, setImageSearchLoading] = useState(false);
    const [imageSearchResults, setImageSearchResults] = useState(null);
    const searchRef = useRef(null);
    const searchTimerRef = useRef(null);

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
                setShowImageDrop(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced text search for dropdown preview
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        searchTimerRef.current = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await searchAPI.searchByText(searchQuery.trim());
                setSearchResults(res.data || []);
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(searchTimerRef.current);
    }, [searchQuery]);

    // Press Enter to go to search results page
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setSearchFocused(false);
            setShowImageDrop(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Click a text result — go to user profile
    const handleResultClick = (post) => {
        setSearchFocused(false);
        setShowImageDrop(false);
        setSearchQuery('');
        setSearchResults(null);
        navigate(`/profile/${post.user?.id}`);
    };

    // See all text results
    const handleSeeAll = () => {
        setSearchFocused(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    // See all image results
    const handleSeeAllImageResults = () => {
        setSearchFocused(false);
        setShowImageDrop(false);
        sessionStorage.setItem('imageSearchResults', JSON.stringify(imageSearchResults));
        navigate('/search?type=image');
    };

    // ── Image search handlers ──
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await processImageFile(file);
        }
    };

    const handleImageFileInput = async (e) => {
        const file = e.target.files[0];
        if (file) await processImageFile(file);
    };

    const processImageFile = async (file) => {
        setImagePreview(URL.createObjectURL(file));
        setImageSearchResults(null);
        try {
            setImageSearchLoading(true);
            const res = await searchAPI.searchByImage(file);
            setImageSearchResults(res.data || []);
        } catch (err) {
            console.error('Image search error:', err);
            setImageSearchResults([]);
        } finally {
            setImageSearchLoading(false);
        }
    };

    const clearImageSearch = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setImageSearchResults(null);
        setShowImageDrop(false);
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://localhost:7114${url}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showSearchDropdown = searchFocused && (searchQuery.trim() || showImageDrop);

    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* Column 1: Brand */}
                <Link to="/feed" className="navbar-brand">
                    <h1>SimpliShare</h1>
                </Link>

                {/* Column 2: Search */}
                <div className="navbar-search" ref={searchRef}>
                    <div className={`search-bar ${searchFocused ? 'focused' : ''}`}>
                        <Search size={18} className="search-bar-icon" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search... (Enter)"
                            className="search-bar-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-bar-clear"
                                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            className={`search-bar-image-btn ${showImageDrop ? 'active' : ''}`}
                            onClick={() => { setShowImageDrop(!showImageDrop); setSearchFocused(true); }}
                            title="Search by image"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>

                    {/* ── Search Dropdown ── */}
                    {showSearchDropdown && (
                        <div className="search-dropdown">

                            {/* IMAGE SEARCH SECTION */}
                            {showImageDrop && (
                                <div className="search-image-section">
                                    {/* Drop zone */}
                                    {!imagePreview ? (
                                        <div
                                            className={`search-drop-zone ${isDragging ? 'dragging' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <ImageIcon size={32} />
                                            <p>Drag & drop an image here</p>
                                            <span>or</span>
                                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                                Browse
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageFileInput}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="search-image-preview-area">
                                            <img src={imagePreview} alt="Search" className="search-preview-img" />
                                            <button className="search-preview-clear" onClick={clearImageSearch}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Loading */}
                                    {imageSearchLoading && (
                                        <div className="search-status">
                                            <div className="spinner-small-dark"></div>
                                            <span>Searching by image...</span>
                                        </div>
                                    )}

                                    {/* Image results */}
                                    {imageSearchResults !== null && !imageSearchLoading && (
                                        <div className="search-image-results">
                                            {imageSearchResults.length === 0 ? (
                                                <p className="search-no-results">No similar posts found</p>
                                            ) : (
                                                <>
                                                    {imageSearchResults.slice(0, 5).map(post => (
                                                        <div
                                                            key={post.id}
                                                            className="search-result-item"
                                                            onClick={() => handleResultClick(post)}
                                                        >
                                                            {post.images?.[0] && (
                                                                <img
                                                                    src={resolveImageUrl(post.images[0].imageUrl)}
                                                                    alt={post.title}
                                                                    className="search-result-thumb"
                                                                />
                                                            )}
                                                            <div className="search-result-info">
                                                                <p className="search-result-title">{post.title}</p>
                                                                <p className="search-result-user">{post.user?.name}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div
                                                        className="search-see-all"
                                                        onClick={handleSeeAllImageResults}
                                                    >
                                                        See all {imageSearchResults.length} results →
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TEXT SEARCH RESULTS */}
                            {!showImageDrop && searchQuery.trim() && (
                                <>
                                    {searchLoading && (
                                        <div className="search-status">
                                            <div className="spinner-small-dark"></div>
                                            <span>Searching...</span>
                                        </div>
                                    )}
                                    {!searchLoading && searchResults !== null && (
                                        <>
                                            {searchResults.length === 0 ? (
                                                <p className="search-no-results">No results for "{searchQuery}"</p>
                                            ) : (
                                                <>
                                                    {searchResults.slice(0, 5).map(post => (
                                                        <div
                                                            key={post.id}
                                                            className="search-result-item"
                                                            onClick={() => handleResultClick(post)}
                                                        >
                                                            {post.images?.[0] && (
                                                                <img
                                                                    src={resolveImageUrl(post.images[0].imageUrl)}
                                                                    alt={post.title}
                                                                    className="search-result-thumb"
                                                                />
                                                            )}
                                                            <div className="search-result-info">
                                                                <p className="search-result-title">{post.title}</p>
                                                                <p className="search-result-user">{post.user?.name}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {searchResults.length > 5 && (
                                                        <div
                                                            className="search-see-all"
                                                            onClick={handleSeeAll}
                                                        >
                                                            See all {searchResults.length} results →
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Column 3: Nav Links */}
                <div className="navbar-center">
                    <Link to="/feed" className="nav-link" title="Home">
                        <Home size={22} />
                        <span>Home</span>
                    </Link>
                    <Link to="/explore" className="nav-link" title="Explore">
                        <Compass size={22} />
                        <span>Explore</span>
                    </Link>
                    <button className="nav-link nav-create-btn" onClick={onCreatePost} title="Create Post">
                        <PlusCircle size={22} />
                        <span>Create</span>
                    </button>
                    <Link to="/following" className="nav-link" title="Following">
                        <Users size={22} />
                        <span>Following</span>
                    </Link>
                </div>

                {/* Column 4: Theme + Profile */}
                <div className="navbar-right">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}>
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="profile-menu-container" ref={menuRef}>
                        <button className="profile-button" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="profile-avatar">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <span className="profile-name">{user?.firstName}</span>
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="profile-dropdown-header">
                                    <div className="profile-avatar-large">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="profile-dropdown-name">{user?.name}</p>
                                        <p className="profile-dropdown-email">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="profile-dropdown-divider"></div>
                                <Link
                                    to={`/profile/${user?.id}`}
                                    className="profile-dropdown-item"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <User size={18} /><span>My Profile</span>
                                </Link>
                                <Link
                                    to="/settings"
                                    className="profile-dropdown-item"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Settings size={18} /><span>Settings</span>
                                </Link>
                                <div className="profile-dropdown-divider"></div>
                                <button
                                    className="profile-dropdown-item profile-dropdown-logout"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} /><span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;