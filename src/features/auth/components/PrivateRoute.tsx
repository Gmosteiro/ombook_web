import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useAuth';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { checkAuth } = useLogin();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderizar las rutas hijas
    return <Outlet />;
};

export default PrivateRoute;
