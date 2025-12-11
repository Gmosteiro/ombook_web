import { apiFetch } from "../features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import type { components } from "../../types/openapi";

// Tipos desde OpenAPI
export type DashboardResponse = components["schemas"]["DashboardResponse"];
export type TopAccionResponse = components["schemas"]["TopAccionResponse"];
export type PuntoDiaResponse = components["schemas"]["PuntoDiaResponse"];
export type AuditoriaResponse = components["schemas"]["AuditoriaResponse"];
export type PaginatorResponseAuditoriaResponse = components["schemas"]["PaginatorResponseAuditoriaResponse"];

// Obtener resumen del dashboard
export async function getResumenDashboard(request: Request): Promise<DashboardResponse> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/admin/dashboard/resumen", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo obtener el resumen del dashboard");
    return await response.json() as DashboardResponse;
}

// Obtener top acciones más ejecutadas
export async function getTopAcciones(request: Request): Promise<TopAccionResponse[]> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/admin/dashboard/top-acciones", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudieron obtener las top acciones");
    const data = await response.json();
    return Array.isArray(data) ? data as TopAccionResponse[] : [];
}

// Obtener actividad de los últimos días
export async function getActividadUltimosDias(request: Request): Promise<PuntoDiaResponse[]> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/admin/dashboard/actividad-ultimos-dias", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo obtener la actividad de los últimos días");
    const data = await response.json();
    return Array.isArray(data) ? data as PuntoDiaResponse[] : [];
}

// Obtener auditorías con filtros y paginación
export async function getAuditorias(
    request: Request,
    filters: {
        page?: string;
        size?: string;
        sort?: string[];
        action?: string;
        resultado?: string;
        email?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    }
): Promise<PaginatorResponseAuditoriaResponse> {
    const jwtToken = await getValidJWTToken(request);
    const queryParams = new URLSearchParams();
    queryParams.set("page", filters.page ?? "0");
    queryParams.set("size", filters.size ?? "20");
    if (filters.sort?.length) filters.sort.forEach(s => queryParams.append("sort", s));
    if (filters.action) queryParams.set("action", filters.action);
    if (filters.resultado) queryParams.set("resultado", filters.resultado);
    if (filters.email) queryParams.set("email", filters.email);
    if (filters.fechaDesde) queryParams.set("fechaDesde", filters.fechaDesde);
    if (filters.fechaHasta) queryParams.set("fechaHasta", filters.fechaHasta);

    const response = await apiFetch(`/auditoria?${queryParams.toString()}`, {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudieron obtener las auditorías");
    return await response.json() as PaginatorResponseAuditoriaResponse;
}
