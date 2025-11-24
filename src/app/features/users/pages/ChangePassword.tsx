import { Form, redirect, useActionData, useNavigation } from "react-router";
import { validatePasswordStrength } from "../../auth/utils/methods";
import { UserRole } from "~/features/auth/types";


export function meta() {
    return [
        { title: 'Ombook | Cambiar Contraseña' }
    ];
}

export async function loader({ request }: { request: Request }) {
    const { requireValidSession } = await import("../../../services/session.server");
    await requireValidSession(request);
    return {};
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const contrasenaActual = formData.get('contrasenaActual') as string;
    const nuevaContrasena = formData.get('nuevaContrasena') as string;
    const confirmarContrasena = formData.get('confirmarContrasena') as string;

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
        return {
            success: false,
            error: 'Las contraseñas no coinciden.'
        };
    }

    // Validar fortaleza de la contraseña
    const validationError = validatePasswordStrength(nuevaContrasena);
    if (!validationError) {
        return {
            success: false,
            error: `La nueva contraseña no cumple con los requisitos de seguridad.
        Asegúrese de que tenga al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*?&).`
        };
    }

    const data = {
        contrasenaActual,
        nuevaContrasena,
        confirmarContrasena
    };

    try {
        const { getUserRole, forceTokenRefresh } = await import("../../../services/session.server");
        const { cambiarContrasena } = await import("../../../routes/api.auth.server");

        const userRoleBeforeChange = await getUserRole(request);
        const response = await cambiarContrasena(request, data);

        // Si el usuario era SIN_VERIFICAR, su rol cambió - refrescar el token y redirigir
        if (userRoleBeforeChange === UserRole.SIN_VERIFICAR) {
            const refreshResult = await forceTokenRefresh(request);

            if (refreshResult.success && refreshResult.headers) {
                // Redirigir inmediatamente con los headers actualizados
                return redirect('/', {
                    headers: refreshResult.headers
                });
            } else {
                // Si falla el refresh, mostrar error pero la contraseña ya se cambió
                return {
                    success: true,
                    message: response.mensaje + ' Por favor, inicie sesión nuevamente.'
                };
            }
        }

        // Para otros usuarios, mostrar mensaje de éxito
        return {
            success: true,
            message: response.mensaje || 'Contraseña cambiada exitosamente.'
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Error al cambiar la contraseña.'
        };
    }
}

export default function ChangePassword() {
    const actionData = useActionData<{
        success: boolean;
        error?: string;
        message?: string;
    }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Cambiar Contraseña
                    </h1>
                    <p className="text-gray-600">
                        Debe cambiar su contraseña antes de continuar
                    </p>
                </div>

                {actionData?.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{actionData.error}</p>
                    </div>
                )}

                {actionData?.success && actionData?.message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{actionData.message}</p>
                    </div>
                )}

                <Form method="post" className="space-y-6">
                    <div>
                        <label htmlFor="contrasenaActual" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            id="contrasenaActual"
                            name="contrasenaActual"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ingrese su contraseña actual"
                        />
                    </div>

                    <div>
                        <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="nuevaContrasena"
                            name="nuevaContrasena"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ingrese su nueva contraseña"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmarContrasena"
                            name="confirmarContrasena"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Confirme su nueva contraseña"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                            La contraseña debe cumplir con:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Mínimo 8 caracteres</li>
                            <li>Al menos una letra mayúscula</li>
                            <li>Al menos una letra minúscula</li>
                            <li>Al menos un número</li>
                            <li>Al menos un carácter especial (@$!%*?&)</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                    </button>
                </Form>
            </div>
        </div>
    );
}
