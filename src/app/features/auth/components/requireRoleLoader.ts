import { LoaderFunctionArgs, redirect } from "react-router";
import { UserRole } from "../types";

export function requireRoleLoader(allowedRoles: UserRole[]) {
    return async ({ request }: LoaderFunctionArgs) => {
        const { requireValidSession, getUserRole } = await import("~/services/session.server");
        // This will automatically redirect to login if session is expired
        console.log("[requireRoleLoader] Validating session for request:", request.url);
        await requireValidSession(request);

        const userRole = await getUserRole(request);
        console.log("[requireRoleLoader] userRole:", userRole, "allowedRoles:", allowedRoles);
        // const url = new URL(request.url);

        // Si el usuario es SIN_VERIFICAR y no está en la página de cambio de contraseña
        if (userRole && userRole === UserRole.SIN_VERIFICAR
            // && url.pathname !== "/profile/change-password"
        ) {
            console.log("[requireRoleLoader] Redirecting to /profile/change-password because userRole is SIN_VERIFICAR:", userRole);
            throw redirect("/profile/change-password");
        }


        if (!userRole || !allowedRoles.includes(userRole)) {
            console.log("[requireRoleLoader] Redirecting to / because userRole is not allowed or missing:", userRole);
            throw redirect("/");
        }

        return null;
    };
}
