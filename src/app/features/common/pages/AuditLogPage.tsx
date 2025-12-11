import { useLoaderData, useSearchParams } from "react-router";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";
import { useState, useEffect } from "react";
import { ACTIONS, RESULTADOS, getTodayDate, headers } from "~/features/common/utils/Auditoria";
import { getAuditorias } from "~/routes/api.auditoria";
import type { PaginatorResponseAuditoriaResponse } from "~/routes/api.auditoria";

type AuditLogFilters = {
    action: string;
    resultado: string;
    userId: string;
    fechaDesde?: string;
    fechaHasta?: string;
};

// Loader
export async function loader({ request }: { request: Request }) {
    requireRoleLoader([UserRole.ADMINISTRADOR]);
    try {
        const url = new URL(request.url);
        const params = url.searchParams;
        const page = params.get("page") ?? "0";
        const size = params.get("size") ?? "20";
        let sort = params.getAll("sort");
        // Si no hay sort definido, aplicar sort descendente por fecha por defecto
        if (sort.length === 0) {
            sort = ["fecha,desc"];
        }
        const action = params.get("action") ?? "";
        const resultado = params.get("resultado") ?? "";
        const userId = params.get("userId") ?? "";
        const fechaDesde = params.get("fechaDesde") ?? "";
        const fechaHasta = params.get("fechaHasta") ?? "";

        const data = await getAuditorias(request, {
            page,
            size,
            sort,
            action,
            resultado,
            userId,
            fechaDesde,
            fechaHasta,
        });

        return new Response(
            JSON.stringify({ data, filters: { action, resultado, userId, fechaDesde, fechaHasta }, page: Number(page) + 1, sort }),
            { headers: headers }
        );

    } catch (e) {
        return new Response(
            JSON.stringify({
                data: { content: [], totalPages: 1 },
                filters: { action: "", resultado: "", userId: "", fechaDesde: "", fechaHasta: "" },
                page: 1,
                sort: [],
                error: String(e)
            }),
            { headers: headers }
        );
    }
}

export const meta = () => {
    return [
        { title: "Log de Auditoría - Ombook" },
    ]
}

export default function AuditLogPage() {
    const { data, filters, page, error, sort: initialSort } = useLoaderData() as {
        data: PaginatorResponseAuditoriaResponse;
        filters: AuditLogFilters;
        page: number;
        sort: string[];
        error?: string;
    };
    const [searchParams, setSearchParams] = useSearchParams();
    const [userInput, setUserInput] = useState(filters.userId || "");
    const [action, setAction] = useState(filters.action || "");
    const [resultado, setResultado] = useState(filters.resultado || "");
    const [fechaDesde, setFechaDesde] = useState(filters.fechaDesde || getTodayDate());
    const [fechaHasta, setFechaHasta] = useState(filters.fechaHasta || getTodayDate());
    const [sort, setSort] = useState<string[]>(initialSort);

    useEffect(() => {
        setUserInput(filters.userId || "");
        setAction(filters.action || "");
        setResultado(filters.resultado || "");
        setFechaDesde(filters.fechaDesde || getTodayDate());
        setFechaHasta(filters.fechaHasta || getTodayDate());
    }, [filters.userId, filters.action, filters.resultado, filters.fechaDesde, filters.fechaHasta]);

    // Actualiza el sort cuando cambian los searchParams
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        setSort(params.getAll("sort"));
    }, [searchParams]);

    // Handler para búsqueda por usuario
    const handleUserSearch = (value: string) => {
        setUserInput(value);
        // Solo buscar si está vacío o tiene 3+ caracteres
        if (value === "" || value.length >= 3) {
            const params = new URLSearchParams(searchParams);
            if (value.length >= 3) {
                params.set("userId", value);
            } else {
                params.delete("userId");
            }
            params.set("page", "0");
            setSearchParams(params);
        }
    };

    // Handler para filtro action
    const handleActionChange = (value: string) => {
        setAction(value);
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("action", value);
        } else {
            params.delete("action");
        }
        params.set("page", "0");
        setSearchParams(params);
    };

    // Handler para filtro resultado
    const handleResultadoChange = (value: string) => {
        setResultado(value);
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("resultado", value);
        } else {
            params.delete("resultado");
        }
        params.set("page", "0");
        setSearchParams(params);
    };

    // Handler para paginación
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(newPage - 1));
        setSearchParams(params);
    };

    // Handler para ordenar por fecha
    const handleSort = () => {
        const params = new URLSearchParams(searchParams);
        const currentSort = params.getAll("sort");
        let direction = "desc";
        const found = currentSort.find(s => s.startsWith("fecha"));
        if (found) {
            direction = found.endsWith("asc") ? "desc" : "asc";
            params.delete("sort");
        }
        params.append("sort", `fecha,${direction}`);
        setSearchParams(params);
        setSort([`fecha,${direction}`]);
    };

    // Icono de sort
    function getSortIcon(field: string) {
        const sortParam = sort.find(s => s.startsWith(field));
        if (!sortParam) return null;
        return sortParam.endsWith("asc") ? "▲" : "▼";
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="ombook-heading ombook-heading-xl mb-6">Auditoría del Sistema</h1>
            {error && (
                <div className="text-red-600 mb-4">
                    Error al cargar los datos de auditoría.
                </div>
            )}
            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-8 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Buscar por email"
                    className="flex-1 border border-gray-200 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-700 bg-gray-50 min-w-[220px]"
                    value={userInput}
                    onChange={e => handleUserSearch(e.target.value)}
                />
                <select
                    className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    value={action}
                    onChange={e => handleActionChange(e.target.value)}
                >
                    <option value="">Filtrar por acción</option>
                    {ACTIONS.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                    ))}
                </select>
                <select
                    className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    value={resultado}
                    onChange={e => handleResultadoChange(e.target.value)}
                >
                    <option value="">Filtrar por resultado</option>
                    {RESULTADOS.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <input
                    type="date"
                    className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    value={fechaDesde}
                    onChange={e => {
                        setFechaDesde(e.target.value);
                        const params = new URLSearchParams(searchParams);
                        if (e.target.value) params.set("fechaDesde", e.target.value);
                        else params.delete("fechaDesde");
                        params.set("page", "0");
                        setSearchParams(params);
                    }}
                    placeholder="Desde"
                />
                <input
                    type="date"
                    className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    value={fechaHasta}
                    onChange={e => {
                        setFechaHasta(e.target.value);
                        const params = new URLSearchParams(searchParams);
                        if (e.target.value) params.set("fechaHasta", e.target.value);
                        else params.delete("fechaHasta");
                        params.set("page", "0");
                        setSearchParams(params);
                    }}
                    placeholder="Hasta"
                />
            </div>
            <div className="ombook-card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Usuario</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Email</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Acción</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Resultado</th>
                            {/* <th className="px-3 py-3 text-left font-semibold text-gray-700">Descripción</th> */}
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Entidad</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">IP</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-700">Canal</th>
                            <th
                                className="px-3 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none hover:text-blue-600"
                                onClick={handleSort}
                            >
                                Fecha {getSortIcon("fecha")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.content?.length ? data.content.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                                <td className="px-3 py-3 text-gray-900">{row.nombreUsuario || "-"}</td>
                                <td className="px-3 py-3 text-gray-700">{row.email || "-"}</td>
                                <td className="px-3 py-3 text-gray-900 capitalize">{row.action?.replace(/_/g, " ").toLowerCase() || "-"}</td>
                                <td className="px-3 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.resultado === "EXITO" ? "bg-green-100 text-green-800" :
                                        row.resultado === "ERROR" ? "bg-red-100 text-red-800" :
                                            row.resultado === "EXITO_PARCIAL" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-gray-100 text-gray-800"
                                        }`}>
                                        {row.resultado || "-"}
                                    </span>
                                </td>
                                {/* <td className="px-3 py-3 text-gray-700 max-w-xs truncate">{row.descripcion || "-"}</td> */}
                                <td className="px-3 py-3 text-gray-700">{row.entidad || "-"}</td>
                                <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row.ip || "-"}</td>
                                <td className="px-3 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${row.canal === "WEB" ? "bg-blue-100 text-blue-800" :
                                        row.canal === "MOBILE" ? "bg-purple-100 text-purple-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                        {row.canal?.toUpperCase() || "-"}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.fecha ? new Date(row.fecha).toLocaleString() : "-"}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No hay registros de auditoría.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Paginación simple */}
            <div className="flex justify-end items-center gap-2 mt-4">
                <button
                    className="ombook-btn"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                >
                    Anterior
                </button>
                <span>Página {page} de {data.totalPages ?? 1}</span>
                <button
                    className="ombook-btn"
                    disabled={page >= (data.totalPages ?? 1)}
                    onClick={() => handlePageChange(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}