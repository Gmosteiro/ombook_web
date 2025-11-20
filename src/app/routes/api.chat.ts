import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";

// ==========================================
// Tipos para el sistema de chat
// ==========================================

export interface Contacto {
    id: number;
    nombre: string;
    apellido: string;
    rol: "ADMINISTRADOR" | "PROFESOR" | "ESTUDIANTE";
    fotoPerfilUrl?: string;
    ultimoMensaje?: string;
    timestampUltimoMensaje?: string;
    enLinea: boolean;
    mensajesNoLeidos?: number;
}

export interface Mensaje {
    id: number;
    remitenteId: number;
    destinatarioId: number;
    contenido: string;
    timestamp: string;
    leido: boolean;
}

export interface Chat {
    contacto: Contacto;
    mensajes: Mensaje[];
}

export interface EnviarMensajeRequest {
    destinatarioId: number;
    contenido: string;
}

export interface EnviarMensajeResponse {
    id: number;
    remitenteId: number;
    destinatarioId: number;
    contenido: string;
    timestamp: string;
    leido: boolean;
}

export interface ErrorResponse {
    error: string;
}

// ==========================================
// Métodos de API
// ==========================================

/**
 * Obtiene la lista de contactos del usuario actual.
 * Pueden ser estudiantes, profesores o administradores según el rol del usuario.
 * @param request Request original para obtener JWT
 * @param search Opcional: término de búsqueda para filtrar contactos
 * @returns Lista de contactos
 */
export async function obtenerContactos(
    request: Request,
    search?: string
): Promise<Contacto[]> {
    const searchParams = new URLSearchParams();
    if (search) searchParams.append("search", search);

    const url = "/contactos" + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al obtener contactos");
    }

    return await response.json() as Contacto[];
}

/**
 * Obtiene todos los chats del usuario actual.
 * Retorna una lista de conversaciones con el último mensaje de cada una.
 * @param request Request original para obtener JWT
 * @returns Lista de chats con información del contacto y último mensaje
 */
export async function obtenerChats(
    request: Request
): Promise<Chat[]> {
    const response = await apiFetch("/chats", {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al obtener chats");
    }

    return await response.json() as Chat[];
}

/**
 * Obtiene la conversación completa con un contacto específico.
 * @param request Request original para obtener JWT
 * @param contactoId ID del contacto con el que se quiere ver la conversación
 * @returns Chat completo con el contacto incluyendo todos los mensajes
 */
export async function obtenerChatPorId(
    request: Request,
    contactoId: number
): Promise<Chat> {
    const response = await apiFetch(`/chats/${contactoId}`, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al obtener chat");
    }

    return await response.json() as Chat;
}

/**
 * Envía un mensaje a un contacto.
 * @param request Request original para obtener JWT
 * @param destinatarioId ID del usuario destinatario
 * @param contenido Contenido del mensaje
 * @returns Mensaje creado con su ID y timestamp
 */
export async function enviarMensaje(
    request: Request,
    destinatarioId: number,
    contenido: string
): Promise<EnviarMensajeResponse> {
    const response = await apiFetch("/mensajes", {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify({ destinatarioId, contenido }),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al enviar mensaje");
    }

    return await response.json() as EnviarMensajeResponse;
}

/**
 * Marca un mensaje como leído.
 * @param request Request original para obtener JWT
 * @param mensajeId ID del mensaje a marcar como leído
 */
export async function marcarMensajeComoLeido(
    request: Request,
    mensajeId: number
): Promise<void> {
    const response = await apiFetch(`/mensajes/${mensajeId}/leer`, {
        method: "PATCH",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.error || "Error al marcar mensaje como leído");
    }
}
