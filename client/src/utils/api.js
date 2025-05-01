import axios from 'axios';

// Create an axios instance with default config
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance that automatically includes auth token
const authAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    });
};

// Auth API calls
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Server error' };
    }
};

export const googleLogin = async (credential) => {
    try {
        console.log("Sending Google credential to backend...");
        const response = await axios.post(`${API_BASE_URL}/auth/google-login`, { credential, tokenId: credential });
        console.log("Google login response received:", response.status);
        return response.data;
    } catch (error) {
        console.error("Google login API error:", error);
        if (error.response) {
            console.error("Error response:", error.response.data);
            throw error.response.data || { message: 'Server error during Google login' };
        }
        throw { message: 'Network error during Google login' };
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

// Swim Times API calls
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

// File uploads
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

// User search and follow
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