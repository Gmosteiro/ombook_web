// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, ApiError, LoginDTO } from '../types';

export const useLogin = () => {
    const { login, logout, setLoading, token } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginUser = async (loginData: LoginDTO): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            console.log('Attempting to log in with', loginData);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginData),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData: ApiError = response.bodyUsed ? await response.json() : { message: response.statusText };
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data: LoginResponse = response.bodyUsed ? await response.json() : JSON.parse(await response.text() || '{}');

            const tokenToStore = (data as any).tokenAcceso ?? (data as any).token;
            if (!tokenToStore) {
                throw new Error('Invalid response from server');
            }

            // Delegar persistencia al contexto
            login(tokenToStore);

            // Redirigir a home después del login exitoso
            navigate('/home');

        } catch (err: any) {
            const errorMessage = err.message ?? 'Login failed';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = async (): Promise<void> => {
        setLoading(true);
        try {
            const currentToken = token;
            if (!currentToken) {
                logout();
                return;
            }

            const decodedToken: { exp?: number } = jwtDecode(currentToken);

            if (typeof decodedToken.exp !== 'number') {
                logout();
                return;
            }

            const isExpired = decodedToken.exp * 1000 < Date.now();

            if (isExpired) {
                logout();
                return;
            }

            // Token válido - mantener sesión activa
            // Aquí podrías hacer una llamada a la API para verificar el usuario si es necesario

        } catch (err) {
            console.error('Auth check error:', err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    return { loginUser, checkAuth, error };
};
