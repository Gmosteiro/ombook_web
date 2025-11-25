

import { apiFetch } from "../features/auth/utils/methods";
import type { components } from "../../types/openapi";

// Types generados desde openapi
export type CalificacionFinalEstudianteResponse = components["schemas"]["CalificacionFinalEstudianteResponse"];
export type MarksListResponse = components["schemas"]["CalificacionFinalResponse"][];
export type SaveMarksResponse = void;
export type PublishMarksResponse = void;

export type MarkStatus = components["schemas"]["CalificacionFinalResponse"]["estado"];


export async function listMarks(request: Request, cursoId: string): Promise<MarksListResponse> {
    const { getValidJWTToken } = await import("../services/session.server");

    const res = await apiFetch(`/cursos/${cursoId}/calificaciones-finales`, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request)
    });
    if (!res.ok) throw new Error("Error al listar calificaciones");
    return res.json();
}


export async function saveMarks(request: Request, cursoId: string, data: any): Promise<SaveMarksResponse> {
    const { getValidJWTToken } = await import("../services/session.server");

    const res = await apiFetch(`/cursos/${cursoId}/calificaciones-finales`, {
        method: "PUT",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar calificaciones");
    return res.json();
}


export async function publishMarks(request: Request, cursoId: string): Promise<PublishMarksResponse> {
    const { getValidJWTToken } = await import("../services/session.server");

    const res = await apiFetch(`/cursos/${cursoId}/calificaciones-finales/publicacion`, {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    if (!res.ok) throw new Error("Error al publicar calificaciones");
    return res.json();
}


export async function getMyMarks(request: Request, cursoId: string): Promise<CalificacionFinalEstudianteResponse> {
    const { getValidJWTToken } = await import("../services/session.server");

    const res = await apiFetch(`/cursos/${cursoId}/calificaciones-finales/mi`, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    if (!res.ok) {
        console.log("Failed to fetch my mark, status:", res.status);
        throw new Error("Error al obtener mi calificación");
    }

    const response = await res.json();

    return response;
}
