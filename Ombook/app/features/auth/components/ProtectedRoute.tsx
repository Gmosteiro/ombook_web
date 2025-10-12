import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

    // Mostrar loading mientras verificamos autenticación
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    Verificando autenticación...
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        console.log('Redirecting to login from:', location.pathname);
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
}