// Register Page Component
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './Auth.css';

function Register() {
    const navigate = useNavigate();
    const { register, loading, error } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (localError) setLocalError('');
    };

    // Validate form
    const validateForm = () => {
        // Check required fields
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setLocalError('Please fill in all required fields');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLocalError('Please enter a valid email address');
            return false;
        }

        // Password length validation (minimum 8 characters)
        if (formData.password.length < 8) {
            setLocalError('Password must be at least 8 characters long');
            return false;
        }

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Prepare data for backend (without confirmPassword)
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber || null,
        };

        // Call register function from AuthContext
        const result = await register(userData);

        if (result.success) {
            // Navigate to feed after successful registration
            navigate('/feed');
        } else {
            setLocalError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo/Header */}
                <div className="auth-header">
                    <h1 className="auth-title">SimpliShare</h1>
                    <p className="auth-subtitle">Create your account and start sharing!</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* First Name */}
                    <div className="form-group">
                        <label htmlFor="firstName" className="form-label">
                            First Name *
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your first name"
                            autoComplete="given-name"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                        <label htmlFor="lastName" className="form-label">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your last name"
                            autoComplete="family-name"
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    {/* Phone Number (Optional) */}
                    <div className="form-group">
                        <label htmlFor="phoneNumber" className="form-label">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your phone number"
                            autoComplete="tel"
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password * (min. 8 characters)
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {(localError || error) && (
                        <div className="error-message">{localError || error}</div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? (
                            <span className="spinner-small"></span>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="auth-footer">
                    <p className="text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;