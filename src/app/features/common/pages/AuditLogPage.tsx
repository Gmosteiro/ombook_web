import { useLoaderData, useSearchParams } from "react-router-dom";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { useState, useEffect } from "react";

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
    try {
        requireRoleLoader([UserRole.ADMINISTRADOR]);
        const jwtToken = await getValidJWTToken(request);
        const url = new URL(request.url);
        const params = url.searchParams;
        const page = params.get("page") ?? "0";
        const size = params.get("size") ?? "20";
        const sort = params.getAll("sort");
        const action = params.get("action") ?? "";
        const resultado = params.get("resultado") ?? "";
        const userId = params.get("userId") ?? "";

        const queryParams = new URLSearchParams();
        queryParams.set("page", page);
        queryParams.set("size", size);
        if (sort.length) sort.forEach(s => queryParams.append("sort", s));
        if (action) queryParams.set("action", action);
        if (resultado) queryParams.set("resultado", resultado);
        if (userId) queryParams.set("userId", userId);

        const res = await apiFetch(`/auditoria?${queryParams.toString()}`, { method: "GET", jwtToken, secure: true });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        return { data, filters: { action, resultado, userId }, page: Number(page) + 1 };
    } catch (e) {
        // Devuelve estructura vacía para evitar errores de hidratación
        return { data: { content: [], totalPages: 1 }, filters: {}, page: 1, error: String(e) };
    }
}

// Acciones y resultados posibles
const ACTIONS = [
    "ANUNCIO_CREAR", "ANUNCIO_EDITAR", "ANUNCIO_ELIMINAR",
    "PAGINA_CREAR", "PAGINA_EDITAR", "PAGINA_ELIMINAR",
    "TAREA_CREAR", "TAREA_EDITAR", "TAREA_ELIMINAR", "TAREA_ENTREGA_SUBIR", "TAREA_ENTREGA_ELIMINAR",
    "ENTREGA_SUBIR", "ENTREGA_CORREGIR",
    "MATRICULA_INDIVIDUAL", "DESMATRICULA_INDIVIDUAL", "MATRICULA_MASIVA", "DESMATRICULA_MASIVA", "MATRICULA_RECHAZADA",
    "CALIFICACION_PUBLICAR_MASIVA", "CALIFICACION_GUARDAR", "CALIFICACION_CARGA_MASIVA",
    "LOGIN", "LOGOUT", "TOKEN_REFRESH",
    "PASSWORD_CAMBIAR", "PASSWORD_RECUPERAR", "CUENTA_DESBLOQUEAR", "PASSWORD_RECUPERAR_REQUEST",
    "USUARIO_CREAR", "USUARIO_EDITAR", "USUARIO_CARGA_MASIVA",
    "EMAIL_CAMBIO_INICIAR", "EMAIL_CAMBIO_CONFIRMAR",
    "AVATAR_ACTUALIZAR", "AVATAR_RESETEAR",
    "CURSO_CREAR", "CURSO_EDITAR", "CURSO_ELIMINAR", "CURSO_CARGA_MASIVA", "CURSO_ELIMINACION_MASIVA",
    "CURSO_CAMBIAR_ESTADO", "CURSO_IMAGEN_ACTUALIZAR", "CURSO_IMAGEN_RESETEAR",
    "PUBLICACION_CREAR", "PUBLICACION_EDITAR", "PUBLICACION_ELIMINAR",
    "MENSAJE_FORO_PUBLICAR", "MENSAJE_FORO_EDITAR", "MENSAJE_FORO_ELIMINAR", "MENSAJE_PRIVADO_ENVIAR",
    "RECURSO_SUBIR", "RECURSO_ELIMINAR"
];

const RESULTADOS = [
    "EXITO", "ERROR", "EXITO_PARCIAL"
];

// Componente principal
export default function AuditLogPage() {
    const { data, filters, page } = useLoaderData() as {
        data: PaginatorResponseAuditoriaResponse;
        filters: { action: string; resultado: string; userId: string };
        page: number;
    };
    const [searchParams, setSearchParams] = useSearchParams();
    const [userInput, setUserInput] = useState(filters.userId || "");
    const [action, setAction] = useState(filters.action || "");
    const [resultado, setResultado] = useState(filters.resultado || "");

    // Sincronizar inputs con filtros externos
    useEffect(() => {
        setUserInput(filters.userId || "");
        setAction(filters.action || "");
        setResultado(filters.resultado || "");
    }, [filters.userId, filters.action, filters.resultado]);

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
            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-8 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Buscar por CI"
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
            </div>
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