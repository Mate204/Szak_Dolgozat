// Login Page Component
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        // Call login function from AuthContext
        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Navigate to feed after successful login
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
                    <p className="auth-subtitle">Welcome back! Please login to your account.</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
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

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    {/* Remember Me Checkbox */}
                    <div className="form-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
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
                                <LogIn size={20} />
                                Login
                            </>
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="auth-footer">
                    <p className="text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;