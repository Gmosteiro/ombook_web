import React, { useState, useEffect } from 'react';
import { Link, useLoaderData, Form, useActionData, useNavigation } from 'react-router';
import type { VerificarTokenResponse, RestablecerContrasenaResponse, ErrorResponse } from '../../../routes/api.auth';
import { apiFetch } from '../utils/methods';

// Loader: verificar token al cargar
export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return {
            tokenValid: false,
            error: 'Token no proporcionado. Por favor, utilice el enlace del correo.',
        };
    } else {
        try {
            const response = await apiFetch(`/api/auth?action=verificar-token&token=${encodeURIComponent(token)}`,
                { method: 'GET' }
            );

            const data = await response.json() as VerificarTokenResponse & ErrorResponse;

            if (!response.ok || !data.valido) {
                return {
                    tokenValid: false,
                    error: data.error || 'El enlace no es válido o ha caducado.',
                };
            }

            return {
                tokenValid: true,
                token,
            };
        } catch (error) {
            console.error('Error al verificar token:', error);
            return {
                tokenValid: false,
                error: 'Error de conexión. Por favor, inténtelo de nuevo.',
            };
        }
    }

}

// Action: restablecer contraseña
export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const nuevaContrasena = formData.get('nuevaContrasena') as string;
    const confirmarContrasena = formData.get('confirmarContrasena') as string;

    // Validar política de contraseña
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

    const validationError = validatePassword(nuevaContrasena);
    if (validationError) {
        return { error: validationError };
    }

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
        return { error: 'Las contraseñas no coinciden.' };
    }

    try {
        const response = await apiFetch('/api/auth?action=restablecer-contrasena', {
            method: 'POST',
            body: JSON.stringify({
                token,
                nuevaContrasena,
                confirmarContrasena,
            }),
        });

        const data = await response.json() as RestablecerContrasenaResponse & ErrorResponse;

        if (!response.ok) {
            return { error: data.error || 'Ocurrió un error al restablecer la contraseña.' };
        }

        return {
            success: true,
            mensaje: data.mensaje || 'Contraseña restablecida exitosamente.',
        };
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        return { error: 'Error de conexión. Por favor, inténtelo de nuevo.' };
    }
}

const ResetPassword: React.FC = () => {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const isSubmitting = navigation.state === 'submitting';
    const tokenValid = loaderData.tokenValid;

    // Redirigir al login si el action fue exitoso
    useEffect(() => {
        if (actionData?.success) {
            const timer = setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [actionData]);

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Restablecer contraseña</h2>

            {!tokenValid ? (
                <div className="space-y-4">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
                        <p className="font-medium mb-2">✗ Enlace inválido</p>
                        <p className="text-sm">{loaderData.error}</p>
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

                    <Form method="post" className="space-y-4">
                        <input type="hidden" name="token" value={loaderData.token} />

                        <div>
                            <label className="block mb-2 text-gray-700 font-medium">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="nuevaContrasena"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                                    placeholder="••••••••"
                                    value={nuevaContrasena}
                                    onChange={e => setNuevaContrasena(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-gray-700 font-medium">
                                Confirmar contraseña
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmarContrasena"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                                placeholder="••••••••"
                                value={confirmarContrasena}
                                onChange={e => setConfirmarContrasena(e.target.value)}
                                required
                                disabled={isSubmitting}
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

                        {actionData?.error && (
                            <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                                {actionData.error}
                            </div>
                        )}

                        {actionData?.success && (
                            <div className="p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
                                {actionData.mensaje}
                                <p className="text-sm mt-2">Redirigiendo al inicio de sesión...</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isSubmitting || actionData?.success}
                        >
                            {isSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </button>
                    </Form>

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
