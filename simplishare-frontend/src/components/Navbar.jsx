// Navigation Bar Component
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Home,
    Search,
    PlusCircle,
    User,
    Users,
    Settings,
    LogOut,
    Moon,
    Sun,
    Compass
} from 'lucide-react';
import './Navbar.css';

function Navbar({ onCreatePost }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <Link to="/feed" className="navbar-brand">
                    <h1>SimpliShare</h1>
                </Link>

                {/* Center - Navigation Links */}
                <div className="navbar-center">
                    <Link to="/feed" className="nav-link" title="Home">
                        <Home size={24} />
                        <span>Home</span>
                    </Link>

                    <Link to="/explore" className="nav-link" title="Explore">
                        <Compass size={24} />
                        <span>Explore</span>
                    </Link>

                    <button
                        className="nav-link nav-create-btn"
                        onClick={onCreatePost}
                        title="Create Post"
                    >
                        <PlusCircle size={24} />
                        <span>Create</span>
                    </button>

                    <Link to="/following" className="nav-link" title="Following">
                        <Users size={24} />
                        <span>Following</span>
                    </Link>
                </div>

                {/* Right - Theme Toggle & Profile */}
                <div className="navbar-right">
                    {/* Theme Toggle Button */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Profile Menu */}
                    <div className="profile-menu-container" ref={menuRef}>
                        <button
                            className="profile-button"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="profile-avatar">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <span className="profile-name">{user?.firstName}</span>
                        </button>

                        {/* Dropdown Menu */}
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
                                    <User size={18} />
                                    <span>My Profile</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    className="profile-dropdown-item"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <Settings size={18} />
                                    <span>Settings</span>
                                </Link>

                                <div className="profile-dropdown-divider"></div>

                                <button
                                    className="profile-dropdown-item profile-dropdown-logout"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
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