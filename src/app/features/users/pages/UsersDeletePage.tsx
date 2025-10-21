import { ActionFunctionArgs, useFetcher } from "react-router";
import { getUserId, getUserRole } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import EntityDelete from "../../common/components/EntityDelete";
import UsersSearchList from "../components/UsersSearchList";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs) {
    const userId = await getUserId(request);
    const userRole = await getUserRole(request);

    if (!userId || userRole !== UserRole.ADMINISTRADOR) {
        throw new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "deleteUser") {
        const userIdToDelete = formData.get("userId") as string;

        const response = await fetch(`http://localhost:3001/api/users/${userIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Cookie': request.headers.get('Cookie') || '',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to delete user: ${error}`);
        }

        return { success: true, message: "Usuario eliminado exitosamente" };
    }

    if (intent === "bulkDelete") {
        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("No file provided");
        }

        const deleteFormData = new FormData();
        deleteFormData.append('file', file);

        const response = await fetch('http://localhost:3001/api/users/bulk-delete', {
            method: 'POST',
            headers: {
                'Cookie': request.headers.get('Cookie') || '',
            },
            body: deleteFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to bulk delete users: ${error}`);
        }

        return { success: true, message: "Usuarios eliminados exitosamente" };
    }

    throw new Error("Invalid intent");
}

export default function UsersDeletePage() {
    const fetcher = useFetcher();

    const handleDeleteUser = async (user: any) => {
        const formData = new FormData();
        formData.append("intent", "deleteUser");
        formData.append("userId", user.id || user._id || user.email); // Ajusta según tu estructura

        fetcher.submit(formData, { method: "POST" });
    };

    const handleBulkDelete = async (file: File) => {
        const formData = new FormData();
        formData.append("intent", "bulkDelete");
        formData.append("file", file);

        fetcher.submit(formData, { method: "POST" });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <EntityDelete
                entityName="Usuario"
                SearchList={UsersSearchList}
                deleteSingle={handleDeleteUser}
                deleteMasive={handleBulkDelete}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/usuarios-delete.csv" }}
                isLoading={fetcher.state === "submitting"}
                error={fetcher.data?.error}
                success={fetcher.data?.success ? fetcher.data.message : undefined}
            />
        </div>
    );
}