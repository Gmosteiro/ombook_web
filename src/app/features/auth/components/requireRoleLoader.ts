import { LoaderFunctionArgs, redirect } from "react-router";
import { UserRole } from "../types";

export function requireRoleLoader(allowedRoles: UserRole[]) {
    return async ({ request }: LoaderFunctionArgs) => {
        const { requireValidSession, getUserRole } = await import("~/services/session.server");
        // This will automatically redirect to login if session is expired
        await requireValidSession(request);

        const userRole = await getUserRole(request);
        // const url = new URL(request.url);

        // Si el usuario es SIN_VERIFICAR y no está en la página de cambio de contraseña
        if (userRole && userRole === UserRole.SIN_VERIFICAR
            // && url.pathname !== "/profile/change-password"
        ) {
            console.log("User role is SIN_VERIFICAR, redirecting to change password");
            throw redirect("/profile/change-password");
        }


        if (!userRole || !allowedRoles.includes(userRole)) {
            throw redirect("/");
        }

        return null;
    };
}
