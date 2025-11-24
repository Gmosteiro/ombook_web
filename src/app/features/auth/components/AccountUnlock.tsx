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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Desbloquear Cuenta
                    </h2>
                </div>

                {loaderData.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{loaderData.error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {actionData?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{actionData.error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loaderData.tokenValid && !confirmUnlock && (
                    <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Token Válido
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Tu token de desbloqueo es válido. Haz clic en el botón de
                                        abajo para desbloquear tu cuenta.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmUnlock(true)}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Desbloquear Cuenta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loaderData.tokenValid && confirmUnlock && (
                    <Form method="post" className="mt-8 space-y-6">
                        <input type="hidden" name="token" value={loaderData.token} />

                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Confirmación
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            ¿Estás seguro de que deseas desbloquear tu cuenta? Una vez
                                            desbloqueada, podrás iniciar sesión normalmente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setConfirmUnlock(false)}
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Volver al inicio de sesión
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
