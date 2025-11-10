import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";
import type { components } from "../../types/openapi";
import { UserRole, UserStatus } from "~/features/auth/types";

// Tipos OpenAPI
export type UsuarioListadoResponse = components["schemas"]["UsuarioListadoResponse"];
export type PaginatorResponseUsuarioListaResponse = components["schemas"]["PaginatorResponseUsuarioListaResponse"];
export type UsuarioListaResponse = components["schemas"]["UsuarioListaResponse"];

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

    // console.log("Fetching users with:", {
    //     q: params?.q,
    //     rol: params?.rol,
    //     estado: params?.estado,
    //     page: params?.page,
    //     size: params?.size,
    //     sort: params?.sort,
    // })

    const response = await apiFetch(url, {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const data = await response.json() as PaginatorResponseUsuarioListaResponse;

    // console.log("Fetched users data:", data);

    return data
}

// Obtener solo profesores usando filtro + otros filtros opcionales
export async function getProfesores(
    request: Request,
    params?: UserGetterParams
): Promise<UsuarioListadoResponse[]> {
    const paginator = await getUsers(request, { ...params, rol: UserRole.PROFESOR });
    return paginator.content ?? [];
}

// Obtener solo estudiantes usando filtro + otros filtros opcionales
export async function getEstudiantes(
    request: Request,
    params?: UserGetterParams
): Promise<UsuarioListadoResponse[]> {
    const paginator = await getUsers(request, { ...params, rol: UserRole.ESTUDIANTE });
    return paginator.content ?? [];
}
