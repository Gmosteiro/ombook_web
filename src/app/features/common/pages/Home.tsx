import { type MetaFunction } from "react-router";
import { redirect } from "react-router";
import { Route } from "../../../../.react-router/types/app/features/common/pages/+types/Home";
import { requireRoleLoader } from "~/features/auth/components/requireRoleLoader";
import { UserRole } from "~/features/auth/types";

export const meta: MetaFunction = () => {
    return [
        { title: "Ombook - Dashboard" },
        { name: "description", content: "Panel de control de Ombook" },
    ];
};

export async function loader({ request }: Route.LoaderArgs) {
    await requireRoleLoader([UserRole.ADMINISTRADOR, UserRole.PROFESOR, UserRole.ESTUDIANTE])({ request } as any);

    const { getUserId, getUserRole } = await import("~/services/session.server");
    const userId = await getUserId(request);
    if (!userId) {
        throw redirect("/login");
    }

    const userRole = await getUserRole(request);

    return {
        userId,
        userRole
    };
}

export default function Index({ loaderData }: Route.ComponentProps) {
    return (
        <div className="ombook-container ombook-section">
            <h1 className="ombook-heading ombook-heading-xl ombook-text-gray mb-6">Dashboard</h1>
            <div className="ombook-card">
                <div className="ombook-card-header">
                    <h2 className="ombook-heading-md ombook-text-blue">Bienvenido a Ombook</h2>
                </div>
                <p className="ombook-text-gray mb-4">
                    Usuario: <span className="font-semibold">{loaderData.userId}</span>
                </p>
                <div className="flex items-center gap-2">
                    <span className="ombook-text-gray text-sm">Rol:</span>
                    <span className="ombook-badge ombook-badge-blue">{loaderData.userRole}</span>
                </div>
            </div>
        </div>
    );
}