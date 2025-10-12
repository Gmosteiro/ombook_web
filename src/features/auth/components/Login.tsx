// src/features/auth/components/Login.tsx
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useLogin } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser, error } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await loginUser(email, password);
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
                >
                    Login
                </button>
                <div className="mt-4 text-center">
                    <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </div>
    );
};

export default Login;
