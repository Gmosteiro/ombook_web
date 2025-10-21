import { LoaderFunctionArgs, redirect } from "react-router";
import { getUserRole, requireValidSession } from "~/services/session.server";
import { UserRole } from "../types";

export function requireRoleLoader(allowedRoles: UserRole[]) {
    return async ({ request }: LoaderFunctionArgs) => {
        // This will automatically redirect to login if session is expired
        await requireValidSession(request);

        const userRole = await getUserRole(request);

        if (!userRole || !allowedRoles.includes(userRole)) {
            throw redirect("/unauthorized");
        }

        return null;
    };
}
