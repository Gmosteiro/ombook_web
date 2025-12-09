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
    return new Response(
        JSON.stringify({}),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
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
        <div className="min-h-screen flex items-center justify-center ombook-bg-light px-4">
            <div className="max-w-md w-full ombook-card">
                <div className="ombook-card-header text-center mb-4">
                    <h1 className="ombook-heading ombook-heading-lg ombook-text-green mb-2">
                        Cambiar Contraseña
                    </h1>
                    <p className="ombook-text-gray">
                        Debe cambiar su contraseña antes de continuar
                    </p>
                </div>

                {actionData?.error && (
                    <div className="ombook-alert ombook-alert-info">
                        <p>{actionData.error}</p>
                    </div>
                )}

                {actionData?.success && actionData?.message && (
                    <div className="ombook-alert ombook-alert-success">
                        <p>{actionData.message}</p>
                    </div>
                )}

                <Form method="post" className="space-y-6">
                    <div>
                        <label htmlFor="contrasenaActual" className="ombook-label">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            id="contrasenaActual"
                            name="contrasenaActual"
                            required
                            className="ombook-input"
                            placeholder="Ingrese su contraseña actual"
                        />
                    </div>

                    <div>
                        <label htmlFor="nuevaContrasena" className="ombook-label">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="nuevaContrasena"
                            name="nuevaContrasena"
                            required
                            className="ombook-input"
                            placeholder="Ingrese su nueva contraseña"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmarContrasena" className="ombook-label">
                            Confirmar Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            id="confirmarContrasena"
                            name="confirmarContrasena"
                            required
                            className="ombook-input"
                            placeholder="Confirme su nueva contraseña"
                        />
                    </div>

                    <div className="ombook-alert ombook-alert-info">
                        <p className="font-medium mb-2">
                            La contraseña debe cumplir con:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
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
                        className={`ombook-btn ombook-btn-primary w-full ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                    </button>
                </Form>
            </div>
        </div>
    );
}
