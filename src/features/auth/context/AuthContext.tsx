import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Iniciar como loading
    const [user, setUser] = useState<User | null>(null);

    const login = (user: User) => {
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        localStorage.removeItem('auth_token');
    };

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            login,
            logout,
            setLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
