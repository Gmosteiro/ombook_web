import { UserRole } from "~/features/auth/types";
type Links = {
    to: string;
    label: string;
}

export const getNavbarLinks = (role: UserRole | undefined): Links[] | [] => {
    try {
        if (!role) {
            return [];
        }

        switch (role) {
            case UserRole.ADMINISTRADOR:
                return [
                    { to: "/users", label: "Usuarios" },
                    { to: "/courses", label: "Cursos" },
                    { to: "/audit", label: "Auditoria" },
                    { to: "/audit/log", label: "Log de Auditoría" }, // <-- NUEVO LINK
                ];
            case UserRole.PROFESOR:
                return [
                    { to: "/courses", label: "Mis Cursos" },
                    { to: "/chat", label: "Chat" },
                ];
            case UserRole.ESTUDIANTE:
                return [
                    { to: "/courses", label: "Mis Cursos" },
                    { to: "/chat", label: "Chat" },
                ];

            case UserRole.SIN_VERIFICAR:
                return [];
            default:
                throw new Error(`Unknown user role: ${role}`);
        }

    } catch (error) {

        console.error("Error determining navbar links:", error);
        return [];
    }
};