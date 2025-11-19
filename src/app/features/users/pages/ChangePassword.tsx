import { useState } from 'react';
import { Form, useActionData, useNavigation, redirect } from 'react-router';
import { apiFetch, validatePasswordStrength } from '~/features/auth/utils/methods';
import { getValidJWTToken, requireValidSession } from '~/services/session.server';

interface CambiarContrasenaRequest {
    contrasenaActual: string;
    nuevaContrasena: string;
}

interface CambiarContrasenaResponse {
    mensaje: string;
}

export function meta() {
    return [
        { title: 'Ombook | Cambiar Contraseña' }
    ];
}

export async function loader({ request }: { request: Request }) {
    // Solo verificar que tenga una sesión válida, sin importar el rol
    // Esta página es accesible para cualquier usuario autenticado
    await requireValidSession(request);

    return {};
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const contrasenaActual = formData.get('contrasenaActual') as string;
    const nuevaContrasena = formData.get('nuevaContrasena') as string;
    const confirmarContrasena = formData.get('confirmarContrasena') as string;

    const validationError = validatePasswordStrength(nuevaContrasena);

    if (validationError) {
        return {
            error: `La nueva contraseña no cumple con los requisitos de seguridad.
            Asegúrese de que tenga al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.`};
    }

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
        return { error: 'Las contraseñas no coinciden.' };
    }

    try {
        const body: CambiarContrasenaRequest = {
            contrasenaActual,
            nuevaContrasena,
        };

        const response = await apiFetch('/usuarios/password', {
            method: 'PUT',
            secure: true,
            jwtToken: await getValidJWTToken(request),
            body: JSON.stringify(body),
        });


        const data = await response.json() as CambiarContrasenaResponse & { error?: string };

        //TODO esperar a que el backend esté listo para manejar este caso
        if (!response.ok) {
            return { error: data.error || 'Ocurrió un error al cambiar la contraseña.' };
        }

        // Si el cambio fue exitoso, redirigir al login para que vuelva a iniciar sesión
        // (el backend actualizará el rol de SIN_VERIFICAR automáticamente)
        return redirect('/login');
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return { error: 'Error de conexión. Por favor, inténtelo de nuevo.' };
    }
}



export default function ChangePassword() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    const [contrasenaActual, setContrasenaActual] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Cambiar contraseña
            </h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>⚠️ Cambio requerido:</strong> Debe cambiar su contraseña para continuar.
                </p>
            </div>

            <p className="text-gray-600 mb-6">
                La nueva contraseña debe cumplir con los siguientes requisitos:
            </p>

            <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos un número</li>
            </ul>

            <Form method="post" className="space-y-4">
                <div>
                    <label className="block mb-2 text-gray-700 font-medium">
                        Contraseña actual
                    </label>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        name="contrasenaActual"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                        placeholder="••••••••"
                        value={contrasenaActual}
                        onChange={e => setContrasenaActual(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-gray-700 font-medium">
                        Nueva contraseña
                    </label>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        name="nuevaContrasena"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                        placeholder="••••••••"
                        value={nuevaContrasena}
                        onChange={e => setNuevaContrasena(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label className="block mb-2 text-gray-700 font-medium">
                        Confirmar nueva contraseña
                    </label>
                    <input
                        type={showPasswords ? 'text' : 'password'}
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
                        id="showPasswords"
                        checked={showPasswords}
                        onChange={e => setShowPasswords(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="showPasswords" className="text-sm text-gray-600">
                        Mostrar contraseñas
                    </label>
                </div>

                {actionData?.error && (
                    <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                        {actionData.error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
                </button>
            </Form>
        </div>
    );
}
