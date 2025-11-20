import type { LoaderFunctionArgs } from "react-router";
import { obtenerChats } from "./api.chat";

/**
 * Handler para GET /api/chat/chats
 * Obtiene todos los chats del usuario actual con sus últimos mensajes.
 */
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const chats = await obtenerChats(request);

        return Response.json(chats, { status: 200 });
    } catch (error) {
        console.error("Error al obtener chats:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Error al obtener chats" },
            { status: 500 }
        );
    }
}
