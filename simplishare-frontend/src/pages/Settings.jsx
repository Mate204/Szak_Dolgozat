// Settings Page - Edit profile and change password
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { User, Lock, Save, ArrowLeft, LogOut } from 'lucide-react';
import './Settings.css';

function Settings() {
    const navigate = useNavigate();
    const { user, logout, updateUserInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Handle profile form changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
        setProfileError('');
        setProfileSuccess('');
    };

    // Handle password form changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        setPasswordError('');
        setPasswordSuccess('');
    };

    // Update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        // Check if anything changed
        if (
            profileForm.firstName === user.firstName &&
            profileForm.lastName === user.lastName &&
            profileForm.email === user.email &&
            profileForm.phoneNumber === user.phoneNumber
        ) {
            setProfileError('No changes detected');
            return;
        }

        try {
            setProfileLoading(true);
            const response = await userAPI.updateUser(user.id, profileForm);

            if (response.data.isSuccess || response.data) {
                // Update user info in context
                updateUserInfo({
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    email: profileForm.email,
                    phoneNumber: profileForm.phoneNumber,
                    name: `${profileForm.firstName} ${profileForm.lastName}`,
                });
                setProfileSuccess('Profile updated successfully!');
            }
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            setPasswordLoading(true);
            await userAPI.changePassword({
                userId: user.id,
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordSuccess('Password changed successfully!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="settings-layout">
            <Navbar />

            <div className="settings-container">
                {/* Header */}
                <div className="settings-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Settings</h1>
                </div>

                <div className="settings-content">
                    {/* Tabs */}
                    <div className="settings-tabs">
                        <button
                            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={18} />
                            <span>Profile</span>
                        </button>
                        <button
                            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            <Lock size={18} />
                            <span>Password</span>
                        </button>
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="settings-panel">
                            <h2>Edit Profile</h2>
                            <form onSubmit={handleProfileSubmit} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={profileForm.firstName}
                                            onChange={handleProfileChange}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={profileForm.lastName}
                                            onChange={handleProfileChange}
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={profileForm.phoneNumber}
                                        onChange={handleProfileChange}
                                        className="input"
                                    />
                                </div>

                                {profileError && <div className="error-message">{profileError}</div>}
                                {profileSuccess && <div className="success-message">{profileSuccess}</div>}

                                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                                    {profileLoading ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="settings-panel">
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordSubmit} className="settings-form">
                                <div className="form-group">
                                    <label htmlFor="oldPassword" className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        id="oldPassword"
                                        name="oldPassword"
                                        value={passwordForm.oldPassword}
                                        onChange={handlePasswordChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newPassword" className="form-label">
                                        New Password (min. 8 characters)
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="input"
                                        required
                                    />
                                </div>

                                {passwordError && <div className="error-message">{passwordError}</div>}
                                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

                                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                                    {passwordLoading ? (
                                        'Changing...'
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Logout Button */}
                    <div className="settings-danger-zone">
                        <h3>Danger Zone</h3>
                        <button onClick={handleLogout} className="btn btn-danger">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;