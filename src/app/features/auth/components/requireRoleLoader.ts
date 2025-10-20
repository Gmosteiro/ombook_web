import { redirect } from "react-router";
import { getUserRole } from "~/services/session.server";
import type { UserRole } from "../../auth/types";

/**
 * Loader genérico para proteger rutas por rol.
 * @param allowedRoles Array de roles permitidos (ej: ["ADMINISTRADOR", "PROFESOR"])
 */
export function requireRoleLoader(allowedRoles: UserRole[]) {
    return async function loader({ request }: { request: Request }) {
        const role = await getUserRole(request);

        if (!role || !allowedRoles.includes(role)) {
            return redirect("/login");
        }
        return null;
    };
}