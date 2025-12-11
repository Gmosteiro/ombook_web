import { apiFetch } from "../features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";

// Tipos
export interface ResumenResponse {
    totalUsuarios: number;
    totalCursos: number;
    totalMatriculas: number;
    totalTareas: number;
    totalEntregas: number;
    totalAuditorias: number;
}

export interface TopAccionResponse {
    action: string;
    cantidad: number;
}

export interface ActividadDiaResponse {
    dia: string;
    cantidad: number;
}

// Obtener resumen del dashboard
export async function getResumenDashboard(request: Request): Promise<ResumenResponse> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/admin/dashboard/resumen", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo obtener el resumen del dashboard");
    return await response.json() as ResumenResponse;
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
export async function getActividadUltimosDias(request: Request): Promise<ActividadDiaResponse[]> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/admin/dashboard/actividad-ultimos-dias", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo obtener la actividad de los últimos días");
    const data = await response.json();
    return Array.isArray(data) ? data as ActividadDiaResponse[] : [];
}
