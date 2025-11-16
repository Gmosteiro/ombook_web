import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';

interface ResetPasswordResponse {
    mensaje?: string;
    error?: string;
}

interface VerifyTokenResponse {
    valido?: boolean;
    error?: string;
}

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Validar token al cargar el componente
    useEffect(() => {
        const verificarToken = async () => {
            if (!token) {
                setMessage({
                    type: 'error',
                    text: 'Token no proporcionado. Por favor, utilice el enlace del correo.',
                });
                setValidatingToken(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/auth?action=verificar-token&token=${encodeURIComponent(token)}`
                );

                const data: VerifyTokenResponse = await response.json();

                if (!response.ok || !data.valido) {
                    setMessage({
                        type: 'error',
                        text: data.error || 'El enlace no es válido o ha caducado.',
                    });
                    setTokenValid(false);
                } else {
                    setTokenValid(true);
                }
            } catch (error) {
                console.error('Error al verificar token:', error);
                setMessage({
                    type: 'error',
                    text: 'Error de conexión. Por favor, inténtelo de nuevo.',
                });
                setTokenValid(false);
            } finally {
                setValidatingToken(false);
            }
        };

        verificarToken();
    }, [token]);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra mayúscula.';
        }
        if (!/[a-z]/.test(password)) {
            return 'La contraseña debe contener al menos una letra minúscula.';
        }
        if (!/[0-9]/.test(password)) {
            return 'La contraseña debe contener al menos un número.';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validar política de contraseña
        const validationError = validatePassword(nuevaContrasena);
        if (validationError) {
            setMessage({ type: 'error', text: validationError });
            setLoading(false);
            return;
        }

        // Validar que las contraseñas coincidan
        if (nuevaContrasena !== confirmarContrasena) {
            setMessage({
                type: 'error',
                text: 'Las contraseñas no coinciden.',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth?action=restablecer-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    nuevaContrasena,
                    confirmarContrasena,
                }),
            });

            const data: ResetPasswordResponse = await response.json();

            if (!response.ok) {
                setMessage({
                    type: 'error',
                    text: data.error || 'Ocurrió un error al restablecer la contraseña.',
                });
            } else {
                setMessage({
                    type: 'success',
                    text: data.mensaje || 'Contraseña restablecida exitosamente.',
                });

                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            setMessage({
                type: 'error',
                text: 'Error de conexión. Por favor, inténtelo de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (validatingToken) {
        return (
            <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando enlace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Restablecer contraseña</h2>

            {!tokenValid ? (
                <div className="space-y-4">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
                        <p className="font-medium mb-2">✗ Enlace inválido</p>
                        <p className="text-sm">{message?.text}</p>
                    </div>
                    <Link
                        to="/forgot-password"
                        className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Solicitar nuevo enlace
                    </Link>
                    <Link
                        to="/login"
                        className="block text-center text-blue-500 hover:text-blue-600 text-sm"
                    >
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-6">
                        Ingrese su nueva contraseña. Debe cumplir con los siguientes requisitos:
                    </p>

                    <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
                        <li>Mínimo 8 caracteres</li>
                        <li>Al menos una letra mayúscula</li>
                        <li>Al menos una letra minúscula</li>
                        <li>Al menos un número</li>
                    </ul>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-gray-700 font-medium">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                                    placeholder="••••••••"
                                    value={nuevaContrasena}
                                    onChange={e => setNuevaContrasena(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700 font-medium">
                                Confirmar contraseña
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                                placeholder="••••••••"
                                value={confirmarContrasena}
                                onChange={e => setConfirmarContrasena(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={e => setShowPassword(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="showPassword" className="text-sm text-gray-600">
                                Mostrar contraseñas
                            </label>
                        </div>

                        {message && (
                            <div
                                className={`p-3 rounded-lg ${message.type === 'success'
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                    }`}
                            >
                                {message.text}
                                {message.type === 'success' && (
                                    <p className="text-sm mt-2">Redirigiendo al inicio de sesión...</p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={loading || (message?.type === 'success')}
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 text-sm">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResetPassword;
