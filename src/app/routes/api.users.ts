import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";
import type { components } from "../../types/openapi";
import { UserRole, UserStatus } from "~/features/auth/types";

// Tipos OpenAPI
export type UsuarioListaResponse = components["schemas"]["UsuarioListaResponse"];
export type PaginatorResponseUsuarioListaResponse = components["schemas"]["PaginatorResponseUsuarioListaResponse"];
export type AltaUsuarioRequest = components["schemas"]["AltaUsuarioRequest"];

/**
 * Crea un usuario individualmente.
 * @param request Request original (para JWT)
 * @param data Datos del usuario a crear
 * @returns void (no hay cuerpo de respuesta)
 */
export async function crearUsuario(request: Request, data: AltaUsuarioRequest): Promise<void> {

    const response = await apiFetch("/usuarios", {
        method: "POST",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(data)
    });

    if (response.status !== 201) throw new Error("Error al crear el usuario");
}


type UserFilters = {
    q?: string;
    estado?: UserStatus;
    page?: number;
    size?: number;
    sort?: string[];
    rol?: UserRole;
};
type UserGetterParams = Omit<UserFilters, 'rol'>;

// Obtener todos los usuarios (con filtros opcionales)
export async function getUsers(
    request: Request,
    params?: UserFilters
): Promise<PaginatorResponseUsuarioListaResponse> {
    // Construir query params manualmente
    const searchParams = new URLSearchParams();
    if (params) {
        if (params.q) searchParams.append("q", params.q);
        if (params.rol) searchParams.append("rol", params.rol);
        if (params.estado) searchParams.append("estado", params.estado);
        if (params.page !== undefined) searchParams.append("page", params.page.toString());
        if (params.size !== undefined) searchParams.append("size", params.size.toString());
        if (params.sort) params.sort.forEach(s => searchParams.append("sort", s));
    }
    const url = "/usuarios" + (searchParams.toString() ? `?${searchParams.toString()}` : "");


    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const data = await response.json() as PaginatorResponseUsuarioListaResponse;

    return data
}

// Obtener solo profesores usando filtro + otros filtros opcionales
export async function getProfesores(
    request: Request,
    params?: UserGetterParams
): Promise<UsuarioListaResponse[]> {
    const paginator = await getUsers(request, { ...params, rol: UserRole.PROFESOR });
    return paginator.content ?? [];
}

// Obtener solo estudiantes usando filtro + otros filtros opcionales
export async function getEstudiantes(
    request: Request,
    params?: UserGetterParams
): Promise<UsuarioListaResponse[]> {
    const paginator = await getUsers(request, { ...params, rol: UserRole.ESTUDIANTE });
    return paginator.content ?? [];
}


export const getEstudiantesByCurso = async (
    request: Request,
    cursoId: number
): Promise<UsuarioListaResponse[]> => {
    const response = await apiFetch(`/cursos/${cursoId}/usuarios-vinculados?rol=ESTUDIANTE`, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener estudiantes del curso");

    // El endpoint devuelve un paginador, extraemos el array de estudiantes
    const data = await response.json();
    return data.content ?? [];
};


type CursoUserFilters = {
    q?: string;
    page?: number;
    size?: number;
    sort?: string[];
    rol?: UserRole;
};

export async function getUsuariosVinculadosByCurso(
    request: Request,
    cursoId: number,
    params?: CursoUserFilters
): Promise<PaginatorResponseUsuarioListaResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
        if (params.q) searchParams.append("q", params.q);
        if (params.rol) searchParams.append("rol", params.rol);
        if (params.page !== undefined) searchParams.append("page", params.page.toString());
        if (params.size !== undefined) searchParams.append("size", params.size.toString());
        if (params.sort) params.sort.forEach(s => searchParams.append("sort", s));
    }
    const url = `/cursos/${cursoId}/usuarios-vinculados${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener usuarios vinculados al curso");

    return await response.json() as PaginatorResponseUsuarioListaResponse;
}


