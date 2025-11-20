import type { LoaderFunctionArgs } from "react-router";
import { obtenerContactos } from "./api.chat";

/**
 * Handler para GET /api/chat/contactos
 * Obtiene la lista de contactos del usuario actual.
 * Soporta búsqueda opcional mediante query param ?search=
 */
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || undefined;

        const contactos = await obtenerContactos(request, search);

        return Response.json(contactos, { status: 200 });
    } catch (error) {
        console.error("Error al obtener contactos:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Error al obtener contactos" },
            { status: 500 }
        );
    }
}
