import type { ActionFunctionArgs } from "react-router";
import { enviarMensaje } from "./api.chat";

/**
 * Handler para POST /api/chat/mensajes
 * Envía un mensaje a un contacto específico.
 */
export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return Response.json(
            { error: "Método no permitido" },
            { status: 405 }
        );
    }

    try {
        const body = await request.json();
        const { destinatarioId, contenido } = body;

        if (!destinatarioId || typeof destinatarioId !== "number") {
            return Response.json(
                { error: "destinatarioId es requerido y debe ser un número" },
                { status: 400 }
            );
        }

        if (!contenido || typeof contenido !== "string" || !contenido.trim()) {
            return Response.json(
                { error: "contenido es requerido y no puede estar vacío" },
                { status: 400 }
            );
        }

        const mensaje = await enviarMensaje(request, destinatarioId, contenido);

        return Response.json(mensaje, { status: 201 });
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Error al enviar mensaje" },
            { status: 500 }
        );
    }
}
