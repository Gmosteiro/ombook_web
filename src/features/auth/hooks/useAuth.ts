// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router'; // Cambio aquí
import { jwtDecode } from 'jwt-decode';

export const useLogin = () => {
    const { login, logout } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginUser = async (email: string, password: string) => {
        try {
            // Llamada a la API para obtener el JWT
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
            // Aquí, almacena el JWT en el localStorage o en un cookie, como corresponda
            localStorage.setItem('auth_token', data.token);
        } catch (err: any) {
            setError(err.message ?? 'Login failed');
        }
    };

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                return logout();
            }

            // Verifica si el token ha expirado
            const decodedToken: { exp?: number } = jwtDecode(token);

            // Si no hay campo exp en el token, tratarlo como inválido/expirado
            if (typeof decodedToken.exp !== 'number') {
                logout();
                navigate('/login');
                return;
            }

            const isExpired = decodedToken.exp * 1000 < Date.now();

            if (isExpired) {
                logout();  // Si el token ha expirado, hacer logout
                navigate('/login'); // Redirigir a la página de login
                return;
            }

            // Si el token no ha expirado, mantén la sesión activa
            // Hacer una validación de la sesión si es necesario con una llamada a la API

        } catch (err) {
            logout();
            navigate('/login');
        }
    };

    return { loginUser, checkAuth, error };
};
