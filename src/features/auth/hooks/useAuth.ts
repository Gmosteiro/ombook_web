// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

export const useLogin = () => {
    const { login, logout, setLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const loginUser = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            login(data.user);
            localStorage.setItem('auth_token', data.token);
        } catch (err: any) {
            setError(err.message ?? 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = async () => {
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
            logout();
        } finally {
            setLoading(false);
        }
    };

    return { loginUser, checkAuth, error };
};
