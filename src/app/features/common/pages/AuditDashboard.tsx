import { apiFetch } from "../../auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { MaterialIcon } from "~/features/common/components/ui/MaterialIcon";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";

// Tipos backend (mejor tipado según API)
interface ResumenResponse {
    totalUsuarios: number;
    totalCursos: number;
    totalMatriculas: number;
    totalTareas: number;
    totalEntregas: number;
    totalAuditorias: number;
}

interface TopAccionResponse {
    action: string;
    cantidad: number;
}

interface ActividadDiaResponse {
    dia: string;
    cantidad: number;
}

// Tipos frontend
export interface DonutDatum {
    label: string;
    value: number;
    color: string;
}

export interface TopAction {
    label: string;
    value: number;
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

export const meta = () => {
    return [
        { title: "Ombook - Dashboard de Auditoría" },
        { name: "description", content: "Panel de control de auditoría de Ombook" },
    ];
}

// Loader para obtener datos reales
// El loader recibe un objeto con 'request' de tipo Request (nativo)
export async function loader({ request }: { request: Request }) {
    requireRoleLoader([UserRole.ADMINISTRADOR]);
    const jwtToken = await getValidJWTToken(request);

    // Fetch resumen
    const resumenRes = await apiFetch("/admin/dashboard/resumen", { method: "GET", jwtToken, secure: true });
    const resumen: ResumenResponse = await resumenRes.json();

    // Fetch top acciones
    const topAccionesRes = await apiFetch("/admin/dashboard/top-acciones", { method: "GET", jwtToken, secure: true });
    const topAccionesRaw: TopAccionResponse[] = await topAccionesRes.json();
    const topActions: TopAction[] = Array.isArray(topAccionesRaw)
        ? topAccionesRaw.map((item) => ({
            label: item.action?.replace(/_/g, " "),
            value: item.cantidad
        }))
        : [];

    // Fetch actividad últimos días
    const actividadDiasRes = await apiFetch("/admin/dashboard/actividad-ultimos-dias", { method: "GET", jwtToken, secure: true });
    const actividadDiasRaw: ActividadDiaResponse[] = await actividadDiasRes.json();


    const weeklyActivity: number[] = Array.isArray(actividadDiasRaw)
        ? actividadDiasRaw.map((item) => item.cantidad)
        : [];
    const weeklyLabels: string[] = Array.isArray(actividadDiasRaw)
        ? actividadDiasRaw.map((item) => item.dia)
        : [];
    const weeklyTotal = weeklyActivity.reduce((acc, cur) => acc + cur, 0);

    // Donut chart data
    const donutData: DonutDatum[] = [
        { label: "Usuarios", value: resumen.totalUsuarios ?? 0, color: "#22c55e" },
        { label: "Cursos", value: resumen.totalCursos ?? 0, color: "#a16207" },
        { label: "Matriculas", value: resumen.totalMatriculas ?? 0, color: "#2563eb" },
        { label: "Tareas", value: resumen.totalTareas ?? 0, color: "#be185d" },
        { label: "Entregas", value: resumen.totalEntregas ?? 0, color: "#0ea5e9" },
        { label: "Auditorias", value: resumen.totalAuditorias ?? 0, color: "#7c3aed" }
    ];

    const result: AuditDashboardData = {
        usuariosTotales: resumen.totalUsuarios ?? 0,
        cursosTotales: resumen.totalCursos ?? 0,
        accionesHoy: resumen.totalAuditorias ?? 0,
        loginsHoy: topActions.find(a => a.label === "LOGIN")?.value ?? 0,
        donutData,
        topActions,
        weeklyActivity,
        weeklyLabels,
        weeklyTotal,
        weeklyPercent: 0
    };

    return new Response(
        JSON.stringify(result),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
}

interface DonutChartProps {
    donutData: DonutDatum[];
    total: number;
}
function DonutChart({ donutData, total }: DonutChartProps) {
    // Renderiza un donut chart simple y la leyenda
    // El SVG es estático, pero los valores y colores se pasan por props
    return (
        <div className="relative flex items-center justify-center" style={{ width: 192, height: 192 }}>
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                {/* Donut segments dinámicos si hay datos */}
                {donutData.length > 0 ? donutData.map((d, idx) => {
                    // Calcular el strokeDasharray y offset
                    const totalValue = donutData.reduce((acc, cur) => acc + cur.value, 0);
                    const percent = (d.value / totalValue) * 100;
                    const prevPercent = donutData.slice(0, idx).reduce((acc, cur) => acc + (cur.value / totalValue) * 100, 0);
                    return (
                        <circle
                            key={d.label}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke={d.color}
                            strokeWidth="3"
                            strokeDasharray={`${percent}, 100`}
                            strokeDashoffset={-prevPercent}
                        />
                    );
                }) : null}
            </svg>
            <div className="absolute flex flex-col items-center justify-center w-full h-full top-0 left-0">
                <span className="ombook-heading ombook-heading-lg">{total}</span>
                <span className="ombook-text-gray text-sm">Total Hoy</span>
            </div>
        </div>
    );
}

interface WeeklyActivityChartProps {
    weeklyActivity: number[];
    weeklyLabels: string[];
}

function WeeklyActivityChart({ weeklyActivity, weeklyLabels }: WeeklyActivityChartProps) {
    const data = weeklyLabels.map((label, i) => ({
        name: label,
        value: weeklyActivity[i] ?? 0
    }));

    return (
        <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#colorActivity)" strokeWidth={3} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

interface AuditDashboardProps {
    loaderData: AuditDashboardData;
}
export default function AuditDashboard({ loaderData }: AuditDashboardProps) {
    const stats = [
        {
            label: "Usuarios Totales",
            value: loaderData.usuariosTotales,
            icon: <MaterialIcon name="group" color="var(--color-ombook-green)" size={40} />,
            color: "ombook-bg-green/10"
        },
        {
            label: "Cursos Totales",
            value: loaderData.cursosTotales,
            icon: <MaterialIcon name="school" color="var(--color-ombook-green)" size={40} />,
            color: "ombook-bg-green/10"
        },
        {
            label: "Acciones Hoy",
            value: loaderData.accionesHoy,
            icon: <MaterialIcon name="bolt" color="var(--color-ombook-green)" size={40} />,
            color: "ombook-bg-green/10"
        },
        {
            label: "Logins Hoy",
            value: loaderData.loginsHoy,
            icon: <MaterialIcon name="login" color="var(--color-ombook-green)" size={40} />,
            color: "ombook-bg-green/10"
        }
    ];

    return (
        <div className="flex min-h-screen ombook-bg-light">
            <main className="flex-1 p-6 ombook-container">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="ombook-heading ombook-heading-xl ombook-text-brown mb-2">Dashboard Administrativo</h1>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="ombook-card flex items-start gap-4">
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="ombook-text-gray text-sm font-medium">{stat.label}</span>
                                <span className="ombook-heading ombook-heading-lg">{stat.value?.toLocaleString?.() ?? 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    {/* Donut Chart */}
                    <div className="lg:col-span-2 ombook-card flex flex-col gap-4">
                        <span className="ombook-heading ombook-heading-md">Resumen de Actividad de Acceso</span>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <DonutChart donutData={loaderData.donutData} total={loaderData.donutData?.reduce((acc, cur) => acc + cur.value, 0) ?? 0} />
                            <ul className="space-y-2">
                                {loaderData.donutData?.map((d) => (
                                    <li key={d.label} className="flex items-center gap-2">
                                        <span style={{ color: d.color }} className="text-lg">●</span>
                                        <span className="ombook-text-gray text-sm">{d.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Top Actions */}
                    <div className="lg:col-span-3 ombook-card flex flex-col gap-4">
                        <span className="ombook-heading ombook-heading-md">Top 10 de acciones más ejecutadas</span>
                        <div className="space-y-3">
                            {loaderData.topActions?.map((action) => (
                                <div key={action.label} className="flex items-center gap-3">
                                    <span className="ombook-text-gray text-sm w-32">{action.label}</span>
                                    <div className="flex-1 h-3 ombook-bg-gray-light rounded-full mr-2">
                                        <div
                                            className="h-3 rounded-full ombook-bg-green"
                                            style={{ width: `${(action.value / (loaderData.topActions?.[0]?.value || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="ombook-heading ombook-heading-sm">{action.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Weekly Activity */}
                <div className="ombook-card flex flex-col gap-4">
                    <span className="ombook-heading ombook-heading-md">Actividad de los últimos 7 días</span>
                    <div className="flex items-center gap-6">
                        <div className="w-full max-w-lg">
                            <WeeklyActivityChart weeklyActivity={loaderData.weeklyActivity} weeklyLabels={loaderData.weeklyLabels} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="ombook-heading ombook-heading-lg">{loaderData.weeklyTotal?.toLocaleString?.() ?? 0}</span>
                            <span className="ombook-text-green text-sm">Últimos 7 Días <span className="font-bold">{loaderData.weeklyPercent ? `+${loaderData.weeklyPercent}%` : ''}</span></span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
