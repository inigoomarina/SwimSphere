import React, { createContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for token and load user on mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                // Fetch user data with token
                const response = await fetchUserProfile();
                
                if (response.status === 'success') {
                    setUser(response.data);
                    setIsAuthenticated(true);
                } else {
                    // Clear invalid token
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error('Auth check error:', err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Login user
    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;