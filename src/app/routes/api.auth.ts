import { API_URL } from "~/features/common/utils/Utils";

// ==========================================
// Tipos para las operaciones de recuperación
// ==========================================

export interface RecuperacionContrasenaRequest {
    correo: string;
}

export interface RecuperacionContrasenaResponse {
    mensaje: string;
}

export interface VerificarTokenResponse {
    valido: boolean;
}

export interface RestablecerContrasenaRequest {
    token: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
}

export interface RestablecerContrasenaResponse {
    mensaje: string;
}

export interface ErrorResponse {
    error: string;
}

// ==========================================
// POST /auth/recuperacion-contrasena
// ==========================================
/**
 * Solicita la recuperación de contraseña enviando un correo con el enlace.
 * @param request Request con el body conteniendo el correo
 * @returns Response 200 OK o 404 Not Found
 */
export async function action({ request }: { request: Request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
        // POST /auth/recuperacion-contrasena
        if (request.method === "POST" && pathname === "/auth/recuperacion-contrasena") {
            const body = await request.json() as RecuperacionContrasenaRequest;

            const response = await fetch(`${API_URL}/auth/recuperacion-contrasena`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                return Response.json(errorData, { status: response.status });
            }

            const data = await response.json() as RecuperacionContrasenaResponse;
            return Response.json(data, { status: 200 });
        }

        // POST /auth/restablecer-contrasena
        if (request.method === "POST" && pathname === "/auth/restablecer-contrasena") {
            const body = await request.json() as RestablecerContrasenaRequest;

            // Validar que las contraseñas coincidan en el frontend también
            if (body.nuevaContrasena !== body.confirmarContrasena) {
                return Response.json(
                    { error: "Las contraseñas no coinciden." } as ErrorResponse,
                    { status: 400 }
                );
            }

            const response = await fetch(`${API_URL}/auth/restablecer-contrasena`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                return Response.json(errorData, { status: response.status });
            }

            const data = await response.json() as RestablecerContrasenaResponse;
            return Response.json(data, { status: 200 });
        }

        return Response.json(
            { error: "Método no permitido" } as ErrorResponse,
            { status: 405 }
        );
    } catch (error) {
        console.error("Error en api.auth:", error);
        return Response.json(
            { error: "Error interno del servidor" } as ErrorResponse,
            { status: 500 }
        );
    }
}

// ==========================================
// GET /auth/restablecer-contrasena/verificar
// ==========================================
/**
 * Verifica si un token de recuperación es válido.
 * @param request Request con el query param token
 * @returns Response 200 OK con {valido: boolean} o 400 Bad Request
 */
export async function loader({ request }: { request: Request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
        // GET /auth/restablecer-contrasena/verificar?token=xxx
        if (pathname === "/auth/restablecer-contrasena/verificar") {
            const token = url.searchParams.get("token");

            if (!token) {
                return Response.json(
                    { error: "Token no proporcionado" } as ErrorResponse,
                    { status: 400 }
                );
            }

            const response = await fetch(
                `${API_URL}/auth/restablecer-contrasena/verificar?token=${encodeURIComponent(token)}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json() as ErrorResponse;
                return Response.json(errorData, { status: response.status });
            }

            const data = await response.json() as VerificarTokenResponse;
            return Response.json(data, { status: 200 });
        }

        return Response.json(
            { error: "Ruta no encontrada" } as ErrorResponse,
            { status: 404 }
        );
    } catch (error) {
        console.error("Error en api.auth loader:", error);
        return Response.json(
            { error: "Error interno del servidor" } as ErrorResponse,
            { status: 500 }
        );
    }
}
