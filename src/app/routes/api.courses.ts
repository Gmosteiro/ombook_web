import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";
import type { components } from "../../types/openapi";

// Tipos OpenAPI
export type CursoListadoResponse = components["schemas"]["CursoListadoResponse"];
export type PaginatorResponseCursoListadoResponse = components["schemas"]["PaginatorResponseCursoListadoResponse"];

export const enum CourseStatus {
    ACTIVO = "ACTIVO",
    INACTIVO = "INACTIVO",
    ELIMINADO = "ELIMINADO"
}

type CursoFilters = {
    q?: string;
    estado?: CourseStatus;
    profesorId?: number;
    page?: number;
    size?: number;
    sort?: string[];
};

// Obtener cursos con filtros y paginación (admin: todos, prof/est: solo sus cursos)
export async function getCursos(
    request: Request,
    params?: CursoFilters
): Promise<PaginatorResponseCursoListadoResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
        if (params.q) searchParams.append("q", params.q);
        if (params.estado) searchParams.append("estado", params.estado);
        if (params.profesorId !== undefined) searchParams.append("profesorId", params.profesorId.toString());
        if (params.page !== undefined) searchParams.append("page", params.page.toString());
        if (params.size !== undefined) searchParams.append("size", params.size.toString());
        if (params.sort) params.sort.forEach(s => searchParams.append("sort", s));
    }
    const url = "/cursos" + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    console.log('Fetching courses with', {
        url,
        params
    });

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener cursos");

    const res = await response.json() as PaginatorResponseCursoListadoResponse;

    console.log('Courses', res)

    return res;
}

export async function listarCursos(request: Request): Promise<CursoListadoResponse[]> {
    const response = await apiFetch("/cursos/listar", {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al listar cursos");

    return await response.json() as CursoListadoResponse[];
}



