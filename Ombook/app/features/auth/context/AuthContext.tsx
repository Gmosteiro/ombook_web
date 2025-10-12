import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { AuthService, LoginCredentials, LoginResponse } from '../api/authService';

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => void;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isAuthenticated = Boolean(token && user);

    // Logout function
    const logout = useCallback(() => {
        AuthService.removeToken();
        setToken(null);
        setUser(null);

        // Limpiar interval si existe
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Verificar estado de autenticación - sin useCallback para evitar bucles
    const checkAuthStatus = async () => {
        console.log('checkAuthStatus: Starting authentication check');

        const storedToken = AuthService.getToken();
        console.log('checkAuthStatus: Stored token exists:', !!storedToken);

        if (storedToken) {
            try {
                const isValid = await AuthService.validateToken(storedToken);
                console.log('checkAuthStatus: Token is valid:', isValid);

                if (isValid) {
                    setToken(storedToken);
                    // Obtener datos del usuario si es necesario
                    try {
                        const response = await fetch('http://localhost:8080/api/auth/validate', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        if (response.ok) {
                            const userData = await response.json();
                            setUser(userData.user);
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                } else {
                    // Token expirado o inválido
                    logout();
                }
            } catch (error) {
                console.error('checkAuthStatus: Error validating token:', error);
                logout();
            }
        } else {
            // No hay token
            setToken(null);
            setUser(null);
        }

        setIsLoading(false);
        console.log('checkAuthStatus: Authentication check completed');
    };

    // Login function - usar useCallback
    const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
        setIsLoading(true);

        try {
            const response = await AuthService.login(credentials);

            AuthService.saveToken(response.token);
            setToken(response.token);
            setUser(response.user);

            return response;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Verificar autenticación al montar el componente - SOLO UNA VEZ
    useEffect(() => {
        console.log('useEffect inicial ejecutándose');
        setIsLoading(true);

        const initAuth = async () => {
            console.log('initAuth: Starting authentication check');
            const storedToken = AuthService.getToken();
            console.log('initAuth: Stored token exists:', !!storedToken);

            if (storedToken) {
                try {
                    const isValid = await AuthService.validateToken(storedToken);
                    console.log('initAuth: Token is valid:', isValid);

                    if (isValid) {
                        setToken(storedToken);
                        // Obtener datos del usuario si es necesario
                        try {
                            const response = await fetch('http://localhost:8080/api/auth/validate', {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${storedToken}`,
                                    'Content-Type': 'application/json',
                                },
                            });
                            if (response.ok) {
                                const userData = await response.json();
                                setUser(userData.user);
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    } else {
                        // Token expirado o inválido
                        console.log('initAuth: Token inválido, limpiando estado');
                        AuthService.removeToken();
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('initAuth: Error validating token:', error);
                    AuthService.removeToken();
                    setToken(null);
                    setUser(null);
                }
            } else {
                // No hay token
                console.log('initAuth: No token found');
                setToken(null);
                setUser(null);
            }

            setIsLoading(false);
            console.log('initAuth: Authentication check completed, isLoading set to false');
        };

        initAuth();
    }, []); // Array vacío para que solo se ejecute una vez al montar

    // Configurar verificación periódica - con cleanup adecuado
    useEffect(() => {
        // Limpiar interval anterior si existe
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Solo configurar interval si hay token
        if (token) {
            intervalRef.current = setInterval(async () => {
                const isValid = await AuthService.validateToken(token);
                if (!isValid) {
                    logout();
                }
            }, 5 * 60 * 1000); // Verificar cada 5 minutos
        }

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [token, logout]); // Solo depende de token y logout

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}