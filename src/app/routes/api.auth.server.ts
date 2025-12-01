import { API_URL } from "~/features/common/utils/Utils";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "../services/session.server";

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
// Métodos de API
// ==========================================

/**
 * Solicita la recuperación de contraseña enviando un correo con el enlace.
 * @param correo El correo electrónico del usuario
 * @returns Response con mensaje de éxito
 */
export async function solicitarRecuperacionContrasena(
    correo: string
): Promise<RecuperacionContrasenaResponse> {
    const response = await fetch(`${API_URL}/auth/recuperacion-contrasena`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo }),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al solicitar recuperación de contraseña");
    }

    return await response.json() as RecuperacionContrasenaResponse;
}

/**
 * Verifica si un token de recuperación es válido.
 * @param token El token a verificar
 * @returns Response con validez del token
 */
export async function verificarToken(token: string): Promise<VerificarTokenResponse> {
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
        throw new Error(errorData.error || "Error al verificar token");
    }

    return await response.json() as VerificarTokenResponse;
}

/**
 * Restablece la contraseña usando un token válido.
 * @param data Datos para restablecer la contraseña
 * @returns Response con mensaje de éxito
 */
export async function restablecerContrasena(
    data: RestablecerContrasenaRequest
): Promise<RestablecerContrasenaResponse> {
    // Validar que las contraseñas coincidan
    if (data.nuevaContrasena !== data.confirmarContrasena) {
        throw new Error("Las contraseñas no coinciden.");
    }

    const response = await fetch(`${API_URL}/auth/restablecer-contrasena`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al restablecer contraseña");
    }

    return await response.json() as RestablecerContrasenaResponse;
}

/**
 * Cambia la contraseña del usuario autenticado.
 * @param request Request object para obtener el JWT token
 * @param data Datos para cambiar la contraseña (contraseña actual y nueva)
 * @returns Response con mensaje de éxito
 */
export async function cambiarContrasena(
    request: Request,
    data: CambiarContrasenaRequest
): Promise<CambiarContrasenaResponse> {
    // Validar que las contraseñas coincidan
    if (data.nuevaContrasena !== data.confirmarContrasena) {
        throw new Error("Las contraseñas no coinciden.");
    }
    const { getValidJWTToken } = await import("../services/session.server");
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch(`/auth/password`, {
        method: "PUT",
        secure: true,
        jwtToken,
        body: data,
    });

    if (!response.ok) {
        const errorData = await response.json() as { message?: string; error?: string };
        // Usar 'message' si está disponible, sino 'error', sino mensaje genérico
        throw new Error(errorData.message || errorData.error || "Error al cambiar contraseña");
    }

    return await response.json() as CambiarContrasenaResponse;
}

/**
 * Desbloquea una cuenta usando el token recibido por email.
 * @param data Datos con el token de desbloqueo
 * @returns Response con mensaje de éxito
 */
export async function desbloquearCuenta(
    data: DesbloquearCuentaRequest
): Promise<DesbloquearCuentaResponse> {
    const response = await fetch(`${API_URL}/auth/desbloqueo-cuenta`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al desbloquear cuenta");
    }

    return await response.json() as DesbloquearCuentaResponse;
}

export interface CambiarContrasenaRequest {
    contrasenaActual: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
}

export interface CambiarContrasenaResponse {
    mensaje: string;
}

export interface DesbloquearCuentaRequest {
    token: string;
}

export interface DesbloquearCuentaResponse {
    mensaje: string;
}

export interface IniciarCambioCorreoRequest {
    nuevoCorreo: string;
    passwordActual: string;
}

export interface ConfirmarCambioCorreoRequest {
    token: string;
}

export interface CambioCorreoResponse {
    mensaje: string;
}

/**
 * Inicia el proceso de cambio de correo electrónico.
 * @param request Request object para obtener el JWT token
 * @param data Datos para iniciar el cambio (nuevo correo y contraseña actual)
 * @returns Mensaje de éxito
 */
export async function iniciarCambioCorreo(
    request: Request,
    data: IniciarCambioCorreoRequest
): Promise<CambioCorreoResponse> {
    const response = await apiFetch(`/email-change/requests`, {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(data),
    });

    console.log('Response status', response.status);
    console.log('Response text', await response.clone().text());

    if (!response.ok) {
        let errorMsg = "Error al iniciar el cambio de correo.";

        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }

    // Si la respuesta está vacía, devuelve un mensaje por defecto
    let mensaje = "Solicitud de cambio de correo enviada correctamente.";
    try {
        const json = await response.json();
        if (json?.mensaje) mensaje = json.mensaje;
    } catch { }
    return { mensaje };
}

/**
 * Confirma el cambio de correo electrónico con el token recibido.
 * @param data Datos para confirmar el cambio (token)
 * @returns Mensaje de éxito
 */
export async function confirmarCambioCorreo(
    data: ConfirmarCambioCorreoRequest
): Promise<CambioCorreoResponse> {
    const response = await fetch(`${API_URL}/email-change/confirm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al confirmar el cambio de correo.");
    }

    return { mensaje: "Correo electrónico cambiado correctamente." };
}