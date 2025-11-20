import type { LoaderFunctionArgs } from "react-router";
import { obtenerChatPorId } from "./api.chat";

/**
 * Handler para GET /api/chat/chats/:id
 * Obtiene la conversación completa con un contacto específico.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
    try {
        const contactoId = parseInt(params.id, 10);

        if (isNaN(contactoId)) {
            return Response.json(
                { error: "ID de contacto inválido" },
                { status: 400 }
            );
        }

        const chat = await obtenerChatPorId(request, contactoId);

        return Response.json(chat, { status: 200 });
    } catch (error) {
        console.error("Error al obtener chat:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Error al obtener chat" },
            { status: 500 }
        );
    }
}
