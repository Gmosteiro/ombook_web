import React, { useState } from 'react';
import { Link } from 'react-router';

interface ForgotPasswordResponse {
    mensaje?: string;
    error?: string;
}

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/auth?action=recuperacion-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo: email }),
            });

            const data: ForgotPasswordResponse = await response.json();

            if (!response.ok) {
                setMessage({
                    type: 'error',
                    text: data.error || 'Ocurrió un error al procesar la solicitud.',
                });
            } else {
                setMessage({
                    type: 'success',
                    text: data.mensaje || 'Se envió un enlace de recuperación al correo.',
                });
                setSubmitted(true);
                setEmail('');
            }
        } catch (error) {
            console.error('Error al solicitar recuperación:', error);
            setMessage({
                type: 'error',
                text: 'Error de conexión. Por favor, inténtelo de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recuperar contraseña</h2>
            <p className="text-gray-600 mb-6">
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
            </p>

            {!submitted ? (
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 text-gray-700 font-medium">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />

                    {message && (
                        <div
                            className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-red-100 text-red-700 border border-red-300'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-100 text-green-700 p-4 rounded-lg border border-green-300">
                        <p className="font-medium mb-2">✓ Correo enviado</p>
                        <p className="text-sm">
                            Se ha enviado un enlace de recuperación a <strong>{email}</strong>.
                            Por favor, revise su bandeja de entrada y siga las instrucciones.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false);
                            setMessage(null);
                        }}
                        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                        Enviar a otro correo
                    </button>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="text-blue-500 hover:text-blue-600 text-sm">
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
