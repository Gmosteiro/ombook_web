import { useState, useEffect } from "react";
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
        setError(null);
        setUsers(null);

        fetcher.submit(
            (() => {
                const formData = new FormData();
                formData.append("intent", "loadUsers");
                formData.append("queryType", query.type);
                if (query.type === "byId") {
                    formData.append("userId", query.id.toString());
                }
                return formData;
            })(),
            { method: "POST", action: "/app/users" }
        );
    };

    // Actualizar estado basado en la respuesta del fetcher
    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.success && fetcher.data.data) {
                setUsers(fetcher.data.data);
                setError(null);
            } else {
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
        loadUsers({ type: 'profesores' });
    };

    return {
        profesores: (users as ProfesorResponsable[]) || [],
        isLoading,
        error,
        loadProfesores,
    };
};