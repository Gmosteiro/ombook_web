// src/features/auth/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, ApiError, LoginRequest } from '../types';

export const useLogin = () => {
    const { login, logout, setLoading, token } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginUser = async (loginData: LoginRequest): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginData),
                headers: { 'Content-Type': 'application/json' },
            });

            const raw = await res.text();
            const json = raw ? JSON.parse(raw) : {};

            if (!res.ok) {
                const errorData: ApiError = json;
                throw new Error(errorData.message || res.statusText || 'Invalid credentials');
            }

            const data: LoginResponse = json;
            const tokenToStore = (data as any).tokenAcceso ?? (data as any).token;
            if (!tokenToStore) throw new Error('Invalid response from server');

            login(tokenToStore);
            navigate('/home');
        } catch (err: any) {
            setError(err?.message ?? 'Login failed');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkAuth = useCallback((): void => {
        if (!token) return; // no desloguear por ausencia; el guard ya redirige

        try {
            const decoded: any = jwtDecode(token);
            const exp = typeof decoded?.exp === 'number' ? decoded.exp : undefined;
            if (exp && exp * 1000 < Date.now()) {
                logout();
            }
            // si no hay exp, asumimos válido (o valida con /api/auth/me)
        } catch {
            // si no es JWT, no forzar logout aquí
        }
    }, [token, logout]);

    return { loginUser, checkAuth, error };
};
