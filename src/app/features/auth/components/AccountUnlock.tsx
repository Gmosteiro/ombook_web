import { useState } from "react";
import {
    type LoaderFunctionArgs,
    type ActionFunctionArgs,
    useLoaderData,
    useActionData,
    useNavigation,
    Form,
    redirect,
} from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
        return {
            error: "Token no proporcionado. Por favor, verifica el enlace de desbloqueo.",
            tokenValid: false,
        };
    }

    return { tokenValid: true, token, error: null };
}

export async function action({ request }: ActionFunctionArgs) {
    const { desbloquearCuenta } = await import("~/routes/api.auth.server");

    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
        return {
            error: "Token no proporcionado.",
            success: false,
        };
    }

    try {
        await desbloquearCuenta({ token });
        return redirect("/login?unlocked=true");
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Error al desbloquear la cuenta",
            success: false,
        };
    }
}

export default function AccountUnlock() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [confirmUnlock, setConfirmUnlock] = useState(false);

    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen flex items-center justify-center ombook-bg-light py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 ombook-card">
                <div>
                    <h2 className="mt-6 text-center ombook-heading ombook-heading-xl">
                        Desbloquear Cuenta
                    </h2>
                </div>

                {loaderData.error && (
                    <div className="ombook-alert ombook-alert-info">
                        <h3 className="text-sm font-medium ombook-text-brown">Error</h3>
                        <div className="mt-2 text-sm ombook-text-brown">
                            <p>{loaderData.error}</p>
                        </div>
                    </div>
                )}

                {actionData?.error && (
                    <div className="ombook-alert ombook-alert-info">
                        <h3 className="text-sm font-medium ombook-text-brown">Error</h3>
                        <div className="mt-2 text-sm ombook-text-brown">
                            <p>{actionData.error}</p>
                        </div>
                    </div>
                )}

                {loaderData.tokenValid && !confirmUnlock && (
                    <div className="ombook-alert ombook-alert-success">
                        <h3 className="text-sm font-medium ombook-text-green">
                            Token Válido
                        </h3>
                        <div className="mt-2 text-sm ombook-text-green">
                            <p>
                                Tu token de desbloqueo es válido. Haz clic en el botón de
                                abajo para desbloquear tu cuenta.
                            </p>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setConfirmUnlock(true)}
                                className="ombook-btn ombook-btn-primary w-full"
                            >
                                Desbloquear Cuenta
                            </button>
                        </div>
                    </div>
                )}

                {loaderData.tokenValid && confirmUnlock && (
                    <Form method="post" className="mt-8 space-y-6">
                        <input type="hidden" name="token" value={loaderData.token} />

                        <div className="ombook-alert ombook-alert-info">
                            <h3 className="text-sm font-medium ombook-text-brown">
                                Confirmación
                            </h3>
                            <div className="mt-2 text-sm ombook-text-brown">
                                <p>
                                    ¿Estás seguro de que deseas desbloquear tu cuenta? Una vez
                                    desbloqueada, podrás iniciar sesión normalmente.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setConfirmUnlock(false)}
                                className="ombook-btn ombook-btn-outline flex-1"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="ombook-btn ombook-btn-primary flex-1 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Desbloqueando..." : "Confirmar Desbloqueo"}
                            </button>
                        </div>
                    </Form>
                )}

                {!loaderData.tokenValid && (
                    <div className="mt-4 text-center">
                        <a
                            href="/login"
                            className="ombook-link"
                        >
                            Volver al inicio de sesión
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
