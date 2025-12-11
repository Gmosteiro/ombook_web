import { MaterialIcon } from "~/features/common/components/ui/MaterialIcon";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";
import { StatCard } from "~/features/common/components/auditoria/StatCard";
import { DonutChart, type DonutDatum } from "~/features/common/components/auditoria/DonutChart";
import { WeeklyActivityChart } from "~/features/common/components/auditoria/WeeklyActivityChart";
import { TopActionsList, type TopAction } from "~/features/common/components/auditoria/TopActionsList";
import { getResumenDashboard, getTopAcciones, getActividadUltimosDias } from "~/routes/api.auditoria";
import { headers } from "../utils/Auditoria";

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
export async function loader({ request }: { request: Request }) {
    requireRoleLoader([UserRole.ADMINISTRADOR]);

    // Fetch resumen
    const resumen = await getResumenDashboard(request);

    // Fetch top acciones
    const topAccionesRaw = await getTopAcciones(request);
    const topActions: TopAction[] = topAccionesRaw.map((item) => ({
        label: item.action?.replace(/_/g, " "),
        value: item.cantidad
    }));

    // Fetch actividad últimos días
    const actividadDiasRaw = await getActividadUltimosDias(request);

    const weeklyActivity: number[] = actividadDiasRaw.map((item) => item.cantidad);
    const weeklyLabels: string[] = actividadDiasRaw.map((item) => item.dia);
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
        { headers: headers }
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
                        <StatCard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
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
                        <TopActionsList topActions={loaderData.topActions} />
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
