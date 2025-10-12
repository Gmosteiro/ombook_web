import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    login: (user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Simular obtener datos de usuario con el token (si es válido)
            setIsAuthenticated(true);
            // Aquí puedes hacer una llamada a tu API para obtener el usuario si es necesario
            setUser({ name: 'Test User' });  // Aquí sería el usuario actual
        }
    }, []);

    const login = (userData: any) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', 'your-jwt-token'); // Guardar el token
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token'); // Borrar el token cuando se haga logout
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
