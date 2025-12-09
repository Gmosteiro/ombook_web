import { Form, useActionData, useNavigation } from "react-router";
import { iniciarCambioCorreo } from "../../../routes/api.auth.server";


export function meta() {
    return [
        { title: 'Ombook | Cambiar Correo' }
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
    const nuevoCorreo = formData.get('nuevoCorreo') as string;
    const passwordActual = formData.get('passwordActual') as string;

    if (!nuevoCorreo || !passwordActual) {
        return {
            success: false,
            error: "Debe completar todos los campos."
        };
    }

    try {
        const response = await iniciarCambioCorreo(request, { nuevoCorreo, passwordActual });
        return {
            success: true,
            message: response.mensaje || "Solicitud enviada correctamente."
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Error al solicitar el cambio de correo."
        };
    }
}

export default function ChangeEmail() {
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
                        Cambiar correo electrónico
                    </h1>
                    <p className="ombook-text-gray">
                        Ingrese su nuevo correo y contraseña actual para continuar
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
                        <label htmlFor="nuevoCorreo" className="ombook-label">
                            Nuevo correo electrónico
                        </label>
                        <input
                            type="email"
                            id="nuevoCorreo"
                            name="nuevoCorreo"
                            required
                            className="ombook-input"
                            placeholder="Ingrese su nuevo correo"
                        />
                    </div>

                    <div>
                        <label htmlFor="passwordActual" className="ombook-label">
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            id="passwordActual"
                            name="passwordActual"
                            required
                            className="ombook-input"
                            placeholder="Ingrese su contraseña actual"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`ombook-btn ombook-btn-primary w-full ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? 'Enviando solicitud...' : 'Solicitar cambio de correo'}
                    </button>
                </Form>
            </div>
        </div>
    );
}
