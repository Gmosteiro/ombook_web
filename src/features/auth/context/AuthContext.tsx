import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types'; // Importar el tipo
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = TokenManager.getToken();
        if (stored) {
            setToken(stored);
            setIsAuthenticated(true);
            // opcional: decodificar y setear user si necesitas fields del token
            // try { const decoded = jwtDecode(stored) as any; setUser(decoded.user ?? null); } catch {}
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        TokenManager.setToken(newToken);
        setIsAuthenticated(true);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        setToken(null);
        TokenManager.clearToken();
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
