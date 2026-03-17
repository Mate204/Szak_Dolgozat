// This manages the user's login state throughout the app
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api.js';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use auth context easily

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Provider component that wraps your app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in when app loads
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.error('Error parsing saved user:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.login({ email, password });
            const userData = response.data;

            // Save token and user info
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message ||
                err.response?.data ||
                'Login failed. Please check your credentials.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.register(userData);

            // After successful registration, log the user in automatically
            if (response.data.isSuccess) {
                const loginResult = await login(userData.email, userData.password);
                return loginResult;
            }

            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message ||
                err.response?.data ||
                'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    // Update user info (after profile edit)
    const updateUserInfo = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Check if user is logged in
    const isAuthenticated = () => {
        return user !== null && localStorage.getItem('token') !== null;
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserInfo,
        isAuthenticated,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};