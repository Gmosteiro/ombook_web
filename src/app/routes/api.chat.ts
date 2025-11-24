import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";
import type {
    ContactoSimpleResponse,
    ChatSummaryResponse,
    MensajePrivadoResponse,
    MensajeCreateRequest
} from "~/features/chat/types";

/**
 * Obtiene la lista unificada de contactos del usuario actual.
 * Incluye todos los usuarios con los que se puede iniciar conversación.
 * Endpoint: GET /mensajes/contactos
 * @param request Request original para obtener JWT
 * @param search Opcional: término de búsqueda para filtrar contactos
 * @returns Lista de contactos simples
 */
export async function obtenerContactos(
    request: Request,
    search?: string
): Promise<ContactoSimpleResponse[]> {
    const searchParams = new URLSearchParams();
    if (search) searchParams.append("q", search);

    const url = "/mensajes/contactos" + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al obtener contactos: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error al obtener contactos: ${response.status}`);
    }

    return await response.json() as ContactoSimpleResponse[];
}

/**
 * Obtiene el resumen de todos los chats del usuario actual.
 * Retorna una lista de conversaciones con el último mensaje y contador de no leídos.
 * Endpoint: GET /mensajes/chats
 * @param request Request original para obtener JWT
 * @param search Opcional: término de búsqueda para filtrar chats
 * @returns Lista de resúmenes de chats
 */
export async function obtenerChats(
    request: Request,
    search?: string
): Promise<ChatSummaryResponse[]> {
    const searchParams = new URLSearchParams();
    if (search) searchParams.append("q", search);

    const url = "/mensajes/chats" + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al obtener chats: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error al obtener chats: ${response.status}`);
    }

    return await response.json() as ChatSummaryResponse[];
}

/**
 * Obtiene la conversación completa con un contacto específico.
 * Endpoint: GET /mensajes/chats/{partnerId}
 * @param request Request original para obtener JWT
 * @param partnerId ID del contacto con el que se quiere ver la conversación
 * @returns Lista de mensajes con el contacto
 */
export async function obtenerMensajesCon(
    request: Request,
    partnerId: number
): Promise<MensajePrivadoResponse[]> {
    const response = await apiFetch(`/mensajes/chats/${partnerId}`, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al obtener mensajes: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error al obtener mensajes: ${response.status}`);
    }

    return await response.json() as MensajePrivadoResponse[];
}

/**
 * Envía un mensaje a un contacto.
 * Endpoint: POST /mensajes
 * @param request Request original para obtener JWT
 * @param destinatarioId ID del usuario destinatario
 * @param contenido Contenido del mensaje
 * @returns Mensaje creado con su información completa
 */
export async function enviarMensaje(
    request: Request,
    destinatarioId: number,
    contenido: string
): Promise<MensajePrivadoResponse> {
    const body: MensajeCreateRequest = { destinatarioId, contenido };

    const response = await apiFetch("/mensajes", {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al enviar mensaje: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error al enviar mensaje: ${response.status}`);
    }

    return await response.json() as MensajePrivadoResponse;
}
