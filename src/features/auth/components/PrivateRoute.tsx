import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useAuth';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading, token } = useAuth();
    const { checkAuth } = useLogin();

    useEffect(() => {
        if (!isLoading && token) {
            checkAuth();
        }
    }, [token, isLoading, checkAuth]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
