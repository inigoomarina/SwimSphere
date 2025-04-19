import axios from 'axios';

// Use environment variable for API URL or fallback to default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return instance;
};

// Axios instance with auth headers
const authAxios = () => {
    const instance = createAxiosInstance();
    const token = localStorage.getItem('token');
    
    if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Add response interceptor to handle token expiration
    instance.interceptors.response.use(
        response => response,
        error => {
            // If unauthorized and token exists, it might be expired
            if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
                localStorage.removeItem('token');
                // You might want to redirect to login page or refresh token
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
    
    return instance;
};

export const registerUser = async (userData) => {
    try {
        const response = await createAxiosInstance().post(`/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await createAxiosInstance().post(`/auth/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const googleLogin = async (credential) => {
    try {
        const response = await createAxiosInstance().post(`/auth/google-login`, { tokenId: credential });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const fetchUserProfile = async () => {
    try {
        const response = await authAxios().get(`/users/profile`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await authAxios().put(`/users/profile`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
};

export const addSwimTime = async (swimTimeData) => {
    try {
        const response = await authAxios().post(`/users/swim-times`, swimTimeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const getSwimTimes = async () => {
    try {
        const response = await authAxios().get(`/users/swim-times`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const deleteSwimTime = async (timeId) => {
    try {
        const response = await authAxios().delete(`/users/swim-times/${timeId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const addAchievement = async (achievementData) => {
    try {
        const response = await authAxios().post(`/users/achievements`, achievementData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

// Posts API calls
export const createPost = async (postData) => {
    try {
        const response = await authAxios().post('/posts', postData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const getPosts = async (page = 1, limit = 10) => {
    try {
        const response = await authAxios().get(`/posts?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
    try {
        const response = await authAxios().get(
            `/posts/user/${userId}?page=${page}&limit=${limit}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const toggleLike = async (postId) => {
    try {
        const response = await authAxios().post(`/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const addComment = async (postId, content) => {
    try {
        const response = await authAxios().post(`/posts/${postId}/comments`, { content });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const deleteComment = async (postId, commentId) => {
    try {
        const response = await authAxios().delete(`/posts/${postId}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const deletePost = async (postId) => {
    try {
        const response = await authAxios().delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

// Handle file uploads
export const uploadMedia = async (file) => {
    try {
        const formData = new FormData();
        formData.append('media', file);
        
        const response = await authAxios().post(`/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error uploading file' };
    }
};

// Records API calls
export const getRecords = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add filters to query parameters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await authAxios().get(`/records${query}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const getRecordById = async (id) => {
    try {
        const response = await authAxios().get(`/records/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

// Admin functions for record management
export const addRecord = async (recordData) => {
    try {
        const response = await authAxios().post(`/records`, recordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const updateRecord = async (id, recordData) => {
    try {
        const response = await authAxios().put(`/records/${id}`, recordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const deleteRecord = async (id) => {
    try {
        const response = await authAxios().delete(`/records/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

// Leaderboard API calls
export const getLeaderboard = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add filters to query parameters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await authAxios().get(`/leaderboard${query}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const getUserBests = async (userId = null) => {
    try {
        const endpoint = userId ? `/leaderboard/user/${userId}` : `/leaderboard/user`;
        const response = await authAxios().get(endpoint);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const submitLeaderboardTime = async (timeData) => {
    try {
        const response = await authAxios().post(`/leaderboard/submit`, timeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const searchUsers = async (query) => {
    try {
        if (!query || query.trim().length < 2) {
            return { status: 'success', data: [] };
        }
        const response = await authAxios().get(`/users/search?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Search error:', error);
        throw error.response?.data || { message: 'Server error' };
    }
};

export const toggleFollowUser = async (userId) => {
    try {
        const response = await authAxios().post(`/follow/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};