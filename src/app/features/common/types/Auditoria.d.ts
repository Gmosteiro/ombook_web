// Tipos backend
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

export interface AuditDashboardData {
    usuariosTotales: number;
    cursosTotales: number;
    accionesHoy: number;
    loginsHoy: number;
    donutData: DonutDatum[];
    topActions: TopAction[];
    weeklyActivity: number[];
    weeklyLabels: string[];
    weeklyTotal: number;
    weeklyPercent: number;
}