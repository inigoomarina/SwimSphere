import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx'; // Add .jsx extension

const useAuth = () => {
    const { user, login, logout, register } = useContext(AuthContext);

    return {
        user,
        login,
        logout,
        register,
    };
};

export default useAuth;