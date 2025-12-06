import { useLoaderData, useSearchParams } from "react-router-dom";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { useState } from "react";

// Tipos
type AuditoriaResponse = {
    nombreUsuario?: string;
    action?: string;
    resultado?: string;
    descripcion?: string;
    entidad?: string;
    ip?: string;
    canal?: string;
    fecha?: string;
};

type PaginatorResponseAuditoriaResponse = {
    content?: AuditoriaResponse[];
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
};

// Loader
export async function loader({ request }: { request: Request }) {
    requireRoleLoader([UserRole.ADMINISTRADOR]);
    const jwtToken = await getValidJWTToken(request);
    const url = new URL(request.url);
    const page = url.searchParams.get("page") ?? "0";
    const size = url.searchParams.get("size") ?? "20";
    const sort = url.searchParams.getAll("sort");
    const action = url.searchParams.get("action") ?? "";
    const resultado = url.searchParams.get("resultado") ?? "";
    const userId = url.searchParams.get("userId") ?? "";

    const params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    if (sort.length) sort.forEach(s => params.append("sort", s));
    if (action) params.set("action", action);
    if (resultado) params.set("resultado", resultado);
    if (userId) params.set("userId", userId);

    const res = await apiFetch(`/auditoria?${params.toString()}`, { method: "GET", jwtToken, secure: true });
    const data: PaginatorResponseAuditoriaResponse = await res.json();
    return { data, filters: { action, resultado, userId }, page: Number(page) + 1 };
}

// Componente principal
export default function AuditLogPage() {
    const { data, filters, page } = useLoaderData() as {
        data: PaginatorResponseAuditoriaResponse;
        filters: { action: string; resultado: string; userId: string };
        page: number;
    };
    const [searchParams, setSearchParams] = useSearchParams();

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
        if (currentSort.find(s => s.startsWith("fecha"))) {
            direction = currentSort.find(s => s.endsWith("asc")) ? "desc" : "asc";
            params.delete("sort");
        }
        params.append("sort", `fecha,${direction}`);
        setSearchParams(params);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="ombook-heading ombook-heading-xl mb-6">Auditoría del Sistema</h1>
            <div className="ombook-card overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Usuario</th>
                            <th className="px-4 py-2 text-left">Acción</th>
                            <th className="px-4 py-2 text-left">Resultado</th>
                            <th className="px-4 py-2 text-left">Descripción</th>
                            <th className="px-4 py-2 text-left">Entidad</th>
                            <th className="px-4 py-2 text-left">IP</th>
                            <th className="px-4 py-2 text-left">Canal</th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer"
                                onClick={handleSort}
                            >
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.content?.length ? data.content.map((row, idx) => (
                            <tr key={idx} className="border-b">
                                <td className="px-4 py-2">{row.nombreUsuario}</td>
                                <td className="px-4 py-2">{row.action?.replace(/_/g, " ")}</td>
                                <td className="px-4 py-2">{row.resultado}</td>
                                <td className="px-4 py-2">{row.descripcion}</td>
                                <td className="px-4 py-2">{row.entidad}</td>
                                <td className="px-4 py-2">{row.ip}</td>
                                <td className="px-4 py-2">{row.canal}</td>
                                <td className="px-4 py-2">{row.fecha ? new Date(row.fecha).toLocaleString() : ""}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay registros de auditoría.</td>
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