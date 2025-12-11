import { apiFetch } from "../features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import type { components } from "../../types/openapi";

// Tipos desde OpenAPI
export type DashboardResponse = components["schemas"]["DashboardResponse"];
export type TopAccionResponse = components["schemas"]["TopAccionResponse"];
export type PuntoDiaResponse = components["schemas"]["PuntoDiaResponse"];

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
