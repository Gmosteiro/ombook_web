import { LoaderFunctionArgs, redirect } from "react-router";
import { getUserRole, requireValidSession } from "~/services/session.server";
import { UserRole } from "../types";

export function requireRoleLoader(allowedRoles: UserRole[]) {
    return async ({ request }: LoaderFunctionArgs) => {
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
