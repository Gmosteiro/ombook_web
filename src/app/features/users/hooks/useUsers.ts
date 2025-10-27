import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import { ProfesorResponsable, UsuarioListadoResponse, Usuario } from "../types";

interface UsersApiResponse {
    success: boolean;
    data?: ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario;
    error?: string;
}

export type UserQueryType =
    | { type: 'profesores' }
    | { type: 'listar' }
    | { type: 'byId', id: number };

export const useUsers = () => {
    const [users, setUsers] = useState<ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useFetcher<UsersApiResponse>();

    const loadUsers = (query: UserQueryType) => {
        console.log("Loading users with query:", query);
        setError(null);
        setUsers(null);

        const formData = new FormData();
        formData.append("intent", "loadUsers");
        formData.append("queryType", query.type);
        if (query.type === "byId") {
            formData.append("userId", query.id.toString());
        }

        console.log("Submitting formData to /app/users");
        fetcher.submit(formData, { method: "POST", action: "/app/users" });
    };

    // Actualizar estado basado en la respuesta del fetcher
    useEffect(() => {
        console.log("Fetcher data changed:", fetcher.data);
        console.log("Fetcher state:", fetcher.state);

        if (fetcher.data) {
            if (fetcher.data.success && fetcher.data.data) {
                console.log("Users loaded successfully:", fetcher.data.data);
                setUsers(fetcher.data.data);
                setError(null);
            } else {
                console.error("Failed to load users:", fetcher.data.error);
                setError(fetcher.data.error || "Error al cargar usuarios");
                setUsers(null);
            }
        }
    }, [fetcher.data]);

    const isLoading = fetcher.state === "submitting";

    return {
        users,
        isLoading,
        error,
        loadUsers,
    };
};

// Hook especializado para profesores (para compatibilidad)
export const useProfesores = () => {
    const { users, isLoading, error, loadUsers } = useUsers();

    const loadProfesores = () => {
        console.log("Loading profesores...");
        loadUsers({ type: 'profesores' });
    };

    // Transform Usuario objects to ProfesorResponsable format
    const profesores = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];

        return (users as any[]).map(usuario => ({
            id: usuario.id,
            nombreCompleto: `${usuario.nombre} ${usuario.apellido}`
        }));
    }, [users]);

    return {
        profesores,
        isLoading,
        error,
        loadProfesores,
    };
};