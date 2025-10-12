// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, ApiError } from '../types';

export const useLogin = () => {
    const { login, logout, setLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginUser = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            console.log('Attempting to log in with', { email, password });
            debugger
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData: ApiError = response.bodyUsed ? await response.json() : { message: response.statusText };
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data: LoginResponse = await response.json();

            // Validar que la respuesta tenga la estructura esperada
            if (!data.user || !data.tokenAcceso) {
                throw new Error('Invalid response from server');
            }

            login(data.user);
            localStorage.setItem('auth_token', data.tokenAcceso);

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
            const token = localStorage.getItem('auth_token');

            if (!token) {
                logout();
                return;
            }

            const decodedToken: { exp?: number } = jwtDecode(token);

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
