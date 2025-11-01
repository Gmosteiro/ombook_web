import { UserRole } from "~/features/auth/types";
type Links = {
    to: string;
    label: string;
}

export const getNavbarLinks = (role: UserRole | undefined): Links[] | [] => {
    try {
        if (!role) throw new Error("Role is undefined");

        switch (role) {
            case UserRole.ADMINISTRADOR:
                return [
                    { to: "/users", label: "Gestión de Usuarios" },
                    { to: "/courses", label: "Gestión de Cursos" },
                ];
            case UserRole.PROFESOR:
                return [
                    { to: "/courses", label: "Mis Cursos" },
                ];
            case UserRole.ESTUDIANTE:
                return [
                    { to: "/courses", label: "Mis Cursos" },
                ];
            default:
                throw new Error(`Unknown user role: ${role}`);
        }

    } catch (error) {

        console.error("Error determining navbar links:", error);
        return [];
    }
};