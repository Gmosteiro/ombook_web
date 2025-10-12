// src/features/auth/components/Login.tsx
import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser, error } = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginUser(email, password);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;
