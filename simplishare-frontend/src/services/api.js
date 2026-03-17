import axios from 'axios';

// Your backend URL
const API_BASE_URL = 'https://localhost:7114/api';

// Create an axios instance with default settings
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the JWT token to every request if user is logged in
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses and errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token is invalid/expired, redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTH API CALLS ==========
export const authAPI = {
    // Register a new user
    register: (userData) => api.post('/Users/Register', userData),

    // Login user
    login: (credentials) => api.post('/Users/Login', credentials),
};

// ========== USER API CALLS ==========
export const userAPI = {
    // Get user by ID (public info)
    getPublicProfile: (userId) => api.get(`/Users/public/${userId}`),

    // Get user by ID (private info - own profile)
    getPrivateProfile: (userId) => api.get(`/Users/private/${userId}`),

    // Get all users
    getAllUsers: () => api.get('/Users/GetAllUser'),

    // Update user profile
    updateUser: (userId, userData) => api.put(`/Users/Update/${userId}`, userData),

    // Change password
    changePassword: (passwordData) => api.put('/Users/ChangePassword', passwordData),

    // Delete user account
    deleteUser: (userId) => api.delete(`/Users/Delete/${userId}`),
};

// ========== POST API CALLS ==========
export const postAPI = {
    // Create a new post with images
    createPost: (formData) => api.post('/Post', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // Get post by ID
    getPost: (postId) => api.get(`/Post/${postId}`),

    // Get posts by user ID
    getUserPosts: (userId) => api.get(`/Post/user/${userId}`),

    // Get feed (paginated)
    getFeed: (userId, pageNumber = 1, pageSize = 10) =>
        api.get(`/Post/feed?userid=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`),

    // Update post
    updatePost: (postId, postData) => api.put(`/Post/${postId}`, postData),

    // Delete post
    deletePost: (postId) => api.delete(`/Post/${postId}`),

    // Like a post
    likePost: (likeData) => api.post('/Post/like', likeData),

    // Unlike a post
    unlikePost: (likeData) => api.delete('/Post/unlike', { data: likeData }),

    // Add comment to post
    addComment: (postId, commentData) => api.post(`/Post/${postId}/comment`, commentData),

    // Get comment by ID
    getComment: (commentId) => api.get(`/Post/comment/${commentId}`),

    // Delete comment
    deleteComment: (commentId) => api.delete(`/Post/comment/${commentId}`),
};

// ========== FOLLOW API CALLS ==========
export const followAPI = {
    // Follow a user
    followUser: (followerId, followedId) =>
        api.post('/Follow/Follow', null, {
            params: {
                followerId: followerId,
                followedId: followedId
            }
        }),

    // Unfollow a user
    unfollowUser: (followerId, followedId) =>
        api.delete('/Follow/UnFollow', {
            params: {
                followerId: followerId,
                followedId: followedId
            }
        }),

    // Check if following
    isFollowing: (followerId, followedId) =>
        api.get('/Follow/IsFollowing', {
            params: {
                followerId: followerId,
                followedId: followedId
            }
        }),

    // Get followers list
    getFollowers: (userId) => api.get('/Follow/GetAllFollower', {
        params: { userId: userId }
    }),

    // Get following list
    getFollowing: (userId) => api.get('/Follow/GetAllFollowing', {
        params: { userId: userId }
    }),

    // Get followers count
    getFollowersCount: (userId) => api.get('/Follow/FollowerCount', {
        params: { userId: userId }
    }),

    // Get following count
    getFollowingCount: (userId) => api.get('/Follow/FollowingCount', {
        params: { userId: userId }
    }),
};

export default api;