import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    // Mostrar loading mientras verificamos autenticación
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    Cargando...
                </div>
            </div>
        );
    }

    // Si ya está autenticado, redirigir a la página principal
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}