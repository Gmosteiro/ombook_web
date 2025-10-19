import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import TokenManager from '../utils/TokenManager'

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const isAuthenticated = !!token;

    useEffect(() => {
        const stored = TokenManager.getToken();
        setToken(stored ?? null);
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        TokenManager.setToken(newToken);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        TokenManager.clearToken();
        setIsLoading(false);
    };

    const setLoadingState = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            token,
            login,
            logout,
            setLoading: setLoadingState
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
