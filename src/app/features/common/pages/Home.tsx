import { type MetaFunction } from "react-router";
import { redirect } from "react-router";
import { Route } from "../../../../.react-router/types/app/features/common/pages/+types/Home";
import Layout from "../components/Layout";
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
        <Layout
            userEmail={loaderData.userId as any}
            userRole={loaderData.userRole}
            notificationCount={5} // Ejemplo: 5 notificaciones //TODO obtener el conteo real
        >
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">
                        Bienvenido a Ombook, {loaderData.userId}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Rol: {loaderData.userRole}
                    </p>
                </div>
            </div>
        </Layout>
    );
}