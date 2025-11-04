import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import { ProfesorResponsable, UsuarioListadoResponse, EstudianteListadoResponse, Usuario } from "../types";

interface UsersApiResponse {
    success: boolean;
    data?: ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario;
    error?: string;
}

export type UserQueryType =
    | { type: 'profesores' }
    | { type: 'estudiantes' }
    | { type: 'listar' }
    | { type: 'byId', id: number };

export const useUsers = () => {
    const [users, setUsers] = useState<ProfesorResponsable[] | UsuarioListadoResponse[] | Usuario | null>(null);
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

export const useProfesores = () => {
    const { users, isLoading, error, loadUsers } = useUsers();

    const loadProfesores = () => {
        loadUsers({ type: 'profesores' });
    };

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

export const useEstudiantes = () => {
    const { users, isLoading, error, loadUsers } = useUsers();

    const loadEstudiantes = () => {
        loadUsers({ type: 'estudiantes' });
    };

    const estudiantes = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        // Tipado correcto:
        return (users as EstudianteListadoResponse[]).map((usuario, idx) => ({
            id: usuario.id ?? Math.floor(Math.random() * 1000000), // Fallback en caso de que no haya ID //TODO
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
