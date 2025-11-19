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
