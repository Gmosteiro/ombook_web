import { getValidJWTToken } from "../services/session.server";
import { apiFetch } from '../features/auth/utils/methods'
import type { components } from "../../types/openapi";

// Tipos OpenAPI
export type CursoListadoResponse = components["schemas"]["CursoListadoResponse"];
export type PaginatorResponseCursoListadoResponse = components["schemas"]["PaginatorResponseCursoListadoResponse"];
export type CursoCreateRequest = components["schemas"]["CursoCreateRequest"];
export type Curso = components["schemas"]["Curso"];

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

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener cursos");

    const res = await response.json() as PaginatorResponseCursoListadoResponse;
    return res;
}

// export async function listarCursos(request: Request): Promise<CursoListadoResponse[]> {
//     const response = await apiFetch("/cursos/listar", {
//         method: "GET",
//         secure: true,
//         jwtToken: await getValidJWTToken(request),
//     });

//     if (!response.ok) throw new Error("Error al listar cursos");

//     return await response.json() as CursoListadoResponse[];
// }

/**
 * Elimina un curso por su ID.
 * @param request Request original (para JWT)
 * @param id ID del curso a eliminar
 * @returns true si fue exitoso, lanza error si falla
 */
export async function deleteCurso(request: Request, id: number): Promise<boolean> {
    const url = `/cursos/${id}`;
    const response = await apiFetch(url, {
        method: "DELETE",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al eliminar el curso");
    return true;
}

/**
 * Crea un curso individualmente.
 * @param request Request original (para JWT)
 * @param data Datos del curso a crear
 * @returns El curso creado
 */
export async function crearCurso(request: Request, data: CursoCreateRequest): Promise<any> {
    const response = await apiFetch("/cursos", {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.error("Error response crearCurso:", await response.text());
        throw new Error(await response.text() || "Error al crear el curso");
    }

    // return await response.json() as Curso;
    return await response.text()
}



