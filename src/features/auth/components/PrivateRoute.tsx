import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useAuth';

const PrivateRoute = () => {
    const { isAuthenticated } = useAuth();
    const { checkAuth } = useLogin();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
