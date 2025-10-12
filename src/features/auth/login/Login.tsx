import React, { useState } from 'react';
import { Link, useNavigate } from "react-router"; // Cambio aquí


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Usar navigate en lugar de window.location

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),

            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); // Guardar token JWT
                alert('Login exitoso!');

                // Usar navigate en lugar de window.location
                navigate('/dashboard'); // o la ruta que desees
            } else {
                const errorText = await response.text();
                alert(`Error de login: ${errorText}`);
            }
        } catch (error) {
            alert('Error en la conexión con el servidor.');
            console.error(error);
        }
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
        </div>
    );
};

export default Login;
