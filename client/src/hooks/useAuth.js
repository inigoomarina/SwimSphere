import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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