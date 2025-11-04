import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import { ProfesorResponsable, UsuarioListadoResponse, Usuario } from "../types";
import type { components } from "/Users/gaston/Documents/Personal Workspace/ombook_web/src/types/openapi";

type EstudianteListadoResponse = components["schemas"]["EstudianteListadoResponse"];

interface UsersApiResponse {
    success: boolean;
    data?: ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario | EstudianteListadoResponse[];
    error?: string;
}

export type UserQueryType =
    | { type: 'profesores' }
    | { type: 'estudiantes' }
    | { type: 'listar' }
    | { type: 'byId', id: number };

export const useUsers = () => {
    const [users, setUsers] = useState<
        ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario | EstudianteListadoResponse[] | null
    >(null);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useFetcher<UsersApiResponse>();

    const loadUsers = (query: UserQueryType) => {
        setError(null);
        setUsers(null);

        const formData = new FormData();
        formData.append("intent", "loadUsers");
        formData.append("queryType", query.type);
        if (query.type === "byId") {
            formData.append("userId", query.id.toString());
        }

        fetcher.submit(formData, { method: "POST", action: "/app/users" });
    };

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

export const useEstudiantes = () => {
    const { users, isLoading, error, loadUsers } = useUsers();

    const loadEstudiantes = () => {
        loadUsers({ type: 'estudiantes' });
    };

    const estudiantes = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        // Tipado correcto:
        return (users as EstudianteListadoResponse[]).map((usuario, idx) => ({
            id: usuario.cedula ?? usuario.correo ?? idx, // Si no hay id, usa cedula/correo/idx
            nombre: usuario.nombre ?? "",
            apellido: usuario.apellido ?? "",
            correo: usuario.correo ?? "",
            cedula: usuario.cedula ?? "",
        }));
    }, [users]);

    return {
        estudiantes,
        isLoading,
        error,
        loadEstudiantes,
    };
};
