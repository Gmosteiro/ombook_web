import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { confirmarCambioCorreo } from "../../../routes/api.auth.server";
import { useNavigate } from "react-router";

type LoaderResult = {
    success: boolean;
    mensaje?: string;
    error?: string;
};

export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    let result;
    if (!token) {
        result = {
            success: false,
            error: "Token no proporcionado. Verifique el enlace de su correo.",
        };
    } else {
        try {
            const response = await confirmarCambioCorreo({ token });
            result = {
                success: true,
                mensaje: response.mensaje || "Correo electrónico cambiado correctamente.",
            };
        } catch (error: any) {
            result = {
                success: false,
                error: error.message || "Error al confirmar el cambio de correo.",
            };
        }
    }

    return new Response(
        JSON.stringify(result),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
}

export default function ConfirmEmailChange() {
    const loaderData = useLoaderData() as LoaderResult;

    const navigate = useNavigate();

    useEffect(() => {
        if (loaderData.success) {
            const timer = setTimeout(() => {
                navigate("/profile");
            }, 3000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [loaderData, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center ombook-bg-light px-4">
            <div className="max-w-md w-full ombook-card text-center">
                <div className="ombook-card-header mb-4">
                    <h1 className="ombook-heading ombook-heading-lg ombook-text-green mb-2">
                        Confirmar cambio de correo
                    </h1>
                </div>
                {loaderData.success ? (
                    <div className="ombook-alert ombook-alert-success">
                        <p>{loaderData.mensaje}</p>
                        <p className="ombook-text-gray mt-2 text-sm">
                            Redirigiendo a tu perfil...
                        </p>
                    </div>
                ) : (
                    <div className="ombook-alert ombook-alert-info">
                        <p>{loaderData.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}